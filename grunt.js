module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-closure-tools');

  var externsPath = 'build/externs/';
  // don't put the extension here
  var debugFile = 'lib/helpers/debug';

  // Project configuration.
  grunt.initConfig({
    closureDepsWriter: {
      ss: {
        closureLibraryPath: 'closure-library/',
        output_file: 'lib/superdeps.js',
        options: {
          root_with_prefix: ['"lib ../../lib"']
        }
      }
    },
    closureBuilder: {
      superstartup: {
        closureLibraryPath: 'closure-library',
        inputs: ['lib/main.js'],
        root: ['lib', 'closure-library'],
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
        js: 'lib/main.js',
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
