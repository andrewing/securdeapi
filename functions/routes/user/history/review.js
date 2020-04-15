import jwt from 'jsonwebtoken';
import {CODE} from '../../../util/code';
import {SECRET, jwtError} from '../../../util/jwt';
import {AUDIENCE} from '../../../util/constants';
import Account from '../../../db/models/account';

export const review = (route, event, context, callback) => {
  if (event.httpMethod !== 'GET') {
    callback(null, CODE(405, 'Method not allowed'));
    return;
  }
  const {authorization} = event.headers;

  jwt.verify(
    authorization,
    SECRET,
    {audience: [AUDIENCE.USER_STUDENT, AUDIENCE.USER_TEACHER]},
    async (err, decoded) => {
      if (err) {
        callback(null, jwtError(err, decoded && decoded.user.username, ''));
        return;
      }
      const {_id} = decoded.user;
      Account.findById(_id)
        .populate({
          path: 'reviewHistory',
          populate: {
            path: 'book',
            model: 'Book',
          },
        })
        .then(account => {
          const {reviewHistory} = account;
          reviewHistory.sort((a, b) => b.dateCreated - a.dateCreated);
          callback(
            null,
            CODE(200, `Successfully retrieved review history`, {reviewHistory}),
          );
        })
        .catch(reviewErr => {
          const {code, message} = reviewErr;
          callback(null, CODE(code || 500, message));
        });
    },
  );
};
