function Game(p1, p2, tier, rated, p1deck, p2deck) {
	var game;
	gameCount++;
	this.id = gameCount;
	this.tier = tier;
	this.rated = rated;
	this.p1 = {
		user: p1,
		deck: p1deck
	};
	this.p2 = {
		user: p2,
		deck: p2deck
	};
	this.spectators = new Array();
	games[this.id] = this;
	game = games[this.id];
	p1.game = game;
	p2.game = game;
	game.initialize();
}
Game.prototype.initialize = function() {
	//shuffle decks
	this.emit('start');
};
Game.prototype.emit = function(data) {
	this.p1.user.send(data);
	this.p2.user.send(data);
	for (var i in this.spectators) this.spectators[i].send(data);
};
exports.Game = Game;