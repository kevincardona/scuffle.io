import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.svg';
import './home.scss';

const Home = () => {
  return (
    <div id="home">
      <img id="title" src={logo} alt="Scuffle" />
      <Link to="/play">
        <button type="button" className="btn btn-primary mb-5">PLAY</button>
      </Link>
      <div id="how-to-play">
        <h5>How to Play</h5>
        <p>Aim to collect the most letters by the end of the game.</p>
        <p>The game begins automatically with 144 letter tiles facedown at the center.</p>
        <p>
          Players take turns flipping one letter at a time. Form words by calling out any that can be made from <strong>three or more</strong> flipped letters. You may also extend your words using all their letters plus at least one new letter from the center, forming a longer and different word.
        </p>
        <h5>Stealing Words</h5>
        <p>
          Steal a word from another player by transforming it into a different word using all the original letters <strong>plus at least one</strong> from the center.
        </p>
        <h5>Winning the Game</h5>
        <p>
          The game ends when all letters from the center are flipped, and no further words or steals can be made. The player with the most letters wins.
        </p>
      </div>
    </div>
  );
}

export default Home;

