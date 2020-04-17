import React, {Fragment, useState, useEffect} from 'react';
import {Link} from 'react-router-dom'
import Room from '../Room';
import './menu.scss'

const Menu = (props) => {
  const [room, setRoom] = useState();
  const [nickname, setNickname] = useState('')
  const [isPrivate, setIsPrivate] = useState(true)
  const [disabled, setDisabled] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(()=>{
    setRoom(props?.match?.params?.room);
    setDisabled(props?.match?.params?.room != null)
  }, [props])

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
      </div>
      <input 
        type="text" 
        className="input-group-text mb-2" 
        id="nickname-input" 
        placeholder="Nickname" 
        value={nickname} 
        onChange={e => setNickname(e.target.value)} 
      />
      { !disabled &&
        <Fragment>
          <div className="play-menu__checkbox">
            <label className="play-menu__checkbox--label">
              Private Room?
            </label>
            <input
              type="checkbox"
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