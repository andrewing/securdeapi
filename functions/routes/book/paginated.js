import {CODE} from '../../util/code';
import Book from '../../db/models/book';
import {regexWildCard} from '../../util/mongoose';
import db from '../../db/db';

export const paginated = async (route, event, context, callback) => {
  if (event.httpMethod !== 'GET') {
    callback(null, CODE(405, 'Method not allowed'));
    return;
  }

  const {page, limit, ...rest} = event.queryStringParameters;

  let query = {};
  Object.keys(rest).forEach(key => {
    query = {
      ...query,
      [key]: regexWildCard(rest[key]),
    };
  });

  const num = await Book.find(query).countDocuments();
  const meta = {
    total: num,
    pages: Math.ceil(num / limit),
    currentPage: page,
  };
  Book.find(query)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .then(books => {
      callback(null, CODE(200, 'Successfully got books!', {res: books, meta}));
    });
};
