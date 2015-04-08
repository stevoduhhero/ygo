var Game = require('./game');


var cacheUser;

var events = {
  /**
   * Search for a duel.
   *
   * @param {Socket Object} user
   * @param {Object} data
   */

  search: function(user, data) {
		//temporary 
		function DECK() {return {main: [1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0],extra: [],side: []};}
		if (typeof data != "object") data = {};
		data.tier = 'Advanced';
		data.deck = DECK();
		//^^ remove these 3 lines once the client starts sending: (tier, deck)
		
    // TODO: verify deck + tier
    // User is searching. Cache the user.
		if (!data.tier || !data.deck) return;
    if (!cacheUser) {
      cacheUser = {
				user: user,
				deck: data.deck,
				tier: data.tier
			};
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
    var game = new Game(opponent, user, data.tier, true, opponentDeck, data.deck);
    cacheUser = null;
    return opponent.send('search|0');
  }
};

module.exports = events;
