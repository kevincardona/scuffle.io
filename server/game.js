const Constants = require('../src/constants');
const Room = require('./room');

class Game {
  constructor(io) {
    this.io = io
    this.players = {};
    this.rooms = {};
    this.lastUpdateTime = Date.now();
    this.shouldSendUpdate = false;
  }

  getPlayerRoom(socket) {
    if (this.players[socket.id])
      return this.rooms[this.players[socket.id].room]
  }

  handlePlayerMessage(socket, message) {
    const data = {
      type: Constants.CHAT_MSG_TYPES.PLAYER_MESSAGE,
      player: this.players[socket.id].nickname,
      playerId: socket.id,
      message: message
    }
    this.getPlayerRoom(socket).handlePlayerMessage(data)
  }

  handlePlayerAction(socket, action) {
    const data = {
      player: this.players[socket.id].nickname,
      playerId: socket.id,
      action: action
    }
    this.getPlayerRoom(socket).handlePlayerCommand(data, action.command, action.args)
  }

  leaveRoom(socket) {
    const room = this.getPlayerRoom(socket)
    if (room) {
      room.removePlayer(socket)
      socket.leave(room.room)
    }
  }

  addPlayer(socket, nickname, room) {
    if (this.rooms[room]) {
      this.rooms[room].addPlayer(socket, nickname)
    } else {
      this.rooms[room] = new Room(this.io, room)
      this.rooms[room].addPlayer(socket, nickname, room)
    }
    socket.join(room)
    this.players[socket.id] = {
      nickname: nickname,
      socket: socket,
      room: room
    }
  }

  removePlayer(socket) {
    this.leaveRoom(socket)
    delete this.players[socket.id];
  }
}

module.exports = Game;