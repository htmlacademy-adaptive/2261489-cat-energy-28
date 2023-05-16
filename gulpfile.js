import gulp from 'gulp';
import plumber from 'gulp-plumber';
import less from 'gulp-less';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import htmlmin from 'gulp-htmlmin';
import csso from 'postcss-csso';
import rename from 'gulp-rename';
import terser from 'gulp-terser';
import squoosh from 'gulp-libsquoosh';
import webp from 'gulp-webp'
import svgo from 'gulp-svgmin';
import { stacksvg } from "gulp-stacksvg";
import {deleteAsync} from 'del';
import browser from 'browser-sync';




// Styles + autoprefix + minify
export const styles = () => {
  return gulp.src('source/less/style.less', { sourcemaps: true })
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
    .pipe(browser.stream());
}

// Minify HTML
const minHTML = () => {
  return gulp.src('source/*.html')
  .pipe(htmlmin({ collapseWhitespace: true }))
  .pipe(gulp.dest('build'));
}

// Minify JS
const minJS = () => {
  return gulp.src('source/js/*.js')
  .pipe(terser())
  .pipe(gulp.dest('build/js'));
}

// Scripts

const scripts = () => {
  return gulp.src('source/js/script.js')
  .pipe(gulp.dest('build/js'))
  .pipe(browser.stream());
  }

// Optimize Images
const optimizeImages = () => {
  return gulp.src('source/img/**/*.{jpg,png}')
  .pipe(squoosh())
  .pipe(gulp.dest('build/img'));
}

// Copy Images
const copyImages = () => {
  return gulp.src('source/img/**/*.{jpg,png,svg}')
  .pipe(gulp.dest('build/img'));
}

// Create Webp
const createWebp = () => {
  return gulp.src('source/img/**/*.{jpg,png}')
  .pipe(webp({quality: 90}))
  .pipe(gulp.dest('build/img'));
  }

// Optimize SVG
export const optimizeSVG = () => {
  return gulp.src(['source/img/*.svg',  '!source/img/icons/*.svg'])
  .pipe(svgo())
  .pipe(gulp.dest('build/img'));
  }

// Create Stack
const createStack = () => {
  return gulp.src('source/img/icons/*.svg')
  .pipe(stacksvg({ output: `stack` }))
  .pipe(gulp.dest('build/img/icons'));
}

// Copy Fonts&Favicons
export const copy = (done) => {
 gulp.src([
  'source/fonts/**/*.{woff2,woff}',
  'source/*.ico',
  'source/img/favicons/*.{svg,png}',
  'source/*.webmanifest'],
  {
    base: 'source'
  })
  .pipe(gulp.dest('build'))
  done();
}

// Clean
const clean = () => {
  return deleteAsync('build');
}


// Server
const server = (done) => {
  browser.init({
  server: {
  baseDir: 'build'   /*!!!!!!!*/
  },
    cors: true,
    notify: false,
    ui: false,
    browser: ['chrome', 'firefox']
  });
  done();
}

// Server
const reload = (done) => {
  sync.reload();
done();
}

// Watcher
const watcher = () => {
  gulp.watch('source/less/**/*.less', gulp.series(styles));
  gulp.watch('source/js/script.js', gulp.series(scripts));
  gulp.watch('source/*.html').on('change', browser.reload);
}

// Build
export const build = gulp.series(
  clean,
  copy,
  optimizeSVG,
  optimizeImages,
  gulp.parallel(
    styles,
    minHTML,
    scripts,
    minJS,
    createStack,
    createWebp
  ),
)


export default gulp.series(
  clean,
  copy,
  copyImages,
  gulp.parallel(
    styles,
    minHTML,
    scripts,
    minJS,
    createStack,
    createWebp
  ),
  gulp.series(
      server,
      watcher
  )
)
