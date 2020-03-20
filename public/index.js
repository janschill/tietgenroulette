var mediaStream = null;
openMediaStream();
var peer = new Peer({ key: 'lwjd5qra8257b9' });

firebase
  .firestore()
  .collection('activeUsers')
  .onSnapshot(snapshot => {
    let activeUsers = snapshot.docs.map(activeUser => activeUser.id);
    console.log(activeUsers);
    document.getElementById('active-users').innerHTML = activeUsers.join(
      ', '
    );
  });

peer.on('open', function (id) {
  console.log('My peer ID is: ' + id);
  firebase
    .firestore()
    .collection('activeUsers')
    .doc(id)
    .set({
      activated: new Date()
    });

  document.querySelector(
    '#peer-id'
  ).innerHTML = `Your peer id is: ${String(id)}`;
});

peer.on('connection', function (conn) {
  console.log('Someone is reaching out');
});

peer.on('call', call => {
  call.answer(mediaStream);

  call.on('stream', stream => {
    const video = document.querySelector('.video--match');
    video.srcObject = stream;
  });
});

function connectToPeer() {
  var peerChoice = document.getElementById('peer-chooser').value;
  console.log(peerChoice);
  conn = peer.connect(peerChoice);
}

function callPeer() {
  var peerChoice = document.getElementById('peer-chooser').value;

  const mediaConnection = peer.call(peerChoice, mediaStream);
  mediaConnection.on('stream', stream => {
    const video = document.querySelector('.video--match');
    video.srcObject = stream;
  });
}

function openMediaStream() {
  function hasGetUserMedia() {
    return !!(
      navigator.mediaDevices && navigator.mediaDevices.getUserMedia
    );
  }
  if (hasGetUserMedia()) {
    const constraints = {
      video: true,
      audio: true
    };
    const video = document.querySelector('.video--me');
    navigator.mediaDevices.getUserMedia(constraints).then(stream => {
      mediaStream = stream;
      video.srcObject = stream;
    });
  }
}
