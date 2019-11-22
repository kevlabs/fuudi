// load .env data into process.env
require('dotenv').config();

// Web server config
const PORT = process.env.PORT || 8080;
const ENV = process.env.ENV || 'development';
const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const sass = require('node-sass-middleware');
const morgan = require('morgan');

// instantiate express
const app = express();

// Nexmo text messages setup
const textMessages = require('./lib/nexmo-text.js')({
  apiKey: process.env.NEXMO_KEY,
  apiSecret: process.env.NEXMO_SECRET,
  fromNumber: process.env.NEXMO_FROM_NUMBER
});

// PG database client/connection setup
const dbParams = require('./lib/db.js');
const db = require('./db/index.js')(dbParams);

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
// The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));

// Middleware for PUT requests - all 'POST' to 'url/edit/' to PUT 'url'
const { editAsPut } = require('./lib/middlewares');
app.use(editAsPut);

// Register cookie session middleware
app.use(cookieSession({
  name: 'session',
  keys: ['Coolstuffgoesonhere'],
  maxAge: 365 * 24 * 60 * 60 * 1000 // 1 year
}));

// request body middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// sass/scss
app.use('/styles', sass({
  src: __dirname + '/styles',
  dest: __dirname + '/public/styles',
  debug: true,
  outputStyle: 'expanded'
}));

app.use(express.static('public'));

// separated Routes for each Resource
const usersRoutes = require('./routes/users');
const restaurantsRoutes = require('./routes/restaurants');
const ordersRoutes = require('./routes/orders');

// Mount all resource routes
app.use('/api/users', usersRoutes(db));
app.use('/api/restaurants', restaurantsRoutes(db));
app.use('/api/orders', ordersRoutes(db, textMessages));

app.listen(PORT, () => console.log(`Fuudi app listening on port ${PORT}`));
