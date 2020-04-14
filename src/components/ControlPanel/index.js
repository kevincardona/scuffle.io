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
    const {children, create} = this.props
    return (
    <div id="control-panel__container">
      <div id="control-panel">
        <div id="control-panel__buttons">
          <button className="control__button control__button--flip" onClick={this.sendFlip}>
            Flip
          </button>
          <button className="control__button control__button--create" onClick={create}>
            Create Word
          </button>
        </div>
        {children}
      </div>
    </div>
    )
  }
}