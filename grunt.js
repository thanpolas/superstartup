module.exports = function(grunt) {
  
  grunt.loadTasks('build/grunt-closure-tools/tasks');

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
    closureDepsWriter: {
      run: {
        closureLibraryPath: 'source/closure-library/',
        //files: 'source/init.js',
        output_file: 'zit.deps',
        options: {
          //root: ['source/ss', 'source/closure-library', 'source/showcase']
          root_with_prefix: '"source/ss ../.."'
          //path_with_depspath
        }
      }
    },
    closureBuilder: {
      superstartup: {
        closureLibraryPath: 'source/closure-library',
        inputs: ['source/init.js'],
        root: 'source',
        compile: true,
        compiler: 'build/bin/Third-Party/closure_compiler/compiler.jar',
        output_file: 'dist/compiled.js',
        compiler_options: {
          compilation_level: 'ADVANCED_OPTIMIZATIONS',
          externs: [externsPath + '*.js'],
          define: ["'goog.DEBUG=false'"],
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