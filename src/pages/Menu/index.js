import React, {Fragment, useState, useEffect} from 'react';
import {Link} from 'react-router-dom'
import queryString from 'query-string';
import {apiGet} from '../../util/api';
import Room from '../Room';
import './menu.scss'
 
const Menu = (props) => {
  const [room, setRoom] = useState('');
  const [nickname, setNickname] = useState('')
  const [disabled, setDisabled] = useState(false)
  const [isPrivate, setPrivate] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playerCount, setPlayerCount] = useState(0);

  useEffect(()=>{
    apiGet('playercount').then((res) => {
      if (res.success)
        setPlayerCount(res.playerCount)
    })
    const params = queryString.parse(props.location.search)
    setRoom(params.room);
    setDisabled(params.room != null)
  }, [props])

  const downHandler = ({ key }) => {
    if (key === 'Enter' && nickname) {
      startGame()
    }
  }

  const startGame = (isPrivate = false) => {
    setPrivate(isPrivate);
    setIsPlaying(true);
  }

  window.addEventListener('keydown', downHandler)

  if (isPlaying)
    return <Room nickname={nickname} isPrivate={isPrivate}/>
  return (
    <div id="play-menu">
      <div className="title">
        <h1>Scuffle</h1>
        { !disabled && <p className="play-menu__header--count">{playerCount} online</p> }
      </div> 
      <input 
        type="text" 
        className="input-group-text mb-2" 
        autoComplete="off"
        id="nickname-input" 
        placeholder="Enter your name" 
        value={nickname} 
        onChange={e => setNickname(e.target.value)} 
        maxLength="15"
      />
      {
      /*
      <button type="button" className="btn btn-success btn-sm menu-button" disabled={!nickname} onClick={()=>{startGame(true)}}>
        PRIVATE GAME
      </button>
      */
      }
      <div id="menu-buttons">
        <span className="button--link" onClick={startGame}>
          <button type="button" className="btn btn-primary menu-button" disabled={!nickname}>
            { disabled ? "JOIN GAME" : "START" }
          </button>
        </span>
        { !disabled &&
          <Fragment>
            <Link className="button--link" to={`/about`}>
              <button type="button" className="btn btn-secondary menu-button">RULES</button>
            </Link>
          </Fragment>
        }
      </div>
    </div>
  )
}

export default Menu