/* global DEBUGGER, RSVP*/

var oldD;
var f = function(){
    var d = new Date().getTime();
    if(typeof oldD !== 'undefined')
        console.log(d-oldD);
    oldD = d;
}
window.onscroll=f;

/**
 * RSVP in global (added in preloader files)
 */
define('OnePageScroll', [ 'DynamicObject', 'DisableScroll' ], function(DynamicObject, DisableScroll) {
    'use strict';
    var scroller = function() {};
    
    scroller.prototype = function() {
        
        /* Integrate in dom
           ========================================================================== */

        var getStyles = function(offset, timeScroll) {
            var styles = {
                '-webkit-transform': 'translate(0, -' + offset + ')',
                '-webkit-transition': '-webkit-transform ' + timeScroll + 'ms ' + this.config.easing,
                '-moz-transform': 'translate(0, -' + offset + ')',
                '-moz-transition': '-moz-transition ' + timeScroll + 'ms ' + this.config.easing,
                '-ms-transform': 'translate(0, -' + offset + ')',
                '-ms-transition': '-ms-transform ' + timeScroll + 'ms ' + this.config.easing,
                transform: 'translate(0, -' + offset + ')',
                transition: 'transform ' + timeScroll + 'ms ' + this.config.easing
            };
            var out = '';
            for (var style in styles) {
                out += style + ' : ' + styles[style] + ';';
            }
            return out;
        };

        var scrollPage = function(offset, time) {
            var timeScroll = time || this.config.scrollTime;
            this.config.mainWrapper.setAttribute('style', getStyles.call(this, offset, timeScroll));
            return new RSVP.Promise(function(ok) {
                setTimeout(function() {
                    ok();
                    // remove style tranform
                    if (offset === '0%') {
                        this.config.mainWrapper.setAttribute('style', '');
                    }
                }.bind(this), timeScroll);
            }.bind(this));
        };

        /* Classes
           ========================================================================== */
        
        var addClass = function(currSection, nextSection) {
            document.body.classList.add(nextSection);
            document.body.classList.remove(currSection);
            document.body.classList.remove('before-' + currSection);
            document.body.classList.remove('start-' + currSection);
        };
    
        /* Get record
           ========================================================================== */
        
        var getRecordNameWhenScrollTo = function(nextSectionName, action, direction) {
            var afterElement = this.config.sections.getKeyAfter(this.config.currentSectionName);
            var beforeElement = this.config.sections.getKeyBefore(this.config.currentSectionName);
            var nextSectionBeforeElement = this.config.sections.getKeyBefore(nextSectionName);
            var nextSectionAfterElement = this.config.sections.getKeyAfter(nextSectionName);
            if (action === 'before' && direction === 'up') {
                return this.config.currentSectionName + '_to_' + beforeElement;
            }
            if (action === 'before' && direction === 'down') {
                return this.config.currentSectionName + '_to_' + afterElement;
            }
            if (action === 'after' && direction === 'up') {
                return nextSectionAfterElement + '_to_' + nextSectionName;
            }
            if (action === 'after' && direction === 'down') {
                return nextSectionBeforeElement + '_to_' + nextSectionName;
            }
            return '';
        };

        /* Callbacks
           ========================================================================== */
 
        var getCallbacksForSection = function(nextSectionName, scrollTo, action, direction) {
            var element;
            /* Get correct record
            ========================================================================== */
            element = '';
            if (scrollTo) {
                element = getRecordNameWhenScrollTo.call(this, nextSectionName, action, direction);
            } else {
                element = this.config.currentSectionName + '_to_' + nextSectionName;
            }
            /* Test
               ========================================================================== */
            if (typeof this.config.sectionsEvents[element] !== 'undefined') {
                DEBUGGER.run('info', 'Call ' + element + ':' + action, 'onePageScroll');
                return this.config.sectionsEvents[element];
            } else {
                DEBUGGER.run('info', 'Try to call' + element);
            }
            // not defined, return empty
            return {
                before: function() {},
                after: function() {}
            };
        };

        /* Scroll sections
           ========================================================================== */

        var scroll = function(nextSectionName, direction) {

            if (this.config.isAnimation || nextSectionName === false || !this.config.enable) {
                return;
            } 

            if(this.config.debug){
                DEBUGGER.run('info','Call scroll method','OnePageScroll');
            }

            // first or last section or dont active
            var scrollTo;
            var accelerate = 1;
            var time = this.config.scrollTime;
            var timeAllScrollTo = 0;
            // time not div when scrollTo
            var currrentIndex = this.config.sections.get(this.config.currentSectionName);
            var nextItemIndex = this.config.sections.get(nextSectionName);
            var howMuch = Math.abs(nextItemIndex - currrentIndex);
            if (typeof direction === 'undefined') {
                // call by scrollTo 
                scrollTo = true;
                if (nextItemIndex - currrentIndex < 0) {
                    direction = 'up';
                } else {
                    direction = 'down';
                }
                timeAllScrollTo = howMuch * this.config.scrollTime;
                if (howMuch > 1) {
                    accelerate = howMuch <= 3 ? 2 : 3;
                    // how much accelerate scroll
                    time = timeAllScrollTo / accelerate;
                }
                DEBUGGER.run('info', 'Scroll to ' + nextSectionName + ' section in ' + time + ' ms ', 'OnePageScroll');
            }

            this.config.isAnimation = true;
            
            /* Call events
               ========================================================================== */
            
            // call before event
            getCallbacksForSection.call(this, nextSectionName, scrollTo, 'before', direction).before();
            this.config.currentScrollClass = this.config.currentSectionName + '-' + nextSectionName;
            
            document.body.classList.add(this.config.currentScrollClass);
            addClass.call(this, this.config.currentSectionName, 'start-' + nextSectionName);
            
            // cal after method after scroll
            
            if (scrollTo) {
                // simulate scroll, add class to before scroll on section before destination
                setTimeout(function() {
                    addClass.call(this, this.config.currentSectionName, 'before-' + nextSectionName);
                    if (howMuch > 2) {
                        document.body.classList.remove(this.config.currentScrollClass);
                    }
                }.bind(this), time - this.config.scrollTime / 2);
            } else {
                addClass.call(this, this.config.currentSectionName, 'before-' + nextSectionName);
            }
            
            setTimeout(function() {
                addClass.call(this, this.config.currentSectionName, nextSectionName);
                document.body.classList.add('half-' + this.config.currentScrollClass);
            }.bind(this), time / 2);

            setTimeout(function() {
                getCallbacksForSection.call(this, nextSectionName, scrollTo, 'after', direction).after();
                document.body.classList.remove('half-' + this.config.currentScrollClass);
                addClass.call(this, this.config.currentSectionName, nextSectionName);
                if (howMuch <= 2) {
                    document.body.classList.remove(this.config.currentScrollClass);
                }
            }.bind(this), time);
            

            
            /* Scroll
               ========================================================================== */
            
            return scrollPage.call(this, (nextItemIndex - 1) * 100 + '%', time).then(function() {
                this.config.currentSectionName = nextSectionName;
                setTimeout(function(){
                    this.config.isAnimation = false;
                    DEBUGGER.run('warn', 'Can scroll', 'onePageScroll');
                }.bind(this), 800);
            }.bind(this));
        };
        
        /* Events
           ========================================================================== */

        var scrolTo = function(sectionName) {
            return scroll.call(this, sectionName);
        };

        var moveDown = function() {
            if (this.config.currentSectionName === this.config.lastSectionName) {
                return;
            }

            DEBUGGER.run('info', 'moveDown', 'onePageScroll');
            var nextSectionName = this.config.sections.getKeyAfter(this.config.currentSectionName);
            scroll.call(this, nextSectionName, 'down');
        };

        var moveUp = function() {
            if (this.config.currentSectionName === this.config.firstSectionName) {
                return;
            }

            DEBUGGER.run('info', 'moveUp', 'onePageScroll');
            var nextSectionName = this.config.sections.getKeyBefore(this.config.currentSectionName);
            scroll.call(this, nextSectionName, 'up');
        };

        var onScroll = function(event) {
            console.log('scroll');

            var e = event || window.event;
 
            if (!this.config.enable || this.config.isAnimation) {
                e.preventDefault();
                return false;
            }
           
            /* Data
                ========================================================================== */
              
            var timeNow = new Date().getTime(),
                delta = e.wheelDelta || -e.deltaY || -e.detail,
                timeDiff = timeNow - this.config.lastAnimationTime;

            // Cancel scroll if currently animating or within quiet period
            
            if(timeDiff <= (this.config.scrollTime + this.config.quietPeriod)){
                e.preventDefault();
                return false;
            }
    
            this.config.lastAnimationTime  = timeNow;

            if(this.config.debug){
                DEBUGGER.run('info','Call scroll method from scroll','OnePageScroll');
            }

            /* Scroll
               ========================================================================== */

            if (delta < 0) {
                moveDown.call(this);
            } else {
                moveUp.call(this);
            }

            // setTimeout(function(){
            //     this.config.lastAnimationTime  = new Date().getTime();
            // }.bind(this), this.config.scrollTime - 120);
            
            return false;
        };

        var keyEvents = function(e) {
            var tag = e.target.tagName.toLowerCase();
            switch (e.which) {
              case 38:
                if (tag !== 'input' && tag !== 'textarea') {
                    moveUp.call(this);
                }
                break;

              case 40:
                if (tag !== 'input' && tag !== 'textarea') {
                    moveDown.call(this);
                }
                break;

              case 32:
                //spacebar
                if (tag !== 'input' && tag !== 'textarea') {
                    moveDown.call(this);
                }
                break;

              case 33:
                //pageg up
                if (tag !== 'input' && tag !== 'textarea') {
                    moveUp.call(this);
                }
                break;

              case 34:
                //page dwn
                if (tag !== 'input' && tag !== 'textarea') {
                    moveDown.call(this);
                }
                break;

              case 36:
                //home
                scrollTo.call(this, this.config.firstSectionName);
                break;

              case 35:
                //end
                scrollTo.call(this, this.config.lastSectionName);
                break;

              default:
                return;
            }
        };
        
        var addEvents = function() {
            DEBUGGER.run('info', 'Add events', 'OnePageScroll');
            window.addEventListener('wheel', onScroll.bind(this), false);
            // window.addEventListener('DOMMouseScroll', onScroll.bind(this), false);
            // window.addEventListener('MozMousePixelScroll', onScroll.bind(this), false);
            document.addEventListener('keydown', keyEvents.bind(this));
        };

        var addSectionEvents = function(events, sections) {
            if (DEBUGGER.run('OnePageScrollchechEventsObject', {
                events: events,
                sections: sections
            }, 'OnePageScroll')) {
                this.config.sectionsEvents = events;
            }
        };

        var initObjects = function() {
            this.config.sections = new DynamicObject();
            var first = false;
            [].forEach.call(this.config.mainSections, function(element, index) {
                var name = element.getAttribute('data-name');
                if (!first) {
                    this.config.firstSectionName = name;
                    this.config.currentSectionName = name;
                    first = true;
                }
                if (this.config.mainSections.length === index + 1) {
                    this.config.lastSectionName = name;
                }
                this.config.sections.add(name, ++index);
            }.bind(this));
        };

        /* ==========================================================================
           Public methods
           ========================================================================== */
        
        return {
            config: {
                debug : true,
                currentScrollClass: '',
                mainWrapper: null,
                mainSections: null,
                enable: true,
                firstSectionName: '',
                lastSectionName: '',
                currentSectionName: '',
                quietPeriod : 700,

                // name of current section
                scrollTime: 300,
                isAnimation: false,
                isAnimationOnScroll: false,
                easing: 'ease-out',
                waitAfterScroll: 0,
                lastAnimationTime: 0,
                sectionsEvents: {},
                
                // config files for sections callbacks
                sections: null
            },

            init: function(config) {
                if (DEBUGGER.run('OnePageScrollCheckConfig', {
                    config: config
                }, 'onePageScroll')) {
                    this.config.mainWrapper = document.querySelector(config.mainSelector);
                    this.config.mainSections = this.config.mainWrapper.children;
                    
                    // change scrollTime
                    if (config.scrollTime) {
                        this.config.scrollTime = parseInt(config.scrollTime);
                    }
                    
                    //change Easing
                    if (config.easing) {
                        this.config.easing = config.easing;
                    }
                    
                    //change timeWait after scroll
                    if (config.waitAfterScroll) {
                        this.config.easing = parseInt(config.waitAfterScroll);
                    }
                    
                    //add section events
                   
                    if (config.sectionsEvents) {
                        addSectionEvents.call(this, config.sectionsEvents, this.config.mainSections);
                    }

                    DisableScroll.disable();
                    initObjects.call(this);
                    addEvents.call(this);
                }
            },

            scrollTo: function(section) {
                var sections = this.config.mainSections;
                if (this.config.currentSectionName === section) {
                    return;
                }
                if (DEBUGGER.run('isGoodSectionOnePageScroll', {
                    sections: sections,
                    section: section,
                    isScrollTo: true
                }, 'OnePageScroll')) {
                    return scrolTo.call(this, section);
                }
            },
            scrollDown: function() {
                moveDown.call(this);
            },

            scrollUp: function() {
                moveUp.call(this);
            },
            
            enable: function() {
                this.config.enable = true;
                DisableScroll.disable();
            },

            disable: function() {
                this.config.enable = false;
                DisableScroll.enable();
            }
        };
    }();
    
    return scroller;
});