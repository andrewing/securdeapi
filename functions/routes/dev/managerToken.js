import jwt from 'jsonwebtoken';
import {CODE} from '../../util/code';
import {SECRET} from '../../util/jwt';
import ResponseError from '../../util/error';
import {AUDIENCE} from '../../util/constants';

export const managerToken = (route, event, context, callback) => {
  if (event.httpMethod !== 'GET') {
    callback(null, CODE(405, 'Method not allowed'));
    return;
  }
  const user = {
    username: 'devManager',
  };
  jwt.sign(
    {user},
    SECRET,
    {expiresIn: '7d', audience: AUDIENCE.BOOK_MANAGER},
    (err, token) => {
      if (err) throw new ResponseError(500, err.message);

      callback(
        null,
        CODE(200, 'Successfully Registered', {name: 'token', data: token}),
      );
    },
  );
};
