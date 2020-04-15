import jwt from 'jsonwebtoken';
import {CODE} from '../../util/code';
import {SECRET, jwtError} from '../../util/jwt';
import {AUDIENCE} from '../../util/constants';
import BookInstance from '../../db/models/book_instance';
import SystemLog from '../../db/models/system_log';
import db from '../../db/db';

export const update = async (route, event, context, callback) => {
  if (event.httpMethod !== 'PUT') {
    callback(null, CODE(405, 'Method not allowed'));
    return;
  }
  const data = JSON.parse(event.body);
  const {authorization} = event.headers;
  const {q} = event.queryStringParameters;

  jwt.verify(
    authorization,
    SECRET,
    {audience: AUDIENCE.BOOK_MANAGER},
    async (err, decoded) => {
      if (err) {
        callback(
          null,
          jwtError(err, decoded && decoded.user.username, 'EDIT BOOK INSTANCE'),
        );
        return;
      }
      const {user} = decoded;
      BookInstance.updateBookInstance(q, data)
        .then(() => {
          SystemLog.addLog(
            new SystemLog({
              action: 'EDIT BOOK INSTANCE',
              content: `Edited [${q}]`,
              account: user._id,
            }),
          );
          callback(null, CODE(200, 'Successfully edited book instance'));
        })
        .catch(updateErr => {
          const {code, message} = updateErr;
          callback(null, CODE(code || 500, message));
        });
    },
  );
};
