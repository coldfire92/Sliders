/* global DEBUGGER, RSVP */

/* ==========================================================================
   Slider
   ========================================================================== */

define('Slider',['Hooks'], function (Hooks) {
	'use strict';

    /* ==========================================================================
       ANIMATIONS
       ========================================================================== */
    
	/**
	 * Animate slider container
	 * @return {Promise} 
	 */
	var scrollAnimate = function(){

		var offset = (this.vars.slideeWidth * (this.vars.curPage -1) ) + '%',  // first page dont need to translate
			translate = 'translate3d(-' + offset + ',0,0)';
		 
	    this.options.DOM.slider.style.webkitTransform = translate;
		this.options.DOM.slider.style.MozTransform = translate;
	    this.options.DOM.slider.style.msTransform = translate;
	    this.options.DOM.slider.style.OTransform = translate;
	    this.options.DOM.slider.style.transform = translate;

		return new RSVP.Promise(function(ok){

			 setTimeout(function(){

			 	ok();

			 }, this.options.animationTime);

		}.bind(this));

	}; 

	var removeClassForNodes = function(nodes){
		[].forEach.call(nodes, function(node){
			node.classList.remove('show');
		});
	};

	var fadeAnimate = function(nextAnimation){

		var prevElementPrevAnim = this.vars.childrenNodes[this.vars.curPage + 1 - 1],
			prevElementNextAnim = this.vars.childrenNodes[this.vars.curPage - 1 - 1];
		
		removeClassForNodes(this.vars.childrenNodes);
		this.vars.childrenNodes[this.vars.curPage -1].classList.add('show');

		return new RSVP.Promise(function(ok){
			 setTimeout(function(){
			 	ok();
			 }, this.options.animationTime);
		}.bind(this));

	};

	var callAnimation = function(nextAnimation){
		this.vars.isAnimation = true;
		if(this.options.fadeEffect) {
			return fadeAnimate.call(this, nextAnimation);
		} else {
			return scrollAnimate.call(this, nextAnimation);
		}
	};


	/**
	 * Call after scroll
	 * @return {[type]} [description]
	 */
	var afterAnimation = function(){

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
	var prepareAnimation = function(next) {

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
        
		return callAnimation.call(this, next).then(afterAnimation.bind(this));

	};

	/**
	 * Scroll Prev
	 * @return {[type]} [description]
	 */
	var scrollPrev = function(){
		return prepareAnimation.call(this, false);
	};


	var scrollNext = function(){
		return prepareAnimation.call(this, true);
	};

	var slideTo = function(index){

		if(index > this.vars.pages || index <= 0){
			DEBUGGER.run('info', 'Cant slide (not such slide) to ' + index, 'Slider');
			return;
		}

		this.vars.curPage = index;
		callBeforeEvent.call(this);
		DEBUGGER.run('info', 'Slide to ' + this.vars.curPage + ' / ' +  this.vars.pages, 'Slider');
		return callAnimation.call(this, true).then(afterAnimation.bind(this));

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

		/* Fade Effects
		   ========================================================================== */
			
		if(typeof config.fadeEffect !== 'undefined') {

			this.options.fadeEffect = config.fadeEffect;

		}

		return isOk;

	};



	var initScrollEffect = function(){

		this.options.DOM.slider.classList.add('scroll-animation');

		this.vars.slideeWidth = Math.ceil( 100 / this.vars.pages);

		// set width
		setSliderContainerWidth.call(this);
		setSlideeWidth.call(this);

	};



	var initFadeEffect = function(){

		this.options.DOM.slider.classList.add('fade-animation');

		this.vars.childrenNodes[0].classList.add('show'); // show first slide

	};




	/**
	 * Init slider
	 * @param  {objects} config
	 * @return {[type]}        [description]
	 */
	var init = function(config){
		
		console.log(this);
		
		if (setConfig.call(this, config)) {
			return;
		}

		// init vars
		this.vars.childrenNodes = this.options.DOM.slider.children;
		this.vars.pages = this.options.DOM.slider.children.length;

		this.vars.id = 'Slider-' + Math.random().toString(36).substr(2, 3);

		if(!this.options.fadeEffect) {

			initScrollEffect.call(this);

		} else {

			initFadeEffect.call(this);

		}

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
	
	var slider = function(config){

		this.vars = {
			isAnimation : false,
	        curPage : 1, // currentPage
	        pages : 0, // count pages
	        childrenNodes : null,
	        slideeWidth : 0,
	        id : 0, // set unique id of slider (use for hooks to multiple instances)
	        hookPrefixer : ''
		};

		this.options = { 

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
            fadeEffect : false

   		 };   

		this.init(config);
	};

	slider.prototype = {
		init : init,
		scrollNext : scrollNext,
		scrollPrev : scrollPrev,
		slideTo : slideTo
	};

	return slider;

});