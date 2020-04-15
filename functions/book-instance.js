import router from './util/router';
import {bookInstance} from './routes/book-instance';
import {CODE} from './util/code';

export const handler = (route, event, context, callback) => {
  try {
    router(bookInstance, event, context, callback);
  } catch (err) {
    const {code, message} = err;
    callback(null, CODE(code || 400, message));
  }
};
