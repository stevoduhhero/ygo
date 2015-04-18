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
        self.deck.splice(0, 1);
        self.game.updateListCounts();
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

    function blankRay(num) {
        var ray = [];
        for (var i = 0; i < num; i++) ray.push(-1);
        return ray;
    }
    this.p1.deck = blankRay(this.p1.mainCount);
    this.p2.deck = blankRay(this.p2.mainCount);
    this.opp.extra = blankRay(this.p2.extraCount); //don't blankRay extra for "you" because everyone knows their own extra deck
    this.updateField();
};
Game.prototype.updateField = function() {
    this.updatePlayersInfo();
    this.updateListCounts();
};
Game.prototype.updatePlayersInfo = function() {
    for (var p = 1; p < 3; p++) {
        var player = this["p" + p];
        $("#" + player.who() + "points").html($("<div/>").text(player.name).html() + "<span>" + player.points + "</span>");
    }
};
Game.prototype.updateListCounts = function() {
    var lists = ["deck", "extra", "grave", "banished"];
    var listsLen = lists.length;
    for (var p = 1; p < 3; p++) {
        var player = this["p" + p];
        for (var i = 0; i < listsLen; i++) {
            var list = lists[i];
            var el = $("#" + player.who() + list);
            el.empty();
            var listCount = player[list].length;
            if (listCount !== 0) {
                //add image
                var cardId = -2;
                if (list === "grave" || list === "banished") cardId = player[list][listCount - 1];
                var card = $(cardImg(cardId, true));
                if (player.who() === "opp") card.addClass("v");
                card.appendTo(el);
            }
            el.append('<span class="deckCount">' + listCount + '</span>');
        }
    }
};
Game.prototype.update = function(info) {
    var player = this[info.who];
    if (info.list === "field") {
        var el = $("#" + player.who() + info.zone).empty();
        var len = player.field[info.zone].length;
        for (var i = 0; i < len; i++) {
            var card = player.field[info.zone][i];
            var cardEl = $(cardImg(card.id, true));
            if (player.who() === "opp") cardEl.addClass("v");
            if (card.pos === 1 || card.pos === 3) cardEl.addClass("defense");
            cardEl.appendTo(el);
        }
    } else if (info.list === "hand") {
        var el = $("#" + player.who() + "hand").empty();
        var len = player.hand.length;
        var revealedCards = false;
        for (var i = 0; i < len; i++) {
            var card = player.hand[i];
            var cardEl = $(cardImg(card, true));
            if (card !== -1) revealedCards = true;
            cardEl.appendTo(el);
        }
        //if cards in hand !== -1 they are being revealed temporarily, in 1000ms revert the ids
        var self = this;
        if (!revealedCards || info.who === "you") return;
        for (var i = 0; i < len; i++) player.hand[i] = -1;
        setTimeout(function() {
            self.update(info);
        }, 1000);
    } else {
        this.updateListCounts();
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
        default: alert("No case for event: '" + event + "'");
        break;

        case 'move':
                var src = data[1].split(',');
            var tar = data[2].split(',');
            var cardId = Number(data[3]);
            var source = {
                who: this[src[0]].who(),
                list: src[1],
                slot: Number(src[2]),
                zone: Number(src[3]),
                pos: Number(src[4])
            };
            var target = {
                who: this[tar[0]].who(),
                list: tar[1],
                slot: Number(tar[2]),
                zone: Number(tar[3]),
                pos: Number(tar[4])
            };
            var player = this[source.who];
            if (cardId) {
                var list = player[source.list];
                if (source.list === "field") {
                    list[source.zone][source.slot].id = cardId;
                } else list[source.slot] = cardId;
            }
            this.move(cardId, source, target, function() {
                self.nextQueue();
            });
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
            if (source.zone === target.zone && target.who === "you") return;
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
Game.prototype.move = function(cardId, source, target, callback) {
    var self = this;
    var sourcePlayer = this[source.who];
    var targetPlayer = this[target.who];
    var flippedWhos = false;
    if (source.who === "opp") {
        //everything is relative to the sourcePlayer so we gotta flip stuff
        source.who = sourcePlayer.opp().who();
        target.who = targetPlayer.opp().who();
        flippedWhos = true;
    }

    //edit the arrays
    var moveZone = false;
    if (source.list === target.list) {
        if (source.list === "field") {
            if (source.zone === target.zone && target.who === "you") return;
            moveZone = true;
        } else return;
    }
    var revealId = false;
    if (moveZone) {
        if (target.who === "you") {
            //card moving zones
            var cardCache = sourcePlayer.field[source.zone][source.slot];
            var tarZone = targetPlayer.field[target.zone];
            sourcePlayer.field[source.zone].splice(source.slot, 1);
            tarZone.push(cardCache);
        } else {
            //changing card control - in this case we move the entire zone instead of just a single card in case we're changing control of cards with attached cards
            var tarZone = targetPlayer.field[target.zone];
            var zoneCache = sourcePlayer.field[source.zone];
            if (tarZone.length) return; //there's already something in the zone
            sourcePlayer.field[source.zone] = [];
            var cardCount = zoneCache.length;
            for (var i = 0; i < cardCount; i++) tarZone.push(zoneCache[i]);
            revealId = true;
        }
    } else {
        //moving lists
        if (target.who === "opp" && target.list === "field") {
            var tarZone = targetPlayer.field[target.zone];
            var cardCache = sourcePlayer[source.list][source.slot];
            if (tarZone.length) return; //there's already something in the zone
            sourcePlayer[source.list].splice(source.slot, 1);
            tarZone.push({
                id: cardCache,
                pos: 0
            });
            revealId = true;
        } else {
            //these are cases where the source === target players
            var cardCache = sourcePlayer[source.list][source.slot];
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
            revealId = true;
            if (target.pos === 2 || target.pos === 3) revealId = false;
        }
    }

    if (flippedWhos) {
        //revert changes made because of relativism
        source.who = sourcePlayer.who();
        target.who = targetPlayer.who();
        flippedWhos = true;
    }

    //animation
    if (source.list === "grave" || source.list === "banished" || source.list === "extra" || source.list === "deck") this.updateListCounts();
    var start = $($("#" + sourcePlayer.who() + source.list + " img")[source.slot]);
    if (source.list === "field") start = $($("#" + sourcePlayer.who() + source.zone + " img")[source.slot]);
    var moveTo = $("#" + targetPlayer.who() + target.list);
    if (target.list === "field") moveTo = $("#" + targetPlayer.who() + target.zone);
    if (target.list === "hand" && self[target.who].hand.length) moveTo = $("#" + targetPlayer.who() + "hand img").last(); //move to last img in hand

    var img = cardImg(cardId);
    img.copy(start, true).toBody();
    start.hide();
    if (source.who === "opp") $(img).addClass("v");
    img.moveTo(moveTo, 500, function() {
        $(img).remove();
        start.remove();
        self.update(target);
        if (callback) callback();
    });
};
