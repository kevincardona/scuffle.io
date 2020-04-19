const express = require('express');
const socketio = require('socket.io');
const path = require('path');
const Constants = require('../src/constants');
const Game = require('./game');
const app = express();
const port = process.env.PORT || 3001;
const winston = require('winston')
winston.loggers.add('main-logger', winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
}))
const logger = winston.loggers.get('main-logger')

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
  app.use(express.static(path.join(__dirname, '../build')));
} else {
  console.log("Starting production server...")
  app.use(express.static(path.join(__dirname, '../build')));
}

const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

app.get('/api/playercount', (_, res) => {res.send({success: true, playerCount: game.getPlayerCount()})})

const io = socketio(server);
io.on('connection', socket => {
  logger.info(`Player connected: ${socket.id}`)
  socket.on(Constants.MSG_TYPES.LEAVE_ROOM, leaveRoom);
  socket.on(Constants.MSG_TYPES.JOIN_ROOM, joinRoom);
  socket.on(Constants.MSG_TYPES.MESSAGE, handlePlayerMessage)
  socket.on(Constants.MSG_TYPES.PLAYER_ACTION, handlePlayerAction)
  socket.on(Constants.MSG_TYPES.DISCONNECT, onDisconnect);
});

const game = new Game(io);

function leaveRoom() {
  game.leaveRoom(this);
}

function joinRoom(data) {
  game.addPlayer(this, data.nickname, data.room);
}

function handlePlayerMessage(message) {
  console.log(`Handling player message: ${message}`)
  game.handlePlayerMessage(this, message);
}

function handlePlayerAction(action) {
  game.handlePlayerAction(this, action);
}

function onDisconnect() {
  game.removePlayer(this);
}