var dest = './dest';
var src = './src';
var vendor = './vendor'
module.exports = {
    browserSync: {
        server: {
            baseDir: [dest,src,vendor]
        },
        files: [
            dest + "/**",
            vendor,
            "!" + dest + "/**.map"

        ]
    },
    markup: {
        src: src + '/htdocs/**',
        dest: dest
    },
    sass: {
        src: [src + "/sass/*.scss",src + "/sass/*.sass"],
        dest: dest,
        settings: {
            sourceComments: 'map',
            imagePath: '/images'
        }
    },
    images: {
        src: src + "/images/**",
        dest: dest
    },
    browserify: {
        debug: true,
        extentions: [],
        transform: ['reactify'],
        bundleConfigs: [{
            entries: src + '/js/app.js',
            dest: dest,
            outputName: 'app.js'
        }]
    }
}