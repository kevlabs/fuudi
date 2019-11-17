/*
 * Middleware to turn all 'POST' requests made to 'url/edit' or 'url/edit/' into 'PUT' requests to 'url'
 */

module.exports = (req, res, next) => {
  if (req.method === 'POST') {
    const editURL = req.url.match(/^(.*)\/edit\/?$/);
    editURL && (req.originalUrl = editURL[1] || '/') && (req.url = editURL[1] || '/') && (req.method = 'PUT');
  }
  next();
};
