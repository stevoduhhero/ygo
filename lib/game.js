/**
 * Setup Game globals.
 */

global.Games = {};
global.NumGames = 0;

/**
 * A Yu-Gi-Oh! Game.
 *
 * @param {Socket Object} p1
 * @param {Socket Object} p2
 * @param {String} tier
 * @param {Boolean} rated
 * @param {Object} p1Deck
 * @param {Object} p2Deck
 */

function Game(p1, p2, tier, rated, p1Deck, p2Deck) {
  this.id = ++NumGames;
  this.p1 = {
		player: "p1",
		user: p1,
		deck: p1Deck.main,
		extra: p1Deck.extra,
		side: p1Deck.side,
		hand: []
	};
  this.p2 = {
		player: "p2",
		user: p2,
		deck: p2Deck.main,
		extra: p2Deck.extra,
		side: p2Deck.side,
		hand: []
	};
  this.tier = tier;
  this.rated = rated;
  this.spectators = [];

  // Create a Yu-Gi-Oh! Game.
  Games[this.id] = this;
  var game = Games[this.id];
  p1.game = game;
  p2.game = game;

  this.emit('start');
  game.startRockPaperScissors();
}

/**
 * Start the game.
 */

Game.prototype.startRockPaperScissors = function() {
	// start rock paper scissors (but we're skipping this and doing the dirty(shuffle & draw) right away)
	this.init(); //since we're skipping rps
};

Game.prototype.init = function() {
	this.shuffle(this.p1);
	this.shuffle(this.p2);
	this.draw(this.p1, 5);
	this.draw(this.p2, 5);
};

Game.prototype.shuffle = function(player) {
	
};
Game.prototype.draw = function(player, amount) {
	if (player.deck.length == 0) return;
	for (var i = 0; i < amount; i++) {
		var card = player.deck[0];
		player.deck.splice(0, 1);
		player.hand.push(card);
		this.emitTo('draw|' + player.player + '|' + card, player);
		this.emitAllExcept('draw|' + player.player + '|' + -1, player);
	}
};

/**
 * Emit data to both players and the spectators.
 *
 * @param {Object} data
 */

Game.prototype.emit = function(data) {
	data = 'g|' + data;
  this.p1.user.send(data);
  this.p2.user.send(data);

  var spectators = Object.keys(this.spectators);
  var len = spectators.length;
  while(len--) {
    this.spectators[spectators[len]].send(data);
  }
};

Game.prototype.emitAllExcept = function(data, player) {
	data = 'g|' + data;
	if (this.p1 !== player) this.p1.user.send(data);
  if (this.p2 !== player) this.p2.user.send(data);

  var spectators = Object.keys(this.spectators);
  var len = spectators.length;
  while(len--) {
    this.spectators[spectators[len]].send(data);
  }
};

Game.prototype.emitTo = function(data, player) {
	data = 'g|' + data;
	player.user.send(data);
};

module.exports = Game;
