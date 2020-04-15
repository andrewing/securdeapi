import jwt from 'jsonwebtoken';
import {CODE} from '../../util/code';
import {SECRET, jwtError} from '../../util/jwt';
import {AUDIENCE} from '../../util/constants';
import BookInstance from '../../db/models/book_instance';
import Book from '../../db/models/book';
import SystemLog from '../../db/models/system_log';
import db from '../../db/db';

export const create = async (route, event, context, callback) => {
  if (event.httpMethod !== 'POST') {
    callback(null, CODE(405, 'Method not allowed'));
    return;
  }
  const data = JSON.parse(event.body);
  const {bookId} = data;
  const {authorization} = event.headers;

  jwt.verify(
    authorization,
    SECRET,
    {audience: AUDIENCE.BOOK_MANAGER},
    async (err, decoded) => {
      if (err) {
        callback(
          null,
          jwtError(
            err,
            decoded && decoded.user.username,
            'CREATE BOOK INSTANCE',
          ),
        );
        return;
      }
      const {_id} = decoded.user;

      const bookInstance = new BookInstance({
        book: bookId,
        isAvailable: true,
        dateAvailable: null,
      });
      bookInstance
        .save()
        .then(async () => {
          const book = await Book.findById(bookId);
          SystemLog.addLog(
            new SystemLog({
              action: 'CREATE BOOK INSTANCE',
              content: `created a book instance of [${book._id}] ${book.title}`,
              account: _id,
            }),
          );
          callback(null, CODE(200, 'Successfully created book instance'));
        })
        .catch(bookInstanceErr => {
          const {code, message} = bookInstanceErr;
          callback(null, CODE(code || 500, message));
        });
    },
  );
};
