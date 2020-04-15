import jwt from 'jsonwebtoken';
import {CODE} from '../../util/code';
import {SECRET, jwtError} from '../../util/jwt';
import Account from '../../db/models/account';
import {AUDIENCE} from '../../util/constants';
import db from '../../db/db';

export const paginatedAccounts = (route, event, context, callback) => {
  if (event.httpMethod !== 'GET') {
    callback(null, CODE(405, 'Method not allowed'));
    return;
  }

  const {authorization} = event.headers;
  jwt.verify(
    authorization,
    SECRET,
    {audience: AUDIENCE.ADMIN},
    async (err, decoded) => {
      if (err) {
        callback(
          null,
          jwtError(err, decoded && decoded.user.username, 'CREATE MANAGER'),
        );
        return;
      }

      const {page, limit, type} = event.queryStringParameters;

      const query = {type};
      // Object.keys(rest).forEach(key => {
      //   query = {
      //     ...query,
      //     [key]: regexWildCard(rest[key]),
      //   };
      // });

      const num = await Account.find(query).countDocuments();
      const meta = {
        total: num,
        pages: Math.ceil(num / limit),
        currentPage: page,
      };

      Account.find(query)
        .sort({firstname: 1})
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate('bookHistory reviewHistory')
        .then(accounts => {
          callback(
            null,
            CODE(200, 'Success in getting accounts', {accounts, meta}),
          );
        })
        .catch(accountErr => {
          const {code, message} = accountErr;
          callback(null, CODE(code || 500, message));
        });
    },
  );
};
