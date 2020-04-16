import React, {Component} from 'react';
import {getSocket, joinRoom, leaveRoom, triggerAction} from '../../util/api';
import Constants from '../../constants';
import ControlPanel from '../../components/ControlPanel';
import Leaderboard from '../../components/Leaderboard';
import Chat from '../../components/Chat';
import Modal from '../../components/Modal';
import Tile from '../../components/Tile';
import './room.scss';

export default class Room extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      isModalOpen: false,
      modalData: null,
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
      alert("Disconnected from room!")
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
      players: data.players,
      unflipped: data.unflippedCount,
      flipped: data.flipped,
      room: data.room,
    })
    if (data.unflippedCount === Constants.GAME.TILE_COUNT && this.state.isFinished)
      this.setFinished(false)
  }
  
  setFinished = (finished) => {
    this.setState({isFinished: finished})
  }

  closeModal = () => { this.setState({ isModalOpen: false, modalData: null }) }

  triggerSteal = (player) => {
    const {socket} = this.state
    let modalData = {
      type: 'input',
      header: `Steal Word: ${player.word}`,
      prompt: `New Word`,
      submit: (word)=>{triggerAction(socket, {command: Constants.COMMANDS.STEAL_WORD, args: [player, word]});},
      close: this.closeModal
    }
    this.setState({isModalOpen: true, modalData: modalData})
  }

  triggerCreate = () => {
    const {socket} = this.state
    let modalData = {
      type: 'input',
      header: `Create Word`,
      prompt: `New Word`,
      submit: (word) => {triggerAction(socket, { command: Constants.COMMANDS.CREATE_WORD, args: [word]});},
      close: this.closeModal
    }
    this.setState({ isModalOpen: true, modalData: modalData })
  }

  toggleInvite = () => {
    let modalData = {
      type: 'invite',
      header: `Inviting a Friend`,
      prompt: `To invite a friend send them this link: `,
      copy:  `http://${window.location.host}/#/invite/${this.state.room}`,
      submit: null,
      close: this.closeModal
    }
    this.setState({ isModalOpen: true, modalData: modalData })
  }

  toggleInfo = () => {
    let modalData = {
      type: 'info',
      close: this.closeModal
    }
    this.setState({ isModalOpen: true, modalData: modalData })
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
    const {socket, loading, flipped, players, room, unflipped, isFinished, isModalOpen, modalData} = this.state
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
            steal={this.triggerSteal} 
            room={room} 
            toggleInviteModal={this.toggleInvite} 
            toggleInfoModal={this.toggleInfo}
          />
        </div>
        <div className="panel--right">
          <Modal {...modalData} isOpen={isModalOpen} />
          <div id="letters--container">
            {
              [...Array(flipped.length + unflipped)].map((_, i) => {
                if (i < flipped.length)
                  return <Tile key={i} letter={flipped[i]}/>
                if (i < flipped.length + 20)
                  return <Tile key={i} onClick={() => {triggerAction(socket, {command: Constants.COMMANDS.FLIP})}}/>
                return null
              })
            }
          </div>
          <ControlPanel socket={socket} create={this.triggerCreate} unflipped={unflipped} finished={isFinished} setFinished={this.setFinished}>
            <Chat socket={socket}/>
          </ControlPanel>
        </div>
      </div>
    )
  }
}