var express = require('express');
var path = require('path');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Player = require('./models/player');

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.use(express.static(path.join(__dirname, 'node_modules')));
app.use(express.static(path.join(__dirname, 'public')));

var players_data = {};
io.on('connection', function(socket){
  console.log('user "',socket.id,'" connect');
  var id = socket.id;
  player = {
    id: id,
    position: {},
  };
  socket.on('joinGame', function(player_pos) {
    console.log('[socket.on][joinGame]', player_pos);
    player.position = player_pos;
    players_data[id] = player;
    socket.emit('joinGame', player);
  });
  players_data[socket.id] = player;
  socket.on('getAllPlayers', function() {
    console.log('[socket.on][getAllPlayers]', players_data);
    socket.emit('getAllPlayers', players_data);
  })
  socket.on('moving', function(pos) {
    console.log('[socket.on][moving]', pos);
    players_data[id].position = pos;
    socket.emit('moving', players_data);
  });
  socket.on('disconnect', function() {
    console.log('user "',socket.id,'" disconnect');
    delete players_data[socket.id];
  })
});


http.listen(3000, function() {
  console.log('listening on *:3000');
});
