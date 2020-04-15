import router from './util/router';
import {book} from './routes/book';
import {CODE} from './util/code';

export const handler = (route, event, context, callback) => {
  try {
    router(book, event, context, callback);
  } catch (err) {
    const {code, message} = err;
    callback(null, CODE(code || 400, message));
  }
};
