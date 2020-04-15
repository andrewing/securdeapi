import router from './util/router';
import {user} from './routes/user';
import {CODE} from './util/code';

export const handler = (route,event, context, callback) => {
  try {
    router(user, event, context, callback);
  } catch (err) {
    const {code, message} = err;
    callback(null, CODE(code || 400, message));
  }
};
