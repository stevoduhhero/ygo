/**
 * Module dependencies.
 */

var chalk = require('chalk');
var express = require('express');
var http = require('http');
var is = require('is_js');
var path = require('path');
var socketio = require('socket.io');

var events = require('./lib/events');

/**
 * Create an express application.
 */

var app = express();
var server = http.Server(app);
var io = socketio(server);

/**
 * Serve the static files. 
 */

app.use(express.static(path.join(__dirname, 'public')));

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

io.on('connection', function(socket) {

  var user = socket;

  /**
   * Send an event.
   *
   * @param {Object} data
   */

  user.send = function(data) {
    user.emit('e', data);
  };

  socket.on('e', function(data) {
		if (typeof data != "object" || !data.event) return;
    console.log(data.event);
    if (is.propertyDefined(events, data.event)) {
      events[data.event](user, data);
    }
  });

  socket.on('disconnect', function() {
    console.log('a user disconnected');
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
