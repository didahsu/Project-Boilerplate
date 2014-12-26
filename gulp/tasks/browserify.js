var browserify   = require('browserify');
var watchify     = require('watchify');
var bundleLogger = require('../util/bundleLogger');
var gulp         = require('gulp');
var handleErrors = require('../util/handleErrors');
var source       = require('vinyl-source-stream');
var config       = require('../config').browserify;
var gutil        = require('gulp-util');

gulp.task('browserify', function(done){
    var bundleQueue = config.bundleConfigs.length;

    var browserifyThis = function(bundleConfig){
        var bundler = browserify({
            cache: {},
            packageCache:{},
            fullPaths: true,
            debug: config.debug,
            extensions: config.extensions,
            transform: config.transform,
            entries: bundleConfig.entries
        });

        var bundle = function(){
            bundleLogger.start(bundleConfig.outputName);
            return bundler
            .bundle()
            .on('error', handleErrors)
            .pipe(source(bundleConfig.outputName))
            .pipe(gulp.dest(bundleConfig.dest))
            .on('end', reportFinished);
        }

        if(global.isWatching){
            bundler = watchify(bundler);

            bundler.on('update', bundle);
        }

        var reportFinished = function(){
            gutil.log('Bundling', "witch step...");
            bundleLogger.end(bundleConfig.outputName);

            if(bundleQueue){
                bundleQueue--;
                if(bundleQueue === 0){
                    done();
                }
            }
        };

        return bundle();
    }

    config.bundleConfigs.forEach(browserifyThis);

});