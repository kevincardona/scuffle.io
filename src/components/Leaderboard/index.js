import React, {Component} from 'react';
import Word from '../Word';
import './leaderboard.scss';

export default class Leaderboard extends Component {
  constructor(props) {
    super(props);
    this.state = {}
  }
  render() {
    const {players, unflipped} = this.props
    return (
      <div id="leaderboard">
        {unflipped && <h4>UNFLIPPED TILES: {unflipped}</h4>}
        <h3>PLAYERS</h3>
        {
          players && players.map((player)=>{
            return (
              <div>
                <div className="player--name">
                  {player.nickname}
                </div>
                <div className="player--score">
                  POINTS: {player.score ? player.score : 0}
                </div>
                WORDS: {!player.words && " NONE"}
                <div className="player--words">
                  {
                    player.words && player.words.map((word)=> {
                      return (
                        <div className="smaller" onClick={()=>console.warn(`clicked ${word}`)}>
                        <Word word={word}/>
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