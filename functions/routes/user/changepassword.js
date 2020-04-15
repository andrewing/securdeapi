import jwt from 'jsonwebtoken';
import {CODE} from '../../util/code';
import {SECRET, jwtError} from '../../util/jwt';
import ResponseError from '../../util/error';
import {AUDIENCE} from '../../util/constants';
import Account from '../../db/models/account';
import SystemLog from '../../db/models/system_log';
import db from '../../db/db';

export const changepassword = (route, event, context, callback) => {
  if (event.httpMethod !== 'POST') {
    callback(null, CODE(405, 'Method not allowed'));
    return;
  }
  const {authorization} = event.headers;
  const data = JSON.parse(event.body);
  const {oldPassword, newPassword} = data;

  jwt.verify(
    authorization,
    SECRET,
    {
      audience: [
        AUDIENCE.USER_STUDENT,
        AUDIENCE.USER_TEACHER,
        AUDIENCE.BOOK_MANAGER,
        AUDIENCE.ADMIN,
      ],
    },
    async (err, decoded) => {
      if (err) {
        callback(null, jwtError(err, decoded && decoded.user.username, ''));
        return;
      }
      const {user} = decoded;

      const found = await Account.findById(user._id);

      Account.authenticate(found.username, oldPassword, found.salt, found.type)
        .then(({data: account}) => {
          if (!account) {
            SystemLog.addLog(
              new SystemLog({
                action: 'CHANGE PASSWORD ATTEMPT',
                content: 'Incorrect password',
                account: user._id,
              }),
            );
            throw new ResponseError(401, 'Incorrect Password');
          }
          Account.changePassword(user._id, newPassword).then(() => {
            SystemLog.addLog(
              new SystemLog({
                action: 'CHANGE PASSWORD',
                content: 'Success!',
                account: user._id,
              }),
            );
            callback(null, CODE(200, `Successfully changed password`));
          });
        })
        .catch(authErr => {
          const {code, message} = authErr;
          callback(null, CODE(code || 500, message));
        });
    },
  );
};
