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
const del = require('del');
const { stream } = require('browser-sync');

function copyAssets() {
    return src('./src/assets/**/*').pipe(dest('dist/assets/'));
}

// Compile EJS.
function compileEJS() {
    return src('src/pages/**/*.ejs')
        .pipe(ejs())
        .pipe(rename({ extname: '.html' }))
        .pipe(dest('./dist'));
}

// Copy JS files to dist.
function concatCustomJS() {
    return src('./src/js/*.js').pipe(concat('main.js')).pipe(dest('dist/js/'));
}

// Concat JS libs to single file, minify and copy to dist.
function concatJSLibs() {
    return src(['node_modules/materialize-css/dist/js/materialize.min.js'])
        .pipe(concat('libs.min.js'))
        .pipe(uglify())
        .pipe(dest('dist/js/'));
}

// Compile CSS libs.
function compileScssLibs() {
    return src(['node_modules/materialize-css/sass/materialize.scss'])
        .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
        .pipe(autoprefixer({ cascade: false }))
        .pipe(concat('libs.min.css'))
        .pipe(cleanCSS())
        .pipe(dest('dist/css/'));
}

// Compile SASS.
function compileCustomSass() {
    return src(['./src/styles/styles.sass'])
        .pipe(sourcemaps.init())
        .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
        .pipe(autoprefixer({ cascade: false }))
        .pipe(groupMQ())
        .pipe(sourcemaps.write('maps'))
        .pipe(dest('./dist/css'))
        .pipe(browserSync.stream());
}

// Remove dist.
function removeDistFolder() {
    return del('dist');
}

// Watch Files.
function watchFiles() {
    browserSync.init({
        server: {
            baseDir: 'dist/',
        },
    });
    watch(['src/styles/**/*', 'src/layout/**/*.sass'], compileCustomSass)
    watch('src/js/**/*', concatCustomJS).on('change', browserSync.reload);
    watch(['src/**/*.ejs'], compileEJS).on('change', browserSync.reload);
}

// Default 'gulp' command with start local server and watch files for changes.
exports.default = series(
    removeDistFolder,
    compileScssLibs,
    concatJSLibs,
    compileEJS,
    compileCustomSass,
    concatCustomJS,
    copyAssets,
    watchFiles
);

// 'gulp build' will build all assets but not run on a local server.
// exports.build = series(
//     removeDistFolder,
//     compileScssLibs,
//     concatJSLibs,
//     compileEJS,
//     compileCustomSass,
//     concatCustomJS,
//     copyFonts,
//     copyImages,
//     watch_files
// );
