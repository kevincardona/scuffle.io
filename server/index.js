const express = require('express');
const socketio = require('socket.io');
const path = require('path');
const Constants = require('../public/constants');
const Game = require('./game');
const app = express();
const port = process.env.PORT || 3001;

if (process.env.NODE_ENV === 'development') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  app.get('*', (req, res) => {  res.sendFile(path.join(__dirname+'../public/index.html'));})
} else {
  app.use(express.static('dist'));
}

const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

const io = socketio(server);
io.on('connection', socket => {
  console.log('Player connected!', socket.id);
  socket.on(Constants.MSG_TYPES.JOIN_ROOM, joinRoom);
  socket.on(Constants.MSG_TYPES.CREATE_ROOM, createRoom);
  socket.on(Constants.MSG_TYPES.DISCONNECT, onDisconnect);
});

const game = new Game();

function createRoom(data) {
  game.createRoom(this, data.nickname, data.roomCode)
}

function joinRoom(data) {
  game.addPlayer(this, data.nickname, data.roomCode);
}

function onDisconnect() {
  game.removePlayer(this);
}