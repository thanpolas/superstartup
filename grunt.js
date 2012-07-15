module.exports = function(grunt) {

  grunt.loadTasks('build/grunt-closure-tools/tasks');

  var externsPath = 'build/externs/';
  // don't put the extension here
  var debugFile = 'source/ss/helpers/debug';

  // Project configuration.
  grunt.initConfig({
    lint: {
      all: ['html/js/init.js', 'html/js/ss/main.js']
    },
    jshint: {
      options: {
            curly: true,
            eqeqeq: false,
            immed: true,
            latedef: true,
            newcap: true,
            noarg: true,
            sub: true,
            undef: true,
            eqnull: true,
            browser: true
          }
    },
    log: {
      foo: [1, 2, 3],
      bar: 'hello world',
      baz: false
    },
    closureDepsWriter: {
      ss: {
        closureLibraryPath: 'source/closure-library/',
        output_file: 'source/deps-ss.js',
        options: {
          root_with_prefix: ['"source/ss ../../../ss"']
        }
      },
      showcase: {
        closureLibraryPath: 'source/closure-library/',
        output_file: 'source/deps-showcase.js',
        options: {
          root_with_prefix: ['"source/showcase ../../../showcase"']
        }
      }
    },
    closureBuilder: {
      superstartup: {
        closureLibraryPath: 'source/closure-library',
        inputs: ['source/ss/main.js'],
        root: ['source/ss', 'source/closure-library'],
        compile: true,
        compiler: 'build/closure_compiler/sscompiler.jar',
        output_file: 'dist/superstartup.min.js',
        compiler_options: {
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

      }
    },
    closureCompiler: {
      target: {
        closureCompiler: 'build/bin/Third-Party/closure_compiler/compiler.jar',
        js: 'source/init.js',
        output_file: 'compiled.js'
      }
    }
  });

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
