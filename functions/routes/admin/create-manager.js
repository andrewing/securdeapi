import jwt from 'jsonwebtoken';
import {CODE} from '../../util/code';
import {SECRET, jwtError} from '../../util/jwt';
import ResponseError from '../../util/error';
import Account from '../../db/models/account';
import {AUDIENCE} from '../../util/constants';
import SystemLog from '../../db/models/system_log';
import db from '../../db/db';

export const createManager = (route, event, context, callback) => {
  if (event.httpMethod !== 'POST') {
    callback(null, CODE(405, 'Method not allowed'));
    return;
  }

  let body = JSON.parse(event.body);
  const {authorization} = event.headers;
  jwt.verify(
    authorization,
    SECRET,
    {audience: AUDIENCE.ADMIN},
    (err, decoded) => {
      if (err) {
        callback(
          null,
          jwtError(err, decoded && decoded.user.username, 'CREATE MANAGER'),
        );
        return;
      }
      const {user} = decoded;
      body = {
        ...body,
        type: AUDIENCE.BOOK_MANAGER,
      };
      Account.findUserByUsername(body.username)
        .then(({data: found}) => {
          if (found) throw new ResponseError(409, 'Username already exists');
          Account.addAccount(
            new Account({...body}),
            callback(null, CODE(200, 'Successfully registered')),
          );

          SystemLog.addLog(
            new SystemLog({
              action: 'CREATE MANAGER',
              content: `Created a book manager`,
              account: user._id,
            }),
          );
        })
        .catch(accountErr => {
          const {code, message} = accountErr;
          callback(null, CODE(code || 500, message));
        });
    },
  );
};
