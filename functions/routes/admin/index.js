import {handlePath} from '../../util/router';
import {CODE} from '../../util/code';
import {createManager} from './create-manager';
import {updateAccount} from './update-account';
import {deleteAccount} from './delete-account';
import {paginatedAccounts} from './paginated-accounts';
import {paginatedLogs} from './paginated-logs';
import {logs} from './logs';

export const admin = (route, ...rest) => {
  handlePath(
    route,
    [
      [createManager, '/create-manager'],
      [updateAccount, '/update-account'],
      [deleteAccount, '/delete-account'],
      [paginatedAccounts, '/paginated-accounts'],
      [paginatedLogs, '/paginated-logs'],
      [logs, '/logs'],
      [def, '/'],
    ],
    ...rest,
  );
};

const def = (route, event, context, callback) => {
  callback(null, CODE(200, '/admin'));
};
