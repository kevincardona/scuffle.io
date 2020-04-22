import React, {Component} from 'react';
import popup from '../../util/popup';
import {getSocket, joinRoom, leaveRoom, triggerAction} from '../../util/api';
import Constants from '../../constants';
import ControlPanel from '../../components/ControlPanel';
import Leaderboard from '../../components/Leaderboard';
import Chat from '../../components/Chat';
import Tile from '../../components/Tile';
import './room.scss';

const TRAILING_TILES = 20;
export default class Room extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      socket: null,
      isFinished: false
    }
  }

  componentDidMount() {
    this.connect();
  }

  connect = () => {
    const {room, nickname} = this.props
    const socket = getSocket()
    joinRoom(socket, room, nickname)
    socket.on(Constants.MSG_TYPES.GAME_UPDATE, this.updateRoom)
    this.setState({ 
      socket: socket, 
      nickname: nickname, 
      room: room 
    })
    socket.on('disconnect',() => {
      window.location.reload()
      this.setState({loading: true})
    })
  }

  componentWillUnmount() {
    const {socket} = this.state
    leaveRoom(socket)
    socket.close()
  }

  updateRoom = (data) => {
    this.setState({
      loading: false,
      currentPlayer: data.currentPlayer,
      players: data.players,
      unflipped: data.unflippedCount,
      flipped: data.flipped,
      room: data.roomName,
      roomId: data.roomId
    })
    if (data.unflippedCount > 0 && this.state.isFinished)
      this.setFinished(false)
  }
  
  setFinished = (finished) => {
    this.setState({isFinished: finished})
  }

  togglePopup = (type, data = {}) => {
    const {socket} = this.state
    switch (type) {
      case 'invite':
        data = {link: `http://${window.location.host}/#/play?room=${this.state.roomId}`}
        break;
      case 'create':
        data = {
          submit: (word) => { triggerAction(socket, { command: Constants.COMMANDS.CREATE_WORD, args: [word] }) }
        }
        break;
      case 'steal':
        data.submit = (word) => { triggerAction(socket, { command: Constants.COMMANDS.STEAL_WORD, args: [data.player, word] }) }
        break;
    }
    popup(type, data)
  }

  sendFlipCommand = () => {
    const {socket} = this.state
    if (!socket)
      return
    triggerAction(socket, {
      command: Constants.COMMANDS.FLIP
    })
  }

  render() {
    const {socket, loading, flipped, players, room, unflipped, isFinished, currentPlayer} = this.state
    if (loading) {
      return (
        <div className="loading">
          <h3 className="text-muted font-weight-bold">LOADING</h3>
          <object type="image/svg+xml" className="loader" data={process.env.PUBLIC_URL + 'loader.svg'} aria-label="Loading..."/>
        </div> 
      )
    }
    return (
      <div id='room'>
        <div className="panel--left">
          <Leaderboard 
            socket={socket}
            players={players} 
            unflipped={unflipped} 
            togglePopup={this.togglePopup} 
            room={room}
            currentPlayer={currentPlayer}
          />
        </div>
        <div className="panel--right">
          <div id="letters--container">
            {
              [...Array(flipped.length + unflipped)].map((_, i) => {
                if (i < flipped.length)
                  return <Tile key={i} letter={flipped[i]}/>
                if (i < flipped.length + TRAILING_TILES)
                  return <Tile key={i} onClick={() => {triggerAction(socket, {command: Constants.COMMANDS.FLIP})}}/>
                return null
              })
            }
          </div>
          <ControlPanel 
            socket={socket} 
            togglePopup={this.togglePopup} 
            unflipped={unflipped} 
            finished={isFinished} 
            setFinished={this.setFinished}
            currentPlayer={currentPlayer}
          >
            <Chat socket={socket}/>
          </ControlPanel>
        </div>
      </div>
    )
  }
}