import jwt from 'jsonwebtoken';
import {CODE} from '../../util/code';
import {SECRET, jwtError} from '../../util/jwt';
import Account from '../../db/models/account';
import {AUDIENCE} from '../../util/constants';
import SystemLog from '../../db/models/system_log';
import db from '../../db/db';

export const updateAccount = (route, event, context, callback) => {
  if (event.httpMethod !== 'PUT') {
    callback(null, CODE(405, 'Method not allowed'));
    return;
  }

  const body = JSON.parse(event.body);
  const {q} = event.queryStringParameters;
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

      const found = await Account.findById(q);

      if (found.username !== body.username) {
        const check = await Account.find({username: body.username});
        if (check) {
          callback(null, CODE(409, 'User Already Exists!'));
          return;
        }
      }
      Account.updateAccount(q, body)
        .then(() => {
          SystemLog.addLog(
            new SystemLog({
              action: 'UPDATE MANAGER',
              content: `Updated Manager [${q}] ${body.username || ''}`,
              account: user._id,
            }),
          );
          callback(null, CODE(200, 'Success in updating manager!'));
        })
        .catch(accountErr => {
          const {code, message} = accountErr;
          callback(null, CODE(code || 500, message));
        });
    },
  );
};
