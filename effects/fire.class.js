'use strict';

let Effects = {} || Effects;

(new function Fire() {
	let _width			= -1;
	let _height			= -1;
	let _line_height	= -1;
	let _highQuality	= false;
	let _scale			= -1;
	let _width_new		= -1;
	let _height_new		= -1;
	let _canvas			= null;
	let _element		= null;
	let _context		= null;
	let _image			= null;
	let _milliseconds	= -1;
	let _fireIntensity	= 1;
	let _lastMoveTime	= 0;
	let _firePixels		= [];
	let _shift			= -1;
	let _i				= [4, 12, 20, 30];
	let _colorsWarm		= [];
	let _colorsCold		= [];
	let _lightness		= [];
	let _morphTargets	= [];

	this.init = function init(element) {
		_width			= 200;
		_height			= 100;
		_line_height	= 2;
		_highQuality	= true;
		_scale			= 100;
		_element		= element;
		_width_new		= Math.ceil(_width / _line_height);
		_height_new		= Math.ceil((_height * _scale) / (_line_height * 100));
		_canvas			= document.createElement('canvas');
		_canvas.width	= _width_new;
		_canvas.height	= _height_new;
		_context		= _canvas.getContext('2d');
		_image			= _context.createImageData(_width, _height);
		_milliseconds	= Date.now();
		_firePixels		= new Array(100).fill(0);
		_lightness		= new Array(_height_new * _width_new).fill(0);
		_morphTargets	= new Array(_height * _width).fill(0);
		_fireIntensity	= _highQuality ? 2 : 1;
		
		this.changeStyle();
		this.initializeColors();
		this.repaint();
	};
	
	this.changeStyle = function changeStyle() {
		_element.style.textShadow = '-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black';
	};
	
	this.repaint = function repaint() {
		this.move();
		_context.clearRect(0, 0, _canvas.width, _canvas.height);
		this.paint(0, 0, _canvas.width);
		requestAnimationFrame(this.repaint.bind(this));
		_element.style.backgroundImage = 'url(' + _canvas.toDataURL("image/png") + ')';
	};
	
	this.fillWithColor = function fillWithColor(pixels, min, max, redStart, redEnd, greenStart, greenEnd, blueStart, blueEnd, alphaStart, alphaEnd) {
		const segmentLength = max - min;
		
		for(let index = 0; index < segmentLength; index++) {
			pixels[min + index] = this.createColor((redStart * (segmentLength - index) + blueStart * index) / segmentLength, (redEnd * (segmentLength - index) + blueEnd * index) / segmentLength, (greenStart * (segmentLength - index) + alphaStart * index) / segmentLength, (greenEnd * (segmentLength - index) + alphaEnd * index) / segmentLength);
		}
	}

	this.createColor = function createColor(red, green, blue, alpha) {
		red		= Math.max(0, Math.min(255, red));
		green	= Math.max(0, Math.min(255, green));
		blue	= Math.max(0, Math.min(255, blue));
		
		return (alpha << 24) | (green << 16) | (green << 8) | blue;
	}
	
	this.initializeColors = function initializeColors() {
		const alpha_available = true; // because browsers has it!

		this.fillWithColor(_colorsCold, 0, 5, 0, 0, 0, alpha_available ? 0 : 255, 0, 0, 0, alpha_available ? 212 : 255);
		this.fillWithColor(_colorsWarm, 0, 32, 0, 0, 0, 255, 0, 0, 255, 255);
		this.fillWithColor(_colorsWarm, 32, 96, 0, 0, 255, 255, 255, 0, 0, 255);
		this.fillWithColor(_colorsWarm, 96, 160, 255, 0, 0, 255, 255, 255, 0, 255);
		this.fillWithColor(_colorsWarm, 160, 256, 255, 255, 0, 255, 255, 255, 255, 255);
		this.fillWithColor(_colorsWarm, 256, 1225, 255, 255, 255, 255, 255, 255, 255, 255);
	};

	this.spreadToBottom = function spreadToBottom(pixels, start, end, value) {
		for(let i = start; i < end; i++) {
			pixels[i] = value;
		}

		return pixels;
	};

	this.addRandomSparks = function addRandomSparks() {
		_shift += _width;

		while(_shift > 160) {
			_shift		-= 160;
			const x		= Math.floor(Math.random() * _width);
			const y		= Math.floor(Math.random() * 24);
			
			this.ignite(x - 7, _height - 4 - y);
		}
	};

	this.ignite = function ignite(x, y) {
		for(let i = 0; i < 7; i++) {
			for(let j = 0; j < 4; j++) {
				_morphTargets[(y + j) * _width + i + x] = 1224;
			}
		}
	};

	this.coolFire = function coolFire() {
		const endIndex = _morphTargets.length - _width - 1;

		for(let i = 0; i < endIndex; i++) {
			let newVal			= (_morphTargets[i] + _morphTargets[i + _width] + _morphTargets[i + _height - 1] + _morphTargets[i + _width + 1] + 2) >> 2;
			newVal				-= 3;
			_morphTargets[i]	= Math.max(0, newVal);
		}
	};

	this.moves = function moves(distance) {
		const timeCurrent = Date.now();
		
		if(timeCurrent < _lastMoveTime) {
			_lastMoveTime = timeCurrent;
		}
		
		if(timeCurrent - _lastMoveTime > 14) {
			let elapsedMillis	= ((timeCurrent * distance) / 1000 - (_lastMoveTime * distance) / 1000) | 0;
			_lastMoveTime		= timeCurrent;
			
			if(elapsedMillis > 20) {
				elapsedMillis = 20;
			}
			
			while(elapsedMillis > 0) {
				this.move();
				elapsedMillis--;
			}
		}
	};

	this.move = function move() {
		_morphTargets = this.spreadToBottom(_morphTargets, _width * (_height - 1), _width * _height, 280);
		
		this.addRandomSparks();
		this.coolFire();
	};

	this.updateDisplayPixels = function updateDisplayPixels() {
		let index				= 0;
		const canvasRowLength	= _width * _line_height;

		for(let y = 0; y < _height_new; y++) {
			const baseIndex = y * canvasRowLength;

			for(let x = 0; x < _width_new; x++) {
				let color;
				const pixelIndex	= baseIndex + x * _line_height;
				const intensity		= _morphTargets[pixelIndex];

				if(intensity > 0) {
					color = _colorsWarm[intensity];
				} else {
					let maxShift = 0;

					for(let targetIndex = 1; targetIndex <= 5; targetIndex++) {
						const shiftedIndex = pixelIndex + canvasRowLength * targetIndex;

						if(shiftedIndex < _morphTargets.length) {
							const morphTarget	= _morphTargets[shiftedIndex];
							let shiftAmount		= 0;

							for(let j = _i.length - 1; j >= 0; j--) {
								if(morphTarget >= _i[j]) {
									shiftAmount = j + 1;
									break;
								}
							}

							const j = shiftAmount - targetIndex + 1;

							if(j > maxShift) {
								maxShift = j;
							}
						}
					}

					const targetIndex	= (index + maxShift + 1) >> 2;
					index				= maxShift;
					color				= _colorsCold[targetIndex];
				}
				
				_lightness[y * _width_new + x] = color;
			}
		}

		const imageData = _image.data;
		
		for(let i = 0; i < _lightness.length; i++) {
			const color		= _lightness[i];
			const offset	= i * 4;
			
			imageData[offset]		= (color >> 16) & 0xFF;	// R
			imageData[offset + 1]	= (color >> 8) & 0xFF;	// G
			imageData[offset + 2]	= (color & 0xFF);		// B
			imageData[offset + 3]	= (color >> 24) & 0xFF;	// A
		}

		_context.putImageData(_image, 0, 0);
	};

	this.paint = function paint(x, y, frames) {
		this.updateDisplayPixels();
		
		let offset = 0;
		while(offset < frames) {
			_context.drawImage(_canvas, x + offset, y);
			offset += _width_new;
		}
	};

	Effects.Fire = this;
}());
