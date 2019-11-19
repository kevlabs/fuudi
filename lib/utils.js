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

/**
 * Turn string into date
 * @param {string} str - String to be parsed.
 * @param {boolean} [toMidnight = true] - Whether or not returned date object should be set to midnight
 * @param {Function} [condition = () => true] - Custom condition that must be satisfied (e.g. (val) => val > 946702800000, to check that date is after Jan 1, 2000).
 * @return never (throws error) if invalid or an integer otherwise.
 */
const stringToDate = (str, toMidnight = true, condition = () => true) => {
  const date = new Date(str);
  if (isNaN(date.valueOf())) throw Error('String cannot be parsed to date.');
  toMidnight && date.setHours(0, 0, 0, 0);
  if (!condition(date)) throw Error('Parsed string does not satisfy the supplied condition.');
  return date;
};

/**
 * Check that string represents a timestamp
 * @param {string} str - Input string.
 * @return boolean.
 */
const isTimestamp = (str) => /^\d{2}:\d{2}:\d{2}.\d{3}$/.test(str);

/**
 * Check that string represents an email
 * Regex courtesy of the WHATWG - https://html.spec.whatwg.org/multipage/input.html#e-mail-state-(type=email)
 * @param {string} str - Input string.
 * @return boolean.
 */
const isEmail = (str) => /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(str);

/**
 * Check that string represents a URL
 * @param {string} str - Input string.
 * @return boolean.
 */
const isUrl = (str) => /^https?:\/\//.test(str);

/**
 * Check that username syntax is valid
 * @param {string} str - Input string.
 * @return boolean.
 */
const isUsername = (str) => /^[\w\d!@#$%^&*\-+[\]{}|\\"':;?/,<.>]*$/.test(str);

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
  '4030': 'notAuthenticated',
  notFound: '4040',
  '4040': 'notFound'
};

const resMessage = {};
resMessage['success'] = 'Success';
resMessage[resEnum.success] = resMessage['success'];
resMessage['badRequest'] = 'Bad Request';
resMessage[resEnum.badRequest] = resMessage['badRequest'];
resMessage['notAuthenticated'] = 'User not logged in';
resMessage[resEnum.notAuthenticated] = resMessage['notAuthenticated'];
resMessage['notFound'] = 'No records found.';
resMessage[resEnum.notFound] = resMessage['notFound'];

// return a JS object to be sent as JSON to the front-end
const createResponse = (status = resEnum.success, body = {}) => {
  return {
    status,
    message: resMessage[status] || 'Non-standard response code',
    body };
};

module.exports = { stringToInteger, stringToDate, isTimestamp, isEmail, isUrl, isUsername, resEnum, createResponse };
