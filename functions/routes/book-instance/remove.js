import jwt from 'jsonwebtoken';
import {CODE} from '../../util/code';
import {SECRET, jwtError} from '../../util/jwt';
import {AUDIENCE} from '../../util/constants';
import BookInstance from '../../db/models/book_instance';
import SystemLog from '../../db/models/system_log';
import db from '../../db/db';

export const remove = async (route, event, context, callback) => {
  if (event.httpMethod !== 'DELETE') {
    callback(null, CODE(405, 'Method not allowed'));
    return;
  }
  const data = JSON.parse(event.body);
  const {authorization} = event.headers;

  jwt.verify(
    authorization,
    SECRET,
    {audience: AUDIENCE.BOOK_MANAGER},
    async (err, decoded) => {
      if (err) {
        callback(
          null,
          jwtError(
            err,
            decoded && decoded.user.username,
            'DELETE BOOK INSTANCE',
          ),
        );
        return;
      }
      const {user} = decoded;
      BookInstance.deleteBookInstance(data.id)
        .then(() => {
          SystemLog.addLog(
            new SystemLog({
              action: 'DELETE BOOK INSTANCE',
              content: `Deleted ${data.id}`,
              account: user._id,
            }),
          );
          callback(null, CODE(200, 'Successfully deleted book instance'));
        })
        .catch(delErr => {
          const {code, message} = delErr;
          callback(null, CODE(code || 500, message));
        });
    },
  );
};
