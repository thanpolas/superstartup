module.exports = function(grunt) {
  /**
   * Determines if given parameter is an array or a string and 
   * returns proper string
   *
   * @param {string|Array} param parameter to examine
   * @param {string} directive The directive (e.g. from -p path/to the '-p')
   * @return {string} "-p path/to" or if array "-p path/one -p path/two [...]"
   */
  grunt.registerHelper('stringOrArray', function(param, directive) {
    if (Array.isArray(param)) {
      return ' ' + directive + ' ' + param.join(' ' + directive + ' ');
    } else {
      return ' ' + directive + ' ' + String(param);
    }
  });
};