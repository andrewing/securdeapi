export const CODE = (
  statusCode,
  message = null,
  data = {},
  isSuccess = null,
) => {
  if (!message) message = TYPES[statusCode.toString().charAt(0)];
  if (isSuccess === null && statusCode.toString().charAt(0) === '2')
    isSuccess = true;
  return {
    statusCode,
    body: JSON.stringify({
      message,
      isSuccess: !!isSuccess,
      data,
    }),
  };
};

const TYPES = {
  1: 'Informational',
  2: 'Success',
  3: 'Redirection',
  4: 'Client Error',
  5: 'Server Error',
};
