import jwt from 'jsonwebtoken';
import moment from 'moment';
import {CODE} from '../../util/code';
import {SECRET, jwtError} from '../../util/jwt';
import {AUDIENCE} from '../../util/constants';
import {isMongooseId} from '../../util/mongoose';
import BookInstance from '../../db/models/book_instance';
import SystemLog from '../../db/models/system_log';
import LibraryLog from '../../db/models/library_log';
import Book from '../../db/models/book';
import db from '../../db/db';

export const ret = (route, event, context, callback) => {
  if (event.httpMethod !== 'PUT') {
    callback(null, CODE(405, 'Method not allowed'));
    return;
  }
  const {q} = event.queryStringParameters;
  const {authorization} = event.headers;

  jwt.verify(
    authorization,
    SECRET,
    {audience: [AUDIENCE.USER_STUDENT, AUDIENCE.USER_TEACHER]},
    async (err, decoded) => {
      if (err) {
        callback(
          null,
          jwtError(
            err,
            decoded && decoded.user.username,
            'BORROW BOOK INSTANCE',
          ),
        );
        return;
      }
      const {user} = decoded;
      if (!isMongooseId(q)) {
        callback(null, CODE(400, `Book Instance ID was invalid`));
        return;
      }
      const bookInstance = await BookInstance.findById(q);
      const book = await Book.findById(bookInstance.book);
      if (!bookInstance) {
        callback(null, CODE(409, `Book does not exist`));
        return;
      }
      if (bookInstance.isAvailable) {
        callback(
          null,
          CODE(
            409,
            `Book has already been returned or has not been borrowed yet`,
          ),
        );
        return;
      }
      BookInstance.returnBookInstance(q)
        .then(() => {
          LibraryLog.findLibraryLogsByBook(q).then(({data: log}) => {
            LibraryLog.logReturn(log._id, moment().format());
          });

          SystemLog.addLog(
            new SystemLog({
              action: 'RETURN BOOK',
              content: `Returned [${book._id}] ${book.title}`,
              account: user._id,
            }),
          );
          callback(
            null,
            CODE(200, `Successfully returned book`, {book: bookInstance}),
          );
        })
        .catch(returnErr => {
          const {code, message} = returnErr;
          callback(null, CODE(code || 500, message));
        });
    },
  );
};
