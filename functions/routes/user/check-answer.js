import {CODE} from '../../util/code';
import Account from '../../db/models/account';
import db from '../../db/db';

export const checkAnswer = (route, event, context, callback) => {
  if (event.httpMethod !== 'POST') {
    callback(null, CODE(405, 'Method not allowed'));
    return;
  }
  const data = JSON.parse(event.body);
  const {id, answer} = data;
  Account.findById(id)
    .then(account => {
      if (account.answer.toLowerCase().trim() === answer.toLowerCase().trim())
        callback(
          null,
          CODE(200, 'Correct!', {
            isCorrect: true,
          }),
        );
      else
        callback(
          null,
          CODE(409, 'Incorrect Answer', {
            isCorrect: false,
          }),
        );
    })
    .catch(authErr => {
      const {code, message} = authErr;
      callback(null, CODE(code || 500, message));
    });
};
