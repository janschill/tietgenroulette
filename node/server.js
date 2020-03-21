const express = require('express');
const { ExpressPeerServer } = require('peer');
const app = express();
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
  console.log('Server running on port 9000');
});

const server = app.listen(9000);

const peerServer = ExpressPeerServer(server, {
  debug: true,
  path: '/myapp'
});

app.use('/peerjs', peerServer);
