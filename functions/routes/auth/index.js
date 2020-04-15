import {handlePath} from '../../util/router';
import {login} from './login';
import {register} from './register';
import {CODE} from '../../util/code';

export const auth = (route, ...rest) => {
  handlePath(
    route,
    [
      [def, '/'],
      [login, '/login'],
      [register, '/register'],
    ],
    ...rest,
  );
};

const def = (route, event, context, callback) => {
  callback(null, CODE(200, '/auth'));
};
