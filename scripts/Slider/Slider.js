/* global DEBUGGER, RSVP */

/* ==========================================================================
   Slider
   ========================================================================== */

define('Slider',['Hooks'], function (Hooks) {
	'use strict';


	/**
	 * vars calc by slider
	 * @type {Object}
	 */
	var defalutVars = {

		isAnimation : false,
        curPage : 1, // currentPage
        pages : 0, // count pages
        childrenNodes : null,
        slideeWidth : 0,
        id : 0, // set unique id of slider (use for hooks to multiple instances)
        hookPrefixer : ''
	};

	/**
	 * Default options
	 * @type {Object}
	 */
	var options = { 

			//dom elements
			DOM : {
                slider : null,
                prev : null,
                next : null
            },

            Events : {

                before : {
                    ev : function(currentSlide, nextSlide, sliderNr){},
                    autoExec : false
                },
                after : {
                    ev : function(currentSlide, nextSlide, sliderNr){},
                    autoExec : false
                }

            },

            UI : {
		
				 hidePrevBut: function(button){

				 	button.classList.remove('show');

				 },
		         showPrevBut : function(button){
		         	
		         	button.classList.add('show');

		         },

		         hideNextBut: function(button){
		         	
		         	button.classList.remove('show');

		         },
		         showNextBut : function(button){

		         	button.classList.add('show');

		         }

			},

            vertical : false,
            animationTime : 500,

    };   

	/**
	 * Animate slider container
	 * @return {Promise} 
	 */
	var scroll = function(){

		var self = this;

		return new RSVP.Promise(function(ok){

			 var offset = (self.vars.slideeWidth * (self.vars.curPage -1) ) + '%',  // first page dont need to translate
				 translate = 'translate3d(-' + offset + ',0,0)';

		     self.options.DOM.slider.style.webkitTransform = translate;
			 self.options.DOM.slider.style.MozTransform = translate;
		     self.options.DOM.slider.style.msTransform = translate;
		     self.options.DOM.slider.style.OTransform = translate;
		     self.options.DOM.slider.style.transform = translate;

			 setTimeout(function(){

			 	ok();

			 },self.options.animationTime);

		});

	};


	/**
	 * Call after scroll
	 * @return {[type]} [description]
	 */
	var afterScroll = function(){

		this.vars.isAnimation = false;

		callAfterEvent.call(this);

		// is last page
    	if(this.vars.curPage == this.vars.pages) {

    		Hooks.doAction(this.vars.id+'.showPrevBut', this.options.DOM.prev); // if have onlu to slides
    		Hooks.doAction(this.vars.id+'.hideNextBut', this.options.DOM.next);
    		return;
    	} 

    	if(this.vars.curPage == 1) {

    		Hooks.doAction(this.vars.id+'.hidePrevBut', this.options.DOM.prev);
    		Hooks.doAction(this.vars.id+'.showNextBut', this.options.DOM.next);
  	        return;
    	} 

    	if(this.vars.curPage == (this.vars.pages - 1) ) {

    		Hooks.doAction(this.vars.id+'.showNextBut', this.options.DOM.next);
  	        return;
    	} 

    	if(this.vars.curPage == 2) {

    		Hooks.doAction(this.vars.id+'.showPrevBut', this.options.DOM.prev);
  	        return;
    	} 

	};

	/**
	 * Prepare vars for scroll
	 * @param  {boolean} next if true scrollNext, if false scrollPrev
	 * @return {void}  
	 */
	var prepareScroll = function(next) {


		// check if is last page when nextScroll
		if((next && this.vars.curPage === this.vars.pages) || this.vars.isAnimation) {
			return false; 
		}

		// check if is frist page when prevScroll
		if((!next && this.vars.curPage === 1) || this.vars.isAnimation) {
			return false; 
		}

		callBeforeEvent.call(this);

		var sign = (next) ? '++' : '--'; 

		eval('this.vars.curPage'+sign);

		DEBUGGER.run('info', 'Slide to ' + this.vars.curPage + ' / ' +  this.vars.pages, 'Slider');
        
		return scroll.call(this).then(afterScroll.bind(this));

	};

	/**
	 * Scroll Prev
	 * @return {[type]} [description]
	 */
	var scrollPrev = function(){

		return prepareScroll.call(this, false);
		
	};


	var scrollNext = function(){

		return prepareScroll.call(this, true);
		
	};

	/* Events
	   ========================================================================== */
	
	var callBeforeEvent = function(){

		var self = this;

		Hooks.doAction(
			self.vars.id+'.before', 
			self.vars.childrenNodes[self.vars.curPage - 1],
			self.vars.childrenNodes[self.vars.curPage],
			self.vars.curPage
		);

	};

	var callAfterEvent = function(){

		var self = this;

		Hooks.doAction(
			self.vars.id+'.after', 
			self.vars.childrenNodes[self.vars.curPage - 1 ],
			self.vars.childrenNodes[self.vars.curPage],
			self.vars.curPage
		);

	};

	/**
	 * Add events
	 */
	var addEvents = function(){

		var self = this;

		// next button
	   this.options.DOM.next.addEventListener('click', function(e){
	   		e.preventDefault();
	   		scrollNext.call(self);
	   });

	   // prev button
	   // 
       this.options.DOM.prev.addEventListener('click', function(e){
	   		e.preventDefault();
	   		scrollPrev.call(self);
	   });

	};


	/* Hooks
	   ========================================================================== */

	/**
	 * Add hooks for slider
	 */
	var addHooks = function(){

		// Buttons Events
		
		Hooks.addAction(this.vars.id+'.hideNextBut', this.options.UI.hideNextBut);
		Hooks.addAction(this.vars.id+'.showNextBut', this.options.UI.showNextBut);

		Hooks.addAction(this.vars.id+'.hidePrevBut', this.options.UI.hidePrevBut);
		Hooks.addAction(this.vars.id+'.showPrevBut', this.options.UI.showPrevBut);
		

		// Before, after events
		
		Hooks.addAction(this.vars.id+'.before', this.options.Events.before.ev);
		Hooks.addAction(this.vars.id+'.after', this.options.Events.after.ev);

	};

	/**
	 * Set proper width for slider container
	 */
	var setSliderContainerWidth = function(){
		
		this.options.DOM.slider.style.width = ( this.vars.pages * 100 ) + '%'; 

	};

	/**
	 * Set proper width for slidee
	 */
	var setSlideeWidth = function(){

		[].forEach.call(this.vars.childrenNodes, function(slidee){
		
			slidee.style.width = this.vars.slideeWidth + '%';
		
		}.bind(this));

	};

	/**
	* Validate and if valid add to plugin settinfs
	* @param {[type]} config [description]
	*/
	var setConfig = function(config){
		
		var isOk = false;

		/* DOM objects
		   ========================================================================== */
		
		if(DEBUGGER.run('sliderCheckSelectors', {
			config : config
		},'Slider')) {

			this.options.DOM = {

				slider : document.querySelector(config.Selectors.slider),
                prev : document.querySelector(config.Selectors.prev),
                next : document.querySelector(config.Selectors.next)

			};

		} else {

			isOk = false;
		
		}

		/* Events
		   ========================================================================== */
		
		if (typeof config.Events !== 'undefined' ) {
			
			if(DEBUGGER.run('sliderCheckEvents', {
				config : config
			},'Slider')) {

				this.options.Events = config.Events; 

			} else {

				isOk = false;

			}	

		}

		/* AnimationTime
		   ========================================================================== */
		
		if(typeof config.animationTime !== 'undefined') {

			this.options.animationTime = parseInt(config.animationTime);

		}


		return isOk;

	};

	/**
	 * Init slider
	 * @param  {objects} config
	 * @return {[type]}        [description]
	 */
	var init = function(config){
		
		if (!setConfig.call(this, config)) {return;}

		// init vars
		this.vars.childrenNodes = this.options.DOM.slider.children;
		this.vars.pages = this.options.DOM.slider.children.length;
		this.vars.id = 'Slider-' + Math.random().toString(36).substr(2, 3);
		this.vars.slideeWidth = Math.ceil( 100 / this.vars.pages);

		// set width
		setSliderContainerWidth.call(this);
		setSlideeWidth.call(this);

		addEvents.call(this);
		addHooks.call(this);

		//show next button
		if(this.vars.pages > 0) {
			Hooks.doAction(this.vars.id+'.showNextBut', this.options.DOM.next);
		}

		//auto exec before function
		
		if(this.options.Events.before.autoExec) {

			callBeforeEvent.call(this);

		}	

		if(this.options.Events.after.autoExec) {

			callAfterEvent.call(this);

		}	

		
	};

	/* ==========================================================================
	   Public methods
	   ========================================================================== */
	

	var slider = function(config){this.init(config);};

	slider.prototype = {
		
		vars : defalutVars,
		options : options,
		init : init,
		scrollNext : scrollNext.bind(this),
		scrollPrev : scrollPrev.bind(this),
		
	};

	return slider;

});