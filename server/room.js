const Constants = require('../src/constants');
const helpers = require('./utils/helpers');

class Room {
  constructor(io, room) {
    this.room = room;
    this.players = new Object();
    this.playerOrder = [];
    this.flipped = new Array(Constants.GAME.TILE_COUNT)
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
    this.letterIndex = {}
    this.unflipped.forEach((letter, index) => {

    })
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

  flipTile(data, index) {
    let newLetter = null
    if (index) {
      newLetter = this.unflipped[index]
      if (newLetter) {
        this.unflipped.splice(index, 1)
      }
    } else {
      newLetter = this.unflipped.pop()
    }
    if (!newLetter)
      return
    this.flipped.push(newLetter);
    this.sendServerMessage(`${data.player} flipped the letter ${newLetter}`)
  }

  checkCenter(letters) {
    let foundLetters = {}
    for (const letter of letters) {
      let found = false
      for(let i = 0; i < this.flipped.length; i++) {
        const flippedLetter = this.flipped[i];
        if (letter == flippedLetter && found[i] == undefined) {
          foundLetters[i] = i;
          found = true;
          break
        }
      }
      if (!found) {
        return false
      }
    }
    return foundLetters
  }

  takeFromCenter(indices) {
    this.flipped = this.flipped.filter((_, index) => {
      return indices[index] == undefined
    })
    console.log(this.flipped)
  }

  claimWord(data, word) {
    let indices = this.checkCenter([...word.toUpperCase()]);
    if (indices !== false) {
      this.takeFromCenter(indices)
    } else {
      this.sendServerMessage('NOT FOUND FOOL')
    }
  }

  handlePlayerMessage(data) {
    const commands = data.message.split(' ')
    if (Constants.CHAT_MSG_TYPES.COMMANDS[commands[0]]) {
      this.handleCommand(data, commands)
    } else {
      this.sendMessage(data)
    }
  }
  
  handleCommand(data, commands) {
    switch(commands[0]) {
      case 'flip':
        return this.flipTile(data, parseInt(commands.slice(1)))
      case 'claim':
        return this.claimWord(data, commands[1])
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

  serializeForUpdate() {
    return {
      id: this.id,
      words: this.words
    }
  }
}

module.exports = Room;