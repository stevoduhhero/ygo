var Game = require('./game');

var match = false;

var decks = {
  // Default deck. Don't use the lowercase word `default` as a key because it is a reserved word in JavaScript.
  Default: [1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0]
};

var events = {
  /**
   * Search for a duel.
   *
   * @param {Socket Object} user
   * @param {Object} data
   */

  search: function(user, data) {
    //verify deck + tier
    if (!match) {
      //finding
      match = [user, decks.Default, "TIER"];
      return user.send('search|1');
    }
    if (match[0] === user) {
      //cancel find
      match = false;
      user.send('search|0');
      return;
    }
    //found
    var opp = match[0];
    var oppDeck = match[1];
    var tier = match[2];
    new Game(opp, user, "TIER", true, oppDeck, decks.Default);
    match = false;
    opp.send("search|0");
  }
};

module.exports = events;
