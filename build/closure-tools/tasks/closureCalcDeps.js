var exec = require('child_process').exec;
var fs = require('fs');
var gzip = require('zlib').gzip;

// path to calcdeps from closure lib path
var CALCDEPS = '/closure/bin/calcdeps.py';

module.exports = function(grunt) {
  grunt.registerMultiTask('closureCalcDeps', 'Google Closure Library Dependency Calculator script', function() {

    var data = this.data;
    var done = this.async();

    //
    // Validations
    // - Check required parameters
    //
    var params = validate(grunt, data);
    if (false === params) {
      return false;
    }

    //
    // Prepare and compile the command string we will execute
    //
    var command = compileCommand(grunt, params, data);

    if (false === command) {
      return false;
    }

    // execute the task
    var result = executeCommand(grunt, command, done);

  });

};

/**
 * Perform validations for given options
 *
 * @return {boolean|Object} false if error
 */
function validate(grunt, data)
{


  // check for closure lib path
  var lib = data.closureLibraryPath;
  var calcdeps;
  if (!lib) {
    // check for direct assignment of calcdeps script
    calcdeps = data.calcdeps;
    if (!calcdeps) {
      grunt.log.error('ERROR'.red + ' :: ' + 'closureLibraryPath'.red + ' or ' + 'calcdeps'.red + ' properties are required');
      return false;
    }
  } else {
    calcdeps = lib + CALCDEPS;
  }

  // ---
  // validate calcdeps existence
  // ---
  var fileExists = false;
  try {
      if (fs.lstatSync(calcdeps).isFile()) {
        fileExists = true;
      }
  }
  catch (e) {}
  if (!fileExists) {
    grunt.log.error('ERROR'.red + ' :: calcdeps file/path not valid: ' + calcdeps);
    return false;
  }

  // ---
  // Check for inputs or paths
  // ---
  var paths = data.paths;
  var inputs = data.inputs;
  if (!paths && !inputs) {
    grunt.log.error('ERROR'.red + ' :: ' + 'paths'.red + ' or ' + 'inputs'.red +
    ' properties are required');
    return false;
  }

  // prep and return params object
  return {
    calcdeps: calcdeps,
    paths: paths,
    inputs: inputs
  };

};


/**
 * Prepare and compile the calcdeps command we will execute
 *
 * @param {grunt} grunt
 * @param {Object} params
 * @param {Object} data
 * @return {string|boolean} boolean false if we failed, command string if all ok
 */
function compileCommand(grunt, params, data)
{
  var cmd = params.calcdeps + ' ';

  // check type of operation first
  var op = data.options.output_mode || 'deps';

  if ('deps' == op) {
    // in case of deps mode, then add the -d flag by default
    // use the JS Source folder by default or if option
    // explicitly set use that
    var deps = data.options.deps;
    if (deps && deps.length) {
      cmd += grunt.helper('stringOrArray', deps, '-d');
    } else {
        grunt.log.error('ERROR'.red + ' :: For "deps" type of operation, option ' +
         'deps'.red + ' is required');
        return false;

    }
  }
  // check for paths
  if (params.paths && params.paths.length) {
    cmd += grunt.helper('stringOrArray', params.paths, '-p');
  }
  // check for inputs
  if (params.inputs && params.inputs.length) {
    cmd += grunt.helper('stringOrArray', params.inputs, '-i');
  }

  // set operation
  cmd += ' -o ' + op;

  // check if output file is defined
  if (data.options.output_file && data.options.output_file.length) {
    cmd += ' --output_file=' + data.options.output_path;
  }

  return cmd;
};

/**
 * @param {grunt} grunt
 * @param {string} command
 * @param {Function} done
 */
function executeCommand(grunt, command, done)
{
  grunt.log.writeln('Executing: '.blue + command);
  exec(command, function(err, stdout, stderr) {
    if (err) {
      grunt.warn(err);
      done(false);
    }

    if (stdout) {
      grunt.log.writeln(stdout);
    }
    done();
  });


};
