import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import Word from '../Word';
import './leaderboard.scss';

export default class Leaderboard extends Component {
  constructor(props) {
    super(props);
    this.state = {}
  }
  render() {
    const {players, unflipped, steal, room, toggleInviteModal} = this.props
    return (
      <div id="leaderboard">
        <div className="leaderboard__header">
          <h2>{room}</h2>
          <button className="leaderboard__button--invite" onClick={toggleInviteModal}>INVITE FRIEND</button>
        </div>
        <h4>UNFLIPPED TILES: {unflipped}</h4>
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
                <div className="player--words">
                  {
                    player.words && player.words.map((word)=> {
                      return (
                        <div onClick={()=>steal({...player, word: word})}>
                          <div className="smaller">
                            <Word word={word}/>
                          </div>
                        </div>
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