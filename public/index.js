var mediaStream = null;
openMediaStream();
var peer = new Peer({ key: 'lwjd5qra8257b9' });

var userStatusDatabaseRef = firebase.database().ref('/status/' + 'test');

var isOfflineForDatabase = {
  state: 'offline',
  last_changed: firebase.database.ServerValue.TIMESTAMP
};

var isOnlineForDatabase = {
  state: 'online',
  last_changed: firebase.database.ServerValue.TIMESTAMP
};

firebase
  .database()
  .ref('.info/connected')
  .on('value', function (snapshot) {
    if (snapshot.val() == false) {
      console.log('Not currently connected');
      return;
    }

    userStatusDatabaseRef
      .onDisconnect()
      .set(isOfflineForDatabase)
      .then(function () {
        userStatusDatabaseRef.set(isOnlineForDatabase);
      });
  });

firebase
  .firestore()
  .collection('activeUsers')
  .onSnapshot(snapshot => {
    let activeUsers = snapshot.docs.map(activeUser => activeUser.id);
    console.log(activeUsers);
    document.getElementById('active-users').innerHTML = activeUsers.join(', ');
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

  document.querySelector('#peer-id').innerHTML = `Your peer id is: ${String(
    id
  )}`;
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
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
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
function findNext() {
  console.log('find next user');
}
