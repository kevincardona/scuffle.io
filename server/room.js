const Constants = require('../src/constants');
const helpers = require('./utils/helpers');
const checkWord = require('check-word'), words = checkWord('en');

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
  }
  
  resetGame() {
    Object.keys(this.players).forEach((player) => {
      this.players[player].words = []
      this.players[player].score = 0;
    })
    this.generateTable();
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
      room: this.room,
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
    if (this.unflipped.length === 0)
      this.sendServerMessage(`There are no letters left to flip! To reset the game type RESET_GAME in chat!`)

  }

  isValidWord(word) {
    if (!word || word.length < 3)
      return false
    return words.check(word)
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

  addWordToPlayer(playerId, word) {
    const player = this.players[playerId]
    if (!player.words)
      player.words = []
    player.words.push(word.toUpperCase());
    player.score += word.length
  }

  removeWordFromPlayer(playerId, word) {
    const player = this.players[playerId]
    if (!player.words)
      player.words = []
    player.words.splice(player.words.indexOf(word), 1)
    player.score -= word.length
  }

  createWord(data, word) {
    if (!this.isValidWord(word)) {
      return this.sendPrivateServerMessage(this.getSocket(data.playerId), 'That\'s an invalid word! Your word needs to be real and at least 3 characters long!')
    }
    let indices = this.checkCenterForWord([...word.toUpperCase()]);
    const player = this.players[data.playerId]
    if (indices !== false) {
      this.addWordToPlayer(data.playerId, word)
      this.takeFromCenter(indices)
      this.sendServerMessage(`${player.nickname} made the word: ${word}`)
    } else {
      this.sendPrivateServerMessage(this.getSocket(data.playerId), 'That word can\'t be made!')
    }
  }

  getLetterMap(word) {
    const letters = {}
    for(let i = 0; i < word.length; i++) {
      if (!letters[word.charAt(i)])
        letters[word.charAt(i).toUpperCase()] = 0
      letters[word.charAt(i).toUpperCase()]++;
    }
    return letters;
  }

  letterMapToWord(letterMap) {
    let word = []
    Object.keys(letterMap).forEach((letter) => {
      for(let i = 0; i < letterMap[letter]; i++) {
        word.push(letter.toUpperCase())
      }
    })
    return word
  }

  checkWordContainsOther(newWordMap, oldWordMap) {
    Object.keys(oldWordMap).forEach((letter) => {
      if (oldWordMap[letter] > newWordMap[letter]) {
        return false
      } else if (oldWordMap[letter] == newWordMap[letter]) {
        delete newWordMap[letter];
      } else {
        newWordMap[letter] -= oldWordMap[letter]
      }
    })
    if (Object.keys(newWordMap).length === 0)
      return false
    return newWordMap
  }

  stealWord(data, args) {
    const oldWord = args[0].word
    const newWord = args[1]
    if (!newWord || !oldWord) {
      return
    }
    const difference = this.checkWordContainsOther(this.getLetterMap(newWord), this.getLetterMap(oldWord))
    console.warn("DIFFERENCE")
    console.warn(difference)
    if (!difference) {
      return this.sendPrivateServerMessage(this.getSocket(data.playerId), `The word ${newWord} doesn't contain all of the letters from ${oldWord} + at least 1 from the center!!`);
    }
    if (!this.isValidWord(newWord)) {
      return this.sendPrivateServerMessage(this.getSocket(data.playerId), 'That\'s an invalid word! Your word needs to be real and at least 3 characters long!')
    }
    const correctCenterPieces = this.checkCenterForWord(this.letterMapToWord(difference));
    if (!correctCenterPieces) {
      return this.sendPrivateServerMessage(this.getSocket(data.playerId), `The word ${newWord} contains some letters that aren't in the center!!`);
    } else {
      this.takeFromCenter(correctCenterPieces)
    }
    this.removeWordFromPlayer(args[0].playerId, oldWord);
    this.addWordToPlayer(data.playerId, newWord);
    this.sendServerMessage(`${this.players[data.playerId].nickname} stole the word: ${oldWord.toUpperCase()} to create: ${newWord.toUpperCase()}!!!`)

  }

  handlePlayerMessage(data) {
    const commands = data.message.toUpperCase().split(' ')
    if (Constants.COMMANDS[commands[0].toUpperCase()]) {
      this.handlePlayerCommand(data, commands[0], commands.slice(1))
    } else {
      this.sendMessage(data)
    }
  }

  handlePlayerCommand(data, command, args) {
    switch(command) {
      case Constants.COMMANDS.FLIP:
        return this.flipTile(data)
      case Constants.COMMANDS.CREATE_WORD:
        return this.createWord(data, args[0])
      case Constants.COMMANDS.STEAL_WORD:
        return this.stealWord(data, args)
      case Constants.COMMANDS.RESET_GAME:
        return this.resetGame()
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
    if (this.players[socket.id])
      this.sendServerMessage(`${this.players[socket.id].nickname} has left the room!`)
    delete this.players[socket.id]
  }
}

module.exports = Room;