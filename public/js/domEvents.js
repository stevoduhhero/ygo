$("#findDuel").click(function() {
  app.socket.emit('search');
});
(function gameDragDropEvents() {
	var draggables = [
		"#youhand img",
		
	];
	var droppables = [
		".o",
		
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
		if (!app.dragging) return;
		//unset drop target
		delete app.dragging.target;
		$(".dropTarget").removeClass("dropTarget");

		//see if we have our mouse over any droppables
		for (var i in droppables) {
			var els = $(droppables[i]);
			for (var x in els) {
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
			$(drag.source).clone().appendTo(drag.target);
			$(drag.target).removeClass("dropTarget");
			drag.source.remove();
		}
		drop(app.dragging);
		delete app.dragging;
	});
})();