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

module.exports = { stringToInteger };
