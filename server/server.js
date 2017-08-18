#!/usr/bin/env node

/**
 * Load .env variables
 */
const path = require('path');
const rootDir = path.dirname(__dirname);

require('dotenv').config({
  path: __dirname + '/.env'
});

/**
 * Module dependencies.
 */
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const jwt = require('jsonwebtoken');
const app = express();

/**
 * Connect do mongoDB.
 */
let mongodbUser = '';
if (process.env.DB_USER && process.env.DB_PASS) {
  mongodbUser = process.env.DB_USER + ':' + process.env.DB_PASS + '@';
}
mongoose.Promise = global.Promise;
mongoose.connect(
  'mongodb://' + mongodbUser + 'localhost:' + process.env.DB_PORT + '/myVideoBase',
  {
    useMongoClient: true
  }
);

/**
 * setup express routes
 */
// CORS, todo: remove later
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Authorization, Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Parsers
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Angular DIST output folder
app.use(express.static(path.join(rootDir, 'dist')));

// API location
app.use('/api/account', require('./routes/api/account'));

// secure protected APIs
app.use('/api/film', (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }
  // verify token
  let token = req.header('Authorization');
  if (token) {
    token = token.substr('Bearer '.length);
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    // token is not valid
    if (err) {
      return res.status(401).json({
        status: 401,
        message: "You are not allowed to call this action!",
      });
    }
    req._accountId = decoded.account;
    next();
  });
});

// process protected APIs
app.use('/api/film', require('./routes/api/film'));

// Send all other requests to the Angular app
app.get('*', (req, res) => {
  res.sendFile(path.join(rootDir, 'dist/index.html'));
});


/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Listen on provided port, on localhost.
 */
server.listen(process.env.PORT, 'localhost');
server.on('listening', () => {
  console.log('Listening on port ' + server.address().port);
});
