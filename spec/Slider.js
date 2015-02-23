
(function(){
      

  describe('Slider', function() {

    var SliderObj,
        SliderInst;


    var goodSelectors = {

                slider : '.wrapper-slider.second .slider',
                prev : '.wrapper-slider.second .prev',
                next : '.wrapper-slider.second .next'

    };    

    beforeEach(function(done){

        require(['Slider'], function (module) {

            SliderObj = module;
            SliderInst = null;
            done();
            
        });

    });
  
    it('should load the AMD Slider module', function() {
          
         expect(SliderObj).toBeDefined();

    }); 


    /* Selctors
       ========================================================================== */
    
    describe('should show that bad selectors', function() {
        

        it('not add at all', function() {
          
            SliderInst = new SliderObj({});

            expect(SliderInst).toBeDefined();

        });

        it('not add slider', function() {
          
            SliderInst = new SliderObj({

              Selectors : {

                prev : '',
                next : ''

              }

            });

            expect(SliderInst).toBeDefined();

         });

        it('not add prev button', function() {
          
            SliderInst = new SliderObj({

              Selectors : {

                slider : '',
                next : ''

              }

            });

            expect(SliderInst).toBeDefined();

         });

         it('not add next button', function() {
          
            SliderInst = new SliderObj({

              Selectors : {

                slider : '',
                prev : '',

              }

            });

            expect(SliderInst).toBeDefined();

         });

         /* Are passesd string?
            ========================================================================== */
         

        it('not strings (slider)', function() {
          
            SliderInst = new SliderObj({

              Selectors : {

                slider : 123,
                prev : '',
                next : ''

              }

            });

            expect(SliderInst).toBeDefined();

        });

        it('not strings (next)', function() {
          
            SliderInst = new SliderObj({

              Selectors : {

                slider : '.wrapper-slider.second .slider',
                prev : '.wrapper-slider.second .prev',
                next : function(){}

              }

            });

            expect(SliderInst).toBeDefined();

        });


        it('not strings (prev)', function() {
          
            SliderInst = new SliderObj({

              Selectors : {

                slider : '.wrapper-slider.second .slider',
                prev : {},
                next : '.wrapper-slider.second .next'

              }

            });

            expect(SliderInst).toBeDefined();

        });


        /* DOM check
           ========================================================================== */

        it('not exisiting object in DOM for selector (slider)', function() {
          
            SliderInst = new SliderObj({

              Selectors : {

                slider : '.wrapper-slider.second .slider2',
                prev : '.wrapper-slider.second .prev',
                next : '.wrapper-slider.second .next'

              }

            });

            expect(SliderInst).toBeDefined();

        });

         it('not exisiting object in DOM for selector (prev)', function() {
          
            SliderInst = new SliderObj({

              Selectors : {

                slider : '.wrapper-slider.second .slider',
                prev : '.wrapper-slider.second .prev2',
                next : '.wrapper-slider.second .next'

              }

            });

            expect(SliderInst).toBeDefined();

        });

        it('not exisiting object in DOM for selector (next)', function() {
          
            SliderInst = new SliderObj({

              Selectors : {

                slider : '.wrapper-slider.second .slider',
                prev : '.wrapper-slider.second .prev',
                next : '.wrapper-slider.second .next2'

              }

            });

            expect(SliderInst).toBeDefined();

        });


    }); 


});
       
    
})();
        
 