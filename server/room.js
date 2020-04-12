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
    setInterval(this.update.bind(this), 250);
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
      return {
        nickname: this.players[player].nickname,
        playerId: this.players[player].playerId,
        words: this.players[player].words,
        score: this.players[player].score
      }
    })
    const data = {
      unflippedCount: this.unflipped.length,
      flipped: this.flipped,
      players: players
    }
    
    return data;
  }1

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

  checkCenterForWord(letters) {
    let foundLetters = {}
    for (const letter of letters) {
      let found = false
      for(let i = 0; i < this.flipped.length; i++) {
        const flippedLetter = this.flipped[i];
        if (letter.toUpperCase() == flippedLetter.toUpperCase() && !foundLetters[i]) {
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

  createWord(data, word) {
    let indices = this.checkCenterForWord([...word.toUpperCase()]);
    const player = this.players[data.playerId]
    if (indices !== false) {
      if (!player.words)
        player.words = []
      player.words.push(word.toUpperCase());
      player.score += word.length
      this.takeFromCenter(indices)
      this.sendServerMessage(`Player: ${player.nickname} made the word: ${word}`)
    } else {
      this.sendPrivateServerMessage(this.getSocket(data.playerId), 'That word can\'t be made!')
    }
  }

  stealWord(data, args) {
    const oldWord = args[0].word
    const newWord = args[1]
    console.log("turning" + oldWord)
    console.log("into" + newWord)
    
  }

  handlePlayerMessage(data) {
    const commands = data.message.toUpperCase().split(' ')
    if (Constants.COMMANDS[commands[0].toUpperCase()]) {
      this.handleCommand(data, commands[0], commands.slice(1))
    } else {
      this.sendMessage(data)
    }
  }

  handleCommand(data, command, args) {
    switch(command) {
      case Constants.COMMANDS.FLIP:
        return this.flipTile(data)
      case Constants.COMMANDS.CREATE_WORD:
        return this.createWord(data, args[0])
      case Constants.COMMANDS.STEAL_WORD:
        return this.stealWord(data, args)
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
      playerId: socket.id,
      nickname: nickname,
      score: 0
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