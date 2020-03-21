const socket = io();

// openMediaStream();
// const peer = new Peer({
//   host: 'localhost',
//   port: 9000,
//   path: '/myapp'
// });

// console.log(peer);

// peer.on('open', async id => {
// });

// peer.on('call', call => {
//   currentCallOrMediaConnection = call;
//   call.answer(mediaStream);

//   call.on('stream', stream => {
//     const video = document.querySelector('.video--match');
//     video.srcObject = stream;
//   });
// });

// function connectToPeer(peerId) {
//   try {
//     currentCallOrMediaConnection = mediaConnection;
//     const mediaConnection = peer.call(peerId, mediaStream);
//     mediaConnection.on('stream', stream => {
//       const video = document.querySelector('.video--match');
//       video.srcObject = stream;
//     });

//   } catch (error) {
//     console.log('Better luck next time.');
//   }
// }

function openMediaStream() {
  function hasGetUserMedia() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }
  if (hasGetUserMedia()) {
    const constraints = {
      video: {
        mandatory: {
          maxWidth: 640,
          maxHeight: 360
        },
        quality: 7
      },
      audio: true
    };
    const video = document.querySelector('.video--me');
    navigator.mediaDevices.getUserMedia(constraints).then(stream => {
      mediaStream = stream;
      video.srcObject = stream;
    });
  }
}

function generateRandomId() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < charactersLength; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
