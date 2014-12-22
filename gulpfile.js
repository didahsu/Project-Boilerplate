var gulp = require('gulp');
var source =require('vinyl-source-stream');
var browserify = require('browserify');
var watchify = require('watchify');
var browserSync = require('browser-sync');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var notify = require('gulp-notify');
var prettyHrtime = require('pretty-hrtime');
var gutil = require('gulp-util');
var changed    = require('gulp-changed');
var imagemin   = require('gulp-imagemin');
var startTime;

var path = {
    dest: './dest',
    src: './src',
    vendor: './vendor',
    js: './src/js',
    css: './src/sass',
    images: './src/images',
    markup: './src/htdocs/**'
};

var BundleLogger = {
    startTime: null,
    start:  function start(filepath){
        this.startTime = process.hrtime();
        gutil.log('Bundling', gutil.colors.green(filepath) + "...");
    },
    end: function end(filepath){
        var taskTime = process.hrtime(this.startTime);
        var prettyTime = prettyHrtime(taskTime);
        gutil.log('Bundled', gutil.colors.green(filepath), "in", gutil.colors.magenta(prettyTime));
    }
}


function handleError(){
    var args = Array.prototype.slice.call(arguments);
    notify.onError({
        title: 'Compile Error',
        message: '<%= error %>'
    }).apply(this,args);

    this.emit("end");
}

gulp.task('markup', function(){
    return gulp.src(path.markup)
        .pipe(gulp.dest(path.dest))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('sass',['images'], function(){
    return gulp.src(path.css+"/*.{sass,scss")
    .pipe(sourcemaps.init())
    .pipe(sass({
        sourceComments: 'map',
        imagePath: '/images'
    }))
    .on('error', handleError)
    .pipe(sourcemaps.write())
    .pipe(autoprefixer({ browsers: ['last 2 version'] }))
    .pipe(gulp.dest(path.dest))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('images', function(){
    return gulp.src(path.images + "/**")
    .pipe(changed(path.dest+"/images"))
    .pipe(imagemin())
    .pipe(gulp.dest(path.dest+"/images"));
});

gulp.task('browserify', function(done){
    var bundleConfigs = [{
        entries: path.js+'/app.js',
        dest: path.dest,
        outputName : 'app.js',
        transform: ['reactify']
    }];

    var bundleQueue = bundleConfigs.length;

    var browserifyThis = function(bundleConfig){
        var bundler = browserify({
            cache: {},
            packageCache:{},
            fullPaths: true,
            debug: true,
            extensions: ['js'],
            entries: bundleConfig.entries,
            transform: bundleConfig.transform
        });

        var bundle = function(){
            BundleLogger.start(bundleConfig.outputName);
            return bundler
            .bundle()
            .on('error', handleError)
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
            BundleLogger.end(bundleConfig.outputName);

            if(bundleQueue){
                bundleQueue--;
                if(bundleQueue === 0){
                    done();
                }
            }
        };

        return bundle();
    }

    bundleConfigs.forEach(browserifyThis);

});


gulp.task('browserSync', ['build'], function(){
    browserSync({
        server: {
            baseDir: [path.dest, path.src,path.vendor]
        },
        files: [
            path.dest + "/**",
            path.vendor + "/**",
            "!" + path.dest + "/**.map"
        ]
    });
});

gulp.task('build', ['browserify','markup','sass','images']);

gulp.task('setWatch', function(){
    global.isWatching = true;
});

gulp.task('watch', ['setWatch','browserSync'], function(){
    gulp.watch(path.markup, ['markup']);
    gulp.watch(config.sass.src, ['sass']);
    gulp.watch(config.images.src, ['images']);
});