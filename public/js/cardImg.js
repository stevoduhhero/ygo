function cardImg(card, dontAnimate) {
	var img = new Image();
	var src = './img/default.jpg';
	if (card === -1) src = './img/back.png';
	img.src = src;
	img.draggable = false;
	if (dontAnimate) {} else {
		img.style.position = 'absolute';
		img.style.top = '0px';
		img.style.left = '0px';
		img.style.display = 'none';
		img.copy = function(el, justHeight) {
			var el = jQuery(el);
			jQuery(this).height(el.height()).css({
				left: el.offset().left + 'px',
				top: el.offset().top + 'px'
			});
			if (!justHeight) jQuery(this).width(el.width());
			return this;
		};
		img.toBody = function() {
			jQuery(this).appendTo('body');
			return this;
		};
		img.moveTo = function(e, time, funk) {
			var div = jQuery(this);
			var start = {
				left: Number(div[0].style.left.replace('px', '')),
				top: Number(div[0].style.top.replace('px', ''))
			};
			var end = {
				left: 0,
				top: 0
			};
			//if s or e are html elements instead of coordinates, center the div's position inside the start and end
			if (e.left) end = e; else {
				end = $(e).offset();
				end.left += ($(e).width() - $(div).width()) / 2;
				end.top += ($(e).height() - $(div).height()) / 2;
			}
			
			//animate it
			div.css({
				position: "absolute",
				display: "block",
				left: start.left + "px",
				top: start.top + "px",
				"z-index": 99999,
			}).animate({
				left: end.left + "px",
				top: end.top + "px"					
			}, time, funk);
		};
	}
	return img;
}
