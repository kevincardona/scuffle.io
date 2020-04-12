import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import logo from '../../assets/logo.svg';
import './home.scss';

export default class Home extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div id="home">
          <img id="title" src={logo} alt="Scuffle" />
          <Link to={`/`}>
            <button type="button" className="btn btn-primary mb-5">PLAY</button>
          </Link>
          <div id="how-to-play">
            <h5>HOW TO PLAY</h5>
            <p>
              Be the player with the most letters by the end of the game
            </p>
            <p>This game starts with 144 letter tiles facedown in the center.</p>
            <p>
              Each player takes turns flipping 1 letter at a time in the center. Whenever any player sees a word that can be made of <b>3 or more</b> flipped letters they must call it out and collect their word. At any time the player can transform their word into a longer (and different) one given they use all of the letters AND at least one from the center              
            </p>
            <h5>STEALING WORDS</h5>
            <p>
              A word can be stolen from another player <b>at any time</b> provided that word can be turned into a different word using <b>ALL</b> of the letters <b>+ at least 1</b> letter from the center
            </p>
            <h5>WINNING</h5>
            <p>
              When all of the letters from the center have been flipped and nobody has any steals/words to create using the center letters then the game is over. The player with the most letters wins the game.
            </p>
          </div>
      </div>
    )
  }
}