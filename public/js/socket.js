function Socket() {
	var socket = io();
	socket.on('connect', function() {
		console.log('I AM CONNECTED!');
	});
	socket.on('e', function(data) {
		//the data should be one biggg string like this
		//event|data1|data2|data3\nevent2|data1|data2
		
		//if the data has a | in it... it might fuck it up lol
		//if it's only the last bit of data that you'll receive that may have | in it then just join all of the parts after it
		console.log(data);
		var events = this.REFERENCE.events;
		if (typeof data == "string") {
			var eventos = data.split('\n');
			for (var eventKey in eventos) {
				var rows = eventos[eventKey].split('|');
				if (events[rows[0]]) {
					events[rows[0]](rows);
				} else events["c"](("c||" + rows.join('|')).split("|"));
			}
		} else {
			if (events[data.event]) events[data.event](data);
		}
	});
	this.emit = function(event, data) {
		var obj = new Object();
		if (typeof data == "object") obj = data; else obj.data = data;
		obj.event = event;
		console.log(JSON.stringify(obj));
		socket.emit('e', obj);
	};
	this.socket = socket;
	this.socket.REFERENCE = this;
	return this;
}
Socket.prototype.events = {
	search: function(data) {
		if (Number(data[1])) {
			//finding
			$("#findDuel").html("Cancel Find Duel");
		} else {
			//canceling
			$("#findDuel").html("Find Duel");
		}
	},
	start: function(data) {
		$("#homeScreen").hide();
		$("#game").show();
	},
};
