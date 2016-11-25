
app.config(["$stateProvider", "$locationProvider", "$mdThemingProvider", function($stateProvider, $locationProvider, $mdThemingProvider) {
  var customPrimary = {
         '50': '#8eb7c3',
         '100': '#7eacba',
         '200': '#6da1b1',
         '300': '#5d97a8',
         '400': '#52899a',
         '500': '#497A89',
         '600': '#406b78',
         '700': '#375c68',
         '800': '#2e4e57',
         '900': '#263f46',
         'A100': '#9fc1cc',
         'A200': '#b0ccd5',
         'A400': '#c0d7de',
         'A700': '#1d3036'
     };
    $mdThemingProvider
        .definePalette('customPrimary',
                        customPrimary);

    var customAccent = {
        '50': '#142125',
        '100': '#1d3036',
        '200': '#263f46',
        '300': '#2e4e57',
        '400': '#375c68',
        '500': '#406b78',
        '600': '#52899a',
        '700': '#5d97a8',
        '800': '#6da1b1',
        '900': '#7eacba',
        'A100': '#52899a',
        'A200': '#497a89',
        'A400': '#406b78',
        'A700': '#8eb7c3'
    };
    $mdThemingProvider
        .definePalette('customAccent',
                        customAccent);

    var customWarn = {
        '50': '#ffb280',
        '100': '#ffa266',
        '200': '#ff934d',
        '300': '#ff8333',
        '400': '#ff741a',
        '500': '#ff6400',
        '600': '#e65a00',
        '700': '#cc5000',
        '800': '#b34600',
        '900': '#993c00',
        'A100': '#ffc199',
        'A200': '#ffd1b3',
        'A400': '#ffe0cc',
        'A700': '#803200'
    };
    $mdThemingProvider
        .definePalette('customWarn',
                        customWarn);

    var customBackground = {
        '50': '#587487',
        '100': '#4e6778',
        '200': '#445a68',
        '300': '#3a4d59',
        '400': '#303f49',
        '500': '#26323a',
        '600': '#1c252b',
        '700': '#12171b',
        '800': '#282e31',
        '900': '#000000',
        'A100': '#303f49',
        'A200': '#718ea2',
        'A400': '#1c252b',
        'A700': '#000000'
    };
     $mdThemingProvider
         .definePalette('customBackground',
                         customBackground);

    $mdThemingProvider.theme('default')
        .primaryPalette('customPrimary')
        .accentPalette('customAccent')
        .warnPalette('customWarn')
        .backgroundPalette('customBackground').dark();


}]);