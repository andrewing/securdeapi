import jwt from 'jsonwebtoken';
import {CODE} from '../../../util/code';
import {SECRET, jwtError} from '../../../util/jwt';
import {AUDIENCE} from '../../../util/constants';
import Account from '../../../db/models/account';
import db from '../../../db/db';

export const book = (route, event, context, callback) => {
  if (event.httpMethod !== 'GET') {
    callback(null, CODE(405, 'Method not allowed'));
    return;
  }
  const {authorization} = event.headers;

  jwt.verify(
    authorization,
    SECRET,
    {audience: [AUDIENCE.USER_STUDENT, AUDIENCE.USER_TEACHER]},
    (err, decoded) => {
      if (err) {
        callback(null, jwtError(err, decoded && decoded.user.username, ''));
        return;
      }
      const {user} = decoded;

      Account.findById(user._id)
        .populate('bookHistory.book bookHistory.log')
        .then(account => {
          const {bookHistory} = account;
          bookHistory.sort((a, b) => b.log.timeBorrowed - a.log.timeBorrowed);
          callback(
            null,
            CODE(200, `Successfully retrieved book history`, {bookHistory}),
          );
        })
        .catch(bookErr => {
          const {code, message} = bookErr;
          callback(null, CODE(code || 500, message));
        });
    },
  );
};
