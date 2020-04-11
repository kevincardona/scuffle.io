const express = require('express');
const socketio = require('socket.io');
const path = require('path');
const Constants = require('../src/constants');
const Game = require('./game');
const app = express();
const port = process.env.PORT || 3001;

if (process.env.NODE_ENV === 'development') {
  app.use(express.static(path.join(__dirname, '../build')));
} else {
  console.log("Starting production server...")
  app.use(express.static(path.join(__dirname, '../build')));
}

const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

const io = socketio(server);
io.on('connection', socket => {
  console.log('Player connected!', socket.id);
  socket.on(Constants.MSG_TYPES.JOIN_ROOM, joinRoom);
  socket.on(Constants.MSG_TYPES.MESSAGE, handlePlayerMessage)
  socket.on(Constants.MSG_TYPES.DISCONNECT, onDisconnect);
});

const game = new Game(io);

function joinRoom(data) {
  game.addPlayer(this, data.nickname, data.room);
}

function handlePlayerMessage(message) {
  console.log(`Handling player message: ${message}`)
  game.handlePlayerMessage(this, message);
}

function onDisconnect() {
  game.removePlayer(this);
}