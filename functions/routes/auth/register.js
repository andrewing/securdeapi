import {CODE} from '../../util/code';
import ResponseError from '../../util/error';
import Account from '../../db/models/account';
import db from '../../db/db';
import SystemLog from '../../db/models/system_log';

export const register = (route, event, context, callback) => {
  if (event.httpMethod !== 'POST') {
    callback(null, CODE(405, 'Method not allowed'));
    return;
  }
  const body = JSON.parse(event.body);
  Account.findUserByUsername(body.username)
    .then(({data: found}) => {
      if (found) {
        SystemLog.addLog(
          new SystemLog({
            action: 'USER REGISTER ATTEMPT',
            content: `Anonymous user tried to register but ${body.username} already existed`,
            account: null,
          }),
        );
        throw new ResponseError(409, 'Username already exists');
      }
      Account.addAccount(
        new Account({
          ...body,
        }),
        callback(null, CODE(200, 'Successfully registered')),
      );
      SystemLog.addLog(
        new SystemLog({
          action: 'USER REGISTER',
          content: `User ${body.username} registered`,
          account: null,
        }),
      );
    })
    .catch(err => {
      const {code, message} = err;
      callback(null, CODE(code || 500, message));
    });
};
