module.exports = function(grunt) {

	'use strict';

	grunt.initConfig({
		
		  compass: {                
			    dist: {                   
			      options: {             
			        sassDir: 'sass',
			        cssDir: 'styles',
			        environment: 'development'
			      }
			    }
	       },
	       watch: {
	       		options : {
	       	    		livereload : true
	       	    },
	       		compass : {
	       			files: ['sass/**/*.scss'],
	       			tasks : ['compass']
	       		},

	       	    livereload : {
	       	    	files : ['scripts/**/*.js','*.html'],
	       	    }
	       }

	});

	grunt.loadNpmTasks('grunt-contrib-compass');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('default', ['watch']);
	
};