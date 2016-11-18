module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-include-source');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            controller: {
                options: {
                    beautify: true
                },
                files: [{
                    src: [
                        'js/app/*.js',
                        'js/app/**/*.js'
                        ],
                    dest: 'js/keyboard.app.js'
                }]
            },
        },
        compass: {
            dist: {
                options: {
                    sassDir: 'scss/',
                    cssDir: 'css/'
                }
            }
        },
        watch: {
          scripts: {
            files: [
                'js/app/*.js',
                'js/app/**/*.js',
                'scss/*',
            ],
            tasks: ['uglify', 'compass'],
            options: {
              debounceDelay: 250
            }
          }
        },
        app: {
            // Application variables
            scripts: [
                // JS files to be included by includeSource task into index.html
                'js/app/*.js',
            ]
        }
    });

    grunt.registerTask('build', [
        'uglify',
        'compass'
    ]);
};
