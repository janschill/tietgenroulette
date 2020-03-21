const express = require('express');
const app = express();
const http = require('http').createServer(app);
const path = require('path');
const io = require('socket.io')(http);
const queue = [];

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
})

io.on('connection', socket => {
  console.log('a new user connected');
  queue.push(socket.id)
  console.log(queue);

  socket.on('disconnect', () => {
    removeUserFromQueue(socket);
    console.log(`user with id ${socket.id} disconnected`);
  });
});

http.listen(3000, () => console.log(`Example app listening on port ${3000}!`))

function removeUserFromQueue() {
  const index = queue.indexOf(socket.id);
  if (index > -1) {
    queue.splice(index, 1);
  }
}
