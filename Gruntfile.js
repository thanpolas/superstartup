/*jshint camelcase:false */

var compiler = require('superstartup-closure-compiler'),
    path     = require('path');

/**
 * [exports description]
 * @param  {[type]} grunt [description]
 * @return {[type]}       [description]
 */
module.exports = function(grunt) {

  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  var lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;

  var folderMount = function folderMount(connect, point) {
    return connect.static(path.resolve(point));
  };


  var externsPath = 'build/externs/';
  // don't put the extension here
  var debugFile = 'src/helpers/debug';

  // Project configuration.
  grunt.initConfig({
    closureDepsWriter: {
      options: {
        closureLibraryPath: 'closure-library/'

      },
      ss: {
        options: {
          root_with_prefix: ['"src ../../../src"']
        },
        dest: 'src/deps-superstartup.js'
      },
      bddTest: {
        options: {
          root_with_prefix: ['"test ../../../../../test"']
        },
        dest: 'test/bdd/deps-test-bdd.js'
      },
      tddTest: {
        options: {
          root_with_prefix: ['"test ../../../../../test"']
        },
        dest: 'test/unit/deps-test-tdd.js'
      }
    },
    closureBuilder: {
      options: {
        closureLibraryPath: 'closure-library',
        inputs: ['src/main.js'],
        compile: true,
        compilerFile: compiler.getPathSS()

      },

      superstartup: {
        options: {
          compilerOpts: {
            compilation_level: 'ADVANCED_OPTIMIZATIONS',
            externs: [externsPath + '*.js', externsPath + 'when.externs.js'],
            define: [
              '\'goog.DEBUG=false\'',
              '\'ss.STANDALONE=false\''
            ],
            warning_level: 'verbose',
            jscomp_off: ['checkTypes', 'fileoverviewTags'],
            summary_detail_level: 3,
            only_closure_dependencies: null,
            closure_entry_point: 'ssd',
            // output_wrapper: '(function(){%output%}).call(this);',
            formatting: 'PRETTY_PRINT',
            debug: null
          }
        },
        src: ['src', 'closure-library'],
        dest: 'dist/superstartup.min.js'


      }
    },



    /**
     * Live Reload
     *
     */
    regarde: {
      compiled: {
        files: ['src/**/*.js'],
        tasks: ['build','livereload']
      },
      dev: {
        files: ['src/**/*.js', 'test/bdd/**/*.js'],
        tasks:['livereload']
      }
    },
    connect: {
      livereload: {
        options: {
          port: 9001,
          middleware: function(connect) {
            return [lrSnippet, folderMount(connect, '.')];
          }
        }
      },
      test: {
        options: {
          port: 4242,
          base: './',
          keepalive: false
        }
      }
    },
    //
    // watch is not yet compatible with livereload
    //
    watch: {
      test: {
        options: {
          nospawn: true
        },
        files: ['src/**/*.js'],
        tasks: ['build']
      }
    },
    open: {
      server: {
        path: 'http://localhost:<%= connect.livereload.options.port %>/test/bdd'
      }
    },




    /**
     *
     * TESTING
     *
     */

    mochaPhantom: 'node_modules/mocha-phantomjs/bin/mocha-phantomjs ' +
      'http://localhost:<%= connect.test.options.port %>/test/',

    mocha: {
      options: {
        run: true
      },
      bdd: {
        options: {
          urls: ['http://localhost:<%= connect.test.options.port %>/test/bdd/']
        }
      },
      bddCompiled: {
        urls: ['http://localhost:<%= connect.test.options.port %>/test/bdd/' +
          'index.html?compiled=true']
      },
      unit: {
        options: {
          urls: ['http://localhost:<%= connect.test.options.port %>/test/unit/']
        }
      }
    }
  });

  grunt.registerTask('test', [
    'connect:test',
    'mocha:bdd'
    // 'shell:mochaPhantomUnit',
    // 'shell:mochaPhantom',
    // 'shell:mochaPhantomCompiled'
  ]);

  grunt.registerTask('deps', 'closureDepsWriter');
  grunt.registerTask('build', 'closureBuilder:superstartup');
  grunt.registerTask('server', [
    'livereload-start',
    'connect:livereload',
    'open:server',
    'regarde:dev'
  ]);

  grunt.registerTask('server:compiled', [
    'livereload-start',
    'connect:livereload',
    'open:server',
    'regarde:compiled'
  ]);

  // Default task.
  grunt.registerTask('default', 'test');

  grunt.registerTask('compile', 'debugOff closureBuilder:superstartup debugOn');

  // "Turn off" the debug file. Remove requirements to
  // goog debug libraries
  grunt.registerTask('debugOff', 'Replace debug file with an empty one', function(){
    var content = 'goog.provide("ss.debug");';

    // execute the task
    grunt.file.write(debugFile + '.js', content);
  });

  // restore the debug file
  grunt.registerTask('debugOn', 'Restore debug file', function(){
    grunt.file.copy(debugFile + '.bak', debugFile + '.js');
  });

};
