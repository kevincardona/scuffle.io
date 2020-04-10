import React, {Component} from 'react';
import {socket, joinRoom} from '../../util/api';
import Constants from '../../constants';
import './game.css';
import Loader from '../../assets/loader.svg';
import Chat from '../../components/Chat';

export default class Game extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true
    }
  }

  componentDidMount() {
    const {room} = this.props.match?.params
    const urlParams = new URLSearchParams(this.props.location.search)
    joinRoom(socket, room, urlParams.get('nick'))
    socket.on(Constants.MSG_TYPES.GAME_UPDATE, this.updateRoom)
  }

  updateRoom = (data) => {
    this.setState({ loading: false})
  }

  render() {
    const {loading} = this.state
    if (loading) {
      return (
        <div id="loading">
          <h3 className="text-muted font-weight-bold">LOADING</h3>
          <object type="image/svg+xml" id="loader" data={Loader} aria-label="Loading..."/>
        </div> 
      )
    }
    return (
      <div id='Game'>
        <Chat socket={socket}/>
      </div>
    )
  }
}