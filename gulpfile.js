var gulp = require('gulp');
var minifyCss = require('gulp-minify-css');
var sass = require('gulp-sass');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

var paths = {
    html: ['app/index.html'],
    css: ['app/scss/*.scss', 'app/components/**/*.scss'],
    script: ['app/main.js']
};

gulp.task('mincss', function () {
    return gulp.src(paths.css)
        .pipe(sass().on('error', sass.logError))
        .pipe(minifyCss())
        .pipe(gulp.dest('app/dist/css'))
        .pipe(reload({ stream: true }));
});

gulp.task('html', function () {
    gulp.src(paths.html)
        .pipe(reload({ stream: true }));
});

gulp.task('browserSync', function () {
    gulp.watch(paths.css, gulp.series(['mincss']));
    gulp.watch(paths.script, gulp.series(['scripts']));
    gulp.watch(paths.html, gulp.series(['html']));
    browserSync({
        server: {
            baseDir: "app"
        },
        port: 8080,
        open: true,
        notify: false
    });
});

gulp.task('scripts', function () {
    return gulp.src(paths.script)
        .pipe(gulp.dest('app/dist'))
        .pipe(reload({ stream: true }));
});

gulp.task('default', gulp.series(['mincss', 'scripts', 'browserSync']));