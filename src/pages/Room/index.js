import React, {Component} from 'react';
import {socket, joinRoom, leaveRoom, triggerAction} from '../../util/api';
import Constants from '../../constants';
import Loader from '../../assets/loader.svg';
import ControlPanel from '../../components/ControlPanel';
import Leaderboard from '../../components/Leaderboard';
import Chat from '../../components/Chat';
import Tile from '../../components/Tile';
import './room.scss';

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

  componentWillUnmount() {
    leaveRoom(socket)
  }

  updateRoom = (data) => {
    this.setState({loading: false, players: data.players, unflipped: data.unflippedCount, flipped: data.flipped})
  }

  sendFlipCommand = () => {
    const { socket } = this.props
    if (!socket)
      return
    triggerAction(socket, {
      command: Constants.COMMANDS.FLIP
    })
  }

  render() {
    const {loading, flipped, players, unflipped} = this.state
    if (loading) {
      return (
        <div className="loading">
          <h3 className="text-muted font-weight-bold">LOADING</h3>
          <object type="image/svg+xml" className="loader" data={Loader} aria-label="Loading..."/>
        </div> 
      )
    }
    return (
      <div id='room'>
        <div className="panel--left">
          <Leaderboard players={players} unflipped={unflipped}/>
        </div>
        <div className="panel--right">
          <div id="letters--container">
            {
              [...Array(Constants.GAME.TILE_COUNT)].map((e, i) => {
                if (i < flipped.length)
                  return <Tile letter={flipped[i]}/>
                if (i < flipped.length + 1)
                  return <Tile onClick={() => {triggerAction(socket, {command: Constants.COMMANDS.FLIP})}}/>
              })
            }
          </div>
          <ControlPanel socket={socket}>
            <Chat socket={socket}/>
          </ControlPanel>
        </div>
      </div>
    )
  }
}