const express = require('express');
const app = express();
const http = require('http').createServer(app);
const path = require('path');
const io = require('socket.io')(http);
app.use(express.static('public'))
const queue = [];

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
})

io.on('connection', socket => {
  console.log('New user connected');

  if (queue.length <= 0) {
    socket.emit('peer', { initiator: true });
    console.log('Client told to become initiator');
  } else {
    socket.emit('peer', { initiator: false });
    socket.emit('joinInitiator', queue.pop());
    console.log(`Users in queue ${queue.length}`)
  }

  socket.on('initiatorData', data => {
    const socketId = socket.id;
    queue.push({ socketId: socketId, data });
  });


  socket.on('disconnect', () => {
    console.log(`User with id ${socket.id} disconnected`);
    removeUserFromQueue(socket);
  });

  socket.on('backToInitiator', data => {
    const socketData = data;
    io.to(socketData.socketId).emit('toInitiatorFromServer', data);
  })
});

http.listen(3000, () => console.log(`App listening on port ${3000}!`))

function removeUserFromQueue(socket) {
  const index = queue.indexOf(socket.id);
  if (index > -1) {
    queue.splice(index, 1);
  }
}
