/**
 * Turn string into integer
 * @param {string} str - String to be parsed.
 * @param {Function} [condition = () => true] - Custom condition that must be satisfied (e.g. (num) => num > 0, to check that integer is positive).
 * @param {boolean} [strict = false] - Whether or not str must evaluate to an integer when type coerced into a number
 * @return never (throws error) if invalid or an integer otherwise.
 */
const stringToInteger = (str, condition = () => true, strict = false) => {
  const int = parseInt(str);
  if (isNaN(int)) throw Error('String cannot be parsed to integer.');
  if (strict && Number(str) !== int) throw Error('String parsed to number is not an integer.');
  if (!condition(int)) throw Error('Parsed string does not satisfy the supplied condition.');
  return int;
};

/* enum to access error codes
 * use http status code + '0'
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
 */
const resEnum = {
  success: '2000',
  '2000': 'success',
  badRequest: '4000',
  '4000': 'badRequest',
  notAuthenticated: '4030',
  '4030': 'notAuthenticated'
};

const resMessage = {};
resMessage['success'] = 'Success';
resMessage[resEnum.success] = resMessage['success'];
resMessage['badRequest'] = 'Bad Request';
resMessage[resEnum.badRequest] = resMessage['badRequest'];
resMessage['notAuthenticated'] = 'User not logged in';
resMessage[resEnum.notAuthenticated] = resMessage['notAuthenticated'];

// return a JS object to be sent as JSON to the front-end
const createResponse = (status = resEnum.success, body = {}) => {
  return {
    status,
    message: resMessage[status] || 'Non-standard response code',
    body };
};

module.exports = { stringToInteger, resEnum, createResponse };
