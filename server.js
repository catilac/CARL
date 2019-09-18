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
})
app.get('/htmleditor', function(request, response) {
  response.sendFile(__dirname + '/htmleditor/index.html');
})

io.on('connection', function(socket){
  console.log('a user connected  :)');
  socket.on('disconnect', function(){
    console.log('user disconnected  :(');
  });
});

