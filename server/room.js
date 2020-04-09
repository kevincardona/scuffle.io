const Constants = require('../public/constants');

class Room {
  constructor(roomCode) {
    this.roomCode = roomCode;
    this.players = {}
  }

  addPlayer(socket, nickname) {
    this.players[socket.id] = {
      socket: socket,
      nickname: nickname
    }
  }

  removePlayer(socket) {
    delete this.players[socket.id]
  }

  addWord(word) {
    this.words.push(word)
  }

  removeWord(word) {
  }

  serializeForUpdate() {
    return {
      id: this.id,
      words: this.words
    }
  }
}

module.exports = Room;