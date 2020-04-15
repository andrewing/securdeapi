import {CODE} from '../../util/code';
import BookInstance from '../../db/models/book_instance';
import db from '../../db/db';

export const paginatedByBook = async (route, event, context, callback) => {
  if (event.httpMethod !== 'GET') {
    callback(null, CODE(405, 'Method not allowed'));
    return;
  }

  const {page, limit, book} = event.queryStringParameters;

  const num = await BookInstance.find({book}).countDocuments();
  const meta = {
    total: num,
    pages: Math.ceil(num / limit),
    currentPage: Number(page),
  };
  BookInstance.find({book})
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .then(books => {
      callback(
        null,
        CODE(200, 'Successfully got book instances!', {res: books, meta}),
      );
    });
};
