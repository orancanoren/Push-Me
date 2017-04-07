const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const request = require('request');
const path = require('path');

// Start the app and configure it
const app = express();
app.set('view engine', 'ejs');
app.set('port', (process.env.PORT || 3000));
app.use(morgan('tiny'));
app.use(express.static(path.resolve(__dirname, 'public')));

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
  tstamp: Date,
  country: String,
  city: String
});

// Compile the model
var push_model = mongoose.model('pushes', push_schema);

app.get('/', (req, res) => {
  var query = push_model.find();
  query.sort({ tstamp: -1 });
  query.limit(10);
  query.exec((err, result) => {
    if (err) return console.error(err);
    res.render('index.ejs', { pushes: result });
  });
});

app.get('/push', (req, res) => {
  // Handle a push
  const req_ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  if (! req_ip) {
    console.error("DEV: cannot acquire the ip address!");
    res.redirect('/');
  }

  function handleError(error) {
    console.error("DEV error: ", error);
    return res.redirect('/');
  }

  request('http://www.ipinfo.io/' + req_ip, (error, response, body) => {
    if (error) return handleError(error);
    body = JSON.parse(body);
    var time = stamp_prep(new Date());
    var new_push = new push_model({
      country: body["country"],
      city: body["city"],
      tstamp: time
    });

    new_push.save( (err) => {
      if (err) return handleError(error);
      console.log('saved new push');
      return res.redirect('/');
    });

  });
});

function stamp_prep(time) {

}
