// express und http Module importieren. Sie sind dazu da, die HTML-Dateien
// aus dem Ordner "public" zu veröffentlichen.
// add express and http module
var express = require('express');
var app = express();

var server = require('http').createServer(app);
// add Socket.io
var io = require('socket.io')(server, {
    cors: {
      origin: "http://localhost:8080",
      credentials: true,
      perMessageDeflate :false
    }
  });
// oif port is not set with an environment variable use port 3000
var port = process.env.PORT || 3000;

// start web server
server.listen(port, function () {
    // write note that web server is running
    console.log('Webserver läuft und hört auf Port %d', port);
});

// add path to public html files
app.use(express.static(__dirname + '/public'));

// === Code for Chat-Server - Socket.io code
 
io.on('connection', function (socket) {
    // socket represents the socket connection to client
    
    var addedUser = false;
    
    // if user enters his name do...
    socket.on('add_user', function (username) {
        // store username in current socket connection
        socket.username = username;
        addedUser = true;
            
        // send message to client so that he knows he is logged in
        socket.emit('login');
            
        // inform all other clients
        socket.broadcast.emit('user_joined', socket.username);
    });
    
    // when someone sends a message, inform all other clients
    socket.on('new_message', function (data) {
        // send message to other clients
        socket.broadcast.emit('new_message', {
            username: socket.username,
            message: data
        });
    });
    
    // when someone disconnects inform all other clients
    // users do not have to click on a button to disconnect, it is enough to close the browser window
    socket.on('disconnect', function () {
        if (addedUser) {
            // inform other clients
            socket.broadcast.emit('user_left', socket.username);
        }
    });
});

