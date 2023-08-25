'use strict';

window.Effects = window.Effects || {};

(new function AngelWings() {
	let _element		= null;
	let _canvas			= null;
	let _context		= null;
	let _style			= null;
	let _metrics		= null;
	let _image_left		= null;
	let _image_right	= null;
	let _image_start	= 0;
	let _image_end		= 0;
	
	this.init = function init(element) {
		_element		= element;
		_canvas			= document.createElement('canvas');
		_context		= _canvas.getContext('2d');
		
		element.appendChild(_canvas);
		this.changeStyle();
		this.loadImages();
		this.repaint();
	};
	
	this.changeStyle = function changeStyle() {
		_style						= getComputedStyle(_element);
		_metrics					= _context.measureText(_element.innerText);
		
		// Calculate Size
		var span = document.body.appendChild(document.createElement('span'));
		span.innerHTML = _element.innerText;
		span.style.position = "absolute";
		span.style.visibility = "hidden";
		let rect = span.getBoundingClientRect();
		
		// Style Canvas
		_canvas.style.position		= 'absolute';
		_canvas.style.left			= '0px';
		_canvas.style.top			= '0px';
		_canvas.height				= rect.height + _metrics.actualBoundingBoxAscent + _metrics.actualBoundingBoxDescent;
		_canvas.width				= rect.width + (_metrics.actualBoundingBoxLeft * 2);
		_element.style.textShadow	= '-1px 0 #FFFFFF, 0 1px #FFFFFF, 1px 0 #FFFFFF, 0 -1px #FFFFFF';
		
		// Hide real text
		_element.style.position		= 'relative';
		_element.style.textIndent	= '-99999px';
	};
	
	this.loadImages = function loadImages() {
		var image1 = new Image();
		image1.src = 'https://chat.knuddels.de/pics/features/angelwings/angelwing_left.png';
        image1.onload = function onLoad() {
            _image_left = image1;
        };
		
		var image2 = new Image();
		image2.src = 'https://chat.knuddels.de/pics/features/angelwings/angelwing_right.png';
        image2.onload = function onLoad() {
            _image_right = image2;
			_image_end = _image_right.width;
			_canvas.width = _canvas.width + (_image_end * 2);
        };
	};
	
	this.repaint = function repaint() {
		_context.clearRect(0, 0, _canvas.width, _canvas.height);
		
		_context.shadowColor	= "#FFFFFF";
		_context.shadowBlur		= 3;
		_context.strokeText(_element.innerText, _image_start, 20);
		
		
		_context.font			= _style.font;
		_context.fillStyle		= _style.color;
		_context.fillText(_element.innerText, _image_start, 20);
		
		if(_image_left !== null) {
			_image_start = _image_left.width;
			_context.drawImage(_image_left, 0, _image_left.height / 4);
		}
		
		if(_image_right !== null) {
			_context.drawImage(_image_right, _canvas.width - _image_end, _image_right.height / 4);
		}
		
		requestAnimationFrame(this.repaint.bind(this));
	};
	
	window.Effects.AngelWings = this;
}());
