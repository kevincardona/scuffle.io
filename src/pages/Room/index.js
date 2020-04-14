import React, {Component} from 'react';
import {socket, joinRoom, leaveRoom, triggerAction} from '../../util/api';
import Constants from '../../constants';
import Loader from '../../assets/loader.svg';
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
      modalData: null
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
    this.setState({
      loading: false,
      players: data.players,
      unflipped: data.unflippedCount,
      flipped: data.flipped,
      room: data.room,
    })
  }

  closeModal = () => { this.setState({ isModalOpen: false, modalData: null }) }

  triggerSteal = (player) => {
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
      copy:  `https://${window.location.host}/#/invite/${this.state.room}`,
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
    const { socket } = this.props
    if (!socket)
      return
    triggerAction(socket, {
      command: Constants.COMMANDS.FLIP
    })
  }

  render() {
    const {loading, flipped, players, unflipped, room, isModalOpen, modalData} = this.state
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
          <Leaderboard 
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
              [...Array(Constants.GAME.TILE_COUNT)].map((_, i) => {
                if (i < flipped.length)
                  return <Tile key={i} letter={flipped[i]}/>
                if (i < flipped.length + 20)
                  return <Tile key={i} onClick={() => {triggerAction(socket, {command: Constants.COMMANDS.FLIP})}}/>
                return null
              })
            }
          </div>
          <ControlPanel socket={socket} create={this.triggerCreate}>
            <Chat socket={socket}/>
          </ControlPanel>
        </div>
      </div>
    )
  }
}