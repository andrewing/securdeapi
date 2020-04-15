import {handlePath} from '../../util/router';
import ResponseError from '../../util/error';
import {CODE} from '../../util/code';
import {create} from './create';
import {update} from './update';
import {remove} from './remove';
import {get} from './get';
import {paginated} from './paginated';
import db from '../../db/db';
import Book from '../../db/models/book';
import Review from '../../db/models/review';

export const book = (route, ...rest) => {
  handlePath(
    route,
    [
      [create, '/create'],
      [update, '/update'],
      [remove, '/remove'],
      [get, '/get'],
      [paginated, '/paginated'],
      [def, '/'],
    ],
    ...rest,
  );
};

const def = async (route, event, context, callback) => {
  if (event.httpMethod !== 'GET') {
    callback(null, CODE(405, 'Method not allowed'));
    return;
  }
  const {q} = event.queryStringParameters;
  const titlePromise = Book.findBookByTitle(q);
  const authorPromise = Book.findBookByAuthor(q);

  Promise.all([titlePromise, authorPromise])
    .then(([title, books]) => {
      const arr = [...title.data, ...books.data];
      let data = [];
      const map = new Map();
      arr.forEach(item => {
        if (!map.has(item._id.toString())) {
          map.set(item._id.toString(), true);
          data = [...data, item];
        }
      });
      callback(null, CODE(200, 'Successful in gettings books', {books: data}));
    })
    .catch(err => {
      const {code, message} = err;
      callback(null, CODE(code || 500, message));
    });
};
