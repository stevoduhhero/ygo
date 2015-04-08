$("#findDuel").click(function() {
  app.socket.emit('search');
});
