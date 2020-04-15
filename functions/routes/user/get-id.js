import {CODE} from '../../util/code';
import Account from '../../db/models/account';
import ResponseError from '../../util/error';
import db from '../../db/db';

export const getId = (route, event, context, callback) => {
  if (event.httpMethod !== 'GET') {
    callback(null, CODE(405, 'Method not allowed'));
    return;
  }

  const {q} = event.queryStringParameters;

  Account.findOne({
    username: q,
  })
    .then(account => {
      if (!account) throw new ResponseError(404, 'User Does Not Exist');
      callback(
        null,
        CODE(200, 'Successfully got id', {
          id: account._id,
        }),
      );
    })
    .catch(err => {
      const {code, message} = err;
      callback(null, CODE(code || 500, message));
    });
};
