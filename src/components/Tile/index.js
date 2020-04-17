import React, {useState, useEffect} from 'react';
import './tile.scss';

const Tile = ({letter, onFlip, onClick}) => {
  const [tileLetter, setLetter] = useState('')
  const [flipped, setFlipped] = useState('tile--unflipped')
  useEffect (()=> {
    if (letter)
      setFlipped('tile--flipped')
    else {
      setFlipped('tile--unflipped')
    }
    setLetter(letter)
  },[letter])

  return (
    <div className={`tile ${flipped}`} onClick={onClick}>
      <div className='tile__face tile__face--back' onClick={onFlip}/>
      <div className='tile__face tile__face--front'>
        <p className='tile__letter'>{tileLetter}</p>
      </div>
    </div>
  );
}

export default Tile