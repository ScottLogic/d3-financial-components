/* global module, require */
var tinySSG = require('tiny-ssg');
var process = require('process');
var handlebars = require('handlebars');

module.exports = function(grunt) {
    'use strict';

    require('time-grunt')(grunt);

    var browserstackKey = process.env.BROWSERSTACK_KEY;

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        meta: {
            metaJsFiles: [
                'Gruntfile.js'
            ],
            componentsJsFiles: [
                'src/*/**/*.js'
            ],
            componentsCssFiles: [
                'src/**/*.css'
            ],
            testJsFiles: [
                'tests/**/*Spec.js'
            ],
            visualTestJsFiles: [
                'visual-tests/**/*.js',
                '!visual-tests/assets/**/*.js'
            ],
            ourJsFiles: [
                '<%= meta.metaJsFiles %>',
                '<%= meta.componentsJsFiles %>',
                '<%= meta.testJsFiles %>',
                '<%= meta.visualTestJsFiles %>'
            ]
        },

        webdriver: {
            test: {
                configFile: './webdriver-tests/wdio.conf.js'
            }
        },

        'browserstacktunnel-wrapper': {
            options: {
                key: browserstackKey,
                hosts: [{
                    name: 'localhost',
                    port: 8000,
                    sslFlag: 0
                },
                {
                    name: 'localhost',
                    port: 9000,
                    sslFlag: 0
                }],
                forcelocal: true,
                onlyAutomate: true,
                v: true
            }
        },

        concat: {
            options: {
                sourceMap: false
            },
            components: {
                src: [
                    'node_modules/d3/d3.js',
                    'node_modules/css-layout/dist/css-layout.js',
                    'node_modules/d3-svg-legend/d3-legend.js',
                    'node_modules/svg-innerhtml/svg-innerhtml.js',
                    'dist/d3fc.js'
                ],
                dest: 'dist/d3fc.bundle.js'
            },
            site: {
                src: [
                    'dist/d3fc.bundle.js',
                    'node_modules/jquery/dist/jquery.js',
                    'node_modules/bootstrap/js/collapse.js',
                    'site/src/lib/init.js',
                    'site/src/lib/playground.js'
                ],
                dest: 'site/dist/scripts.js'
            }
        },

        connect: {
            options: {
                useAvailablePort: true
            },
            visualTests: {
                options: {
                    base: 'visual-tests',
                    port: 9000
                }
            },
            site: {
                options: {
                    base: 'site/dist'
                }
            }
        },

        copy: {
            visualTests: {
                files: [
                    {
                        expand: true,
                        cwd: 'node_modules/bootstrap/dist/',
                        src: ['**'],
                        dest: 'visual-tests/assets/bootstrap/'
                    },
                    {
                        src: [
                            'node_modules/css-layout/dist/css-layout.js',
                            'node_modules/d3-svg-legend/d3-legend.js',
                            'dist/d3fc.js',
                            'dist/d3fc.css',
                            'node_modules/jquery/dist/jquery.js',
                            'node_modules/d3/d3.js',
                            'node_modules/seedrandom/seedrandom.min.js'],
                        dest: 'visual-tests/assets/',
                        flatten: true,
                        expand: true
                    }
                ]
            },
            site: {
                files: [
                    {
                        expand: true,
                        cwd: 'site/src/',
                        src: ['**/*', '!_*', '!**/*.hbs', '!**/*.md', '!**/*.yml'],
                        dest: 'site/dist/'
                    },
                    {
                        expand: true,
                        cwd: 'dist/',
                        src: ['d3fc.*'],
                        dest: 'site/dist'
                    }
                ]
            }
        },

        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n',
                sourceMap: true
            },
            components: {
                files: {
                    'dist/d3fc.min.js': ['dist/d3fc.js'],
                    'dist/d3fc.bundle.min.js': ['dist/d3fc.bundle.js']
                }
            },
            site: {
                files: {
                    'site/dist/scripts.js': 'site/dist/scripts.js'
                }
            }
        },

        'concat_css': {
            options: {},
            components: {
                src: ['<%= meta.componentsCssFiles %>'],
                dest: 'dist/d3fc.css'
            }
        },

        cssmin: {
            components: {
                files: [{
                    expand: true,
                    cwd: 'dist/',
                    src: ['d3fc.css'],
                    dest: 'dist/',
                    ext: '.min.css'
                }]
            }
        },

        watch: {
            components: {
                files: [
                    '<%= meta.componentsJsFiles %>',
                    '<%= meta.testJsFiles %>',
                    '<%= meta.componentsCssFiles %>'
                ],
                tasks: ['components']
            },
            visualTests: {
                files: [
                    '<%= meta.componentsJsFiles %>',
                    '<%= meta.testJsFiles %>',
                    '<%= meta.componentsCssFiles %>',
                    'visual-tests/**/*',
                    '!visual-tests/assets/**/*'
                ],
                tasks: ['components', 'visualTests'],
                options: {
                    livereload: {
                        port: 36729
                    }
                }
            },
            site: {
                files: [
                    '<%= meta.metaJsFiles %>',
                    'site/src/**/*'
                ],
                tasks: ['site'],
                options: {
                    livereload: {
                        port: 35729
                    }
                }
            },
            options: {
                atBegin: true
            }
        },

        eslint: {
            components: {
                src: ['<%= meta.componentsJsFiles %>']
            },
            test: {
                src: ['<%= meta.testJsFiles %>']
            },
            visualTests: {
                src: ['<%= meta.visualTestJsFiles %>']
            },
            webdriverTests: {
                src: ['webdriver-tests/**Spec.js']
            }
        },

        'jasmine_nodejs': {
            options: {
                reporters: {
                    console: {
                        verbosity: false
                    }
                }
            },
            test: {
                specs: '<%= meta.testJsFiles %>'
            }
        },

        clean: {
            components: ['dist/*', '!dist/README.md'],
            visualTests: ['visual-tests/assets'],
            site: ['site/dist/*']
        },

        version: {
            defaults: {
                src: ['dist/d3fc.js']
            }
        },

        less: {
            site: {
                files: {
                    'site/dist/styles.css': 'site/src/style/styles.less'
                }
            }
        },

        rollup: {
            components: {
                files: {
                    'dist/d3fc.js': ['src/fc.js']
                },
                options: {
                    external: ['css-layout', 'd3', 'd3-svg-legend', 'svg-innerhtml'],
                    format: 'umd',
                    moduleName: 'fc'
                }
            }
        }
    });

    grunt.registerTask('tiny-ssg', 'builds the site', function() {
        var done = this.async();
        var globalData = {
            package: grunt.file.readJSON('package.json')
        };
        process.chdir('site/src');

        // load the helpers required by the site build
        require('handlebars-helpers/lib/helpers/helpers-miscellaneous').register(tinySSG.handlebars);
        require('handlebars-helpers/lib/helpers/helpers-comparisons').register(tinySSG.handlebars);
        require('handlebars-group-by').register(tinySSG.handlebars);

        // load the project-specific helpers
        require('./site/handlebars-helpers/dynamic-include').register(tinySSG.handlebars);
        require('./site/handlebars-helpers/escape').register(tinySSG.handlebars);
        require('./site/handlebars-helpers/codeblock').register(tinySSG.handlebars);
        require('./site/handlebars-helpers/json').register(tinySSG.handlebars);

        //'./components/**/*.md',
        tinySSG.build(['components/**/*.md', 'index.html', 'examples/**/*.md'], '../dist', globalData)
            .then(function() {
                process.chdir('../../');
                done();
            })
            .catch(function(e) {
                process.chdir('../../');
                grunt.fail.warn(e);
            });
    });

    require('jit-grunt')(grunt);

    grunt.registerTask('components', [
        'eslint:components', 'clean:components', 'rollup:components', 'version', 'concat:components',
        'concat_css:components', 'cssmin:components', 'eslint:test', 'jasmine_nodejs:test'
    ]);

    grunt.registerTask('visualTests', [
        'eslint:visualTests', 'clean:visualTests', 'copy:visualTests'
    ]);
    grunt.registerTask('visualTests:serve', ['connect:visualTests', 'watch:visualTests']);

    grunt.registerTask('site', ['clean:site', 'copy:site', 'concat:site', 'less:site', 'tiny-ssg']);
    grunt.registerTask('site:serve', ['connect:site', 'watch:site']);

    grunt.registerTask('webdriverTests:browserstack', browserstackKey ?
        ['connect:site', 'connect:visualTests', 'browserstacktunnel-wrapper', 'webdriver'] : []);
    grunt.registerTask('webdriverTests', ['eslint:webdriverTests', 'webdriverTests:browserstack']);

    grunt.registerTask('ci', ['components', 'uglify:components', 'site',
        'uglify:site', 'visualTests', 'webdriverTests']);

    grunt.registerTask('default', ['watch:components']);
};
