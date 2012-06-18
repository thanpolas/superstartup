module.exports = function(grunt) {

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
    }    
  });

  // Default task.
  grunt.registerTask('default', 'lint');

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