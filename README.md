# Introducing Fuudi
## A food ordering app made for the Lighthouse Labs Midterm Project 
## Authors: [James Truong](https://github.com/james-truong), [Kevin Laburte](https://github.com/kevlabs/), [Matthew Wardle](https://github.com/m-wardle)

## Link: [Heroku host](https://fuudi.herokuapp.com)

### Features
- Single Page Application using ViewComponent classes
- Users can order food from their favorite restaurants from their location using Google Maps API.
- Users will see SMS updates on their order status using Nexmo API + sockets.io.
- Users can see restaurant ratings from Yelp API.
- Restaurants can accept/reject orders and assign preparation time for the client.
- Both users and restaurants can see previous orders.

### Getting Started

1. Fork this repository, then clone your fork of this repository.
2. Install dependencies using the npm install command.
3. Start the web server using the npm run local command. The app will be served at http://localhost:8080/.
4. Go to http://localhost:8080/ in your browser.

### Dependencies
- Express
- Node 5.10.x or above
- axios
- bcrypt
- body-parser
- chalk
- cookie-session
- dotenv
- morgan
- nexmo
- node-sass-middleware
- pg
- pg-native
- socket.io