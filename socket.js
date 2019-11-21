// Establish socket connection
// const io = require('./socket.js')(app);


const http = require('http');
const socketio = require('socket.io');


module.exports = (app) => {
  const server = http.createServer(app);
  const io = socketio(server);
  server.listen(80);

  io.on('connection', function(socket) {
    console.log('connected to socket');
  });


  return io;
};
