import React, {useState, useEffect} from 'react';
import {Link} from 'react-router-dom'
import './menu.scss'

const Menu = (props) => {
  const [room, setRoom] = useState();
  const [nickname, setNickname] = useState('')
  const [disabled, setDisabled] = useState(false)

  useEffect(()=>{
    setRoom(props?.match?.params?.room);
    setDisabled(props?.match?.params?.room != null)
  }, [props])

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
      <input 
        type="text" 
        className="input-group-text mb-2" 
        id="room-input" 
        placeholder="Room Code" 
        value={room || ''} 
        disabled={disabled}
        onChange={e => setRoom(e.target.value)} 
      />
      <Link to={`/room/${room}?nick=${nickname}`}>
        <button id="play-button" className="btn btn-primary">PLAY</button>
      </Link>
    </div>
  )
}

export default Menu