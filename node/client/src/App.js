import React, { useEffect, useState } from 'react';
import './App.css';
import Peer from 'simple-peer';
import socketIOClient from 'socket.io-client';

const App = () => {
  const [clientStream, setClientStream] = useState(null);
  const [peer, setPeer] = useState(null);
  const [peerStream, setPeerStream] = useState(null);

  const socketConnection = stream => {
    var socket = socketIOClient.connect('http://localhost:3000');

    socket.on('peer', data => {
      let localPeer = createPeer(data.initiator, stream);
      console.log(localPeer);

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

      setPeer(null);
      setPeerStream(null);
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
    var peer = new Peer({
      initiator: initiator,
      trickle: false,
      stream: stream
    });

    peer.on('error', err => {});

    peer.on('connect', () => {});

    peer.on('data', async data => {
      data = JSON.parse(data);
    });

    peer.on('stream', data => {
      setPeerStream(data);
    });

    setPeer(peer);

    return peer;
  };

  // Mount listener
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then(stream => {
        setClientStream(stream);
      });
  }, []);

  useEffect(() => {
    const video = document.querySelector('.video--me');
    video.srcObject = clientStream;
  }, [clientStream]);

  useEffect(() => {
    const video = document.querySelector('.video--match');
    video.srcObject = peerStream;
  }, [peerStream]);

  return (
    <div>
      <video className="video--me" autoPlay playsInline muted></video>
      <video className="video--match" autoPlay playsInline muted></video>
      <button onClick={next}>NEXT!</button>
    </div>
  );
};

export default App;
