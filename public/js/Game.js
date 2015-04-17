function Game(data) {
	var you = data[1];
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
		if (moveTo.length === 0) moveTo = $("#" + self.who() + "hand"); //no cards in hand so move to center of hand
		img.copy($("#" + self.who() + "deck"), true).toBody().moveTo(moveTo, 250, function() {
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
	game.parseStartData(data);
	return game;
}
Game.prototype.parseStartData = function(data) {
	function allToNum(obj) {
		if (typeof obj === "string") return Number(obj);
		for (var i in obj) {
			if (obj[i] === "") {
				obj.splice(i, 1); //delete blank entries
				continue;
			}
			obj[i] = Number(obj[i]);
		}
		return obj;
	}
	var you = data[1];
	var data = {
		name: data[2].split(','),
		points: data[3].split(','),
		mainCount: data[4].split(','),
		extraCount: data[5].split(','),
		hand: data[6].split('*'),
		field: data[7].split('*'),
		extra: data[8].split(','),
		grave: data[9].split('*'),
		banished: data[10].split('*')
	};
	var playerCount = data.name.length;
	for (var key in data) {
		var val = data[key];
		for (var p = 0; p < playerCount; p++) {
			var obj;
			if (key === "name") {
				obj = val[p];
			} else if (key === "points" || key === "mainCount" || key === "extraCount") {
				obj = Number(val[p]);
			} else if (key === "hand") {
				obj = val[p].split(',');
				obj = allToNum(obj);
			}
			if (key === "field") {
				obj = val[p].split(','); //gives you the zones, but the zones may have multiple cards
				for (var z in obj) {
					var zoneTxt = allToNum(obj[z].split('@'));
					var zone = [];
					for (var c in zoneTxt) {
						var card = {
							id: Number(zoneTxt[c].slice(0, -1)),
							pos: Number(zoneTxt[c].slice(-1))
						};
						zone.push(card);
					}
					obj[z] = zone;
				}
			} else if (key === "extra") {
				obj = val;
				obj = allToNum(obj);
			} else if (key === "grave" || key === "banished") {
				obj = val[p].split(',');
				obj = allToNum(obj);
			}
			this["p" + (p + 1)][key] = obj;
		}
	}
};
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
Game.prototype.drop = function(drag) {
	function info(el, noparent) {
		var info = {};
		var parent = el.parent();
		if (noparent) parent = el;
		var id = parent.attr('id');
		//determine who
		info.who = "you";
		if (id.split('opp').length - 1 > 0) info.who = "opp";
		id = id.replace('you', '').replace('opp', '');
		//determine array type & zone
		if (isNaN(id)) {
			info.list = id;
		} else {
			info.list = 'field';
			info.zone = Number(id);
		}
		//determine slot
		if (noparent) return info;
		var imgs = parent.find('img');
		for (var slot in imgs) {
			if (isNaN(slot)) continue;
			if (imgs[slot] === el[0]) {
				info.slot = Number(slot);
				break;
			}
		}
		return info;
	}
	var source = info($(drag.source));
	var target = info($(drag.target), true);
	
	//$(drag.source).clone().appendTo(drag.target); //remove this when done
	//drag.source.remove(); //remove this when done
	
	var moveZone = false;
	if (source.list === target.list) {
		if (source.list === "field") {
			if (source.zone === target.zone) return;
			if (target.who === "opp") {
				//giving control of cards in zone
				if (this.opp.field[target.zone].length) return; //there's already a card on this zone
			}
			//moving zones
			moveZone = true;
		} else return;
	}
	if (moveZone) {
		//moving zones
		app.socket.emit('move', {
			source: source,
			target: target
		});
	} else {
		//moving lists
		if (target.who === "opp" && target.list === "field") {
			if (this.opp.field[target.zone].length) return; //there's already a card on this zone
		}
		if (target.who === "you" && target.list === "field") {
			alert("prompt to determine what position to summon in");
			return;
		}
		if (target.list === "deck") {
			//top === (target.pos = 0) bottom === (target.pos = 1)
			alert("prompt to determine where to place card (top/bottom)");
			return;
		}
		//moving lists
		app.socket.emit('move', {
			source: source,
			target: target
		});
	}
};
