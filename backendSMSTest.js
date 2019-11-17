


// Init Nexmo
const nexmo = new Nexmo({
  apiKey: '7226847a',
  apiSecret: '1A2Ynv7u2Y0vyRa4'
}, { debug: true });

// Init app
const app = express();

// Template engine setup
app.set('view engine', 'html');
app.engine('html', ejs.renderFile);

// Public folder setup
app.use(express.static(__dirname + '/public'));

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

// Define port
const port = 3000;

// Start server
const server = app.listen(port, () => console.log(`Server started on port ${port}`));

// Connect to socket.io
const io = socketio(server);
io.on('connection', (socket) => {
  console.log('Connected');
  io.on('disconnect', () => {
    console.log('Disconnected');
  })
});
