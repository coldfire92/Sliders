/* global DEBUGGER, RSVP*/	

/* ==========================================================================
   One Page Scroll Module
   ========================================================================== */

/**
 * RSVP in global (added in preloader files)
 */
define('OnePageScroll',['DynamicObject', 'DisableScroll'], function(DynamicObject, DisableScroll){
	
	'use strict';

	var scroller = function(){};

	scroller.prototype = (function(){

			
		/* Integrate in dom
		   ========================================================================== */
		
		/**
		 * Set offset for main wrapper
		 * @param  {int} offset   
		 * @param  {int} timeScroll 
		 * 	
  	    */
		var getStyles = function(offset, timeScroll){

			var styles = {
				  '-webkit-transform': 'translate(0, -' + offset + ')',
	              '-webkit-transition': 'all ' + timeScroll + 'ms ' + this.config.easing,
	              '-moz-transform': 'translate(0, -' + offset + ')',
	              '-moz-transition': 'all ' + timeScroll + 'ms ' + this.config.easing,
	              '-ms-transform': 'translate(0, -' + offset + ')',
	              '-ms-transition': 'all ' + timeScroll + 'ms ' + this.config.easing,
	              'transform': 'translate(0, -' + offset + ')',
	              'transition': 'all ' + timeScroll + 'ms ' + this.config.easing
	        };

		 	var out = '';

		 	for(var style in styles){
		 	
		 		out+= style + ' : '+ styles[style] + ';';

		 	}
		 	
		 	return out;

		}; 


		var scrollPage = function(offset, time){

			var timeScroll = time || this.config.scrollTime;

			this.config.mainWrapper.setAttribute('style', getStyles.call(this, offset, timeScroll));

			return new RSVP.Promise(function(ok){

				setTimeout(function(){

					ok();
				
					this.config.isAnimationOnScroll = false;
				
				}.bind(this), timeScroll + this.config.waitAfterScroll);

				// if moved by keys, or scrollTo functions

				setTimeout(function(){

					this.config.isAnimation = false;

				}.bind(this), timeScroll);


			}.bind(this));

		};

		/* Callbacks
		   ========================================================================== */
		
		/**
		 * Get events for current scoll
		 * @param  {string} nextSectionName 
		 * @param  {bool} scrollTo   is scroll trger from scrollTo method
		 * @param  {string} action   {before, after} - only for debugger
		 * @return {object}     
		 */
		var getCallbacksForSection = function(nextSectionName, scrollTo, action){

			var element,
			    beforeElement;

			element = this.config.currentSectionName+'_to_'+nextSectionName;
		
			if(typeof this.config.sectionsEvents[element] !== 'undefined'){

					DEBUGGER.run('info', 'Call ' + element + ':' + action,'onePageScroll');

					return this.config.sectionsEvents[element];
					
			}
				
			// not defined, return empty
			return {
	
				before: function(){},
				after: function(){}

			};	

		};


		/* Scroll sections
		   ========================================================================== */
		
		/**
		 * Scroll
		 * @param  {string} nextSectionName section to scroll
		 * @param  {string} direction  {up|down}
		 * @return {object} Promise object 
		 */
		var scroll = function(nextSectionName, direction){

			if(nextSectionName === false || !this.config.enable) {return;} // first or last section or dont active

			var scrollTo;

			var time = this.config.scrollTime;
			var currrentIndex = this.config.sections.get(this.config.currentSectionName);
			var nextItemIndex = this.config.sections.get(nextSectionName);

			if(typeof direction === 'undefined') {

				// call by scrollTo 
				scrollTo = true;

				var howMuch = Math.abs(nextItemIndex - currrentIndex);

				time = howMuch * (this.config.scrollTime);

				if(howMuch > 1) {
					time /= 2;
				}

				DEBUGGER.run('info', 'Scroll to ' + nextSectionName + ' section in ' + time + ' ms ' , 'OnePageScroll');
				
			}

			this.config.isAnimation = true;
			this.config.isAnimationOnScroll = true;

			/* Call events
			   ========================================================================== */
			
			// call before event
			getCallbacksForSection.call(this, nextSectionName, scrollTo, 'before').before();

			// cal after method after scroll

			setTimeout(function(){

				getCallbacksForSection.call(this, nextSectionName, scrollTo,'after').after();

			}.bind(this), time);

			/* Scroll
			   ========================================================================== */
			
			return scrollPage.call(this, (nextItemIndex - 1) * 100 + '%', time).then(function(){

				this.config.currentSectionName = nextSectionName;

			}.bind(this));

		};


		/* Events
		   ========================================================================== */

		/**
		 * scroll to section
		 * @param  {string} sectionName 
		 * @return {object} Promise object
		 * 		
	    */
		var scrolTo = function(sectionName){
			
			if(this.config.isAnimation) {return;}

			return scroll.call(this, sectionName);

		};


		/**
		 * Move down section
		 */
		var moveDown = function(){

			if(this.config.isAnimation ||  this.config.currentSectionName === this.config.lastSectionName) {return;}

			DEBUGGER.run('info', 'moveDown', 'onePageScroll');
			
			var nextSectionName = this.config.sections.getKeyAfter(this.config.currentSectionName);
			
			scroll.call(this, nextSectionName, 'down');

		};

		/**
		 * Move up section
		 */
		var moveUp = function(){

			if(this.config.isAnimation || this.config.currentSectionName === this.config.firstSectionName) {return;}

			DEBUGGER.run('info', 'moveUp', 'onePageScroll');

			var nextSectionName = this.config.sections.getKeyBefore(this.config.currentSectionName);
			
			scroll.call(this, nextSectionName, 'up');

		};

		/**
		 * Call on scroll
		 * @param  {object} event    scroll event object
		 * @param  {int} direction int
		 */
		var onScroll = function(event){

			event.preventDefault();

			var delta = event.wheelDelta || -event.detail;
			
			if(this.config.isAnimationOnScroll) {
				return;
		    }

			if(delta < 0){

				moveDown.call(this);

			} else {

				moveUp.call(this);
			}
			
		};

		/**
		 * Add events
		 */
		var addEvents = function(){

		    window.addEventListener('mousewheel', onScroll.bind(this), false);
	        window.addEventListener('DOMMouseScroll', onScroll.bind(this), false);
	        window.addEventListener('MozMousePixelScroll', onScroll.bind(this), false);	

			document.addEventListener('keydown', function(e) {

	      	  var tag = e.target.tagName.toLowerCase();

	          switch(e.which) {
	            case 38:
	              if (tag !== 'input' && tag !== 'textarea') {moveUp.call(this);}
	           	  break;

	            case 40:
	              if (tag !== 'input' && tag !== 'textarea') {moveDown.call(this);}
	              break;

	            case 32: //spacebar
	              if (tag !== 'input' && tag !== 'textarea') {moveDown.call(this);}
	              break;

	            case 33: //pageg up
	              if (tag !== 'input' && tag !== 'textarea') {moveUp.call(this);}
	              break;

	            case 34: //page dwn
	              if (tag !== 'input' && tag !=='textarea') {moveDown.call(this);}
	              break;

	            case 36: //home
	              scrollTo.call(this, this.config.firstSectionName);
	              break;

	            case 35: //end

	              scrollTo.call(this, this.config.lastSectionName);
	              break;

	            default: return;
	          }

	        }.bind(this));

		};


		var addSectionEvents = function(events, sections){

			if(DEBUGGER.run('OnePageScrollchechEventsObject', {

				events : events,
				sections : sections

			}, 'OnePageScroll')){

				this.config.sectionsEvents = events;

			}

		};

		/**
		 * Add sections to dynamic objects and set first and last section
		 * @return {[type]} [description]
		 */
		var initObjects = function(){

			this.config.sections = new DynamicObject();

			var first = false;

			[].forEach.call(this.config.mainSections , function(element, index){
				
				var name = element.getAttribute('data-name');

				if(!first){
				     this.config.firstSectionName = name;
					 this.config.currentSectionName = name;
					 first = true;

				}

				if(this.config.mainSections.length === (index + 1)){

					 this.config.lastSectionName = name;

				}

				this.config.sections.add(name, ++index);
				
			}.bind(this));

		};
		
		/* ==========================================================================
		   Public methods
		   ========================================================================== */

		return {

			config : {

				mainWrapper : null,
				mainSections : null,
				enable : true,
			    firstSectionName : '',
			    lastSectionName : '',
			    currentSectionName : '', // name of current section
			    scrollTime : 1000,
			    isAnimation : false,
				isAnimationOnScroll : false,
			    easing : 'ease-out',
			    waitAfterScroll : 1000,
			    sectionsEvents : {}, // config files for sections callbacks
			    sections : null // dynamicObjectsInstance

			},

			init : function(config){


				if(DEBUGGER.run('OnePageScrollCheckConfig', {
					config : config
				}, 'onePageScroll')){

					this.config.mainWrapper = document.querySelector(config.mainSelector);
				    this.config.mainSections = this.config.mainWrapper.children; 

				    // change scrollTime
				    if( config.scrollTime ) this.config.scrollTime = parseInt(config.scrollTime);

				    //change Easing
				    if (config.easing) this.config.easing = config.easing; 

				    //change timeWait after scroll

				    if (config.waitAfterScroll) this.config.easing = parseInt(config.waitAfterScroll); 

				    //add section events
				    
				    if (config.sectionsEvents) addSectionEvents.call(this, config.sectionsEvents, this.config.mainSections);
		
				    DisableScroll.disable(); 
			        initObjects.call(this);
			        addEvents.call(this);

				}

			},

			scrollTo : function(section){

				var sections = this.config.mainSections; 

				if(DEBUGGER.run('isGoodSectionOnePageScroll', {
					sections : sections,
					section : section,
					isScrollTo : true
				},'OnePageScroll')){

					return scrolTo.call(this, section);

				}

			},
			scrollDown : function(){

				 moveDown.call(this);

			},
			scrollUp: function(){

				moveUp.call(this);

			},
			enable: function(){

				this.config.enable = true;

			},
			disable: function(){

				this.config.enable = false;

			}

		};
	
	})();
	
	return scroller;

});
