// server.js
// where your node app starts

// init project
const express = require("express");
const app = express();
const server = require("http").createServer(app);

// socket.io
const io = require("socket.io")(server);

// listen for requests :)
const listener = server.listen(process.env.PORT || 3000, function() {
  console.log("Your app is listening on port " + listener.address().port);
});

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function(request, response) {
  response.sendFile(__dirname + "/views/register.html");
});

app.get("/editor", function(request, response) {
  response.sendFile(__dirname + "/views/editor.html");
});

app.get("/concert", function(request, response) {
  response.sendFile(__dirname + "/views/concert.html");
});

// DEBUG ROUTE
app.get("/num_connections", function(request, response) {
  response.send({ numConnections: Object.keys(connections) });
});

const connections = {};

io.on("connection", function(socket) {
  socket.on("added user", function(username) {
    // lets not worry about unique usernames...
    console.log(`added user:  ${username}`);
    const guid = username + +new Date();
    connections[guid] = { guid };
    socket.send(connections[guid]);
  });

  socket.on("livecode-enter", function(guid) {
    console.log("livecode-enter + ", guid);
  });
  
  socket.on("livecode-update", function(guid, code) {
    console.log("CODE UPDATE:", guid, code);
  })

  socket.on("disconnect", function() {
    //
  });
});
