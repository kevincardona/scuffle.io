import React, {PureComponent} from 'react';
import {socket} from '../../util/api';
import Word from '../Word';
import './leaderboard.scss';

export default class Leaderboard extends PureComponent {
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
        <h5 className="leaderboard__info--unflipped">UNFLIPPED TILES: <span className="unflipped">{unflipped}</span></h5>
        <div className="leaderboard__players">
          <h4 className="leaderboard__players--header">
            PLAYERS
          </h4>
          <div className="leaderboard__players--words">
          {
            players && players
              .sort((a, b)=>{
                console.log(socket.id)
                if (b.playerId === socket.id)
                  return 1;
                if (a.score > b.score)
                  return -1;
                if (b.score > a.score)
                  return 1;
                return 0;
              })
              .map((player, index)=>{
              return (
                <div key={index} className="player">
                  <div className="player--name">
                    {player.nickname}
                  </div>
                  <div className="player--score">
                    POINTS: {player.score ? player.score : 0}
                  </div>
                  {!player.words && "NO WORDS"}
                  <div className="player__words">
                    {
                      player.words && player.words.map((word, index)=> {
                        return (
                          <Word key={index} className="smaller player__word" word={word} onClick={() => steal({ ...player, word: word })}/>
                        )
                      })
                    }
                  </div>
                </div>
              )
            })
          }
          </div>
        </div>
      </div>
    )
  }
}