"use strict"

const {src, dest} = require('gulp');
const gulp = require("gulp");
const autoprefixer = require('gulp-autoprefixer');
const cssbeautify = require('gulp-cssbeautify');
const removeComments = require('gulp-strip-css-comments');
const rename = require("gulp-rename");
const sass = require('gulp-sass');
const cssnano = require('gulp-cssnano');
const rigger = require('gulp-rigger');
const uglify = require('gulp-uglify');
const plumber = require('gulp-plumber');
const imagemin = require('gulp-imagemin');
const del = require('del');

const browserSync = require('browser-sync').create();


/* Пути */
var path = {
  build: {
    html: "build/",
    js: "build/js/",
    css: "build/css/",
    img: "build/img/",
    fonts: "build/fonts/"
  },
  src: {
    html: "source/*.html",
    js: "source/js/*.js",
    css: "source/sass/style.scss",
    img: "source/img/**/*.{jpg,svg,png}",
    fonts: "source/fonts/*.{eot,woff,woff2}"
  },
  watch: {
    html: "source/*.html",
    js: "source/**/*.js",
    css: "source/sass/**/*.scss",
    img: "source/img/**/*.{jpg,svg,png}"
  },
  clean: "./build"
}

/* Таски */
function browsersync(done) {
  browserSync.init({
    server: {
      baseDir: "./build/"
    },
    port: 3000
  })
}

function browserSyncReload(done) {
  browserSync.reload();
}

function fonts() {
  return src(path.src.fonts, {base: "source/fonts/"})
    .pipe(dest(path.build.fonts));
}


function html() {
  return src(path.src.html, {base: "source/"})
    .pipe(plumber())
    .pipe(dest(path.build.html))
    .pipe(browserSync.stream());
}

function style() {
  return src(path.src.css, {base: "source/sass/"})
  .pipe(plumber())
  .pipe(sass())
  .pipe(autoprefixer({
    cascade: true
  }))
  .pipe(cssbeautify({
    indent: '  ',
    openbrace: 'end-of-line',
    autosemicolon: true
  }))
  .pipe(dest(path.build.css))
  .pipe(cssnano({
    zindex: false,
    discardComments: {
      removeAll: true
    }
  }))
  .pipe(removeComments())
  .pipe(rename({
    suffix: ".min",
    extname: ".css"
  }))
  .pipe(dest(path.build.css))
  .pipe(browserSync.stream());
}

function js() {
  return src(path.src.js, {base: "source/js/"})
    .pipe(plumber())
    .pipe(rigger())
    .pipe(gulp.dest(path.build.js))
    .pipe(uglify())
    .pipe(rename({
      suffix: ".min",
      extname: ".js"
    }))
    .pipe(dest(path.build.js))
    .pipe(browserSync.stream());
}

function images() {
  return src(path.src.img)
    .pipe(imagemin())
    .pipe(dest(path.build.img))
    .pipe(browserSync.stream());
}

function clean() {
  return del(path.clean);
}

function watchFiles() {
  gulp.watch([path.watch.html], html);
  gulp.watch([path.watch.css], style);
  gulp.watch([path.watch.js], js);
  gulp.watch([path.watch.img], images);
}

const build = gulp.series(clean, gulp.parallel(html, style, js, images, fonts));
const watch = gulp.parallel(build, watchFiles, browsersync);

/* Экспорт Тасков*/
exports.html = html;
exports.fonts = fonts;
exports.style = style;
exports.js = js;
exports.images = images;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = watch;
