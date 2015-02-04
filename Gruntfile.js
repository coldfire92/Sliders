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
	       }

	});

	grunt.loadNpmTasks('grunt-contrib-compass');

	grunt.registerTask('default', ['compass']);
	
};