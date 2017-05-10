'use strict'

var gulp = require('gulp');
var browserSync = require('browser-sync').create();

// Static Server + watching scss/html files
gulp.task('serve', function() {

    browserSync.init({
        server: "./web/src/",
        startPath: "/"
    });

    gulp.watch('**/*.js').on('change', browserSync.reload);
    gulp.watch('**/*.html').on('change', browserSync.reload);
    gulp.watch('**/*.css').on('change', browserSync.reload);
});

gulp.task('default', ['serve']);
