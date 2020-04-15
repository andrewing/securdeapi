import jwt from 'jsonwebtoken';
import moment from 'moment';
import {CODE} from '../../util/code';
import {SECRET, jwtError} from '../../util/jwt';
import {AUDIENCE} from '../../util/constants';
import Review from '../../db/models/review';
import SystemLog from '../../db/models/system_log';
import Account from '../../db/models/account';
import Book from '../../db/models/book';
import db from '../../db/db';

export const create = (route, event, context, callback) => {
  if (event.httpMethod !== 'POST') {
    callback(null, CODE(405, 'Method not allowed'));
    return;
  }
  const data = JSON.parse(event.body);
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
      const {user} = decoded;
      const review = new Review({
        time: moment().format(),
        account: user._id,
        ...data,
      });
      const book = await Book.findById(data.book);

      Review.addReview(review)
        .then(() => {
          Account.addReviewHistory(user._id, review._id);
          SystemLog.addLog(
            new SystemLog({
              action: 'BOOK REVIEW',
              content: `Reviewed [${book._id}] ${book.title}`,
              account: user._id,
            }),
          );
          callback(null, CODE(200, 'Successfully created review'));
        })
        .catch(reviewErr => {
          const {code, message} = reviewErr;
          callback(null, CODE(code || 500, message));
        });
    },
  );
};
