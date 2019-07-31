// gulp
const gulp = require("gulp");

// css
const sass = require("gulp-sass");
const autoprefixer = require("gulp-autoprefixer");

// img
const imagemin = require("gulp-imagemin");
const pngquant = require("imagemin-pngquant");
const mozjpeg  = require("imagemin-mozjpeg");

// build & watch
const browsersync = require("browser-sync").create();
const connectSSI = require("connect-ssi");
const changed = require("gulp-changed");
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");

// del
const del = require("del");

const path = {
  "src": "./src",
  "dist": "./dist"
}

// browser sync
gulp.task("browser", done => {
  browsersync.init({
    server: {
      baseDir: path.dist,
      middleware: [
        connectSSI({
          baseDir: path.dist,
          notify: false,
          ext: ".html"
        })
      ]
    }
  })
  done()
});

// html
gulp.task("html", done => {
  gulp.src(path.src + "/*.html")
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe(changed(path.dist))
    .pipe(gulp.dest(path.dist))
    done()
});

// css
gulp.task("sass", done => {
  gulp.src(path.src + "/**/*.scss")
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe(sass({outputStyle: "expanded"}))
    .pipe(autoprefixer({
      cascade: false,
      grid: true
    }))
    .pipe(changed(path.dist))
    .pipe(gulp.dest(path.dist))
    .pipe(notify("Sassをコンパイルしました！"))
    done()
});

// js
gulp.task("js", done => {
  gulp.src(path.src + "/**/*.js")
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe(changed(path.dist))
    .pipe(gulp.dest(path.dist))
    done()
});

// image 圧縮
gulp.task("image", done => {
  gulp.src(path.src + "/**/*.{png,jpg,gif,svg}")
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe(imagemin([
      pngquant([
        "80-85",
        1,
        0
      ]),
      mozjpeg({
        quality: 85,
        progressive: true
      }),
      imagemin.gifsicle({
        interlaced: false,
        optimizationLevel: 1,
        colors: 256
      }),
      imagemin.jpegtran(),
      imagemin.optipng(),
      imagemin.svgo()
    ]))
    .pipe(changed(path.dist))
    .pipe(gulp.dest(path.dist))
    done()
});

// distフォルダ削除
gulp.task("clean", done => {
  del([path.dist, "!" + path.src], {force:true})
  done()
});

// watch
gulp.task("watch", done => {
  const browserreload = done => {
      browsersync.reload()
      done()
  }
  gulp.watch(path.src + "/**/*.html", gulp.parallel("html", browserreload));
  gulp.watch(path.src + "/**/*.scss", gulp.parallel("sass", browserreload));
  gulp.watch(path.src + "/**/*.js", gulp.parallel("js", browserreload));
  gulp.watch(path.src + "/**/*.{png,jpg,gif,svg}", gulp.parallel("image", browserreload));
  done()
});

gulp.task("default", gulp.parallel("clean", "browser", "watch", "html", "sass", "js", "image"));