const Constants = require('../src/constants');
const helpers = require('./utils/helpers');
const checkWord = require('check-word'), words = checkWord('en');
const { loggers } = require('winston');
const logger = loggers.get('main-logger');

class Room {
  constructor(io, id) {
    this.id = id;
    this.playerCount = 0
    this.players = {};
    this.overrides = {}
    this.flipped = new Array(Constants.GAME.TILE_COUNT)
    this.currentPlayer = null;
    this.io = io
    this.updateInterval = setInterval(this.update.bind(this), 250);
    this.generateTable()
  }

  destroy() {
    clearInterval(this.updateInterval)
    delete this.id
    delete this.playerCount
    delete this.players
    delete this.overrides
    delete this.flipped
    delete this.currentPlayer
    delete this
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
      room: this.id,
      unflippedCount: this.unflipped.length,
      flipped: this.flipped,
      players: players
    }
    
    return data;
  }

  getSocket(playerId) {return this.players[playerId].socket}

  update() {
    const currentPlayer = this.getRoomData()
    this.io.in(this.id).emit(Constants.MSG_TYPES.GAME_UPDATE, currentPlayer)    
  }

  flipTile(data) {
    let newLetter = this.unflipped.pop()
    if (!newLetter) return
    this.flipped.push(newLetter);
    this.sendServerMessage(`${data.player} flipped the letter ${newLetter}`)
    if (this.unflipped.length === 0)
      this.sendServerMessage(`There are no letters left to flip! To reset the game type RESET_GAME in chat!`)

  }

  isValidWord(word, data) {
    word = word.toLowerCase()
    if ((word == null || word.length < 3) && this.overrides[word] == null) {
      if (data)
        this.sendPrivateServerMessage(this.getSocket(data.playerId), 'Your word needs to be real and at least 3 characters long!')
      return false
    }
    if (words.check(word.toLowerCase()) || this.overrides[word] != null)
      return true
    this.sendPrivateServerMessage(this.getSocket(data.playerId), 'That\'s not a real word! To allow this word type /override word')
    return false
  }

  overrideWord(data, word) {
    this.overrides[word.toLowerCase()] = true
    this.sendServerMessage(`${this.players[data.playerId].nickname} has added the word: ${word} to the dictionary!`)
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
    if (!this.isValidWord(word, data)) {return}
    let indices = helpers.checkCenterForWord(word, this.flipped);
    const player = this.players[data.playerId]
    if (indices !== false) {
      this.addWordToPlayer(data.playerId, word)
      this.takeFromCenter(indices)
      this.sendServerMessage(`${player.nickname} made the word: ${word}`)
    } else {
      this.sendPrivateServerMessage(this.getSocket(data.playerId), 'That word can\'t be made!')
    }
  }

  stealWord(data, victim, oldWord, newWord) {
    if (typeof(oldWord) !== 'string' || typeof(newWord) !== 'string') return
    oldWord = oldWord.toUpperCase()
    newWord = newWord.toUpperCase()
    logger.info(`${this.players[data.playerId].nickname} attempting to steal the word: ${oldWord} to create: ${newWord}`)
    let newWordMap = helpers.letterCountMap(newWord)
    let oldWordMap = helpers.letterCountMap(oldWord)
    const difference = helpers.checkWordContainsOther(newWordMap, oldWordMap)
    if (!difference) {
      return this.sendServerMessage(`${this.players[data.playerId].nickname} attempted to steal the word: ${oldWord} to create the INVALID word: ${newWord}`);
    }
    if (!this.isValidWord(newWord, data)) {return}
    const correctCenterPieces = helpers.checkCenterForWord(helpers.letterMapToWord(difference), this.flipped);
    if (!correctCenterPieces) {
      return this.sendServerMessage(`${this.players[data.playerId].nickname} attempted to steal the word: ${oldWord} to make: ${newWord}! There aren't enough letters for that word!`);
    } else {
      this.takeFromCenter(correctCenterPieces)
    }
    this.removeWordFromPlayer(victim, oldWord);
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
        if (!args[0]) return
        return this.stealWord(data, args[0].playerId, args[0].word, args[1])
      case Constants.COMMANDS.PUT_BACK:
        return this.putBackWord(data, args[0])
      case Constants.COMMANDS.OVERRIDE:
        return this.overrideWord(data, args[0])
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
        return this.io.in(this.id).emit(Constants.MSG_TYPES.MESSAGE, data) 
      case Constants.CHAT_MSG_TYPES.PLAYER_MESSAGE:
        return this.io.in(this.id).emit(Constants.MSG_TYPES.MESSAGE, data) 
      default:
        return
    }
  }

  addPlayer(socket, nickname) {
    logger.debug(`Adding player ${nickname} to room ${this.id}`)
    this.players[socket.id] = {
      socket: socket,
      playerId: socket.id,
      nickname: nickname,
      score: 0
    }
    this.sendServerMessage(`${nickname} has joined the room!`)
    this.playerCount = this.playerCount + 1
  }

  removePlayer(socket) {
    if (!this.players[socket.id]) return logger.error(`Attempted to remove nonexistent player: ${socket.id} from room: ${this.id}`)
    this.sendServerMessage(`${this.players[socket.id].nickname} has left the room!`)
    delete this.players[socket.id]
    this.playerCount = this.playerCount - 1
  }
}

module.exports = Room;