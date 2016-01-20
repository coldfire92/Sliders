
'use strict';

var gulp = require('gulp'),
	jshint = require('gulp-jshint'),
	sass = require('gulp-sass'),
	livereload = require('gulp-livereload');

gulp.task('css', function () {
  gulp.src('./sass/**/*.scss')
	    .pipe(sass().on('error', sass.logError))
	    .pipe(gulp.dest('./dist/css'))
	    .pipe(livereload());
});

gulp.task('js', function() {
  	gulp.src('./scripts/**/*.js')
  		.pipe(gulp.dest('./dist/js'))
  		.pipe(jshint())
    	.pipe(jshint.reporter('default'))
    	.pipe(livereload());
});

gulp.task('default',['js','css'],function(){
	livereload.listen();
	gulp.watch('./sass/**/*.scss', ['css']);
	gulp.watch('./scripts/**/*.js', ['js']);
});