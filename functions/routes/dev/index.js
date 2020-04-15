import {handlePath} from '../../util/router';
import ResponseError from '../../util/error';
import {CODE} from '../../util/code';
import {adminToken} from './adminToken';
import {managerToken} from './managerToken';
import {userToken} from './userToken';

export const dev = (route, ...rest) => {
  handlePath(
    route,
    [
      [adminToken, '/adminToken'],
      [managerToken, '/managerToken'],
      [userToken, '/userToken'],
      [dev, '/'],
    ],
    ...rest,
  );
};

const def = (route, event, context, callback) => {
  callback(null, CODE(200, '/dev'));
};
