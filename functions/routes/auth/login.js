import jwt from 'jsonwebtoken';
import {CODE} from '../../util/code';
import {SECRET, REFRESH_SECRET, jwtError} from '../../util/jwt';
import ResponseError from '../../util/error';
import {EXPIRATIONS, AUDIENCE} from '../../util/constants';
import Account from '../../db/models/account';
import db from '../../db/db';
import SystemLog from '../../db/models/system_log';
import moment from 'moment';

const LIMIT = 5
const TIME_IN_MINUTES = 60

export const login = (route, event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  if (event.httpMethod !== 'POST') {
    callback(null, CODE(405, 'Method not allowed'));
    return;
  }
  const body = JSON.parse(event.body);
  const {username, password, type: loginType} = body;
  Account.findUserByUsername(username)
    .then(({data: found}) => {
      if (!found) {
        SystemLog.addLog(
          new SystemLog({
            action: 'LOG IN ATTEMPT',
            content: `Anonymous user tried ${username} but it did not exist`,
            account: null,
          }),
        );
        throw new ResponseError(404, 'User Not Found');
      }
      if(found.loginFailedHistory){
        let attempts = 0
        for(let i = found.loginFailedHistory.length - 1; i > found.loginFailedHistory.length - LIMIT - 1; i--){
          if(moment(found.loginFailedHistory[i]).isBetween(moment().subtract(TIME_IN_MINUTES, 'minutes'), moment())){
            attempts++
          }else{
            break;
          }
        }
        
        if(attempts >= LIMIT) throw new ResponseError(404, `Log in attempts exceeded try again in ${moment(found.loginFailedHistory[found.loginFailedHistory.length - LIMIT]).add(1,'hour').fromNow()}`);
      }

      Account.authenticate(
        username,
        password,
        found.salt,
        loginType || AUDIENCE.USER_STUDENT,
      )
        .then(({data: user}) => {
          if (!user) {
            SystemLog.addLog(
              new SystemLog({
                action: 'LOG IN ATTEMPT',
                content: `${username} tried to log in`,
                account: null,
              }),
            );
            
            Account.updateOne({
              _id: found._id
            },{
              $push: {
                loginFailedHistory: moment()
              }
            })
            throw new ResponseError(401, 'Incorrect Password');
          }

          const {type} = user;
          const tokenPromise = jwt.sign({user}, SECRET, {
            expiresIn: EXPIRATIONS.access,
            audience: type,
          });

          const refreshTokenPromise = jwt.sign({id: user._id}, REFRESH_SECRET, {
            expiresIn: EXPIRATIONS.refresh,
          });

          Promise.all([tokenPromise, refreshTokenPromise])
            .then(([token, refreshToken]) => {
              SystemLog.addLog(
                new SystemLog({
                  action: 'LOG IN',
                  content: `${username} logged in`,
                  account: user._id,
                }),
              );
              callback(
                null,
                CODE(200, 'Successfully logged in', {
                  access: token,
                  refresh: refreshToken,
                  type,
                }),
              );
              return
            })
            .catch(err => {
              const {code, message} = jwtError(err);
              callback(null, CODE(code || 500, message));
            });
        })
        .catch(err => {
          const {code, message} = err;
          callback(null, CODE(code || 500, message));
        });
    })
    .catch(err => {
      const {code, message} = err;
      callback(null, CODE(code || 500, message));
    });
  // const {data:user, err:authErr} = await
  // if(!user) throw new ResponseError(401, "Incorrect Password")
  // if(authErr) throw new ResponseError(500, authErr.message)
};
