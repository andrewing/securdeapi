import jwt from 'jsonwebtoken';
import {CODE} from '../../util/code';
import {SECRET} from '../../util/jwt';
import ResponseError from '../../util/error';
import {AUDIENCE} from '../../util/constants';

export const userToken = (route, event, context, callback) => {
  if (event.httpMethod !== 'GET') {
    callback(null, CODE(405, 'Method not allowed'));
    return;
  }
  const user = {
    username: 'devUser',
  };
  jwt.sign(
    {user},
    SECRET,
    {expiresIn: '7d', audience: AUDIENCE.USER_STUDENT},
    (err, token) => {
      if (err) throw new ResponseError(500, err.message);

      callback(
        null,
        CODE(200, 'Successfully Registered', {name: 'token', data: token}),
      );
    },
  );
};
