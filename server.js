/**
 * Module dependencies.
 */
var chalk = require('chalk');
var express = require('express');
var http = require('http');
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

// usernames which are currently connected to the chat
var usernames = {};
var numUsers = 0;

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
        if (typeof data !== "object" || !data.event) return;
        console.log(data.event);
        if (events[data.event]) {
            events[data.event](user, data);
        }
    });

    var addedUser = false;

    // when the client emits 'new message', this listens and executes
    socket.on('new message', function(data) {
        // we tell the client to execute 'new message'
        socket.broadcast.emit('new message', {
            username: socket.username,
            message: data
        });
    });

    // when the client emits 'add user', this listens and executes
    socket.on('add user', function(username) {
        // we store the username in the socket session for this client
        socket.username = username;
        // add the client's username to the global list
        usernames[username] = username;
        ++numUsers;
        addedUser = true;
        socket.emit('login', {
            numUsers: numUsers
        });
        // echo globally (all clients) that a person has connected
        socket.broadcast.emit('user joined', {
            username: socket.username,
            numUsers: numUsers
        });
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', function() {
        console.log('a user disconnected');
        // remove the username from global usernames list
        if (addedUser) {
            delete usernames[socket.username];
            --numUsers;

            // echo globally that this client has left
            socket.broadcast.emit('user left', {
                username: socket.username,
                numUsers: numUsers
            });
        }
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
