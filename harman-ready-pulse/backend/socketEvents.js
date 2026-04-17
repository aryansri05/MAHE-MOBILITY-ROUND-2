module.exports = (socket, io) => {
  console.log('New connection:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
};
