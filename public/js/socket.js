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
			case 'start':
				function startGame(you) {
					function Side(game, player) {
						this.player = player;
						this.game = game;
						return this;
					}
					Side.prototype.opp = function() {
						var opp = "p1";
						if (this.player == "p1") opp = "p2";
						return this.game[opp];
					};
					Side.prototype.who = function() {
						if (this === this.game.you) return "you";
						return "opp";
					};
					Side.prototype.draw = function(card) {
						this.hand.push(Number(cardId));
						//move card element from deck to hand and add it to hand element
					};
					$("#homeScreen").hide();
					$("#game").show();
					app.game = {
					
					};
					app.game.p1 = Side(game, "p1");
					app.game.p2 = Side(game, "p2");
					app.game.you = app.game[you];
					app.game.opp = app.game[you].opp();
				}
				var youPlayer = data[1];
				startGame(youPlayer);
				break;
				
			case 'draw':
				var player = data[1];
				var cardId = Number(data[2]);
				var side = app.game[player];
				side.draw(Number(cardId));
				break;
		}
  }
};
