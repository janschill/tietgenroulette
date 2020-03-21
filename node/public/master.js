let clientStream = null;
let peer = null;
let peerStream = null;

const socketConnection = stream => {
  var socket = io('http://localhost:3000');

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
      let initiaitorSocketId = data.socketid;
      peer.on('signal', data => {
        socket.emit('backToInitiator', {
          socketid: initiaitorSocketId,
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

  navigator.mediaDevices
    .getUserMedia({ video: true, audio: true })
    .then(stream => {
      socketConnection(stream);
    })
    .catch(err => {
      socketConnection(false);
    });
};

const createPeer = (initiator, stream) => {
  let newPeer = new SimplePeer({
    initiator: initiator,
    trickle: false,
    stream: stream
  });

  newPeer.on('error', err => {});

  newPeer.on('connect', () => {});

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
  .getUserMedia({ video: true, audio: true })
  .then(stream => {
    const video = document.querySelector('.video--me');
    video.srcObject = stream;
  });
