import {CODE} from '../../util/code';
import Book from '../../db/models/book';
import db from '../../db/db';

export const get = (route, event, context, callback) => {
  if (event.httpMethod !== 'GET') {
    callback(null, CODE(405, 'Method not allowed'));
    return;
  }
  Book.findAllBooks()
    .then(({data: books}) => {
      callback(null, CODE(200, 'Successfully retrieved books', {books}));
    })
    .catch(err => {
      const {code, message} = err;
      callback(null, CODE(code || 500, message));
    });
};
