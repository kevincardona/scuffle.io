module.exports = Object.freeze({
  COMMANDS: {
    FLIP: 'FLIP',
    CREATE_WORD: 'CREATE_WORD',
    OVERRIDE: 'OVERRIDE',
    RETURN: 'RETURN',
    STEAL_WORD: 'STEAL_WORD',
    RESET: 'RESET',
    DONE: 'DONE',
    RULES: 'RULES',
    HELP: 'HELP'
  },
  MSG_TYPES: {
    CREATE_ROOM: 'create_room',
    JOIN_ROOM: 'join_room',
    LEAVE_ROOM: 'leave_room',
    MESSAGE: 'message',
    GAME_UPDATE: 'update',
    PLAYER_ACTION: 'player_action',
    INPUT: 'input',
    DISCONNECT: 'disconnect'
  },
  CHAT_MSG_TYPES: {
    SERVER_MESSAGE: 'server_message',
    PLAYER_MESSAGE: 'player_message',
    MODIFIERS: {
      PRIVATE: 'private'
    }
  },
  GAME: {
    TILE_COUNT: 150,
    LETTER_DISTRIBUTION: {
      A: 14,
      B: 5,
      C: 5,
      D: 6,
      E: 18,
      F: 4,
      G: 4,
      H: 3,
      I: 12,
      J: 2,
      K: 2,
      L: 5,
      M: 3,
      N: 8,
      O: 11,
      P: 3,
      Q: 2,
      R: 9,
      S: 6,
      T: 9,
      U: 6,
      V: 3,
      W: 3,
      X: 2,
      Y: 3,
      Z: 2
    },
    TURN_TIMEOUT: 15000
  },
  SERVER_PROMPTS: {
    RULES: 
      `Object: Be the player with the most letters by the end of the game
        This game starts with 144 letter tiles facedown in the center.
        HOW TO PLAY
        Each player takes turns flipping 1 letter at a time in the center. Whenever any player sees a word that can be made of 3 or more flipped letters they must call it out and collect their word. At any time the player can transform their word into a longer (and different) one given they use all of the letters AND at least one from the center
        STEALING LETTERS
        A word can be stolen from another player at any time provided that word can be turned into a different word using ALL of the letters + at least 1 letter from the center
        WINNING
        When all of the letters from the center have been flipped and nobody has any steals/words to create using the center letters then the game is over. The player with the most letters wins the game.
      `,
  },
})