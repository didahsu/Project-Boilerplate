var gutil        = require('gulp-util');
var prettyHrtime = require('pretty-hrtime');
var startTime;

module.exports = {
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
};