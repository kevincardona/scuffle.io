import io from 'socket.io-client';

const protocol = (window.location.protocol.includes('https')) ? 'wss' : 'ws';
export const socket = io(`${protocol}://${window.location.host}`, { reconnection: false });

const connectedPromise = new Promise(resolve => {
  socket.on('connect', () => {
    console.log('Connected to server!');
    resolve();
  });
})

export const connect = onClose => (
  connectedPromise.then(() => {
    socket.on('disconnect', () => {
      console.log('Disconnected from server.');
    });
  })
)

export const createRoom = data => {
}

export const joinRoom = data => {
}