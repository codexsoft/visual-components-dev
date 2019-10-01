// const filter = require('gulp-filter');
const gulp = require('gulp');
const replace = require('gulp-replace');
const path = require('path');
const rename = require('gulp-rename');
const autoprefixer = require('gulp-autoprefixer');
const foreach = require('gulp-foreach');
const less = require('gulp-less');
const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');

function componentsLessWatch( pathToComponents ) {

    gulp.watch([
        pathToComponents+'/**/style.less'
    ], function(file) {

        var classname = path.basename(path.dirname(file.path));
        console.log('Recompiling styles of component '+classname);
        console.log(classname);
        // console.log(pathToComponents+'/'+classname);

        gulp.src(file.path)

            // /*

            /*
            .pipe(foreach(function(stream, file){

                // var classname = path.basename(path.dirname(file.path));
                // console.log(classname);

                return stream
                    .pipe(replace('\\\\style', 'div.VisualComponent.'+classname))
                    .pipe(replace('\\\\container', 'div.CONTAINER_'+classname))
                    .pipe(replace('\\\\body', 'body.BODY_'+classname))
                    ;
            }))
            */

            // */

            // .pipe(replace('\\\\style', 'div.VisualComponent.'+classname))
            // .pipe(replace('\\\\container', 'div.CONTAINER_'+classname))
            // .pipe(replace('\\\\body', 'body.BODY_'+classname))

            .pipe(less())
            .pipe(autoprefixer({
                browsers: ['last 20 versions'],
                cascade: false
            }))
            .pipe(cleanCSS())
            // .pipe(cleanCSS({compatibility: 'ie8'}))
            .pipe(rename({extname: '.css'}))
            // .pipe(concat('concat.css'))
            .pipe(gulp.dest(pathToComponents+'/'+classname));

        // copy assets
        // gulp.src(file.path, { base: source.themes })
        //     .pipe(gulpif(config.hasPermission, chmod(config.permission)))
        //     .pipe(gulp.dest(output.themes))
        //     .pipe(print(log.created))
        // ;
    })
    ;



}

function componentsLessCompile( pathToComponents ) {

    // exit('asdfff');

    gulp.src(pathToComponents+'/**/*.less', () => {
        console.log('asdf');
    })

        // /*
        .pipe(foreach(function(stream, file){

            var classname = path.basename(path.dirname(file.path));
            console.log(classname);

            return stream
                .pipe(replace('\\\\style', 'div.VisualComponent.'+classname))
                .pipe(replace('\\\\container', 'div.CONTAINER_'+classname))
                .pipe(replace('\\\\body', 'body.BODY_'+classname))
                ;
        }))
        // */

        .pipe(less())
        .pipe(autoprefixer({
            // browsers: ['last 20 versions'],
            cascade: false
        }))
        .pipe(cleanCSS())
        // .pipe(cleanCSS({compatibility: 'ie8'}))
        // .pipe(rename({extname: '.css'}))
        .pipe(concat('concat.css'))
        .pipe(gulp.dest(pathToComponents));

}

gulp.task('compileComponentsStyles',function(){
    return componentsLessCompile('./src/components');
});

gulp.task('watchComponentsStyles',function(){
    return componentsLessWatch('./src/components');
});

// Default Task
gulp.task('default', gulp.series('compileComponentsStyles'));
// gulp.task('default', ['componentsLessWatch']);
// gulp.task('default', [componentsLessWatch]);