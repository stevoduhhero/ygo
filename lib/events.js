global.Game = require('./game.js').Game;
global.games = {};
global.gameCount = 0;

var search = false;
var events = {
	search: function(user, data) {
		//if (!data.deck || !data.tier) return;
		//verify deck + tier
		function DECK() {
			//DEFAULT DECK
			return [1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0];
		}
		if (!search) {
			//finding
			search = [user, DECK(), "TIER"];
			user.send('search|1');
		} else {
			if (search[0] === user) {
				//cancel find
				search = false;
				user.send('search|0');
				return;
			}
			//found
			var opp = search[0],
				oppDeck = search[1],
				tier = search[2];
			new Game(opp, user, "TIER", true, oppDeck, DECK());
			search = false;
			opp.send("search|0");
		}
	},
};
module.exports = events;
