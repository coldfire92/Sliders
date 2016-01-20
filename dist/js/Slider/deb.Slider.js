
/* global DEBUGGER*/

/**
 * Chect selectors in config object
 */
DEBUGGER.addMethod('sliderCheckSelectors', function(Vars){
	'use strict';

	var Selectors = Vars.config.Selectors;

   /* Check are deinfed
    ========================================================================== */

	if(typeof Selectors === 'undefined') {

		this.print('Slider', 'You dont pass Selectors to config object','error');
		return false;

	}

	var slider = Selectors.slider,
		prev = Selectors.prev,
		next = Selectors.next;

	if(typeof slider === 'undefined') {

		this.print('Slider', 'You dont pass selector \'slider\' to config object','error');
		return false;

	}

	if(typeof prev === 'undefined') {

		this.print('Slider', 'You dont pass selector \'prev\' to config object','error');
		return false;

	}

	if(typeof next === 'undefined') {

		this.print('Slider', 'You dont pass selector \'next\' to config object','error');
		return false;

	}

	/* Are strings?
    ========================================================================== */


    if (!(typeof slider === 'string' || slider instanceof String)) {

		this.print('Slider', 'Selector for \'slider\' pass to config object is not a string','error');
		return false;

	}

	if (!(typeof prev === 'string' || prev instanceof String)) {

		this.print('Slider', 'Selector for \'prev\' pass to config object is not a string','error');
		return false;

	}


	if (!(typeof next === 'string' || next instanceof String)) {

		this.print('Slider', 'Selector for \'next\' pass to config object is not a string','error');
		return false;

	}

	/* Are in DOM?
	   ========================================================================== */
	
	if(document.querySelector(slider) === null) {

		this.print('Slider', 'Selector for \'slider\' pass to config object is bad (not object in DOM)','error');
		return false;
	}

	if(document.querySelector(prev) === null) {

		this.print('Slider', 'Selector for \'prev\' pass to config object is bad (not object in DOM)','error');
		return false;
	}

	if(document.querySelector(next) === null) {

		this.print('Slider', 'Selector for \'next\' pass to config object is bad (not object in DOM)','error');
		return false;
	}

    return true;

}, ['config']);


/**
 * Chech events in config object
 */
DEBUGGER.addMethod('sliderCheckEvents', function(Vars){
	'use strict';

	return true;

},['config']);

