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
      loading: true,
      isModalOpen: true,
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
    this.setState({loading: false, players: data.players, unflipped: data.unflippedCount, flipped: data.flipped})
  }

  closeModal = () => {this.setState({isModalOpen: false, modalData: null, modalInput: null})}

  updateInput = (e) => {
    this.setState({ modalInput: e.target.value })
  }

  triggerSteal = (player) => {
    let modalData = {
      header: `Stealing word: ${player.word} from ${player.nickname}`,
      prompt: `New word:`,
      submit: (word)=>{triggerAction(socket, {command: Constants.COMMANDS.STEAL_WORD, args: [player, word]}); this.closeModal()}
    }
    this.setState({isModalOpen: true, modalData: modalData})
  }

  triggerCreate = () => {
    console.warn("CREATING MODAL")
    let modalData = {
      header: `Creating Word`,
      prompt: `New word:`,
      submit: (word) => {triggerAction(socket, { command: Constants.COMMANDS.CREATE_WORD, args: [word]}); this.closeModal() }
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
    const {loading, flipped, players, unflipped, isModalOpen, modalData, modalInput} = this.state
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
        {
          isModalOpen && modalData != null &&
            <div className="action-menu">
              <h3>{modalData.header}</h3>
              <p>{modalData.prompt}</p>
              <input onChange={(e) => this.updateInput(e)}></input>
              <button onClick={() => { modalData.submit(modalInput) }}>Submit</button>
              <button onClick={this.closeModal}>Cancel</button>
            </div>
        }
        <div className="panel--left">
          <Leaderboard players={players} unflipped={unflipped} steal={this.triggerSteal}/>
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
          <ControlPanel socket={socket} create={this.triggerCreate}>
            <Chat socket={socket}/>
          </ControlPanel>
        </div>
      </div>
    )
  }
}