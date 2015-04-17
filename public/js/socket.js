function Socket() {
  var socket = io();

  socket.on('connect', function() {
    console.log('I AM CONNECTED!');
  });

  /**
   * Retriving an event.
   *
   * @param {Object or String} data
   *
   * The data should be one large string
   * Example - event|data1|data2|data3\nevent|data1|data2
   */

  socket.on('e', function(data) {
    console.log(data);
    var events = this.REFERENCE.events;
    if (typeof data === "string") {
      var eventos = data.split('\n');
      for (var eventKey in eventos) {
        var rows = eventos[eventKey].split('|');
        if (events[rows[0]]) {
          events[rows[0]](rows);
        } else {
          events.c(("c||" + rows.join('|')).split("|"));
        }
      }
    } else {
      if (events[data.event]) events[data.event](data);
    }
  });

  /**
   * Emit an event.
   *
   * @param {String} event
   * @param {Object} data
   */

  this.emit = function(event, data) {
    var obj = {};
    if (typeof data === 'object') {
      obj = data; 
    } else {
      obj.data = data;
    }
    obj.event = event;
    console.log(JSON.stringify(obj));
    socket.emit('e', obj);
  };
  this.socket = socket;
  this.socket.REFERENCE = this;
  return this;
}
Socket.prototype.events = {
  search: function(data) {
    if (Number(data[1])) {
      //finding
      $("#findDuel").html("Cancel Find Duel");
    } else {
      //canceling
      $("#findDuel").html("Find Duel");
    }
  },
  g: function(data) {
		//all events that have to do with the game
		data.splice(0, 1);
		switch(data[0]) {
			default:
				//all the animations are pushed to queue
				app.game.queue.push([data[0], data]);
				app.game.processQueue();
				break;
			
			case 'start':
				app.game = new Game(data);
				break;
		}
  }
};
