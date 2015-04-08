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
 * @param {Array} p1Deck
 * @param {Array} p2Deck
 */

function Game(p1, p2, tier, rated, p1Deck, p2Deck) {
  this.id = ++NumGames;
  this.p1 = { user: p1, deck: p1Deck };
  this.p2 = { user: p2, deck: p2Deck };
  this.tier = tier;
  this.rated = rated;
  this.spectators = [];

  // Create a Yu-Gi-Oh! Game.
  Games[this.id] = this;
  var game = Games[this.id];
  p1.game = game;
  p2.game = game;

  game.init();
}

/**
 * Start the game.
 */

Game.prototype.init = function() {
  // TODO: shuffle decks
  this.emit('start');
};

/**
 * Emit data to both players and the spectators.
 *
 * @param {Object} data
 */

Game.prototype.emit = function(data) {
  this.p1.user.send(data);
  this.p2.user.send(data);

  var spectators = Object.keys(this.spectators);
  var len = spectators.length;
  while(len--) {
    this.spectators[spectators[len]].send(data);
  }
};

module.exports = Game;
