import React, {PureComponent} from 'react';
import Word from '../Word';
import './leaderboard.scss';

export default class Leaderboard extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {}
  }
  render() {
    const {socket, players, unflipped, steal, room, toggleInviteModal, toggleInfoModal} = this.props
    return (
      <div id="leaderboard">
        <div className="leaderboard__header">
          <h2>{room}</h2>
          <div className="leaderboard__header--buttons">
            <button className="leaderboard__button--invite" onClick={toggleInviteModal}>INVITE FRIEND</button>
            <button className="leaderboard__button--help" onClick={toggleInfoModal}>HELP</button>
          </div>
        </div>
        <h4 className="leaderboard__players--header">
          PLAYERS
          <div className="leaderboard__info--unflipped">
            UNFLIPPED TILES: <span className="unflipped">{unflipped}</span>
          </div>
        </h4>
        <div className="leaderboard__players--container">
          <div className="leaderboard__players--words">
          {
            players && players
              .sort((a, b)=>{
                if (a.playerId === socket.id)
                  return -1;
                if (a.score > b.score)
                  return -1;
                if (b.score > a.score)
                  return 1;
                return 0;
              })
              .map((player, index)=>{
              return (
                <div key={index} className="player">
                  <div className="player__header" >
                    <div className="player__header--name">
                      {player.nickname}
                    </div>
                    <div className="player__header--score">
                      POINTS: {player.score ? player.score : 0}
                    </div>
                  </div>
                  <div className="player__words">
                    {
                      player.words && player.words.map((word, index)=> {
                        return (
                          <Word key={index} className="player__word" word={word} onClick={() => steal({ ...player, word: word })}/>
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