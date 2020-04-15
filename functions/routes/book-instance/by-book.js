import {CODE} from '../../util/code';
import BookInstance from '../../db/models/book_instance';
import db from '../../db/db';

export const byBook = (route, event, context, callback) => {
  if (event.httpMethod !== 'GET') {
    callback(null, CODE(405, 'Method not allowed'));
    return;
  }
  const {q} = event.queryStringParameters;

  BookInstance.find({
    book: q,
  })
    .then(val => {
      callback(
        null,
        CODE(200, 'Successfully got book instances under books', {
          bookInstances: val,
        }),
      );
    })
    .catch(err => {
      const {code, message} = err;
      callback(null, CODE(code || 500, message));
    });
};
