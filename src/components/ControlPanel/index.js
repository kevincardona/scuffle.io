import React, {Component, Fragment} from 'react';
import {triggerAction} from '../../util/api';
import Constants from '../../constants';
import './controlPanel.scss';

export default class ControlPanel extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isFinished: false
    }
  }

  sendFlip = () => {
    const {socket} = this.props
    triggerAction(socket, {
      command: Constants.COMMANDS.FLIP
    })
  }

  toggleFinished = () => {
    const {socket, setFinished} = this.props
    setFinished(true);
    triggerAction(socket, {
      command: Constants.COMMANDS.DONE
    })
    this.setState({isFinished: true})
  }

  render () {
    const {children, create, unflipped, finished} = this.props
    return (
    <div id="control-panel__container">
      <div id="control-panel">
        <div id="control-panel__buttons">
          { unflipped !== 0 
              ? 
              <Fragment>
                <button className="control__button control__button--flip" onClick={this.sendFlip}>
                  Flip
                </button>
              </Fragment>
              :
              !finished
                ?
                  <button className="control__button control__button--finished" onClick={this.toggleFinished}>
                    Finished
                  </button>
                :
                  <button className="control__button control__button--waiting" onClick={this.toggleFinished}>
                    Waiting...
                  </button>
          } 
          { !finished &&
              <button className="control__button control__button--create" onClick={create}>
                Create Word
              </button>
          }
        </div>
        {children}
      </div>
    </div>
    )
  }
}