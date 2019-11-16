// load .env data into process.env
require('dotenv').config();

// Web server config
const PORT = process.env.PORT || 8080;
const ENV = process.env.ENV || 'development';
const express = require('express');
const bodyParser = require('body-parser');
const sass = require('node-sass-middleware');
const app = express();
const morgan = require('morgan');

// PG database client/connection setup
const dbParams = require('./lib/db.js');
const db = require('./db/index.js')(dbParams);

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
// The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/styles', sass({
  src: __dirname + '/styles',
  dest: __dirname + '/public/styles',
  debug: true,
  outputStyle: 'expanded'
}));
app.use(express.static('public'));

// Separated Routes for each Resource
const usersRoutes = require('./routes/users');
const restaurantsRoutes = require('./routes/restaurants');
const ordersRoutes = require('./routes/orders');

// Mount all resource routes
app.use('/api/users', usersRoutes(db));
app.use('/api/restaurants', restaurantsRoutes(db));
app.use('/api/orders', ordersRoutes(db));


// Home page
app.get('/', (req, res) => {
  res.render('index');
});

app.listen(PORT, () => {
  console.log(`Fuudi app listening on port ${PORT}`);
});
