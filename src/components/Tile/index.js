import React, {useState, useEffect} from 'react';
import './tile.css';

const Tile = ({letter}) => {
  const [tileLetter, setLetter] = useState('')
  const [flipped, setFlipped] = useState('tile--flipped')
  useEffect (()=> {
    if (letter)
      setFlipped('')
    setLetter(letter)
  },[letter])

  return (
    <div className={`tile ${flipped}`}>
      <div className='tile__face tile__face--back'/>
      <div className='tile__face tile__face--front'>
        <p>{tileLetter}</p>
      </div>
    </div>
  );
}

export default Tile