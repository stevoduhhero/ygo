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
	function Side(game, player, userObject, deck) {
		this.game = game;
		this.player = player;
		this.user = userObject;
		this.deck = deck.main;
		this.extra = deck.extra;
		this.side = deck.side;
		this.hand = [];
		return this;
	}
	Side.prototype.send = function(data) {
		this.user.send('g|' + data);
	};
	Side.prototype.sendExclude = function(data) {
		this.game.send(data, this);
	};
  this.id = ++NumGames;
	this.p1 = new Side(this, "p1", p1, p1Deck);
	this.p2 = new Side(this, "p2", p2, p2Deck);
  this.tier = tier;
  this.rated = rated;
  this.spectators = [];

  // Create a Yu-Gi-Oh! Game.
  Games[this.id] = this;
  var game = Games[this.id];
  p1.game = game;
  p2.game = game;
	
	this.p1.send('start|p1');
	this.p2.send('start|p2');
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
		player.send('draw|' + player.player + '|' + card);
		player.sendExclude('draw|' + player.player + '|' + -1);
	}
};

/**
 * Emit data to both players and the spectators.
 *
 * @param {Object} data
 */

Game.prototype.send = function(data, dontSendTo) {
	data = 'g|' + data;
  if (this.p1 !== dontSendTo) this.p1.user.send(data);
  if (this.p1 !== dontSendTo) this.p2.user.send(data);

  var spectators = Object.keys(this.spectators);
  var len = spectators.length;
  while(len--) {
    this.spectators[spectators[len]].send(data);
  }
};

module.exports = Game;
