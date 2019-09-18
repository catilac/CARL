// server.js
// where your node app starts

// init project
const express = require('express');
const app = express();
const http = require('http').createServer(app);

// socket.io
const io = require('socket.io')(http);

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

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
})

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});

io.on('connection', function(socket){
  console.log('a user connected  :)');
  socket.on('disconnect', function(){
    console.log('user disconnected  :(');
  });
});