const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const socketEvents = require('./socketEvents');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  socketEvents(socket, io);
});

const PORT = 3001;
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
