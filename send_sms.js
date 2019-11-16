// Download the helper library from https://www.twilio.com/docs/node/install
// Your Account Sid and Auth Token from twilio.com/console
// DANGER! This is insecure. See http://twil.io/secure
const accountSid = 'AC9041bb97622715c4629da986cdcacb2e';
const authToken = '660da9a24df77f44b4cc077a101f61ce';
const client = require('twilio')(accountSid, authToken);

client.messages
  .create({
     body: 'This is the ship that made the Kessel Run in fourteen parsecs?',
     from: '+19382009472',
     to: '+16478624888'
   })
  .then(message => console.log(message.sid));
