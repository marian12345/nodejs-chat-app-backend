// express und http Module importieren. Sie sind dazu da, die HTML-Dateien
// aus dem Ordner "public" zu veröffentlichen.
// add express and http module
var express = require('express');
var fs = require('fs');
var app = express();

var server = require('http').createServer(app);

var httpPort = 3000;
var httpsPort = 443;
// add Socket.io
var io = require('socket.io')(server, {
    cors: {
      origin: ["https://marian12345.github.io/new-vue-project/", "http://localhost:8080"],
      credentials: true,
      perMessageDeflate :false
    }
});

// Set up https server
if (process.env.NODE_ENV === 'production') {
    console.log("Production mode on");
    // use actual http port
    httpPort = 80;
    
    // Certificate for Domain 1
    const privateKey1 = fs.readFileSync('/etc/letsencrypt/live/www.vivaldiseinhaus.de/privkey.pem', 'utf8');
    const certificate1 = fs.readFileSync('/etc/letsencrypt/live/www.vivaldiseinhaus.de/cert.pem', 'utf8');
    const ca1 = fs.readFileSync('/etc/letsencrypt/live/www.vivaldiseinhaus.de/chain.pem', 'utf8');
    const certCredentials = {
        key: privateKey1,
        cert: certificate1,
        ca: ca1
    };

    const httpsServer = https.createServer(certCredentials, app);

    // start https web server
    httpsServer.listen(httpsPort, function () {
        // write note that web server is running
        console.log('HTTPS Webserver läuft und hört auf https Port %d', httpsPort);
    });
}

// start http web server
server.listen(httpPort, function () {
    // write note that web server is running
    console.log('HTTP Webserver läuft und hört auf Port %d', httpPort);
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

