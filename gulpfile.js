let production=require('path').basename(__dirname);
let source_folder='app';

let fs = require('fs');

let path={
    vendor: {
        js: 'app/js/libs/',
        css: 'app/css/libs/'
    },
    build:{
        html:production + '/',
        css:production + '/css/',
        libs_css:production + '/css/libs',
        js:production + '/js/',
        libs_js:production + '/js/libs/',
        img:production + '/img/',
        fonts:production + '/fonts/',
    },
    src:{
        html:[source_folder + '/*.html', '!' + source_folder + '/_*.html'],
        css:source_folder + '/scss/main.scss',
        libs_css: source_folder + '/css/libs/*.css',
        js:[source_folder + '/js/main.js', '!' + source_folder + '/js/_*.js'],
        libs_js: source_folder + '/js/libs/*.js',
        img:source_folder + '/img/**/*.{jpg,png,svg,gif,ico,webp}',
        fonts:source_folder + '/fonts/*.ttf',
    },
    watch:{
        html:source_folder + '/**/*.html',
        css:source_folder + '/scss/**/*.scss',
        libs_css:production + '/css/libs/*.css',
        js:source_folder + '/js/**/*.js',
        libs_js:production + '/js/libs/*.js',
        img:source_folder + '/img/**/*.{jpg,png,svg,gif,ico,webp}',
    },
    clean: './' + production
}

let {src, dest} = require('gulp'),
    gulp = require('gulp'),
    browsersync = require('browser-sync').create(),
    mainBowerFiles = require('main-bower-files'),
    fileinclude = require('gulp-file-include'),
    del = require('del'),
    scss = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    group_media = require('gulp-group-css-media-queries'),
    clean_css = require('gulp-clean-css'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify-es').default,
    babel = require('gulp-babel'),
    imagemin = require('gulp-imagemin'),
    webp = require('gulp-webp'),
    webp_html = require('gulp-webp-html'),
    webp_css = require('gulp-webpcss'),
    svgSprite = require('gulp-svg-sprite'),
    ttf2woff = require('gulp-ttf2woff'),
    ttf2woff2 = require('gulp-ttf2woff2'),
    fonter = require('gulp-fonter');


function browserSync() {
    browsersync.init({
        server:{
            baseDir: './' + production + '/'
        },
        port: 3000,
        notify: false,
        logPrefix: 'DomWeb'
    })
}

function html() {
    return src(path.src.html)
        .pipe(fileinclude())
        .pipe(webp_html())
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream())
}

function css() {
    return src(path.src.css)
        .pipe(
            scss({
                outputStyle: 'expanded'
            })
        )
        .pipe(webp_css())
        .pipe(group_media())
        .pipe(
            autoprefixer({
                overrideBrowserslist: ['last 5 version'],
                cascade: true
            })
        )
        .pipe(dest(path.build.css))
        .pipe(clean_css())
        .pipe(
            rename({
                extname: '.min.css'
            })
        )
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream())
}

function cssLibs() {
    return src(path.src.libs_css)
        .pipe(clean_css())
        .pipe(
            rename({
                extname: '.min.css'
            })
        )
        .pipe(dest(path.build.libs_css))
        .pipe(browsersync.stream())
}

function js() {
    return src(path.src.js)
        .pipe(fileinclude())
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(dest(path.build.js))
        .pipe(uglify())
        .pipe(
            rename({
                extname: '.min.js'
            })
        )
        .pipe(dest(path.build.js))
        .pipe(browsersync.stream())
}

function jsLibs() {
    return src(path.src.libs_js)
        .pipe(uglify())
        .pipe(
            rename({
                extname: '.min.js'
            })
        )
        .pipe(dest(path.build.libs_js))
        .pipe(browsersync.stream())
}

function images() {
    return src(path.src.img)
        .pipe(
            webp({
                quality: 70
            })
        )
        .pipe(dest(path.build.img))
        .pipe(src(path.src.img))
        .pipe(
            imagemin({
                progressive: true,
                svgoPlugins: [{removeViewBox: false}],
                interlaced: true,
                optimizationLevel: 3 // 0 to 7
            })
        )
        .pipe(dest(path.build.img))
        .pipe(browsersync.stream())
}

function fonts() {
    src(path.src.fonts)
        .pipe(ttf2woff())
        .pipe(dest(path.build.fonts));
    return src(path.src.fonts)
        .pipe(ttf2woff2())
        .pipe(dest(path.build.fonts));
}

gulp.task('otf2ttf', function () {
   return src([source_folder + '/fonts/*.otf'])
       .pipe(fonter({
           formats: ['ttf']
       }))
       .pipe(dest(source_folder + '/fonts/'));
});

gulp.task('svgSprite', function () {
    return gulp.src([source_folder + '/img/icons/*.svg'])
        .pipe(svgSprite({
            mode: {
                stack: {
                    sprite: '../icons/sprite.svg',
                    example: true
                }
            },
        }))
        .pipe(dest(path.build.img));
})

gulp.task('libs', function () {
    gulp.src(mainBowerFiles('**/*.js'))
        .pipe(gulp.dest(path.vendor.js))
    return gulp.src(mainBowerFiles('**/*.css'))
        .pipe(gulp.dest(path.vendor.css))
});

gulp.task('cleanDist', function () {
    return del(path.clean)
})

function fontsStyle() {

    let file_content = fs.readFileSync(source_folder + '/scss/_fonts.scss');
    if (file_content == '') {
        fs.writeFile(source_folder + '/scss/_fonts.scss', '', cb);
        return fs.readdir(path.build.fonts, function (err, items) {
            if (items) {
                let c_fontname;
                for (var i = 0; i < items.length; i++) {
                    let fontname = items[i].split('.');
                    fontname = fontname[0];
                    if (c_fontname != fontname) {
                        fs.appendFile(source_folder + '/scss/_fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
                    }
                    c_fontname = fontname;
                }
            }
        })
    }
}

function cb() { }

function watchFiles() {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.libs_css], cssLibs);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.libs_js], jsLibs);
    gulp.watch([path.watch.img], images);
}

function clean() {
    return del(path.clean)
}

let build = gulp.series(clean, gulp.parallel(images, js, jsLibs, css, cssLibs, html, fonts), fontsStyle);
let watch = gulp.parallel(build, watchFiles, browserSync);

exports.fontsStyle = fontsStyle;
exports.fonts = fonts;
exports.images = images;
exports.js = js;
exports.jsLibs = jsLibs;
exports.css = css;
exports.cssLibs = cssLibs;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;
