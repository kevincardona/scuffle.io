import React, {Component} from 'react';
import { socket, sendMessage } from '../../util/api';
import Constants from '../../constants';
import './chat.css';

export default class Chat extends Component {
  constructor(props) {
    super(props);
    this.messageRef = React.createRef();
    this.state = {
      messages: [],
      input: "",
    }
    this.getMessage.bind(this)
  }

  componentDidMount() {
    socket.on(Constants.MSG_TYPES.SEND_MESSAGE, (message)=>{this.getMessage(message)})
  }

  componentDidUpdate() { 
    this.messageRef.current.scrollTop = this.messageRef.current.scrollHeight;
  }

  updateInput = (e) => {
    this.setState({input: e.target.value})
  }

  getMessage = (message) => {
    this.setState({ messages: this.state.messages.concat(message) })
  }

  send = (event) => {
    event.preventDefault();
    sendMessage(socket, this.state.input)
    this.setState({input: ""})
  }

  render() {
    const {input, messages} = this.state
    return (
      <div id="chat" className="mb-3">
        <ul id="messages" ref={this.messageRef}>
          {
            messages.map((data) => {
              return (
                <li className="chat-message">
                  <label className="player-name">{data.player + ':'}</label>
                  {" "}
                  <label className='message'>{data.message}</label>
                </li>
              )
            })
          }
        </ul>
        <div className="input-group">
          <input type="text" className="form-control" placeholder="Message" value={input} onChange={(e) => this.updateInput(e)}/>
          <div className="input-group-append">
            <button className="btn btn-primary input-group-btn" onClick={this.send}>Send</button>
          </div>
        </div>
      </div>
    )
  }

}