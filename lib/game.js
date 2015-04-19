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
		this.points = 8000;
		this.deck = deck.main;
		this.extra = deck.extra;
		this.side = deck.side;
		this.hand = [];
		this.field = [ [], [], [], [], [], [], [], [], [], [], [], [], [] ];
		this.grave = [];
		this.banished = [];
		return this;
	}
	Side.prototype.send = function(data) {
		this.user.send('g|' + data);
	};
	Side.prototype.sendExclude = function(data) {
		this.game.send(data, this);
	};
	Side.prototype.opp = function() {
		var opp = "p1";
		if (this.player === "p1") opp = "p2";
		return this.game[opp];
	};
	Side.prototype.you = function() {
		return this;
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

	game.reconnect(this.p1.user);
	game.reconnect(this.p2.user);
	game.startRockPaperScissors();
}

/**
 * Gives game state on connection
 */

Game.prototype.reconnect = function(user) {
	var spectator = true, x;
	if (user === this.p1.user) {
		spectator = this.p1;
	} else if (user === this.p2.user) {
		spectator = this.p2;
	}
	//player data and deck counts
	var dataString = this.p1.user.name + ',' + this.p2.user.name + '|' +
		this.p1.points + ',' + this.p2.points + '|' +
		this.p1.deck.length + ',' + this.p2.deck.length + '|' +
		this.p1.extra.length + ',' + this.p2.extra.length + '|';
	//game state
	var players = ["p1", "p2"];
	var lists = ["hand", "field", "extra", "grave", "banished"];
	var listCount = lists.length;
	for (var listKey = 0; listKey < listCount; listKey++) {
		var list = lists[listKey];
		for (var i = 0; i < 2; i++) {
			var player = this[players[i]];
			if (list === "hand") {
				//you only see your hand, the opponents hand will be "-1"s
				var handCount = player.hand.length;
				for (x = 0; x < handCount; x++) {
					if (spectator === true || spectator !== player) dataString += '-1,'; //-1 means the id is "anonymous/unknown"
					if (spectator === player) dataString += player.hand[x] + ',';
				}
				if (player.hand.length) dataString = dataString.slice(0, -1);
				dataString += "*";
				if (player.player === "p2") dataString = dataString.slice(0, -1) + '|';
			}
			if (list === "field") {
				//everyone can see anything that isn't facedown
				for (x = 0; x < 13; x++) { //13 zones including field and pendulums
					var zone = player.field[x];
					if (typeof zone !== "object") {
						//if not an [] no cards in the zone
						dataString += ",";
						continue;
					}
					var zoneCardCount = zone.length;
					for (var z = 0; z < zoneCardCount; z++) {
						//there can be multiple cards in a zone (overlay, attached cards), the first one is the main one obviously
						//@ is card separator. in card dataStrings the position will be the last character in the string
						//cardid + position + '@' + cardid + position + '@'
						//so "10@20" means "cardid"=1 and "position"=0 and there's another card with a "cardid"=2 and a "position"=0
						var card = zone[z];
						var facedown = false;
						var displayId = card.id;
						if ((card.pos === 3 || card.pos === 4)) facedown = true;
						if (spectator !== player && facedown) displayId = -1;
						dataString += displayId + card.pos + "@";
					}
					if (zone.length) dataString = dataString.slice(0, -1);
					dataString += ",";
				}
				dataString = dataString.slice(0, -1) + '*';
				if (player.player === "p2") dataString = dataString.slice(0, -1) + '|';
			}
			if (list === "extra") {
				//you only see your own extra deck
				if (spectator === player) dataString += player.extra.join(',') + '|';
			}
			if (list === "banished" || list === "grave") {
				//there's no obscuring this data and any player can see it
				dataString += player[list].join(',') + '*';
				if (player.player === "p2") dataString = dataString.slice(0, -1) + '|';
			}
		}
	}
	dataString = dataString.slice(0, -1);

	var viewingAs = 'p1';
	if (spectator !== true) viewingAs = spectator.player;
	user.send('g|start|' + viewingAs + '|' + dataString);
};

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
	if (player.deck.length === 0) return;
	for (var i = 0; i < amount; i++) {
		var card = player.deck[0];
		player.deck.splice(0, 1);
		player.hand.push(card);
		player.send('draw|' + player.player + '|' + card);
		player.sendExclude('draw|' + player.player + '|' + -1);
	}
};
Game.prototype.move = function(user, source, target) {
	var sourcePlayer;
	if (user === this.p1.user) {
		sourcePlayer = this.p1;
	} else if (user === this.p2.user) {
		sourcePlayer = this.p2;
	} else return;
	var targetPlayer = sourcePlayer[target.who]();
	var moveZone = false;
	if (source.list === target.list) {
		if (source.list === "field") {
			if (source.zone === target.zone && target.who === "you") return;
			moveZone = true;
		} else return;
	}
	var revealId = false;
	var revealSelf = false;
	var tarZone, cardCache;
	if (moveZone) {
		if (target.who === "you") {
			//card moving zones
			cardCache = sourcePlayer.field[source.zone][source.slot];
			tarZone = targetPlayer.field[target.zone];
			sourcePlayer.field[source.zone].splice(source.slot, 1);
			tarZone.push(cardCache);
		} else {
			//changing card control - in this case we move the entire zone instead of just a single card in case we're changing control of cards with attached cards
			tarZone = targetPlayer.field[target.zone];
			var zoneCache = sourcePlayer.field[source.zone];
			if (tarZone.length) return; //there's already something in the zone
			sourcePlayer.field[source.zone] = [];
			var cardCount = zoneCache.length;
			for (var i = 0; i < cardCount; i++) tarZone.push(zoneCache[i]);
			revealId = zoneCache[0].id; //only the first card can be facedown
		}
	} else {
		//moving lists
		if (target.who === "opp" && target.list === "field") {
			tarZone = targetPlayer.field[target.zone];
			cardCache = sourcePlayer[source.list][source.slot];
			if (tarZone.length) return; //there's already something in the zone
			sourcePlayer[source.list].splice(source.slot, 1);
			tarZone.push({
				id: cardCache,
				pos: 0
			});
			revealId = cardCache;
		} else {
			//these are cases where the source === target players
			cardCache = sourcePlayer[source.list][source.slot];
			if (source.list === "field") {
				cardCache = sourcePlayer[source.list][source.zone][source.slot].id;
				sourcePlayer[source.list][source.zone].splice(source.slot, 1);
			} else sourcePlayer[source.list].splice(source.slot, 1);
			if (target.list === "field") {
				cardCache = {
					id: cardCache,
					pos: target.pos
				};
			}
			if (target.list === "deck" && (!target.pos || target.pos === 0)) {
				targetPlayer[target.list].unshift(cardCache); //at the top of the deck
			} else {
				targetPlayer[target.list].push(cardCache);
			}
			revealId = cardCache;
			if (target.pos === 2 || target.pos === 3) {
				revealId = false;
				revealSelf = cardCache;
			}
		}
	}

	function strConstruct(info) {
		function str(text) {
			if (text === undefined) return "";
			return text;
		}
		return sourcePlayer[info.who]().player + ',' + info.list + ',' + str(info.slot) + ',' + str(info.zone) + ',' + str(info.pos);
	}
	var dataString = 'move|' + strConstruct(source) + '|' + strConstruct(target);
	if (revealId === false) {
		//don't send reveal'd id to spectators
		sourcePlayer.send(dataString + '|' + revealSelf); //the owner of the card must at least know what it is
		sourcePlayer.sendExclude(dataString);
		return;
	}
	this.send(dataString + '|' + revealId);
};

/**
 * Emit data to both players and the spectators.
 *
 * @param {Object} data
 */

Game.prototype.send = function(data, dontSendTo) {
	data = 'g|' + data;
	if (this.p1 !== dontSendTo) this.p1.user.send(data);
	if (this.p2 !== dontSendTo) this.p2.user.send(data);

	var spectators = Object.keys(this.spectators);
	var len = spectators.length;
	while (len--) {
		this.spectators[spectators[len]].send(data);
	}
};

module.exports = Game;
