/**
 * [exports description]
 * @param  {[type]} grunt [description]
 * @return {[type]}       [description]
 */
module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-closure-tools');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-watch');

  var externsPath = 'build/externs/';
  // don't put the extension here
  var debugFile = 'lib/helpers/debug';

  // Project configuration.
  grunt.initConfig({
    closureDepsWriter: {
      options: {
        closureLibraryPath: 'closure-library/'

      },
      ss: {
        options: {
          root_with_prefix: ['"lib ../../../lib"']
        },
        dest: 'lib/deps-superstartup.js'
      },
      test: {
        options: {
          root_with_prefix: ['"test ../../../../test"']
        },
        dest: 'test/bdd/deps-test.js'
      }
    },
    closureBuilder: {
      options: {
        closureLibraryPath: 'closure-library',
        inputs: ['lib/main.js'],
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
        src: ['lib', 'closure-library'],
        dest: 'dist/superstartup.min.js'


      }
    },

    /**
     *
     * TESTING
     *
     */
    mochaPhantom: 'node_modules/mocha-phantomjs/bin/mocha-phantomjs test/bdd/mocha.html',

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

  grunt.registerTask('test', 'Test using mocha-phantom', 'shell:mochaPhantom');
  grunt.registerTask('test:min', 'Test using mocha-phantom min Reporter', 'shell:mochaPhantomMin');

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
