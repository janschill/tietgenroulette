var mediaStream = null;
openMediaStream();
var peer = new Peer({ key: 'lwjd5qra8257b9' });

let activeUsers = [];
let myId = null;
let occupied = false;

var activeUsersRef = firebase.database().ref('/status');

activeUsersRef.on('value', snapshot => {
  const users = snapshot.val();
  activeUsers = Object.keys(users)
    .map(user => users[user])
    .filter(user => user.id !== myId)
    .filter(user => !user.occupied);

  if (myId && !occupied && activeUsers.length) {
    connectToPeer(getRandomUser(activeUsers).id);
  }
});

peer.on('open', async id => {
  myId = id;
  var userStatusDatabaseRef = firebase.database().ref('/status/' + id);

  firebase
    .database()
    .ref('.info/connected')
    .on('value', function(snapshot) {
      if (snapshot.val() == false) {
        return;
      }

      userStatusDatabaseRef
        .onDisconnect()
        .remove()
        .then(function() {
          userStatusDatabaseRef.set({
            occupied: false,
            id
          });
        });
    });

  document.querySelector('#peer-id').innerHTML = `Your peer id is: ${String(
    id
  )}`;
});

peer.on('call', call => {
  call.answer(mediaStream);

  var userStatusDatabaseRef = firebase.database().ref('/status/' + myId);
  userStatusDatabaseRef.set({
    id: myId,
    occupied: true
  });

  call.on('stream', stream => {
    const video = document.querySelector('.video--match');
    video.srcObject = stream;
  });
});

function connectToPeer(peerId) {
  conn = peer.connect(peerId);
  var userStatusDatabaseRef = firebase.database().ref('/status/' + myId);
  userStatusDatabaseRef.set({
    id: myId,
    occupied: true
  });
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
      video: {
        mandatory: {
          maxWidth: 640,
          maxHeight: 360,
        },
        quality: 7,
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

function findNext() {
  var userStatusDatabaseRef = firebase.database().ref('/status/' + myId);
  userStatusDatabaseRef.set({
    id: myId,
    occupied: false
  });
}

function getRandomUser(activeUsers) {
  const activeUsersLength = activeUsers.length;
  return activeUsers[Math.floor(Math.random() * activeUsersLength)];
}
