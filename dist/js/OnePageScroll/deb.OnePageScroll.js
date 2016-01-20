/* global DEBUGGER*/
/**
 * Check config objects for OnePageScroll
 * @param  {object} Vars 
 * @return {bool}    
 */

DEBUGGER.addMethod("OnePageScrollCheckConfig", function(Vars) {
    "use strict";
    var easingExcepted = [ "ease", "ease-in", "ease-out", "ease-in-out", "linear" ];
    /* Chech main selector
	   ========================================================================== */
    var childrenSections;
    
    if (typeof Vars.config.mainSelector === "undefined") {
        this.print("onePageScroll", "You dont add mainSelector property", "error");
        return false;
    } else {
        // are dom elelement for selector (wrapper)
        if (!document.querySelector(Vars.config.mainSelector)) {
            this.print("onePageScroll", "There isn`t any dom element for " + Vars.config.mainSelector, "error");
            return false;
        }
        
        // are sections for main wrapper dom element
        childrenSections = document.querySelector(Vars.config.mainSelector).children;
        if (childrenSections.length === 0) {
            this.print("onePageScroll", "There isn`t any children sections for dom object " + Vars.config.mainSelector, "error");
            return false;
        }
       
        // are all section has good data-name attribute
        var ok = true;
        [].forEach.call(childrenSections, function(section, index) {
            if (section.getAttribute("data-name") === null) {
                ok = false;
                this.print("onePageScroll", "Section " + (++index) + " hasn`t got data-name attribute", "warn");
            }
        }.bind(this));
        
        if (!ok) {
            return false;
        }
    }
    /* Easing
	   ========================================================================== */
    if (typeof Vars.config.easing !== "undefined") {
        if (easingExcepted.indexOf(Vars.config.easing) === -1) {
            this.print("onePageScroll", Vars.config.easing + " isnt good easing", "warn");
            return false;
        }
    }
    return true;
}, [ "config" ]);

/**
 * Check is good section
 */
DEBUGGER.addMethod("isGoodSectionOnePageScroll", function(Vars) {
    "use strict";
    var sectionsNames = [];
    /* Get valid section names
	   ========================================================================== */
    [].forEach.call(Vars.sections, function(section) {
        sectionsNames.push(section.getAttribute("data-name"));
    });
    var isOk = sectionsNames.indexOf(Vars.section) !== -1;
    if (Vars.isScrollTo && !isOk) {
        this.print("OnePageScroll", "Section " + Vars.section + " is not valid (passed to scrollTo method", "warn");
    }
    return isOk;
}, [ "sections", "section" ]);

/**
 * Check sections events for OnePageScroll
 * */
DEBUGGER.addMethod("OnePageScrollchechEventsObject", function(Vars) {
    "use strict";
    var self = this;
    /* Check validy of key
	   ========================================================================== */
    var isGoodKey = function(key) {
        var sections = key.split("_");
        
        // is valid record
        if (sections.length !== 3) {
            self.print("onePageScroll", key + " is bad key for section events object", "error");
            return false;
        }
        
        //first dection
        if (!DEBUGGER.run("isGoodSectionOnePageScroll", {
            sections: Vars.sections,
            section: sections[0]
        })) {
            self.print("OnePageScroll", sections[0] + " is bad section in " + key + " record");
            return false;
        }
        
        //second sections
        if (!DEBUGGER.run("isGoodSectionOnePageScroll", {
            sections: Vars.sections,
            section: sections[2]
        })) {
            self.print("OnePageScroll", sections[0] + " is bad section in " + key + " record");
            return false;
        }
        return true;
    };
    /* is gool object
	   ========================================================================== */
    var isGoodObject = function(object, key) {
        var typeOfBefore = typeof object.before;
        var typeOfAfter = typeof object.after;
        if (typeOfBefore === "undefined" || typeOfBefore !== "function") {
            self.print("OnePageScroll", "Object " + key + " hasn`t got before function in events sections config object", "error");
            return false;
        }
        if (typeOfAfter === "undefined" || typeOfAfter !== "function") {
            self.print("OnePageScroll", "Object " + key + " hasn`t got after function in events sections config object", "error");
            return false;
        }
        return true;
    };
    /* Check events object
	   ========================================================================== */
    for (var sectionsEventKey in Vars.events) {
        var objectEvent = Vars.events[sectionsEventKey];
        if (!isGoodKey(sectionsEventKey)) {
        	return false;
        }
        if (!isGoodObject(objectEvent, sectionsEventKey)) {
        	return false;
        }
    }

    return true;
}, [ "events", "sections" ]);