/**
 * Module dependencies.
 */

var chalk = require('chalk');
var express = require('express');
var http = require('http');
var path = require('path');
var socketio = require('socket.io');

/**
 * Create an express application.
 */

var app = express();
var server = http.Server(app);
var io = socketio(server);

/**
 * GET /
 * Home page.
 */

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});

/**
 * Socket connections.
 */

io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});

/**
 * Start Express server.
 */

app.set('port', 8000);
server.listen(app.get('port'), function() {
  var env = '\n[' + chalk.green(app.get('env')) + ']';
  var port = chalk.magenta(app.get('port'));
  console.log(env + ' Listening on port ' + port + '...\n');
});
