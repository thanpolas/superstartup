/**
 * Copyright 2000-2011 Athanasios Polychronakis. Some Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * =======================
 *
 * closureBuilder.js Compines and optionally compiles javascript files
 *
 * Call from grunt as:
 */
 var gruntConfig = {
   closureBuilder:  {
     taskName: { // any arbitrary name that describes your task
       // To find the builder executable we need either the path to
       // closure library or directly the filepath to the builder:
       closureLibraryPath: 'path/to/closure-library', // path to closure library
       builder: 'path/to/closurebuilder.py', // filepath to builder
       
       // One of the two following options are required:
       inputs: 'string|Array', // input files (just the starting point)
       namespaces: 'string|Array', // namespaces
       
       // paths to be traversed to build the dependencies
       root: 'string|Array',
       
       // the following options are optional.
       options: {
         output_mode: '', // 'list', 'script' or 'compiled'
         output_file: '', // if not set output to stdout
         compiler: '', // if we also want to compile, location of the compiler .jar
         compiler_options: {
           /**
            * Go wild here... 
            * any key will be used as an option for the compiler
            * value can be a string or an array
            * If no value is required use null
            */
         }
       }
     }
   }
 };
 
 

var exec = require('child_process').exec;
var fs = require('fs');
var gzip = require('zlib').gzip;

// path to builder from closure lib path
var BUILDER = '/closure/bin/build/closurebuilder.py';

module.exports = function(grunt) {
  grunt.registerMultiTask('closureBuilder', 'Google Closure Library builder', function() {

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
  var builder;
  if (!lib) {
    // check for direct assignment of calcdeps script
    builder = data.builder;
    if (!builder) {
      grunt.log.error('ERROR'.red + ' :: ' + 'closureLibraryPath'.red + ' or ' + 'builder'.red + ' properties are required');
      return false;
    }
  } else {
    builder = lib + BUILDER;
  }

  // ---
  // validate builder existence
  // ---
  var fileExists = false;
  try {
      if (fs.lstatSync(builder).isFile()) {
        fileExists = true;
      }
  }
  catch (e) {}
  if (!fileExists) {
    grunt.log.error('ERROR'.red + ' :: builder file/path not valid: ' + builder.red);
    return false;
  }

  // ---
  // Check for inputs or paths
  // ---
  var inputs = data.inputs;
  var namespaces = data.namespaces;
  if (!inputs && !namespaces) {
    grunt.log.error('ERROR'.red + ' :: ' + 'inputs'.red + ' or ' + 'namespaces'.red +
    ' properties are required');
    return false;
  }
  
  var root = data.root;
  if (!root) {
    grunt.log.error('ERROR'.red + ' :: ' + 'root'.red + ' property is required');
    return false;    
  }

  // prep and return params object
  return {
    builder: builder,
    inputs: inputs,
    namespaces: namespaces,
    root: root
  };

};


/**
 * Prepare and compile the builder command we will execute
 *
 * @param {grunt} grunt
 * @param {Object} params
 * @param {Object} data
 * @return {string|boolean} boolean false if we failed, command string if all ok
 */
function compileCommand(grunt, params, data)
{
  var cmd = params.builder + ' ';

  // check for inputs
  if (params.inputs && params.inputs.length) {
    cmd += grunt.helper('stringOrArray', params.inputs, '-i');
  }  
  // check for namespaces
  if (params.namespaces && params.namespaces.length) {
    cmd += grunt.helper('stringOrArray', params.namespaces, '-n');
  }
  
  // append root
  cmd += grunt.helper('stringOrArray', params.root, '--root');
  
  // make it easy for our checks, create an options object if
  // it's not there
  data.options || (data.options = {});

  // check type of operation
  var op = data.options.output_mode || 'list';
  
  // see if we have compiler set, will override any operation
  var compile = false;
  if (data.options.compiler) {
    // we got something, check if file is there...
    var fileExists = false;
    try {
        if (fs.lstatSync(data.options.compiler).isFile()) {
          fileExists = true;
        }
    }
    catch (e) {}
    if (!fileExists) {
      grunt.log.error('ERROR'.red + ' :: compiler .jar location not valid: ' + data.compiler.red);
      return false;
    }
    
    // alright, we are compile on
    compile = true;    
    op = 'compiled';
  }

  // set operation
  cmd += ' -o ' + op;

  // check if output file is defined
  if (data.options.output_file && data.options.output_file.length) {
    cmd += ' --output_file=' + data.options.output_path;
  }

  // if compile modestart digging
  if (compile) {
    cmd += ' --compiler_jar=' + data.options.compiler;
    // dive into all options
    var opts = data.options.compiler_options;
    for(var directive in opts) {
      if (Array.isArray(opts[directive])) {
        // go through all values
        for (var i = 0, l = opts[directive].length; i < l; i++) {
          cmd += ' --compiler_flags="--' + directive + '=' + opts[directive][i] + '"';
        }
      } else if (null === opts[directive]) {
        // value of directive is null, not required
        cmd += ' --compiler_flags="--' + directive + '"';        
      } else {
        // value of directive is a string
        cmd += ' --compiler_flags="--' + directive + '=' + opts[directive] + '"';
      }
      
    }
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
    console.log('stuff stuff stuff');
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
