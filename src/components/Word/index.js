import React, {Component} from 'react';
import Tile from '../Tile';
import './word.scss'

export default class Word extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render () {
    const {word} = this.props
    return (
      <div className="word">
        { 
          [...word].map(letter => <Tile letter={letter}/>)
        }
      </div>
    )
  }
}