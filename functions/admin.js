import router from './util/router';
import {admin} from './routes/admin';
import {CODE} from './util/code';

export const handler = (route, event, context, callback) => {
  console.log(event, context, callback)
  try {
    router(admin, event, context, callback);
  } catch (err) {
    const {code, message} = err;
    callback(null, CODE(code || 400, message));
  }
};
