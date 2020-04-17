import React, {Component} from 'react';
import './word.scss'

export default class Word extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render () {
    const {word} = this.props
    return (
      <div {...this.props} className={"word " + this.props.className}>
        { 
          [...word].map((letter) => <div className="word__letter">{letter}</div>)
        }
      </div>
    )
  }
}