import ResponseError from './error';

export const handlePath = (route, paths, ...rest) => {
  const [,,callback] = rest
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
  if (!found) {
    callback(null, CODE(404, "Path not found"))
  };
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
