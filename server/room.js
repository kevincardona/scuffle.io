const Constants = require('../src/constants');
const helpers = require('./utils/helpers');
const checkWord = require('check-word'), words = checkWord('en');

class Room {
  constructor(io, room) {
    this.room = room;
    this.players = {};
    this.playerOrder = [];
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
    if (word == null || word.length < 3)
      return false
    return words.check(word.toLowerCase())
  }

  checkCenterForWord(word) {
    const letters = [...word];
    let foundLetters = {}
    for (const letter of letters) {
      let found = false
      for(let i = 0; i < this.flipped.length; i++) {
        const flippedLetter = this.flipped[i];
        if (letter.toUpperCase() === flippedLetter.toUpperCase() && !foundLetters[i]) {
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
      return indices[index] === undefined
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
    let indices = this.checkCenterForWord(word.toUpperCase());
    const player = this.players[data.playerId]
    if (indices !== false) {
      this.addWordToPlayer(data.playerId, word)
      this.takeFromCenter(indices)
      this.sendServerMessage(`${player.nickname} made the word: ${word}`)
    } else {
      this.sendPrivateServerMessage(this.getSocket(data.playerId), 'That word can\'t be made!')
    }
  }

  stealWord(data, args) {
    let oldWord = args[0].word.toUpperCase()
    let newWord = args[1].toUpperCase()
    const difference = this.checkWordContainsOther(this.getLetterMap(newWord), this.getLetterMap(oldWord))
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
    this.sendServerMessage(`${this.players[data.playerId].nickname} stole the word: ${oldWord} to create: ${newWord}!!!`)

  }

  putBackWord(data, word) {
    let player = this.players[data.playerId]
    if (player.words.indexOf(word) !== -1) {
      this.removeWordFromPlayer(data.playerId, word)
      this.sendServerMessage(`${player.nickname} put ${word} back into the mix!`)
      this.flipped = this.flipped.concat([...word])
    } else {
      return this.sendPrivateServerMessage(this.getSocket(data.playerId), `Failed to put back word ${word}! Are you sure that's not someone elses?`);
    }
  }

  getLetterMap(word) {
    let letters = {};
    for(let i = 0; i < word.length; i++) {
      if (!letters[word.charAt(i)])
        letters[word.charAt(i).toUpperCase()] = 0
      letters[word.charAt(i).toUpperCase()] = letters[word.charAt(i).toUpperCase()] + 1;
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
    const letters = Object.keys(oldWordMap);
    for(let i = 0; i < letters.length; i++) {
      let letter = letters[i];
      if (!newWordMap[letter] || oldWordMap[letter] > newWordMap[letter]) {
        return false
      }
      newWordMap[letter] -= oldWordMap[letter]
      if (newWordMap[letter] === 0)
        delete newWordMap[letter];
    }
    if (Object.keys(newWordMap).length === 0)
      return false
    return newWordMap
  }

  handlePlayerMessage(data) {
    if (data.message && data.message[0] === '/') {
      const commands = data.message.slice(1,).toUpperCase().split(' ')
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
      case Constants.COMMANDS.PUT_BACK:
        return this.putBackWord(data, args[0])
      case Constants.COMMANDS.RESET_GAME:
        return this.resetGame()
      case Constants.COMMANDS.RULES:
        return this.sendPrivateServerMessage(this.getSocket(data.playerId), Constants.SERVER_PROMPTS.RULES);
      case Constants.COMMANDS.HELP:
        return this.sendPrivateServerMessage(this.getSocket(data.playerId), Constants.SERVER_PROMPTS.COMMANDS);
      default:
        return this.sendPrivateServerMessage(this.getSocket(data.playerId), `Command not found!`);
    }
  }

  sendRules(data) {
    this.sendPrivateServerMessage(this.getSocket(data.playerId), Constants.SERVER_PROMPTS.RULES);
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
      default:
        return
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