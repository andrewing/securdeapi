import jwt from 'jsonwebtoken';
import {CODE} from '../../util/code';
import {SECRET, jwtError} from '../../util/jwt';
import {AUDIENCE} from '../../util/constants';
import SystemLog from '../../db/models/system_log';
import db from '../../db/db';

export const logs = (route, event, context, callback) => {
  if (event.httpMethod !== 'GET') {
    callback(null, CODE(405, 'Method not allowed'));
    return;
  }
  const {authorization} = event.headers;

  jwt.verify(
    authorization,
    SECRET,
    {audience: AUDIENCE.ADMIN},
    (err, decoded) => {
      if (err) {
        callback(
          null,
          jwtError(err, decoded && decoded.user.username, 'CREATE MANAGER'),
        );
        return;
      }
      SystemLog.findAllLogs()
        .then(({data}) => {
          callback(null, CODE(200, 'Successfully got logs!', {logs: data}));
        })
        .catch(error => {
          const {code, message} = error;
          callback(null, CODE(code || 500, message));
        });
    },
  );
};
