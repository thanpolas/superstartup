/*jshint camelcase:false */
/**
 * [exports description]
 * @param  {[type]} grunt [description]
 * @return {[type]}       [description]
 */
module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-closure-tools');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');

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
          root_with_prefix: ['"test/bdd ../../../../../test/bdd"']
        },
        dest: 'test/bdd/deps-test-bdd.js'
      }
    },
    closureBuilder: {
      options: {
        closureLibraryPath: 'closure-library',
        inputs: ['src/main.js'],
        compile: true,
        compilerFile: 'build/closure_compiler/sscompiler.jar'

      },

      superstartup: {
        options: {
          compilerOpts: {
            compilation_level: 'ADVANCED_OPTIMIZATIONS',
            externs: [externsPath + '*.js'],
            define: [
              "'goog.DEBUG=false'",
              "'ss.STANDALONE=false'"
              ],
            warning_level: 'verbose',
            jscomp_off: ['checkTypes', 'fileoverviewTags'],
            summary_detail_level: 3,
            only_closure_dependencies: null,
            closure_entry_point: 'ss',
            output_wrapper: '(function(){%output%}).call(this);'
          }
        },
        src: ['src', 'closure-library'],
        dest: 'dist/superstartup.min.js'


      }
    },

    /**
     *
     * TESTING
     *
     */
    connect: {
      test: {
        options: {
          port: 4242,
          base: './',
          keepalive: false
        }
      }
    },

    mochaPhantom: 'node_modules/mocha-phantomjs/bin/mocha-phantomjs ' +
      'http://localhost:4242/test/bdd/index.html',

    shell: {
      options: {
        stdout: true
      },
      mochaPhantom: {
          command: '<%= mochaPhantom %> -R spec'
      },
      mochaPhantomMin: {
          command: '<%= mochaPhantom %> -R min'
      }
    }
  });

  grunt.registerTask('test', ['connect:test', 'shell:mochaPhantom']);
  grunt.registerTask('test:min', 'Test using mocha-phantom min Reporter', 'shell:mochaPhantomMin');
  grunt.registerTask('deps', 'closureDepsWriter');

  // Default task.
  grunt.registerTask('default', 'closureDepsWriter');

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
