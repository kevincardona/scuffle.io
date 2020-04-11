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

  flipTile(player) {
    const newLetter = this.unflipped.pop()
    this.flipped.push(newLetter);
    this.sendServerMessage(`${player} flipped the letter ${newLetter}`)
  }
  
  handleCommand(data) {
    switch(data.message) {
      case 'flip':
        this.flipTile(data.player)
    }
  }

  handlePlayerMessage(data) {
    if (Constants.CHAT_MSG_TYPES.COMMANDS[data.message]) {
      this.handleCommand(data)
    } else {
      this.sendMessage(data)
    }
  }

  sendServerMessage(message) {
    const data = {
      type: Constants.CHAT_MSG_TYPES.SERVER_MESSAGE,
      message: message
    }
    this.sendMessage(data)
  }

  sendMessage(data) {
    this.io.in(this.room).emit(Constants.MSG_TYPES.MESSAGE, data) 
  }

  addPlayer(socket, nickname) {
    this.players[socket.id] = {
      socket: socket,
      nickname: nickname
    }
    if (!this.currentPlayer)
      this.currentPlayer = socket.id;
    this.playerOrder.push(socket.id);
    this.sendServerMessage(`Player: ${nickname} has joined the room!`)
  }

  removePlayer(socket) {
    this.sendServerMessage(`Player: ${this.players[socket.id].nickname} has left the room!`)
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