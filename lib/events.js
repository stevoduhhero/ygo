var Game = require('./game');

var decks = {
  // Default deck. Don't use the lowercase word `default` as a key because it is a reserved word in JavaScript.
  Default: [1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0]
};

var cacheUser;

var events = {
  /**
   * Search for a duel.
   *
   * @param {Socket Object} user
   * @param {Object} data
   */

  search: function(user, data) {
    // TODO: verify deck + tier
    // User is searching. Cache the user.
    if (!cacheUser) {
      cacheUser = { user: user, decks: decks.Default, tier: "PLACEHOLDER TIER" };
      return user.send('search|1');
    }
    // Cancel Find since it is the same user.
    if (cacheUser.user === user) { 
      cacheUser = null;
      return user.send('search|0');
    }
    // Found an opponent for the user.
    var opponent = cacheUser.user;
    var opponentDeck = cacheUser.deck;
    var game = new Game(opponent, user, 'TIER', true, opponentDeck, decks.Default);
    cacheUser = null;
    return opponent.send('search|0');
  }
};

module.exports = events;
