import React, {Component} from 'react';
import {socket, joinRoom} from '../../util/api';
import Constants from '../../constants';
import Loader from '../../assets/loader.svg';
import Chat from '../../components/Chat';
import Tile from '../../components/Tile';
import './room.css';

export default class Room extends Component {
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
    console.warn(data)
    this.setState({loading: false, players: data.players, unflipped: data.unflipped.length, flipped: data.flipped})
  }

  render() {
    const {loading, flipped} = this.state
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
        <div id="letters--center">
          {
            [...Array(Constants.GAME.TILE_COUNT)].map((e, i) => {
              if (i < flipped.length)
                return <Tile letter={flipped[i]}/>
              return <Tile/>
            })
          }
        </div>
        <Chat socket={socket}/>
      </div>
    )
  }
}