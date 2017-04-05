const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const request = require('request');

// Start the app and configure it
const app = express();
app.set('view engine', 'ejs');
app.set('port', (process.env.PORT || 3000));
app.use(morgan('tiny'));
app.use(express.static(__dirname + '/public'));

// Set up the server & connect to the database
var db;
app.listen(app.get('port'), function() {
  console.log('App is running on port %d', app.get('port'));
  mongoose.connect(process.env.MONGODB_URI);
  db = mongoose.connection;
  db.on('error', console.error.bind(console, 'MongoDB connection error:'));
});

// configure the database schema
const push_schema = new mongoose.Schema({
  tstamp: { type: Date, default: Date.now },
  country: String,
  city: String
});

// Compile the model
var push_model = mongoose.model('pushes', push_schema);

// GET request incoming
app.get('/', (req, res) => {
  /*
  var new_data = new push_model({ country: "Turkey", city: "Istanbul"});
  new_data.save((err) => {
    if(err) throw err;
  })*/
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
  console.log('GET request to /push');

  const req_ip = req.connection.remoteAddress;
  if (! req_ip) {
    console.error("cannot retrieve ip of the request");
    res.redirect('/');
  }

  function handleError(error) {
    console.error(error);
    return res.redirect('/');
  }

  request('http://www.ipinfo.io/' + req_ip, (error, response, body) => {
    if (error) return handleError(error);
    console.log('ipinfo response\n',body);
    var new_push = new push_model({
      country: body.country,
      city: body.city
    });

    new_push.save( (err) => {
      if (err) return handleError(error);
      console.log('saved new push');
      return res.redirect('/');
    });

  });
});
