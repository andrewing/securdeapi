import jwt from 'jsonwebtoken';
import {CODE} from '../../util/code';
import {SECRET, jwtError} from '../../util/jwt';
import Account from '../../db/models/account';
import {AUDIENCE} from '../../util/constants';
import SystemLog from '../../db/models/system_log';
import db from '../../db/db';

export const deleteAccount = (route, event, context, callback) => {
  if (event.httpMethod !== 'POST') {
    callback(null, CODE(405, 'Method not allowed'));
    return;
  }

  const body = JSON.parse(event.body);
  const {authorization} = event.headers;
  jwt.verify(
    authorization,
    SECRET,
    {audience: AUDIENCE.ADMIN},
    async (err, decoded) => {
      if (err) {
        callback(
          null,
          jwtError(err, decoded && decoded.user.username, 'CREATE MANAGER'),
        );
        return;
      }
      const {user} = decoded;

      Account.deleteOne({
        _id: body._id,
      })
        .then(() => {
          SystemLog.addLog(
            new SystemLog({
              action: 'DELETE ACCOUNT',
              content: `Deleted account ${body._id}`,
              account: user._id,
            }),
          );
          callback(null, CODE(200, 'Success in deleting account!'));
        })
        .catch(accountErr => {
          const {code, message} = accountErr;
          callback(null, CODE(code || 500, message));
        });
    },
  );
};
