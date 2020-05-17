const Constants = require('../src/constants');
const { loggers } = require('winston');
const logger = loggers.get('main-logger');

class Player {
  constructor(socket, nickname, room) {
    this.id = socket.id
    this.socket = socket
    this.nickname = nickname
    this.room = room
    this.words = []
    this.score = 0
    this.active = true
    this.isDone = false
  }

  getPlayerData() {
    return {
      nickname: this.nickname,
      playerId: this.id,
      words: this.words,
      score: this.score,
      active: this.active,
    }
  }

  resetPlayer() {
    this.words = []
    this.score = 0
  }

  addWord(word) {
    this.words.push(word.toUpperCase());
    this.score += word.length
  }

  removeWord(word) {
    this.words.splice(this.words.indexOf(word), 1)
    this.score -= word.length
  }

  hasWord(word) {
    return this.words.includes(word);
  }
}

module.exports = Player