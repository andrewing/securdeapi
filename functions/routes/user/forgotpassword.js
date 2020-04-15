import {CODE} from '../../util/code';
import Account from '../../db/models/account';
import SystemLog from '../../db/models/system_log';
import db from '../../db/db';

export const forgotpassword = async (route, event, context, callback) => {
  if (event.httpMethod !== 'POST') {
    callback(null, CODE(405, 'Method not allowed'));
    return;
  }
  const {authorization} = event.headers;
  const data = JSON.parse(event.body);
  const {newPassword, answer, id} = data;

  const found = await Account.findById(id);
  if (found.answer.toLowerCase() === answer.toLowerCase()) {
    Account.changePassword(id, newPassword)
      .then(() => {
        SystemLog.addLog(
          new SystemLog({
            action: 'FORGOT PASSWORD',
            content: 'Success!',
            account: id,
          }),
        );

        callback(null, CODE(200, 'Password changed!'));
      })
      .catch(authErr => {
        const {code, message} = authErr;
        callback(null, CODE(code || 500, message));
      });
  } else {
    SystemLog.addLog(
      new SystemLog({
        action: 'FORGOT PASSWORD ATTEMPT',
        content: 'Incorrect Answer',
        account: null,
      }),
    );
    callback(null, CODE(401, 'Incorrect answer'));
  }
};
