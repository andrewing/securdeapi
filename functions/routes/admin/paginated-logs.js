import jwt from 'jsonwebtoken';
import {CODE} from '../../util/code';
import {SECRET, jwtError} from '../../util/jwt';
import ResponseError from '../../util/error';
import {AUDIENCE} from '../../util/constants';
import SystemLog from '../../db/models/system_log';
import {regexWildCard} from '../../util/mongoose';
import db from '../../db/db';

export const paginatedLogs = async (route, event, context, callback) => {
  if (event.httpMethod !== 'GET') {
    callback(null, CODE(405, 'Method not allowed'));
    return;
  }

  const {page, limit, ...rest} = event.queryStringParameters;

  const num = await SystemLog.find().countDocuments();
  const meta = {
    total: num,
    pages: Math.ceil(num / limit),
    currentPage: page,
  };
  SystemLog.find()
    .sort('-time')
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate('account')
    .then(logs => {
      callback(null, CODE(200, 'Successfully got books!', {res: logs, meta}));
    });
};
