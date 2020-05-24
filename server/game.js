const Constants = require('../src/constants');
const crypto    = require('crypto');
const Room = require('./room');
const { loggers } = require('winston')
const logger = loggers.get('main-logger')

class Game {
  constructor(io) {
    this.io = io
    this.players = {};
    this.rooms = {};
    this.publicRooms = []
    this.lastUpdateTime = Date.now();
    this.shouldSendUpdate = false;
  }

  handlePlayerMessage(socket, message) {
    if (!this.players[socket.id]) return logger.error(`Unable to handle unregistered player action with socket id: ${socket.id}`)
    const data = {
      type: Constants.CHAT_MSG_TYPES.PLAYER_MESSAGE,
      player: this.players[socket.id].nickname,
      playerId: socket.id,
      message: message
    }
    this.getPlayerRoom(socket).handlePlayerMessage(data)
  }

  handlePlayerAction(socket, action) {
    if (!this.players[socket.id]) return logger.error(`Unable to handle unregistered player action with socket id: ${socket.id}`)
    const data = {
      player: this.players[socket.id].nickname,
      playerId: socket.id,
      action: action
    }
    this.getPlayerRoom(socket).handlePlayerCommand(data, action.command, action.args)
  }

  getPlayerCount() {
    return Object.keys(this.players).length
  }

  getPlayerRoom(socket) {
    if (this.players[socket.id])
      return this.rooms[this.players[socket.id].room]
  }

  getPrivateRoom(roomId) {
    if (roomId)
      return this.rooms[roomId] !== undefined && roomId
    let room = crypto.randomBytes(20).toString('hex');
    if (this.rooms[room])
      return this.getPrivateRoom()
    this.rooms[room] = new Room(this.io, room, true);
    return room
  }

  getPublicRoom(roomId) {
    if (this.rooms[roomId] !== undefined)
      return roomId
    for (let i = 0; i < this.publicRooms.length; i++) {
      if (this.rooms[this.publicRooms[i]] && this.rooms[this.publicRooms[i]].activePlayerCount() < 6) {
        return this.publicRooms[i];
      }
    }
    let room = crypto.randomBytes(20).toString('hex');
    this.rooms[room] = new Room(this.io, room, false);
    this.publicRooms.push(room);
    return room
  }

  addPlayer(socket, nickname, room, isPrivate = false) {
    logger.info(`Player ${nickname} has joined room ${room} with socket id: ${socket.id}`)
    if (isPrivate) 
      room = this.getPrivateRoom(room) 
    else
      room = this.getPublicRoom(room)

    if (this.players[socket.id])
      return this.rooms[room].addPlayer(socket, nickname)

    if (this.rooms[room])
      this.rooms[room].addPlayer(socket, nickname)
    else
      return socket.emit(Constants.MSG_TYPES.ERROR, {message: "This game is no longer active!", exit: true}) 

    socket.join(room)
    this.players[socket.id] = {
      nickname: nickname,
      socket: socket,
      room: room
    }
  }

  leaveRoom(socket) {
    const room = this.getPlayerRoom(socket)
    if (room) {
      room.removePlayer(socket)
      socket.leave(room.id, () => {
        if (room.isEmpty()) {
          logger.info(`No players left in room:${room.id}. Deleting...`)
          this.publicRooms.splice(this.publicRooms.indexOf(room.id), 1)
          this.rooms[room.id] = null
          room.destroy()
          delete this.rooms[room.id]
        }
      })
    }
  }

  removePlayer(socket) {
    logger.info(`Removing player with socket id: ${socket.id}`)
    this.leaveRoom(socket)
    delete this.players[socket.id];
  }
}

module.exports = Game;