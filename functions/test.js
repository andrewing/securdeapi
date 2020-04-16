import faker from 'faker';
import {CODE} from './util/code';

export const handler = (route,event, context, callback) => {
  callback(
    null,
    CODE(200, `This test is with name ${faker.name.findName()}!`, {
      randomName: faker.name.findName(),
      env: process.env
    }),
  );
};
