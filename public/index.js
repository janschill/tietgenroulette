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
  .on('value', function(snapshot) {
    // If we're not currently connected, don't do anything.
    if (snapshot.val() == false) {
      console.log('Not currently connected');
      return;
    }

    // If we are currently connected, then use the 'onDisconnect()'
    // method to add a set which will only trigger once this
    // client has disconnected by closing the app,
    // losing internet, or any other means.
    userStatusDatabaseRef
      .onDisconnect()
      .set(isOfflineForDatabase)
      .then(function() {
        // The promise returned from .onDisconnect().set() will
        // resolve as soon as the server acknowledges the onDisconnect()
        // request, NOT once we've actually disconnected:
        // https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect

        // We can now safely set ourselves as 'online' knowing that the
        // server will mark us as offline once we lose connection.
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

peer.on('open', function(id) {
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

peer.on('connection', function(conn) {
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
