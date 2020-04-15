import jwt from 'jsonwebtoken';
import {CODE} from './util/code';
import ResponseError from './util/error';
import {jwtError, REFRESH_SECRET, SECRET} from './util/jwt';
import db from './db/db';
import Account from './db/models/account';
import {EXPIRATIONS} from './util/constants';

export const handler = (route, event, context, callback) => {
  try {
    if (event.httpMethod !== 'POST')
      throw new ResponseError(405, 'Method not allowed!');

    const {authorization: oldRefreshToken} = event.headers;

    jwt.verify(oldRefreshToken, REFRESH_SECRET, (err, decoded) => {
      if (err) {
        callback(
          null,
          jwtError(err, decoded && decoded.user.username, 'REFRESH TOKEN'),
        );
        return;
      }
      const {id} = decoded;
      Account.findById(id)
        .then(user => {
          const tokenPromise = jwt.sign({user}, SECRET, {
            expiresIn: EXPIRATIONS.refresh,
            audience: user.type,
          });
          const refreshTokenPromise = jwt.sign({id}, REFRESH_SECRET, {
            expiresIn: EXPIRATIONS.refresh,
          });

          Promise.all([tokenPromise, refreshTokenPromise])
            .then(([token, refreshToken]) => {
              callback(
                null,
                CODE(200, null, {
                  access: token,
                  refresh: refreshToken,
                  type: user.type,
                }),
              );
            })
            .catch(pErr => {
              throw jwtError(pErr);
            });
        })
        .catch(refErr => {
          const {code, message} = refErr;
          callback(null, CODE(code || 500, message));
        });
    });
  } catch (err) {
    const {code, message} = err;
    callback(null, CODE(code || 400, message));
  }
};
