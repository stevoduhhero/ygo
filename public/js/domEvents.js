$("#findDuel").click(function() {
  app.socket.emit('search');
});
(function gameDragDropEvents() {
	var draggables = [
		"#youhand img",
		"#youSide .fieldZone img",
		"#you10 img",
		"#you11 img",
		"#you12 img"
	];
	var droppables = [
		"#youSide .o",
		"#oppSide .fieldZone",
		"#youbanished",
		"#youhand"
	];
	$("body").on("mousedown touchstart", draggables.join(','), function(touch) {
		$("body").addClass("unselectable");
		var drag = {};
		drag.source = this;
		drag.ghost = $(drag.source).clone().css({
			position: 'absolute',
			left: ($(drag.source).offset().left) + 'px',
			top: ($(drag.source).offset().top) + 'px',
			"z-index": 9999
		}).width($(drag.source).width()).height($(drag.source).height()).appendTo('body');
		$(drag.source).hide();
		app.dragging = drag;
		touch.preventDefault();
		return false;
	});
	$(document).on("mousemove touchmove", function(touch) {
		if (touch.originalEvent.touches) touch = touch.originalEvent.touches[0];
		if (!app.dragging) return;
		//unset drop target
		delete app.dragging.target;
		$(".dropTarget").removeClass("dropTarget");

		//see if we have our mouse over any droppables
		var len = droppables.length;
		for (var i = 0; i < len; i++) {
			var els = $(droppables[i]);
			var elCount = els.length;
			for (var x = 0; x < elCount; x++) {
				if (!isNaN(x)) {
					var el = $(els[x]);
					var offset = el.offset();
					var borders = {
						min: {
							x: offset.left,
							y: offset.top
						},
						max: {
							x: offset.left + el.width(),
							y: offset.top + el.height()
						}
					};
					if ((borders.min.x <= touch.pageX && borders.max.x >= touch.pageX) && (borders.min.y <= touch.pageY && borders.max.y >= touch.pageY)) {
						//mousing over this element
						//set drop target
						app.dragging.target = el;
						$(el).addClass("dropTarget");
					}
				}
			}
		}
		
		app.dragging.ghost.css({
			left: (touch.pageX - (app.dragging.ghost.width() / 2)) + 'px',
			top: (touch.pageY - (app.dragging.ghost.height() / 2)) + 'px'
		});
	});
	$(document).on("mouseup touchend", function() {
		//drop
		$("body").removeClass("unselectable");
		function drop(drag) {
			if (drag) {
				$(drag.source).show();
				drag.ghost.remove();
			}
			if (!drag || !drag.target) return;
			$(drag.target).removeClass("dropTarget");
			app.game.drop(drag);
		}
		drop(app.dragging);
		delete app.dragging;
	});
})();