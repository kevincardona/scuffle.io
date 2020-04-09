const Constants = require('../public/constants');
const Room = require('./room');

class Game {
  constructor() {
    this.players = {};
    this.rooms = {};
    this.lastUpdateTime = Date.now();
    this.shouldSendUpdate = false;
  }

  getPlayerRoom(id) {
    if (this.players[id])
      return this.rooms[this.players[id].roomCode]
  }

  createRoom(socket, nickname, roomCode) {
    if (!roomCode || !nickname) {
      return socket.emit(Constants.MSG_TYPES.DISCONNECT)
    }
    this.rooms[roomCode] = new Room(roomCode)
    this.addPlayer(socket, nickname, roomCode)
  }

  addPlayer(socket, nickname, roomCode) {
    this.players[socket.id] = {
      socket: socket,
      roomCode: roomCode
    }
    if (this.rooms[roomCode]) {
      this.rooms[roomCode].addPlayer(socket, nickname)
    } else {
      socket.emit(Constants.MSG_TYPES.LEAVE_ROOM, {message: "No room found with given roomcode!"})
      this.removePlayer(socket)
    }
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