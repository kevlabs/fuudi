// basic function for testing

const isLoggedIn = (req) => req.session.userId;
const login = (req, id) => req.session.userId = id;

module.exports = { isLoggedIn, login };
