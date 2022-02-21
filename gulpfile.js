const { src, dest, series, watch } = require('gulp'); // 
const autoprefixer = require('gulp-autoprefixer'); // расставляет префиксы браузеров для некоторый свойств css
const babel = require('gulp-babel'); // компилятор, преобразует js в совместимый с браузерами
const cleanCSS = require('gulp-clean-css'); // минификация файлов *.css (удаление пробелов/комментов)
const uglify = require('gulp-uglify-es').default; // для минификации файлов js
const del = require('del'); // очистка сгенерированных файлов (создали какую-то страницу, чет там написали, решили стереть, а она осталась в папке продакшена. И вот ее надо снова удалить)
const browserSync = require('browser-sync').create(); // открытие страниц сайта с использованием локального сервера и настройкой автоматической перезагрузкой страниц при изменениях
const sass = require('gulp-sass')(require('sass'));; // 
const svgSprite = require('gulp-svg-sprite'); //преобразование svg в спрайт
const fileInclude = require('gulp-file-include'); // позволяет писать компоненты сайта в отдельной папке и потом подключать их на страницу и переиспользовать
const sourcemaps = require('gulp-sourcemaps'); // отражает, что было и что стало с файлами при преобразовании. (пример: после минификации соурсмап позволяет посмотреть реальную структуру фалйов)
const rev = require('gulp-rev'); // помогает проверить код до его публикации ?
const revRewrite = require('gulp-rev-rewrite');
const revDel = require('gulp-rev-delete-original'); // удаляет исходный файл, перезаписанный при помощи rev
const htmlmin = require('gulp-htmlmin'); // минификация файла *.html - удаление пробелова, комментов и прочего
const gulpif = require('gulp-if'); // возможность установки условия. Н/р, если сайт в разработке - добавляем соурсмап, а если в продакшене - удаляем его и т.д.
const notify = require('gulp-notify'); // выводит уведомления на рабочий стол
const image = import('gulp-image'); // оптимизация изображений
const { readFileSync } = require('fs');
const concat = require('gulp-concat'); // объединяет все файлы какого-либо формата в один того же формата

let isProd = false; // dev by default

// удаление все из папки продакшена 
const clean = () => {
  return del(['app/*'])
}

//создание svg-спрайтов
const svgSprites = () => {
  return src('./src/img/svg/**.svg')
    .pipe(svgSprite({
      mode: {
        stack: {
          sprite: "../sprite.svg" //название файла спрайта
        }
      },
    }))
    .pipe(dest('./app/img'));
}

const styles = () => {
  return src('./src/scss/**/*.scss')
    .pipe(gulpif(!isProd, sourcemaps.init()))
    .pipe(sass().on("error", notify.onError()))
    .pipe(autoprefixer({
      cascade: false,
    }))
    .pipe(gulpif(isProd, cleanCSS({ level: 2 })))
    .pipe(gulpif(!isProd, sourcemaps.write('.')))
    .pipe(dest('./app/css/'))
    .pipe(browserSync.stream());
};

const stylesBackend = () => {
  return src('./src/scss/**/*.scss')
    .pipe(sass().on("error", notify.onError()))
    .pipe(autoprefixer({
      cascade: false,
    }))
    .pipe(dest('./app/css/'))
};

const scripts = () => {
  src('./src/js/vendor/**.js')
    .pipe(concat('vendor.js'))
    .pipe(gulpif(isProd, uglify().on("error", notify.onError())))
    .pipe(dest('./app/js/'))
  return src(
    ['./src/js/global.js', './src/js/components/**.js', './src/js/main.js'])
    .pipe(gulpif(!isProd, sourcemaps.init()))
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(concat('main.js'))
    .pipe(gulpif(isProd, uglify().on("error", notify.onError())))
    .pipe(gulpif(!isProd, sourcemaps.write('.')))
    .pipe(dest('./app/js'))
    .pipe(browserSync.stream());
}
const scriptsBackend = () => {
  src('./src/js/vendor/**.js')
    .pipe(concat('vendor.js'))
    .pipe(gulpif(isProd, uglify().on("error", notify.onError())))
    .pipe(dest('./app/js/'))
  return src(['./src/js/functions/**.js', './src/js/components/**.js', './src/js/main.js'])
    .pipe(dest('./app/js'))
};

const resources = () => {
  return src('./src/resources/**')
    .pipe(dest('./app'))
}

const images = () => {
  return src([
    './src/img/**.jpg',
    './src/img/**.png',
    './src/img/**.jpeg',
    './src/img/*.svg',
    './src/img/**/*.jpg',
    './src/img/**/*.png',
    './src/img/**/*.jpeg',
    './src/img/**/*.svg'
  ])
    .pipe(gulpif(isProd, image))
    .pipe(dest('./app/img'))
};

const htmlInclude = () => {
  return src(['./src/*.html'])
    .pipe(fileInclude({
      prefix: '@',
      basepath: '@file'
    }))
    .pipe(dest('./app'))
    .pipe(browserSync.stream());
}

const watchFiles = () => {
  browserSync.init({
    server: {
      baseDir: "./app"
    },
  });

  watch('./src/scss/**/*.scss', styles);
  watch('./src/js/**/*.js', scripts);
  watch('./src/partials/*.html', htmlInclude);
  watch('./src/*.html', htmlInclude);
  watch('./src/resources/**', resources);
  watch('./src/img/*.{jpg,jpeg,png,svg}', images);
  watch('./src/img/**/*.{jpg,jpeg,png,svg}', images);
  watch('./src/img/svg/**.svg', svgSprites);
}

const cache = () => {
  return src('app/**/*.{css,js,svg,png,jpg,jpeg,woff2}', {
    base: 'app'
  })
    .pipe(rev())
    .pipe(revDel())
    .pipe(dest('app'))
    .pipe(rev.manifest('rev.json'))
    .pipe(dest('app'));
};

const rewrite = () => {
  const manifest = readFileSync('app/rev.json');
  src('app/css/*.css')
    .pipe(revRewrite({
      manifest
    }))
    .pipe(dest('app/css'));
  return src('app/**/*.html')
    .pipe(revRewrite({
      manifest
    }))
    .pipe(dest('app'));
}

const htmlMinify = () => {
  return src('app/**/*.html')
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(dest('app'));
}

const toProd = (done) => {
  isProd = true;
  done();
};

exports.default = series(clean, htmlInclude, scripts, styles, resources, images, svgSprites, watchFiles);

exports.build = series(toProd, clean, htmlInclude, scripts, styles, resources, images, svgSprites, htmlMinify);

exports.cache = series(cache, rewrite);

exports.backend = series(toProd, clean, htmlInclude, scriptsBackend, stylesBackend, resources, images, svgSprites);