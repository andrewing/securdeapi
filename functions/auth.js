import router from './util/router';
import {auth} from './routes/auth';
import {CODE} from './util/code';

export const handler = (route, event, context, callback) => {
  try {
    router(auth, event, context, callback);
  } catch (err) {
    const {code, message} = err;
    callback(null, CODE(code || 400, message));
  }
};
