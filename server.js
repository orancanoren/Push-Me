const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
//const bodyParser = require('body-parser');

// Start the app and configure it
const app = express();
app.set('view engine', 'ejs');
app.use(morgan('tiny'));
app.use(express.static('public'));

// Set up the server & connect to the database
var db;
var listener = app.listen(process.env.PORT || 3000, function() {
  console.log('Listening on port %d', listener.address().port);
  mongoose.connect('mongodb://localhost:25566/push_db');
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
  })
  */
  var query = push_model.find();
  query.sort({ tstamp: -1 });
  query.limit(10);
  query.exec((err, result) => {
    if (err) return console.error(err);
    res.render('index.ejs', { pushes: result });
  });
});

app.post('/push', (req, res) => {
  // Handle a push
})
