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

  getPlayerRoom(id) {
    if (this.players[id])
      return this.rooms[this.players[id].room]
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

  handleMessage(socket, message) {
    const data = {
      player: this.players[socket.id].nickname,
      message: message
    }
    this.io.in(this.players[socket.id].room).emit(Constants.MSG_TYPES.SEND_MESSAGE, data)
  }

  removePlayer(socket) {
    this.getPlayerRoom(socket.id) && this.getPlayerRoom(socket.id).removePlayer(socket)
    delete this.players[socket.id];
  }

  handlePlayerUpdate(socket, data) {
    this.getPlayerRoom(socket.id) && this.getPlayerRoom(socket.id).update(socket, data)
  }
}

module.exports = Game;