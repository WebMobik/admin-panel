const gulp = require("gulp");
const webpack = require("webpack-stream");
const sass = require("gulp-sass");

const dist = '../Openserver/OSPanel/domains/reactAdmin/admin'; // указание пути к компилируемому файлу

gulp.task("copy-html", () => {
    return gulp.src("./public/index.html")
                .pipe(gulp.dest(dist)); // указание файла index.html для компиляции на сервер
});

gulp.task("build-js", () => {
    return gulp.src("./src/index.js")
                .pipe(webpack({
                    mode: 'development',
                    output: {
                        filename: 'script.js'
                    },
                    watch: false,
                    devtool: "source-map",
                    module: {
                        rules: [
                            {
                                test: /\.m?js$/,
                                exclude: /(node_modules|bower_components)/,
                                use: {
                                    loader: 'babel-loader',
                                    options: {
                                        presets: [["@babel/preset-env", {
                                            debug: true,
                                            corejs: 3,
                                            useBuiltIns: "usage"
                                        }],
                                         "@babel/react"]
                                    }
                                }
                            }
                        ]
                    }
                }))
                .pipe(gulp.dest(dist)) // указание настроек к компиляции файла js
})

gulp.task("build-sass", () => {
    return gulp.src("./public/style.scss")
                .pipe(sass().on('error', sass.logError)) // при ошибке компиляции выведем логи (sass.logError)
                .pipe(gulp.dest(dist)) // компиляция sass файла в css
});

gulp.task("copy-api", () => {
    return gulp.src("./api/**/*.*")
                .pipe(gulp.dest(dist + "/api")) // компиляция всех файлов из папки api на сервер
});

gulp.task("copy-assets", () => {
    return gulp.src("./api/**/*.*")
                .pipe(gulp.dest(dist + "/assets")) // компиляция всех файлов из папки assets на сервер
});

gulp.task("watch", () => { // отслеживание компиляции файлов при изменении
    gulp.watch("./public/index.html", gulp.parallel("copy-html"));
    gulp.watch("./src/**/*.js", gulp.parallel("build-js"));
    gulp.watch("./public/**/*.scss", gulp.parallel("build-sass"));
    gulp.watch("./api/**/*.*", gulp.parallel("copy-api"));
    gulp.watch("./assets/**/*.*", gulp.parallel("copy-assets"));
});

// компиляция файлов при запуске gulp
gulp.task("build", gulp.parallel("copy-html", "build-js", "build-sass", "copy-api", "copy-assets"));

// заупуск команды build для компиляции файлов при запуске, затем запуск команды watch для отслеживания
gulp.task("default", gulp.parallel("watch", "build"));