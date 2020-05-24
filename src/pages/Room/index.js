import React, {Component} from 'react';
import { Redirect } from 'react-router-dom'
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
      isFinished: false,
      redirect: false,
      paused: true
    }
  }

  componentDidMount() {
    this.connect();
  }

  connect = () => {
    const {room, nickname, isPrivate} = this.props
    const socket = getSocket()
    joinRoom(socket, room, nickname, isPrivate)
    socket.on(Constants.MSG_TYPES.ERROR, (data)=>this.togglePopup('error', {...data, close: this.disconnect}))
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

  disconnect = () => {
    this.setState({redirect: '/'})
  }

  renderRedirect = () => { return <Redirect to={this.state.redirect} /> }

  componentWillUnmount() {
    const {socket} = this.state
    leaveRoom(socket)
    socket.close()
  }

  updateRoom = (data) => {
    if (data.paused !== this.state.paused)
      this.togglePause(data);
    this.setState({
      loading: false,
      currentPlayer: data.currentPlayer,
      players: data.players,
      unflipped: data.unflippedCount,
      flipped: data.flipped,
      room: data.roomName,
      roomId: data.roomId,
      privateRoom: data.privateRoom,
      paused: data.paused,
      pausedPlayer: data.pausedPlayer
    })
    if (data.unflippedCount > 0 && this.state.isFinished)
      this.setFinished(false)
  }
  
  setFinished = (finished) => {
    this.setState({isFinished: finished})
  }

  togglePause = (data) => {
    const {socket, players} = this.state
    if (socket && data.pausedPlayer === socket.id) return
    
    if (data.paused && socket && data.pausedPlayer !== socket.id) {
      const player = players.find((player) => player.playerId === data.pausedPlayer)
      this.togglePopup('pause', {message: `${player?.nickname} is creating a word...`})
    } else {
      this.togglePopup('close')
    }
  }

  togglePopup = (type, data = {}) => {
    const {socket} = this.state
    switch (type) {
      case 'invite':
        data = {link: `http://${window.location.host}/#/play?${this.state.privateRoom ? 'p' : ''}room=${this.state.roomId}`}
        break;
      case 'create':
        data = {
          submit: (word) => { triggerAction(socket, { command: Constants.COMMANDS.CREATE_WORD, args: [word] }) },
          close: () => { triggerAction(socket, { command: Constants.COMMANDS.UNPAUSE_GAME }) }
        }
        triggerAction(socket, { command: Constants.COMMANDS.PAUSE_GAME })
        break;
      case 'steal':
        data.submit = (word) => { triggerAction(socket, { command: Constants.COMMANDS.STEAL_WORD, args: [data.player, word] }) }
        data.close = () => { triggerAction(socket, { command: Constants.COMMANDS.UNPAUSE_GAME }) }
        triggerAction(socket, { command: Constants.COMMANDS.PAUSE_GAME })
        break;
      default:
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
    const {socket, loading, flipped, players, room, unflipped, isFinished, currentPlayer, redirect, paused} = this.state
    if (loading) {
      return (
        <div className="loading">
          <h3 className="text-muted font-weight-bold">LOADING</h3>
          <object type="image/svg+xml" className="loader" data={process.env.PUBLIC_URL + 'loader.svg'} aria-label="Loading..."/>
          {redirect && this.renderRedirect()}
        </div> 
      )
    }
    return (
      <div id="room">
        {paused && <div className="overlay__paused"></div>}
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
        {redirect && this.renderRedirect()}
      </div>
    )
  }
}