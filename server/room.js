const Constants = require('../src/constants');
const helpers = require('./utils/helpers');

class Room {
  constructor(io, room) {
    this.room = room;
    this.players = new Object();
    this.playerOrder = new Array();
    this.flipped = new Array(Constants.GAME.TILE_COUNT)
    this.currentPlayer = null;
    this.io = io
    setInterval(this.update.bind(this), 500);
    this.generateTable()
  }

  generateTable() {
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
      unflippedCount: this.unflipped.length,
      flipped: this.flipped,
      players: players
    }
    
    return data;
  }

  getSocket(playerId) {return this.players[playerId].socket}

  update() {
    const currentPlayer = this.getRoomData()
    this.io.in(this.room).emit(Constants.MSG_TYPES.GAME_UPDATE, currentPlayer)    
  }

  flipTile(data) {
    let newLetter = this.unflipped.pop()
    if (!newLetter) return
    this.flipped.push(newLetter);
    this.sendServerMessage(`${data.player} flipped the letter ${newLetter}`)
  }

  checkCenter(letters) {
    let foundLetters = {}
    for (const letter of letters) {
      let found = false
      for(let i = 0; i < this.flipped.length; i++) {
        const flippedLetter = this.flipped[i];
        if (letter.toLowerCase() == flippedLetter.toLowerCase() && !foundLetters[i]) {
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
  }

  claimWord(data, word) {
    let indices = this.checkCenter([...word.toLowerCase()]);
    if (indices !== false) {
      this.takeFromCenter(indices)
    } else {
      this.sendPrivateServerMessage(this.getSocket(data.playerId), 'That word can\'t be made!')
    }
  }

  handlePlayerMessage(data) {
    const commands = data.message.toLowerCase().split(' ')
    if (Constants.COMMANDS[commands[0]]) {
      this.handleCommand(data, commands[0], commands.slice(1))
    } else {
      this.sendMessage(data)
    }
  }

  handleCommand(data, command, args) {
    switch(command) {
      case Constants.COMMANDS.FLIP:
        return this.flipTile(data)
      case Constants.COMMANDS.CLAIM:
        return this.claimWord(data, args[0])
    }
  }

  sendPrivateServerMessage(socket, message) {
    const data = {
      type: Constants.CHAT_MSG_TYPES.SERVER_MESSAGE,
      typeModifier: Constants.CHAT_MSG_TYPES.MODIFIERS.PRIVATE,
      message: message
    }
    socket.emit(Constants.MSG_TYPES.MESSAGE, data)
  }

  sendServerMessage(message) {
    const data = {
      type: Constants.CHAT_MSG_TYPES.SERVER_MESSAGE,
      message: message
    }
    this.sendMessage(data)
  }

  sendMessage(data) {
    switch (data.type) {
      case Constants.CHAT_MSG_TYPES.SERVER_MESSAGE:
        return this.io.in(this.room).emit(Constants.MSG_TYPES.MESSAGE, data) 
      case Constants.CHAT_MSG_TYPES.PLAYER_MESSAGE:
        return this.io.in(this.room).emit(Constants.MSG_TYPES.MESSAGE, data) 
    }
  }

  addPlayer(socket, nickname) {
    this.players[socket.id] = {
      socket: socket,
      nickname: nickname
    }
    if (!this.currentPlayer)
      this.currentPlayer = socket.id;
    this.playerOrder.push(socket.id);
    this.sendServerMessage(`${nickname} has joined the room!`)
  }

  removePlayer(socket) {
    this.sendServerMessage(`Player: ${this.players[socket.id].nickname} has left the room!`)
    delete this.players[socket.id]
  }
}

module.exports = Room;