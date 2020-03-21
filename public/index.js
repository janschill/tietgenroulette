var mediaStream = null;
openMediaStream();
var peer = new Peer({ key: 'lwjd5qra8257b9' });

let myId = null;
let occupied = false;
let currentCallOrMediaConnection = null;

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

  var activeUsersRef = firebase.database().ref('/status');

  activeUsersRef.on('value', snapshot => {
    const users = snapshot.val();
    const activeUsers = Object.keys(users)
      .map(user => users[user])
      .filter(user => user.id !== myId)
      .filter(user => !user.occupied);

    if (myId && !occupied && activeUsers.length) {
      connectToPeer(getRandomUser(activeUsers).id);
    }
  });

  document.querySelector('#peer-id').innerHTML = `Your peer id is: ${String(
    id
  )}`;
});

peer.on('call', call => {
  if (!occupied) {
    currentCallOrMediaConnection = call;
    call.answer(mediaStream);

    call.on('stream', stream => {
      const video = document.querySelector('.video--match');
      video.srcObject = stream;
    });

    var userStatusDatabaseRef = firebase.database().ref('/status/' + myId);
    userStatusDatabaseRef.set({
      id: myId,
      occupied: true
    });
  }
});

function connectToPeer(peerId) {
  try {
    currentCallOrMediaConnection = mediaConnection;
    const mediaConnection = peer.call(peerId, mediaStream);
    mediaConnection.on('stream', stream => {
      const video = document.querySelector('.video--match');
      video.srcObject = stream;
    });

    var userStatusDatabaseRef = firebase.database().ref('/status/' + myId);
    userStatusDatabaseRef.set({
      id: myId,
      occupied: true
    });
    occupied = true;
  } catch (error) {
    console.log('Better luck next time.');
  }
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

function findNext() {
  if (currentCallOrMediaConnection) currentCallOrMediaConnection.close();

  var userStatusDatabaseRef = firebase.database().ref('/status/' + myId);
  userStatusDatabaseRef.set({
    id: myId,
    occupied: false
  });

  occupied = false;
}

function getRandomUser(activeUsers) {
  const activeUsersLength = activeUsers.length;
  return activeUsers[Math.floor(Math.random() * activeUsersLength)];
}
