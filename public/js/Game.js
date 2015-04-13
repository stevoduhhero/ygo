function Game(you) {
	var game = this;
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
		var moveTo = $("#" + self.who() + "hand img").last(); //move to last img in hand
		if (moveTo.length == 0) moveTo = $("#" + self.who() + "hand"); //no cards in hand so move to center of hand
		img.copy($("#" + self.who() + "deck")).toBody().moveTo(moveTo, 250, function() {
			self.hand.push(card);
			$(img).clone().removeAttr('style').appendTo("#" + self.who() + "hand");
			$(img).remove();
			callback();
		});
		//move card element from deck to hand and add it to hand element
	};
	$("#homeScreen").hide();
	$("#game").show();
	game.p1 = new Side(game, "p1");
	game.p2 = new Side(game, "p2");
	game.you = game[you];
	game.opp = game.you.opp();
	game.queue = [];
	game.isQueueProcessing = false;
	return game;
}
Game.prototype.processQueue = function() {
	if (this.isQueueProcessing) return;
	this.isQueueProcessing = true;
	this.nextQueue();
};
Game.prototype.nextQueue = function() {
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
			var side = self[player];
			side.draw(Number(cardId), function() {
				self.nextQueue();
			});
			break;
	}
};
