// server.js
// where your node app starts

// init project
const express = require('express');
const app = express();
const server = require('http').createServer(app);

// socket.io
const io = require('socket.io')(server);

// listen for requests :)
const listener = server.listen(process.env.PORT || 3000, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get('/editor', function(request, response) {
  response.sendFile(__dirname + '/views/editor.html');
});

app.get('/concert', function(request, response) {
  response.sendFile(__dirname + '/views/concert.html');
});

// app.get('/htmleditor', function(request, response) {
//   response.sendFile(__dirname + '/public/htmleditor/index.html');
// });

// DEBUG ROUTE
app.get('/num_connections', function(request, response) {
  response.send({numConnections});
})

var numConnections = 0;

const connections = {};

io.on('connection', function(socket){
  numConnections++;
  console.log('user connected :)');
  
  socket.on('disconnect', function(){
    numConnections--;
    console.log('user disconnected  :(');
  });
  
  /* TODO
    1. user makes some changes to the editor
    2. we need to be able to tell who is connected
  */
});

