import {handlePath, getNextPath} from '../../../util/router';
import {book} from './book';
import {review} from './review';
import {CODE} from '../../../util/code';

export const history = (route, ...rest) => {
  route = getNextPath(route);
  handlePath(
    route,
    [
      [book, '/book'],
      [review, '/review'],
      [def, '/'],
    ],
    ...rest,
  );
};

const def = (route, event, context, callback) => {
  callback(null, CODE(200, '/user/history'));
};
