const { src, dest, series, parallel, watch } = require('gulp');
const ejs = require('gulp-ejs');
const rename = require('gulp-rename');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const autoprefixer = require('gulp-autoprefixer');
const groupMQ = require('gulp-group-css-media-queries');
const sourcemaps = require('gulp-sourcemaps');
const cleanCSS = require('gulp-clean-css');

// Copy font to dist folder.
function copyFonts() {
    return src('./src/fonts/**/*.*').pipe(dest('dist/fonts'));
}

// Copy images to dist folder.
function copyImages() {
    return src('./src/assets/img/**/*.*').pipe(dest('dist/img'));
}

// Compile EJS.
function compileEJS() {
    return src('src/pages/*.ejs')
        .pipe(ejs({ title: 'gulp-ejs' }))
        .pipe(rename({ extname: '.html' }))
        .pipe(dest('./dist'));
}

// Copy JS files to dist.
function js() {
    return src('./src/assets/js/*.js')
        .pipe(concat('main.js'))
        .pipe(dest('dist/js'));
}

// Concat JS libs to single file, minify and copy to dist.
function compileJsLibs() {
    return src('node_modules/materialize-css/dist/js/materialize.min.js')
        .pipe(concat('libs.min.js'))
        .pipe(uglify())
        .pipe(dest('dist/js/'));
}

// Compile CSS libs.
function compileCssLibs() {
    return src('node_modules/materialize-css/sass/materialize.scss')
        .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
        .pipe(autoprefixer({ cascade: false }))
        .pipe(concat('libs.min.css'))
        .pipe(cleanCSS())
        .pipe(dest('dist/css/'));
}

// Compile SASS.
function compileSASS() {
    return src(['./src/assets/styles/styles.sass'])
        .pipe(sourcemaps.init())
        .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
        .pipe(autoprefixer({ cascade: false }))
        .pipe(groupMQ())
        .pipe(sourcemaps.write('maps'))
        .pipe(dest('./dist/css'))
        .pipe(browserSync.stream({ once: true }));
}

// Watch Files.
function watch_files() {
    browserSync.init({
        server: {
            baseDir: 'dist/',
        },
    });
    watch('src/assets/styles/**/*.sass', compileSASS);
    watch('src/assets/js/*.js', js).on('change', browserSync.reload);
    watch(
        ['src/pages/*.ejs', 'src/layout/*.ejs', 'src/components/*.ejs'],
        compileEJS
    ).on('change', browserSync.reload);
    watch('src/components/*.ejs', compileEJS).on('change', browserSync.reload);
}

// Default 'gulp' command with start local server and watch files for changes.
exports.default = series(
    compileCssLibs,
    compileJsLibs,
    compileEJS,
    compileSASS,
    js,
    compileJsLibs,
    copyFonts,
    copyImages,
    watch_files,
    compileEJS
);

// 'gulp build' will build all assets but not run on a local server.
exports.build = parallel(
    compileCssLibs,
    compileJsLibs,
    compileEJS,
    compileSASS,
    js,
    compileJsLibs,
    copyFonts,
    copyImages,
    compileEJS
);
