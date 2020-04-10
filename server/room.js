const Constants = require('../src/constants');
const helpers = require('./utils/helpers');

class Room {
  constructor(io, room) {
    this.room = room;
    this.players = new Object();
    this.playerOrder = [];
    this.currentPlayer = null;
    this.io = io
    setInterval(this.update.bind(this), 500);
    this.generateTable()
  }

  generateTable() {
    let tally = 0
    this.unflipped = []
    this.flipped = []
    Object.keys(Constants.GAME.LETTER_DISTRIBUTION).forEach((letter)=>{
      for (let i = 0; i < Constants.GAME.LETTER_DISTRIBUTION[letter]; i++)
        this.unflipped.push(letter)
    })
    this.unflipped = helpers.shuffle(this.unflipped)
  }

  getRoomData() {
    const players = Object.keys(this.players).map((player) => {
      return this.players[player].nickname
    })
    const data = {
      unflipped: this.unflipped,
      flipped: this.flipped,
      players: players
    }
    
    return data;
  }

  update() {
    const currentPlayer = this.getRoomData()
    this.io.in(this.room).emit(Constants.MSG_TYPES.GAME_UPDATE, currentPlayer)    
  }

  addPlayer(socket, nickname) {
    this.players[socket.id] = {
      socket: socket,
      nickname: nickname
    }
    if (!this.currentPlayer)
      this.currentPlayer = socket.id;
    this.playerOrder.push(socket.id);
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