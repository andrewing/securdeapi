import db from './db/db';
import {CODE} from './util/code';
import SystemLog from './db/models/system_log';

export const handler = ( route, event, context, callback) => {
  if (event.httpMethod !== 'POST') {
    callback(null, CODE(405, 'Method not allowed'));
    return;
  }
  SystemLog.addLog(
    new SystemLog({
      action: 'USER VISIT',
      content: '',
      account: null,
    }),
  );

  callback(null, CODE(200, 'Success'));
};
