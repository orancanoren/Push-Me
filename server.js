const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const request = require('request');
const path = require('path');
const moment = require('moment');
const bodyParser = require('body-parser');
const nodeGeocoder = require('node-geocoder');

// Start the app and configure it
const app = express();
app.set('view engine', 'ejs');
app.set('port', (process.env.PORT || 3000));
app.use(morgan('tiny'));
app.use(express.static(path.resolve(__dirname, 'public')));
app.use(bodyParser.json());

// Utility functions
function handleError(error) {
  console.error("DEV error: ", error);
  return res.redirect('/');
}

var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: 'AIzaSyAi1yCNi-7IRo3_Pb-vgiwIgrLyk8x9oxI',
  formatter: null
};
var geocoder = nodeGeocoder(options);


// Set up the server & connect to the database
var db;
app.listen(app.get('port'), function() {
  console.log('DEV: App is running on port %d', app.get('port'));
  console.log('DEV: mongodb connecting to: ', (process.env.MONGODB_URI || "mongodb://localhost:25566"));
  mongoose.Promise = global.Promise;
  mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:25566");
  db = mongoose.connection;
  db.on('error', console.error.bind(console, 'MongoDB connection error:'));
});

// configure the database schema
const push_schema = new mongoose.Schema({
  ipAddr: String,
  date: Date,
  time: String,
  country: String,
  city: String,
  longitude: Number,
  latitude: Number
});

// Compile the model
var push_model = mongoose.model('pushes', push_schema);

app.get('/', (req, res) => {
  var counter = push_model.count({});
  var query = push_model.find();
  query.sort({ date: -1 });
  query.exec((err, result) => {
    if (err) return console.error(err);
    res.render('index.ejs', {
      pushes: result,
      total: counter
    });
  });
});

app.post('/push', (req, res) => {
  console.log('--------\nDEV: [POST] to /push with ', req.body, '--------\n');
  var city = "";
  var country = "";
  geocoder.reverse({
    lat: req.body.latitude,
    lon: req.body.longitude
  }, (err, res) => {
    if (err) {
      console.error('Error during reverse geocoding!');
      return handleError(err);
    }
    city = res[0].administrativeLevels.level1long;
    country = res[0].country;
    console.log('City: ', city, '\nCountry: ', country);
  });

  const req_ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  if (! req_ip) {
    console.error("DEV: cannot acquire the ip address!");
  }

  var new_push = new push_model({
    country: country,
    city: city,
    date: moment().format("MMM-DD-YYYY"),
    time: moment().format("hh:mm:ss"),
    longitude: req.body.longitude,
    latitude: req.body.latitude,
    ipAddr: req_ip
  });
  console.log('DEV - New push: ', new_push);

  new_push.save( (err) => {
    if (err) return handleError(error);
    console.log('saved new push');
    return res.redirect('/');
  });
});
