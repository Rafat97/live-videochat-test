const mix = require('laravel-mix');

// mix.js('frontend/js/app.js', 'js')
//    .sass('frontend/scss/app.scss', 'css')
//    .setPublicPath('public');

mix.react('frontend/js/app.js', 'public/js')
    .sass('frontend/scss/app.scss', 'public/css');