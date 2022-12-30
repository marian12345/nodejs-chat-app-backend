// express und http Module importieren. Sie sind dazu da, die HTML-Dateien
// aus dem Ordner "public" zu veröffentlichen.
// add express and http module
var express = require("express");
var fs = require("fs");
var app = express();

var server = require("http").createServer(app);
var port = process.env.PORT || 3000;

// change from http to https server when in production
/**
 * The following code section is only executed in combination with certbot and
 * when the application is deployed on a public server (production mode).
 * It is not used when deplyoying on Heroku or fly.io
 */
if (process.env.NODE_ENV === "production") {
  console.log("production mode on");
  // use https port
  port = 443;

  // Certificate for Domain 1
  const privateKey1 = fs.readFileSync(
    "/etc/letsencrypt/live/www.vivaldiseinhaus.de/privkey.pem",
    "utf8"
  );
  const certificate1 = fs.readFileSync(
    "/etc/letsencrypt/live/www.vivaldiseinhaus.de/cert.pem",
    "utf8"
  );
  const ca1 = fs.readFileSync(
    "/etc/letsencrypt/live/www.vivaldiseinhaus.de/chain.pem",
    "utf8"
  );
  const certCredentials = {
    key: privateKey1,
    cert: certificate1,
    ca: ca1,
  };

  server = require("https").createServer(certCredentials, app);
}

// add Socket.io
var io = require("socket.io")(server, {
  cors: {
    origin: ["https://marian12345.github.io", "http://localhost:8080"],
    credentials: true,
    perMessageDeflate: false,
  },
});

// start http web server
server.listen(port, function () {
  // write note that web server is running
  console.log("Webserver läuft und hört auf Port %d", port);
});

// add path to public html files
app.use(express.static(__dirname + "/public"));

// === Code for Chat-Server - Socket.io code

io.on("connection", function (socket) {
  // socket represents the socket connection to client

  var addedUser = false;

  // if user enters his name do...
  socket.on("add_user", function (username) {
    // store username in current socket connection
    socket.username = username;
    addedUser = true;

    // send message to client so that he knows he is logged in
    socket.emit("login");

    // inform all other clients
    socket.broadcast.emit("user_joined", socket.username);
  });

  // when someone sends a message, inform all other clients
  socket.on("new_message", function (data) {
    // send message to other clients
    socket.broadcast.emit("new_message", {
      username: socket.username,
      message: data,
    });
  });

  // when someone disconnects inform all other clients
  // users do not have to click on a button to disconnect, it is enough to close the browser window
  socket.on("disconnect", function () {
    if (addedUser) {
      // inform other clients
      socket.broadcast.emit("user_left", socket.username);
    }
  });
});
