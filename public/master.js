let clientStream = null;
let peer = null;
let peerStream = null;

const socketConnection = stream => {
  const socket = io('localhost:3000');
  // const socket = io('https://www.tietgenroulette.com');

  socket.on('peer', data => {
    createPeer(data.initiator, stream);

    if (data.initiator) {
      peer.on('signal', data => {
        socket.emit('initiatorData', data);
      });
    }
  });

  socket.on('joinInitiator', data => {
    peer.signal(data.data);

    if (!data.initiator) {
      let initiaitorSocketId = data.socketId;
      peer.on('signal', data => {
        socket.emit('backToInitiator', {
          socketId: initiaitorSocketId,
          data: data
        });
      });
    }
  });

  socket.on('toInitiatorFromServer', data => {
    peer.signal(data.data);
  });
};

const next = () => {
  if (peer != null && typeof peer != 'undefined') {
    peer.destroy();

    peer = null;
    peerStream = null;
  }

  if (clientStream) {
    socketConnection(clientStream);
  } else {
    navigator.mediaDevices
      .getUserMedia({
        video: {
          mandatory: {
            maxWidth: 640,
            maxHeight: 360
          },
        }, audio: true
      })
      .then(stream => {
        socketConnection(stream);
      })
      .catch(err => {
        socketConnection(false);
      });
  }
};

const createPeer = (initiator, stream) => {
  let newPeer = new SimplePeer({
    initiator: initiator,
    trickle: false,
    stream: stream
  });

  newPeer.on('error', err => { });

  newPeer.on('connect', () => { });

  newPeer.on('data', async data => {
    data = JSON.parse(data);
  });

  newPeer.on('stream', data => {
    peerStream = data;
    const video = document.querySelector('.video--match');
    video.srcObject = data;
  });

  peer = newPeer;
};

navigator.mediaDevices
  .getUserMedia({
    video: {
      mandatory: {
        maxWidth: 640,
        maxHeight: 360
      },
      quality: 7
    }, audio: true
  })
  .then(stream => {
    clientStream = stream;
    const video = document.querySelector('.video--me');
    video.srcObject = stream;
  });
