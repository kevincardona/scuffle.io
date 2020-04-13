import React, {Component} from 'react';
import Word from '../Word';
import './leaderboard.scss';

export default class Leaderboard extends Component {
  constructor(props) {
    super(props);
    this.state = {}
  }
  render() {
    const {players, unflipped, steal, room, toggleInviteModal, toggleInfoModal} = this.props
    return (
      <div id="leaderboard">
        <div className="leaderboard__header">
          <h2>{room}</h2>
          <div className="leaderboard__header--buttons">
            <button className="leaderboard__button--invite" onClick={toggleInviteModal}>INVITE FRIEND</button>
            <button className="leaderboard__button--help" onClick={toggleInfoModal}>HELP</button>
          </div>
        </div>
        <h4>UNFLIPPED TILES: <span className="unflipped">{unflipped}</span></h4>
        <h4>PLAYERS</h4>
        {
          players && players.map((player)=>{
            return (
              <div className="player">
                <div className="player--name">
                  {player.nickname}
                </div>
                <div className="player--score">
                  POINTS: {player.score ? player.score : 0}
                </div>
                {!player.words && "NO WORDS"}
                <div className="player__words">
                  {
                    player.words && player.words.map((word)=> {
                      return (
                        <Word className="smaller player__word" word={word} onClick={() => steal({ ...player, word: word })}/>
                      )
                    })
                  }
                </div>
              </div>
            )
          })
        }
      </div>
    )
  }
}