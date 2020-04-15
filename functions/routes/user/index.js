import {handlePath} from '../../util/router';
import {CODE} from '../../util/code';
import {changepassword} from './changepassword';
import {forgotpassword} from './forgotpassword';
import {getQuestion} from './get-question';
import {history} from './history/index';
import {getId} from './get-id';
import {checkAnswer} from './check-answer';
import {details} from './details';

export const user = (route, ...rest) => {
  handlePath(
    route,
    [
      [changepassword, '/change-password'],
      [forgotpassword, '/forgot-password'],
      [getQuestion, '/get-question'],
      [history, '/history'],
      [details, '/details'],
      [getId, '/get-id'],
      [checkAnswer, '/check-answer'],
      [def, '/'],
    ],
    ...rest,
  );
};

const def = (route, event, context, callback) => {
  callback(null, CODE(200, '/user'));
};
