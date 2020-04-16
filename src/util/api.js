import io from 'socket.io-client';
import Constants from '../constants';

export const getSocket = () => {
  const protocol = (window.location.protocol.includes('https')) ? 'wss' : 'ws';
  const socket = io(`${protocol}://${window.location.host}`, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax : 5000,
    reconnectionAttempts: Infinity
  });
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
  if (!socket)
    return
  socket.emit(Constants.MSG_TYPES.PLAYER_ACTION, action)
}

export const leaveRoom = (socket) => {
  if (!socket)
    return
  socket.emit(Constants.MSG_TYPES.LEAVE_ROOM);
}

export const joinRoom = (socket, room, nickname) => {
  if (!socket)
    return
  socket.emit(Constants.MSG_TYPES.JOIN_ROOM, {room: room, nickname: nickname});
}

export const sendMessage = (socket, message) => {
  if (!socket)
    return
  socket.emit(Constants.MSG_TYPES.MESSAGE, message);
}