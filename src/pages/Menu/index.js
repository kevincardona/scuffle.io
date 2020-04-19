import React, {Fragment, useState, useEffect} from 'react';
import {Link} from 'react-router-dom'
import queryString from 'query-string';
import {apiGet} from '../../util/api';
import Room from '../Room';
import './menu.scss'
 
const Menu = (props) => {
  const [room, setRoom] = useState('');
  const [nickname, setNickname] = useState('')
  const [isPrivate, setIsPrivate] = useState(true)
  const [disabled, setDisabled] = useState(false)
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
    if (key === 'Enter' && nickname && (isPrivate || room !== null)) {
      setIsPlaying(true);
    }
  }

  window.addEventListener('keydown', downHandler)

  const togglePrivate = () => {
    setIsPrivate(!isPrivate); 
    if (isPrivate) 
      setRoom(null)
  }

  if (isPlaying)
    return <Room room={room} nickname={nickname}/>
  return (
    <div id="play-menu">
      <div className="title">
        <h1>Scuffle</h1>
        <p className="play-menu__header--count">{playerCount} online</p>
      </div> 
      <input 
        type="text" 
        className="input-group-text mb-2" 
        autoComplete="off"
        id="nickname-input" 
        placeholder="Nickname" 
        value={nickname} 
        onChange={e => setNickname(e.target.value)} 
        maxLength="15"
      />
      { !disabled &&
        <Fragment>
          <div className="play-menu__checkbox">
            <label className="play-menu__checkbox--label">
              Private Room?
            </label>
            <input
              type="checkbox"
              autoComplete="off"
              value={isPrivate}
              onClick={togglePrivate}
              defaultChecked
            />
          </div>
        </Fragment>
      }
      { !disabled && !isPrivate &&
        <input 
          type="text" 
          className="input-group-text mb-2" 
          id="room-input" 
          placeholder="Room Name" 
          value={room || ''} 
          disabled={disabled}
          onChange={e => setRoom(e.target.value)} 
          maxLength="15"
        />
      }
      <div id="menu-buttons">
        { (room && nickname) || (nickname && isPrivate) ?
          <span className="button--link" onClick={()=>setIsPlaying(true)}>
            <button type="button" className="btn btn-primary menu-button">PLAY</button>
          </span>
          :
          <button type="button" className="btn btn-primary menu-button" disabled>PLAY</button>
        }
        <Link className="button--link" to={`/about`}>
          <button type="button" className="btn btn-secondary menu-button">RULES</button>
        </Link>
      </div>
    </div>
  )
}

export default Menu