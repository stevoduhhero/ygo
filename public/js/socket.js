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
				function cardImg(card, dontAnimate) {
					var img = new Image();
					var src = './img/default.jpg';
					if (card === -1) src = './img/back.png';
					img.src = src;
					img.draggable = false;
					if (dontAnimate) {} else {
						img.style.position = 'absolute';
						img.style.top = '0px';
						img.style.left = '0px';
						img.style.display = 'none';
						img.copy = function(el) {
							var el = jQuery(el);
							jQuery(this).width(el.width()).height(el.height()).css({
								left: el.offset().left + 'px',
								top: el.offset().top + 'px'
							});
							return this;
						};
						img.toBody = function() {
							jQuery(this).appendTo('body');
							return this;
						};
						img.moveTo = function(e, time, funk) {
							var div = jQuery(this);
							var start = {
								left: Number(div[0].style.left.replace('px', '')),
								top: Number(div[0].style.top.replace('px', ''))
							};
							var end = {
								left: 0,
								top: 0
							};
							//if s or e are html elements instead of coordinates, center the div's position inside the start and end
							if (e.left) end = e; else {
								end = $(e).offset();
								end.left += ($(e).width() - $(div).width()) / 2;
								end.top += ($(e).height() - $(div).height()) / 2;
							}
							
							//animate it
							div.css({
								position: "absolute",
								display: "block",
								left: start.left + "px",
								top: start.top + "px",
								"z-index": 99999,
							}).animate({
								left: end.left + "px",
								top: end.top + "px"					
							}, time, funk);
						};
					}
					return img;
				}
				function startGame(you) {
					function Side(game, player) {
						this.player = player;
						this.game = game;
						this.hand = [];
						return this;
					}
					Side.prototype.opp = function() {
						var opp = "p1";
						if (this.player === "p1") opp = "p2";
						return this.game[opp];
					};
					Side.prototype.who = function() {
						if (this === this.game.you) return "you";
						return "opp";
					};
					Side.prototype.draw = function(card, callback) {
						var self = this;
						var img = cardImg(card);
						img.copy($("#" + self.who() + "deck")).toBody().moveTo($("#" + self.who() + "hand"), 250, function() {
							self.hand.push(card);
							$(img).clone().removeAttr('style').appendTo("#" + self.who() + "hand");
							$(img).remove();
							callback();
						});
						//move card element from deck to hand and add it to hand element
					};
					$("#homeScreen").hide();
					$("#game").show();
					app.game = {
					
					};
					app.game.p1 = new Side(app.game, "p1");
					app.game.p2 = new Side(app.game, "p2");
					app.game.you = app.game[you];
					app.game.opp = app.game.you.opp();
					app.game.queue = [];
					app.game.isQueueProcessing = false;
					app.game.processQueue = function() {
						if (this.isQueueProcessing) return;
						this.isQueueProcessing = true;
						this.nextQueue();
					};
					app.game.nextQueue = function() {
						var self = this;
						if (!self.queue.length) {
							self.isQueueProcessing = false;
							return;
						}
						var currentQueue = self.queue[0];
						self.queue.splice(0, 1);
						var event = currentQueue[0];
						var data = currentQueue[1];
						switch (event) {
							default:
								alert("No case for event: '" + event + "'");
								break;
							
							case 'draw':
								var player = data[1];
								var cardId = Number(data[2]);
								var side = app.game[player];
								side.draw(Number(cardId), function() {
									self.nextQueue();
								});
								break;
						}
					};
				}
				var youPlayer = data[1];
				startGame(youPlayer);
				break;
		}
  }
};
