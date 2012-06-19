module.exports = function(grunt) {
  grunt.loadTasks('build/closure-tools/tasks');

  var externsPath = 'build/bin/externs/';

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
    closureTools: {
      go: {
        run: 'wtf',
        fart: 1
      },
      zit: {
        poke: 'yes'
      }
    },
    closureCalcDeps: {
      run: {
        closureLibraryPath: 'source/closure-library/',
        paths: 'source',
        options: {
          deps: 'source/closure-library'
        }
      }
    },
    closureBuilder: {
      complete: {
        closureLibraryPath: 'source/closure-library',
        inputs: ['source/init.js'],
        root: 'source',
        options: {
          compiler: 'build/bin/Third-Party/closure_compiler/compiler.jar',
          compiler_options: {
            compilation_level: 'ADVANCED_OPTIMIZATIONS',
            externs: [externsPath + 'compiler_externs.js',
                externsPath + 'jquery-1.7.js',
                externsPath + 'facebook_javascript_sdk.js',
                externsPath + 'json.js'],
            define: ["'goog.DEBUG=false'"],
            warning_level: 'verbose',
            jscomp_off: ['checkTypes', 'fileoverviewTags'],
            summary_detail_level: 3,
            only_closure_dependencies: null,
            closure_entry_point: 'ss',            
            output_wrapper: '(function(){%output%}).call(this);'
          }
        }
      }
    }
  });

  // Default task.
  grunt.registerTask('default', 'closureBuilder');

  // Create a new task.
  grunt.registerTask('awesome', 'Print out "awesome!!!"', function() {
    var awesome = grunt.helper('awesome');
    grunt.log.write(awesome);
  });

  // Register a helper.
  grunt.registerHelper('awesome', function() {
    return 'awesome!!!';
  });

  grunt.registerMultiTask('log', 'Log stuff.', function() {
    grunt.log.writeln(this.target + ': ' + this.data);
  });

};