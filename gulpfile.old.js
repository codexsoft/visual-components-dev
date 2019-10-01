// const ts = require('gulp-typescript');
// const dest = require('gulp-dest');
// const tap = require('gulp-tap');

const filter = require('gulp-filter');
const ts = require('gulp-typescript');
const gulp = require('gulp');
const replace = require('gulp-replace');
const path = require('path');
const rename = require('gulp-rename');
const autoprefixer = require('gulp-autoprefixer');
const foreach = require('gulp-foreach');
const less = require('gulp-less');
const cleanCSS = require('gulp-clean-css');

function fluidableLessCompile( pathToComponents ) {

    gulp.src(pathToComponents+'/fluidable.less')
        .pipe(less())
        .pipe(autoprefixer({
            browsers: ['last 20 versions'],
            cascade: false
        }))
        .pipe(cleanCSS())
        // .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(rename({extname: '.css'}))
        .pipe(gulp.dest(pathToComponents));
        // .pipe(gulp.dest(pathToComponents+'/dist'));

}

function uikitLessCompile( pathToComponents ) {

    gulp.src(pathToComponents+'/uikit.less')
        .pipe(less())
        .pipe(autoprefixer({
            browsers: ['last 20 versions'],
            cascade: false
        }))
        .pipe(cleanCSS())
        // .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(rename({extname: '.css'}))
        .pipe(gulp.dest(pathToComponents+'/dist'));

}

function componentsLessWatch( pathToComponents ) {

    gulp.watch([
        pathToComponents+'/**/style.less'
    ], function(file) {

        var classname = path.basename(path.dirname(file.path));
        console.log('Recompiling styles of component '+classname);
        // console.log(classname);
        // console.log(pathToComponents+'/'+classname);

        gulp.src(file.path)

            // /*
            .pipe(foreach(function(stream, file){

                // var classname = path.basename(path.dirname(file.path));
                // console.log(classname);

                return stream
                    .pipe(replace('\\\\style', 'div.VisualComponent.'+classname))
                    .pipe(replace('\\\\container', 'div.CONTAINER_'+classname))
                    .pipe(replace('\\\\body', 'body.BODY_'+classname))
                    ;
            }))
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

    gulp.src(pathToComponents+'/**/style.less')

        .pipe(foreach(function(stream, file){

            var classname = path.basename(path.dirname(file.path));
            console.log(classname);

            return stream
                .pipe(replace('\\\\style', 'div.VisualComponent.'+classname))
                .pipe(replace('\\\\container', 'div.CONTAINER_'+classname))
                .pipe(replace('\\\\body', 'body.BODY_'+classname))
                ;
        }))

        .pipe(less())
        .pipe(autoprefixer({
            browsers: ['last 20 versions'],
            cascade: false
        }))
        .pipe(cleanCSS())
        // .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(rename({extname: '.css'}))
        .pipe(gulp.dest(pathToComponents));

}

function buildApp( appName, verMain, verMiddle, copyInto ) {

    verMain = verMain || 1;
    verMiddle = verMiddle || 0;
    copyInto = copyInto || null;
    var verMinor = Math.floor( Date.now()/10000 );
    const jsFilter = filter('**/*.js', {restore: true});

    var appDir = './src/frontend/'+appName+'/';
    var verDir = String( verMain )+'.'+String(verMiddle)+'.'+String(verMinor);
    console.log('Building '+appName+' version: '+verDir);
    var distDir = './dist/frontend/'+appName+'/'+verDir;

    // return gulp.src([
    var process = gulp.src([
        "./src/assets/**/*.d.ts",
        appDir+'__compiler.d.ts',
        appDir+"**/*.ts",
        appDir+"**/*.tsx"
    ])
        .pipe(ts({
            "sourceMap": true,
            "target": "es5",
            "removeComments": true,
            "pretty": true,
            "jsx": "react",
            "declaration": true,
            // "jsxFactory": "le.components.renderElement",
            "jsxFactory": "Array",
            "outFile": 'bundle.js'
        }))
        .pipe(gulp.dest(distDir));

    if ( copyInto )
        process.pipe(jsFilter).pipe(gulp.dest(copyInto));

    return process;

}

gulp.task('buildLiquidEngineCore',function(){
    return buildApp('LiquidEngineCore', 1, 0, "./src/assets/LiquidEngineCore/dist");
    // return buildApp('LiquidEngineCore', 1, 0, 'test3');
});

gulp.task('buildPravo70',function(){
    return buildApp('Pravo70', 1, 0, "./src/assets/Pravo70/dist");
    // return buildApp('LiquidEngineCore', 1, 0, 'test3');
});

gulp.task('buildKitchensAndCupboardsApp',function(){
    return buildApp('KitchensAndCupboardsApp', 1, 0, "./src/assets/KitchensAndCupboardsApp/dist");
});

gulp.task('buildVkusnika',function(){
    return buildApp('Vkusnika', 1, 0, "./src/assets/Vkusnika/dist");
});

gulp.task('buildDetskiy',function(){
    return buildApp('Detskiy', 1, 0, "./src/assets/Detskiy/dist");
});

gulp.task('buildTerminal',function(){
    return buildApp('Terminal', 1, 0, "./src/assets/Terminal/dist");
});

gulp.task('compileComponentsStyles',function(){
    return componentsLessCompile('./src/components');
});

// todo: export css to asset bundle
gulp.task('compileUiKit',function(){
    return uikitLessCompile('./src/frontend/uikit/less');
});

gulp.task('compileFluidable',function(){
    return fluidableLessCompile('./src/frontend/fluidable');
});

gulp.task('watchComponentsStyles',function(){
    return componentsLessWatch('./src/components');
});



// Default Task
gulp.task('default', ['build']);