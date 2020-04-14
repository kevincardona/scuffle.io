import io from 'socket.io-client';
import Constants from '../constants';

export const getSocket = () => {
  const protocol = (window.location.protocol.includes('https')) ? 'wss' : 'ws';
  const socket = io(`${protocol}://${window.location.host}`, { reconnection: true });
  const connectedPromise = new Promise(resolve => {
    socket.on('connect', () => {
      console.log('Connected to server!');
      resolve();
    });
  })
  connectedPromise.then(() => {
    socket.on('disconnect', () => {
      console.log('Disconnected from server.');
    });
  })
  return socket
}

export const triggerAction = (socket, action) => {
  socket.emit(Constants.MSG_TYPES.PLAYER_ACTION, action)
}

export const leaveRoom = (socket) => {
  socket.emit(Constants.MSG_TYPES.LEAVE_ROOM);
}

export const joinRoom = (socket, room, nickname) => {
  socket.emit(Constants.MSG_TYPES.JOIN_ROOM, {room: room, nickname: nickname});
}

export const sendMessage = (socket, message) => {
  socket.emit(Constants.MSG_TYPES.MESSAGE, message);
}