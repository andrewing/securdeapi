import ResponseError from './error';

export const handlePath = (route, paths, ...rest) => {
  if (!paths.length) return;
  const found = !paths.every(item => {
    const [func, path] = item;
    const currRoute = route.split('/')[1];
    if (path === `/${currRoute}`) {
      func(route, ...rest);
      return false;
    }
    return true;
  });
  if (!found) throw new ResponseError(404, 'Invalid Path!');
};

export const getNextPath = route => {
  const [, , ...restRoute] = route.split('/');
  return `/${restRoute.join('/')}`;
};

export default (func, ...params) => {
  const [event] = params;
  const restRoute = getNextPath(event.path);
  func(restRoute, ...params);
};
