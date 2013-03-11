/**
 * @fileoverview third-party deps loader.
 */
goog.provide('ssd.vendor');


if (!COMPILED) {
  /**
   * load third party dependencies.
   *
   * @param  {Object} deps key value, value being the url.
   */
  ssd.loadDeps = function(deps) {
    goog.object.forEach(deps, function(src) {
      ssd.writeScript(src);
    });
  };

  /**
   * Write script on document. This operation will get scripts synchronously.
   *
   * @param  {string} src A canonical path.
   * @param  {boolean=} optInline set to true to append inline javascript.
   */
  ssd.writeScript = function (src, optInline) {

    var out = '<script type="text/javascript"';
    if (!optInline) {
      out += ' src="' + src + '">';
    } else {
      out += '>' + src;
    }
    out += '</script>';
    document.write(out);
  };


  /**
   * Load vendor deps
   * @return {[type]} [description]
   */
  ssd.vendor = function() {

    var vendorFilepath = goog.basePath + goog.getPathFromDeps_('ssd.vendor');

    var vendorFilename = vendorFilepath.match(/[\.\w]+$/)[0];

    var ind = vendorFilepath.indexOf(vendorFilename);

    var vendorPath = vendorFilepath.substr(0, ind);

    // load third party deps
    ssd.loadDeps({
      //goog.basePath goog.getPathFromDeps_('ssd')
      when: vendorPath + 'when.js'
    });
  };

  ssd.vendor();
}
