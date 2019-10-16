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
  response.sendFile(__dirname + "/views/concert.html");
});

app.get("/editor", function(request, response) {
  response.sendFile(__dirname + "/views/editor.html");
});

app.get("/current_code_debug", function(request, response) {
  response.send({_code});
})


let _code = undefined;

io.on("connection", function(socket) {

  socket.on("livecode-update", function(code) {
    console.log("CODE UPDATE:",  code);
    // save the code here
    _code = code;
    
    // broadcast the code too
    socket.broadcast.emit('code', _code);
  })

  socket.on("disconnect", function() {
    //
  });
});
