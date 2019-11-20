// load .env data into process.env
require('dotenv').config();

// Web server config
const PORT = process.env.PORT || 8080;
const ENV = process.env.ENV || 'development';
const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const sass = require('node-sass-middleware');
const Nexmo = require('nexmo');
const socketio = require('socket.io');
const app = express();

const morgan = require('morgan');
// Init Nexmo
const nexmo = new Nexmo({
  apiKey: process.env.NEXMO_KEY,
  apiSecret: process.env.NEXMO_SECRET
}, { debug: true });

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

app.set('view engine', 'ejs');
app.use(bodyParser.json());
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


// Google geo coord
const getCoordinates = require('./lib/geo-coordinates');
app.get('/geo', (req, res) => {
  getCoordinates('M5H1C4').then(data => res.json(data));
});

// Yelp coord
const getYelpData = require('./lib/yelp-data');
app.get('/yelp', (req, res) => {
  getYelpData('Paramount', 43.653587, -79.3831154).then(data => res.json(data));
});

// Index route
app.get('/smstext', (req, res) => {
  res.render('smsForm');
});

// Catch form submit
app.post('/smstext', (req, res) => {
  // res.send(req.body);
  // console.log(req.body);
  const { number, text } = req.body;

  nexmo.message.sendSms(
    '12506638721', number, text, { type: 'unicode' },
    (err, responseData) => {
      if(err) {
        console.log(err);
      } else {
        const { messages } = responseData;
        const { ['message-id']: id, ['to']: number, ['error-text']: error  } = messages[0];
        console.dir(responseData);
        // Get data from response
        const data = {
          id,
          number,
          error
        };

        // Emit to the client
        io.emit('smsStatus', data);
      }
    }
  );
});


const server = app.listen(PORT, () =>
  console.log(`Fuudi app listening on port ${PORT}`));

// Connect to socket.io
const io = socketio(server);
// app.configure(socketio(io, {
//   timeout: 10000000
// }));
io.on('connection', (socket) => {
  console.log('Connected');
  io.on('disconnect', () => {
    console.log('Disconnected');
  })
});
