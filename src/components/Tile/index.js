import React, {useState, useEffect} from 'react';
import Sound from '../../util/Sound';
import './tile.scss';

const Tile = ({letter, onFlip, onClick}) => {
  const [tileLetter, setLetter] = useState('')
  const [flipped, setFlipped] = useState('tile--unflipped')
  const [sound, playSound] = useState(false)
  useEffect (()=> {
    if (letter) {
      playSound(true)
      setFlipped('tile--flipped')
    } else {
      playSound(false)
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
      { sound &&
        <Sound url={process.env.PUBLIC_URL + "/flip.wav"} delay={100} volume={0.1}/>
      }
    </div>
  );
}

export default Tile