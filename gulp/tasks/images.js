var changed    = require('gulp-changed');
var gulp       = require('gulp');
var imagemin   = require('gulp-imagemin');
var config     = require('../config').images;

gulp.task('images', function(){
    return gulp.src(config.src + "/**")
    .pipe(changed(config.dest+"/images"))
    .pipe(imagemin())
    .pipe(gulp.dest(config.dest+"/images"));
});