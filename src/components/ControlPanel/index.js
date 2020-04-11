import React, {Component} from 'react';
import {triggerAction} from '../../util/api';
import Constants from '../../constants';
import './controlPanel.scss';

export default class ControlPanel extends Component {
  constructor(props) {
    super(props)
    this.state = {

    }
  }

  sendFlip = () => {
    const {socket} = this.props
    if (!socket)
      return
    triggerAction(socket, {
      command: Constants.COMMANDS.FLIP
    })
  }

  render () {
    const {children, socket} = this.props
    return (
      <div id="control-panel">
        <div id="control-panel__buttons">
          <button className="btn btn-info control__button" onClick={this.sendFlip}>
            Flip
          </button>
          <button className="btn btn-success control__button">
            Found Word
          </button>
          <button className="btn btn-danger control__button">
            Steal Word
          </button>
        </div>
        {children}
      </div>
    )
  }
}