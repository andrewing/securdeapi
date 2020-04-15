import {CODE} from '../../util/code';
import Account from '../../db/models/account';
import db from '../../db/db';

export const getQuestion = (route, event, context, callback) => {
  if (event.httpMethod !== 'GET') {
    callback(null, CODE(405, 'Method not allowed'));
    return;
  }
  const {authorization} = event.headers;
  const {q} = event.queryStringParameters;

  Account.findById(q)
    .then(account => {
      callback(
        null,
        CODE(200, 'Successfully got question', {
          question: account.question,
        }),
      );
    })
    .catch(authErr => {
      const {code, message} = authErr;
      callback(null, CODE(code || 500, message));
    });
};
