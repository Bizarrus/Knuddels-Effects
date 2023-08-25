'use strict';

window.Effects = window.Effects || {};

(new function VUP() {
	let _element		= null;

	this.init = function init(element) {
		_element		= element;
		
		this.changeStyle();
	};
	
	this.changeStyle = function changeStyle() {
		_element.style.color = '#b8b8b8';
		_element.style.textShadow = '-1px 0 #c8c8c8, 0 1px #c8c8c8, 1px 0 #c8c8c8, 0 -1px #c8c8c8';
	};
	
	window.Effects.VUP = this;
}());
