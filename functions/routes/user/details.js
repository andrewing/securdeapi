import jwt from 'jsonwebtoken';
import {CODE} from '../../util/code';
import {SECRET, jwtError} from '../../util/jwt';
import {AUDIENCE} from '../../util/constants';
import Account from '../../db/models/account';
import db from '../../db/db';

export const details = (route, event, context, callback) => {
  if (event.httpMethod !== 'GET') {
    callback(null, CODE(405, 'Method not allowed'));
    return;
  }
  const {authorization} = event.headers;

  jwt.verify(
    authorization,
    SECRET,
    {
      audience: [
        AUDIENCE.USER_STUDENT,
        AUDIENCE.USER_TEACHER,
        AUDIENCE.BOOK_MANAGER,
        AUDIENCE.ADMIN,
      ],
    },
    async (err, decoded) => {
      if (err) {
        callback(
          null,
          jwtError(err, decoded && decoded.user.username, 'GET DETAILS'),
        );
        return;
      }
      const {user} = decoded;

      Account.findById(user._id)
        .then(account => {
          const {username, firstname, lastname, email, idNumber} = account;
          const data = {username, firstname, lastname, email, idNumber};
          callback(
            null,
            CODE(200, 'Successfully got details', {account: data}),
          );
        })
        .catch(getErr => {
          const {code, message} = getErr;
          callback(null, CODE(code || 500, message));
        });
    },
  );
};
