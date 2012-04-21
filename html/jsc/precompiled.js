// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Bootstrap for the Google JS Library (Closure).
 *
 * In uncompiled mode base.js will write out Closure's deps file, unless the
 * global <code>CLOSURE_NO_DEPS</code> is set to true.  This allows projects to
 * include their own deps file(s) from different locations.
 *
 */


/**
 * @define {boolean} Overridden to true by the compiler when --closure_pass
 *     or --mark_as_compiled is specified.
 */
var COMPILED = false;


/**
 * Base namespace for the Closure library.  Checks to see goog is
 * already defined in the current scope before assigning to prevent
 * clobbering if base.js is loaded more than once.
 *
 * @const
 */
var goog = goog || {}; // Identifies this file as the Closure base.


/**
 * Reference to the global context.  In most cases this will be 'window'.
 */
goog.global = this;


/**
 * @define {boolean} DEBUG is provided as a convenience so that debugging code
 * that should not be included in a production js_binary can be easily stripped
 * by specifying --define goog.DEBUG=false to the JSCompiler. For example, most
 * toString() methods should be declared inside an "if (goog.DEBUG)" conditional
 * because they are generally used for debugging purposes and it is difficult
 * for the JSCompiler to statically determine whether they are used.
 */
goog.DEBUG = true;


/**
 * @define {string} LOCALE defines the locale being used for compilation. It is
 * used to select locale specific data to be compiled in js binary. BUILD rule
 * can specify this value by "--define goog.LOCALE=<locale_name>" as JSCompiler
 * option.
 *
 * Take into account that the locale code format is important. You should use
 * the canonical Unicode format with hyphen as a delimiter. Language must be
 * lowercase, Language Script - Capitalized, Region - UPPERCASE.
 * There are few examples: pt-BR, en, en-US, sr-Latin-BO, zh-Hans-CN.
 *
 * See more info about locale codes here:
 * http://www.unicode.org/reports/tr35/#Unicode_Language_and_Locale_Identifiers
 *
 * For language codes you should use values defined by ISO 693-1. See it here
 * http://www.w3.org/WAI/ER/IG/ert/iso639.htm. There is only one exception from
 * this rule: the Hebrew language. For legacy reasons the old code (iw) should
 * be used instead of the new code (he), see http://wiki/Main/IIISynonyms.
 */
goog.LOCALE = 'en';  // default to en


/**
 * Creates object stubs for a namespace.  The presence of one or more
 * goog.provide() calls indicate that the file defines the given
 * objects/namespaces.  Build tools also scan for provide/require statements
 * to discern dependencies, build dependency files (see deps.js), etc.
 * @see goog.require
 * @param {string} name Namespace provided by this file in the form
 *     "goog.package.part".
 */
goog.provide = function(name) {
  if (!COMPILED) {
    // Ensure that the same namespace isn't provided twice. This is intended
    // to teach new developers that 'goog.provide' is effectively a variable
    // declaration. And when JSCompiler transforms goog.provide into a real
    // variable declaration, the compiled JS should work the same as the raw
    // JS--even when the raw JS uses goog.provide incorrectly.
    if (goog.isProvided_(name)) {
      throw Error('Namespace "' + name + '" already declared.');
    }
    delete goog.implicitNamespaces_[name];

    var namespace = name;
    while ((namespace = namespace.substring(0, namespace.lastIndexOf('.')))) {
      if (goog.getObjectByName(namespace)) {
        break;
      }
      goog.implicitNamespaces_[namespace] = true;
    }
  }

  goog.exportPath_(name);
};


/**
 * Marks that the current file should only be used for testing, and never for
 * live code in production.
 * @param {string=} opt_message Optional message to add to the error that's
 *     raised when used in production code.
 */
goog.setTestOnly = function(opt_message) {
  if (COMPILED && !goog.DEBUG) {
    opt_message = opt_message || '';
    throw Error('Importing test-only code into non-debug environment' +
                opt_message ? ': ' + opt_message : '.');
  }
};


if (!COMPILED) {

  /**
   * Check if the given name has been goog.provided. This will return false for
   * names that are available only as implicit namespaces.
   * @param {string} name name of the object to look for.
   * @return {boolean} Whether the name has been provided.
   * @private
   */
  goog.isProvided_ = function(name) {
    return !goog.implicitNamespaces_[name] && !!goog.getObjectByName(name);
  };

  /**
   * Namespaces implicitly defined by goog.provide. For example,
   * goog.provide('goog.events.Event') implicitly declares
   * that 'goog' and 'goog.events' must be namespaces.
   *
   * @type {Object}
   * @private
   */
  goog.implicitNamespaces_ = {};
}


/**
 * Builds an object structure for the provided namespace path,
 * ensuring that names that already exist are not overwritten. For
 * example:
 * "a.b.c" -> a = {};a.b={};a.b.c={};
 * Used by goog.provide and goog.exportSymbol.
 * @param {string} name name of the object that this file defines.
 * @param {*=} opt_object the object to expose at the end of the path.
 * @param {Object=} opt_objectToExportTo The object to add the path to; default
 *     is |goog.global|.
 * @private
 */
goog.exportPath_ = function(name, opt_object, opt_objectToExportTo) {
  var parts = name.split('.');
  var cur = opt_objectToExportTo || goog.global;

  // Internet Explorer exhibits strange behavior when throwing errors from
  // methods externed in this manner.  See the testExportSymbolExceptions in
  // base_test.html for an example.
  if (!(parts[0] in cur) && cur.execScript) {
    cur.execScript('var ' + parts[0]);
  }

  // Certain browsers cannot parse code in the form for((a in b); c;);
  // This pattern is produced by the JSCompiler when it collapses the
  // statement above into the conditional loop below. To prevent this from
  // happening, use a for-loop and reserve the init logic as below.

  // Parentheses added to eliminate strict JS warning in Firefox.
  for (var part; parts.length && (part = parts.shift());) {
    if (!parts.length && goog.isDef(opt_object)) {
      // last part and we have an object; use it
      cur[part] = opt_object;
    } else if (cur[part]) {
      cur = cur[part];
    } else {
      cur = cur[part] = {};
    }
  }
};


/**
 * Returns an object based on its fully qualified external name.  If you are
 * using a compilation pass that renames property names beware that using this
 * function will not find renamed properties.
 *
 * @param {string} name The fully qualified name.
 * @param {Object=} opt_obj The object within which to look; default is
 *     |goog.global|.
 * @return {?} The value (object or primitive) or, if not found, null.
 */
goog.getObjectByName = function(name, opt_obj) {
  var parts = name.split('.');
  var cur = opt_obj || goog.global;
  for (var part; part = parts.shift(); ) {
    if (goog.isDefAndNotNull(cur[part])) {
      cur = cur[part];
    } else {
      return null;
    }
  }
  return cur;
};


/**
 * Globalizes a whole namespace, such as goog or goog.lang.
 *
 * @param {Object} obj The namespace to globalize.
 * @param {Object=} opt_global The object to add the properties to.
 * @deprecated Properties may be explicitly exported to the global scope, but
 *     this should no longer be done in bulk.
 */
goog.globalize = function(obj, opt_global) {
  var global = opt_global || goog.global;
  for (var x in obj) {
    global[x] = obj[x];
  }
};


/**
 * Adds a dependency from a file to the files it requires.
 * @param {string} relPath The path to the js file.
 * @param {Array} provides An array of strings with the names of the objects
 *                         this file provides.
 * @param {Array} requires An array of strings with the names of the objects
 *                         this file requires.
 */
goog.addDependency = function(relPath, provides, requires) {
  if (!COMPILED) {
    var provide, require;
    var path = relPath.replace(/\\/g, '/');
    var deps = goog.dependencies_;
    for (var i = 0; provide = provides[i]; i++) {
      deps.nameToPath[provide] = path;
      if (!(path in deps.pathToNames)) {
        deps.pathToNames[path] = {};
      }
      deps.pathToNames[path][provide] = true;
    }
    for (var j = 0; require = requires[j]; j++) {
      if (!(path in deps.requires)) {
        deps.requires[path] = {};
      }
      deps.requires[path][require] = true;
    }
  }
};




// NOTE(nnaze): The debug DOM loader was included in base.js as an orignal
// way to do "debug-mode" development.  The dependency system can sometimes
// be confusing, as can the debug DOM loader's asyncronous nature.
//
// With the DOM loader, a call to goog.require() is not blocking -- the
// script will not load until some point after the current script.  If a
// namespace is needed at runtime, it needs to be defined in a previous
// script, or loaded via require() with its registered dependencies.
// User-defined namespaces may need their own deps file.  See http://go/js_deps,
// http://go/genjsdeps, or, externally, DepsWriter.
// http://code.google.com/closure/library/docs/depswriter.html
//
// Because of legacy clients, the DOM loader can't be easily removed from
// base.js.  Work is being done to make it disableable or replaceable for
// different environments (DOM-less JavaScript interpreters like Rhino or V8,
// for example). See bootstrap/ for more information.


/**
 * @define {boolean} Whether to enable the debug loader.
 *
 * If enabled, a call to goog.require() will attempt to load the namespace by
 * appending a script tag to the DOM (if the namespace has been registered).
 *
 * If disabled, goog.require() will simply assert that the namespace has been
 * provided (and depend on the fact that some outside tool correctly ordered
 * the script).
 */
goog.ENABLE_DEBUG_LOADER = true;


/**
 * Implements a system for the dynamic resolution of dependencies
 * that works in parallel with the BUILD system. Note that all calls
 * to goog.require will be stripped by the JSCompiler when the
 * --closure_pass option is used.
 * @see goog.provide
 * @param {string} name Namespace to include (as was given in goog.provide())
 *     in the form "goog.package.part".
 */
goog.require = function(name) {

  // if the object already exists we do not need do do anything
  // TODO(arv): If we start to support require based on file name this has
  //            to change
  // TODO(arv): If we allow goog.foo.* this has to change
  // TODO(arv): If we implement dynamic load after page load we should probably
  //            not remove this code for the compiled output
  if (!COMPILED) {
    if (goog.isProvided_(name)) {
      return;
    }

    if (goog.ENABLE_DEBUG_LOADER) {
      var path = goog.getPathFromDeps_(name);
      if (path) {
        goog.included_[path] = true;
        goog.writeScripts_();
        return;
      }
    }

    var errorMessage = 'goog.require could not find: ' + name;
    if (goog.global.console) {
      goog.global.console['error'](errorMessage);
    }


      throw Error(errorMessage);

  }
};


/**
 * Path for included scripts
 * @type {string}
 */
goog.basePath = '';


/**
 * A hook for overriding the base path.
 * @type {string|undefined}
 */
goog.global.CLOSURE_BASE_PATH;


/**
 * Whether to write out Closure's deps file. By default,
 * the deps are written.
 * @type {boolean|undefined}
 */
goog.global.CLOSURE_NO_DEPS;


/**
 * A function to import a single script. This is meant to be overridden when
 * Closure is being run in non-HTML contexts, such as web workers. It's defined
 * in the global scope so that it can be set before base.js is loaded, which
 * allows deps.js to be imported properly.
 *
 * The function is passed the script source, which is a relative URI. It should
 * return true if the script was imported, false otherwise.
 */
goog.global.CLOSURE_IMPORT_SCRIPT;


/**
 * Null function used for default values of callbacks, etc.
 * @return {void} Nothing.
 */
goog.nullFunction = function() {};


/**
 * The identity function. Returns its first argument.
 *
 * @param {*=} opt_returnValue The single value that will be returned.
 * @param {...*} var_args Optional trailing arguments. These are ignored.
 * @return {?} The first argument. We can't know the type -- just pass it along
 *      without type.
 * @deprecated Use goog.functions.identity instead.
 */
goog.identityFunction = function(opt_returnValue, var_args) {
  return opt_returnValue;
};


/**
 * When defining a class Foo with an abstract method bar(), you can do:
 *
 * Foo.prototype.bar = goog.abstractMethod
 *
 * Now if a subclass of Foo fails to override bar(), an error
 * will be thrown when bar() is invoked.
 *
 * Note: This does not take the name of the function to override as
 * an argument because that would make it more difficult to obfuscate
 * our JavaScript code.
 *
 * @type {!Function}
 * @throws {Error} when invoked to indicate the method should be
 *   overridden.
 */
goog.abstractMethod = function() {
  throw Error('unimplemented abstract method');
};


/**
 * Adds a {@code getInstance} static method that always return the same instance
 * object.
 * @param {!Function} ctor The constructor for the class to add the static
 *     method to.
 */
goog.addSingletonGetter = function(ctor) {
  ctor.getInstance = function() {
    if (ctor.instance_) {
      return ctor.instance_;
    }
    if (goog.DEBUG) {
      // NOTE: JSCompiler can't optimize away Array#push.
      goog.instantiatedSingletons_[goog.instantiatedSingletons_.length] = ctor;
    }
    return ctor.instance_ = new ctor;
  };
};


/**
 * All singleton classes that have been instantiated, for testing. Don't read
 * it directly, use the {@code goog.testing.singleton} module. The compiler
 * removes this variable if unused.
 * @type {!Array.<!Function>}
 * @private
 */
goog.instantiatedSingletons_ = [];


if (!COMPILED && goog.ENABLE_DEBUG_LOADER) {
  /**
   * Object used to keep track of urls that have already been added. This
   * record allows the prevention of circular dependencies.
   * @type {Object}
   * @private
   */
  goog.included_ = {};


  /**
   * This object is used to keep track of dependencies and other data that is
   * used for loading scripts
   * @private
   * @type {Object}
   */
  goog.dependencies_ = {
    pathToNames: {}, // 1 to many
    nameToPath: {}, // 1 to 1
    requires: {}, // 1 to many
    // used when resolving dependencies to prevent us from
    // visiting the file twice
    visited: {},
    written: {} // used to keep track of script files we have written
  };


  /**
   * Tries to detect whether is in the context of an HTML document.
   * @return {boolean} True if it looks like HTML document.
   * @private
   */
  goog.inHtmlDocument_ = function() {
    var doc = goog.global.document;
    return typeof doc != 'undefined' &&
           'write' in doc;  // XULDocument misses write.
  };


  /**
   * Tries to detect the base path of the base.js script that bootstraps Closure
   * @private
   */
  goog.findBasePath_ = function() {
    if (goog.global.CLOSURE_BASE_PATH) {
      goog.basePath = goog.global.CLOSURE_BASE_PATH;
      return;
    } else if (!goog.inHtmlDocument_()) {
      return;
    }
    var doc = goog.global.document;
    var scripts = doc.getElementsByTagName('script');
    // Search backwards since the current script is in almost all cases the one
    // that has base.js.
    for (var i = scripts.length - 1; i >= 0; --i) {
      var src = scripts[i].src;
      var qmark = src.lastIndexOf('?');
      var l = qmark == -1 ? src.length : qmark;
      if (src.substr(l - 7, 7) == 'base.js') {
        goog.basePath = src.substr(0, l - 7);
        return;
      }
    }
  };


  /**
   * Imports a script if, and only if, that script hasn't already been imported.
   * (Must be called at execution time)
   * @param {string} src Script source.
   * @private
   */
  goog.importScript_ = function(src) {
    var importScript = goog.global.CLOSURE_IMPORT_SCRIPT ||
        goog.writeScriptTag_;
    if (!goog.dependencies_.written[src] && importScript(src)) {
      goog.dependencies_.written[src] = true;
    }
  };


  /**
   * The default implementation of the import function. Writes a script tag to
   * import the script.
   *
   * @param {string} src The script source.
   * @return {boolean} True if the script was imported, false otherwise.
   * @private
   */
  goog.writeScriptTag_ = function(src) {
    if (goog.inHtmlDocument_()) {
      var doc = goog.global.document;
      doc.write(
          '<script type="text/javascript" src="' + src + '"></' + 'script>');
      return true;
    } else {
      return false;
    }
  };


  /**
   * Resolves dependencies based on the dependencies added using addDependency
   * and calls importScript_ in the correct order.
   * @private
   */
  goog.writeScripts_ = function() {
    // the scripts we need to write this time
    var scripts = [];
    var seenScript = {};
    var deps = goog.dependencies_;

    function visitNode(path) {
      if (path in deps.written) {
        return;
      }

      // we have already visited this one. We can get here if we have cyclic
      // dependencies
      if (path in deps.visited) {
        if (!(path in seenScript)) {
          seenScript[path] = true;
          scripts.push(path);
        }
        return;
      }

      deps.visited[path] = true;

      if (path in deps.requires) {
        for (var requireName in deps.requires[path]) {
          // If the required name is defined, we assume that it was already
          // bootstrapped by other means.
          if (!goog.isProvided_(requireName)) {
            if (requireName in deps.nameToPath) {
              visitNode(deps.nameToPath[requireName]);
            } else {
              throw Error('Undefined nameToPath for ' + requireName);
            }
          }
        }
      }

      if (!(path in seenScript)) {
        seenScript[path] = true;
        scripts.push(path);
      }
    }

    for (var path in goog.included_) {
      if (!deps.written[path]) {
        visitNode(path);
      }
    }

    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i]) {
        goog.importScript_(goog.basePath + scripts[i]);
      } else {
        throw Error('Undefined script input');
      }
    }
  };


  /**
   * Looks at the dependency rules and tries to determine the script file that
   * fulfills a particular rule.
   * @param {string} rule In the form goog.namespace.Class or project.script.
   * @return {?string} Url corresponding to the rule, or null.
   * @private
   */
  goog.getPathFromDeps_ = function(rule) {
    if (rule in goog.dependencies_.nameToPath) {
      return goog.dependencies_.nameToPath[rule];
    } else {
      return null;
    }
  };

  goog.findBasePath_();

  // Allow projects to manage the deps files themselves.
  if (!goog.global.CLOSURE_NO_DEPS) {
    goog.importScript_(goog.basePath + 'deps.js');
  }
}



//==============================================================================
// Language Enhancements
//==============================================================================


/**
 * This is a "fixed" version of the typeof operator.  It differs from the typeof
 * operator in such a way that null returns 'null' and arrays return 'array'.
 * @param {*} value The value to get the type of.
 * @return {string} The name of the type.
 */
goog.typeOf = function(value) {
  var s = typeof value;
  if (s == 'object') {
    if (value) {
      // Check these first, so we can avoid calling Object.prototype.toString if
      // possible.
      //
      // IE improperly marshals tyepof across execution contexts, but a
      // cross-context object will still return false for "instanceof Object".
      if (value instanceof Array) {
        return 'array';
      } else if (value instanceof Object) {
        return s;
      }

      // HACK: In order to use an Object prototype method on the arbitrary
      //   value, the compiler requires the value be cast to type Object,
      //   even though the ECMA spec explicitly allows it.
      var className = Object.prototype.toString.call(
          /** @type {Object} */ (value));
      // In Firefox 3.6, attempting to access iframe window objects' length
      // property throws an NS_ERROR_FAILURE, so we need to special-case it
      // here.
      if (className == '[object Window]') {
        return 'object';
      }

      // We cannot always use constructor == Array or instanceof Array because
      // different frames have different Array objects. In IE6, if the iframe
      // where the array was created is destroyed, the array loses its
      // prototype. Then dereferencing val.splice here throws an exception, so
      // we can't use goog.isFunction. Calling typeof directly returns 'unknown'
      // so that will work. In this case, this function will return false and
      // most array functions will still work because the array is still
      // array-like (supports length and []) even though it has lost its
      // prototype.
      // Mark Miller noticed that Object.prototype.toString
      // allows access to the unforgeable [[Class]] property.
      //  15.2.4.2 Object.prototype.toString ( )
      //  When the toString method is called, the following steps are taken:
      //      1. Get the [[Class]] property of this object.
      //      2. Compute a string value by concatenating the three strings
      //         "[object ", Result(1), and "]".
      //      3. Return Result(2).
      // and this behavior survives the destruction of the execution context.
      if ((className == '[object Array]' ||
           // In IE all non value types are wrapped as objects across window
           // boundaries (not iframe though) so we have to do object detection
           // for this edge case
           typeof value.length == 'number' &&
           typeof value.splice != 'undefined' &&
           typeof value.propertyIsEnumerable != 'undefined' &&
           !value.propertyIsEnumerable('splice')

          )) {
        return 'array';
      }
      // HACK: There is still an array case that fails.
      //     function ArrayImpostor() {}
      //     ArrayImpostor.prototype = [];
      //     var impostor = new ArrayImpostor;
      // this can be fixed by getting rid of the fast path
      // (value instanceof Array) and solely relying on
      // (value && Object.prototype.toString.vall(value) === '[object Array]')
      // but that would require many more function calls and is not warranted
      // unless closure code is receiving objects from untrusted sources.

      // IE in cross-window calls does not correctly marshal the function type
      // (it appears just as an object) so we cannot use just typeof val ==
      // 'function'. However, if the object has a call property, it is a
      // function.
      if ((className == '[object Function]' ||
          typeof value.call != 'undefined' &&
          typeof value.propertyIsEnumerable != 'undefined' &&
          !value.propertyIsEnumerable('call'))) {
        return 'function';
      }


    } else {
      return 'null';
    }

  } else if (s == 'function' && typeof value.call == 'undefined') {
    // In Safari typeof nodeList returns 'function', and on Firefox
    // typeof behaves similarly for HTML{Applet,Embed,Object}Elements
    // and RegExps.  We would like to return object for those and we can
    // detect an invalid function by making sure that the function
    // object has a call method.
    return 'object';
  }
  return s;
};


/**
 * Returns true if the specified value is not |undefined|.
 * WARNING: Do not use this to test if an object has a property. Use the in
 * operator instead.  Additionally, this function assumes that the global
 * undefined variable has not been redefined.
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is defined.
 */
goog.isDef = function(val) {
  return val !== undefined;
};


/**
 * Returns true if the specified value is |null|
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is null.
 */
goog.isNull = function(val) {
  return val === null;
};


/**
 * Returns true if the specified value is defined and not null
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is defined and not null.
 */
goog.isDefAndNotNull = function(val) {
  // Note that undefined == null.
  return val != null;
};


/**
 * Returns true if the specified value is an array
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is an array.
 */
goog.isArray = function(val) {
  return goog.typeOf(val) == 'array';
};


/**
 * Returns true if the object looks like an array. To qualify as array like
 * the value needs to be either a NodeList or an object with a Number length
 * property.
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is an array.
 */
goog.isArrayLike = function(val) {
  var type = goog.typeOf(val);
  return type == 'array' || type == 'object' && typeof val.length == 'number';
};


/**
 * Returns true if the object looks like a Date. To qualify as Date-like
 * the value needs to be an object and have a getFullYear() function.
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is a like a Date.
 */
goog.isDateLike = function(val) {
  return goog.isObject(val) && typeof val.getFullYear == 'function';
};


/**
 * Returns true if the specified value is a string
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is a string.
 */
goog.isString = function(val) {
  return typeof val == 'string';
};


/**
 * Returns true if the specified value is a boolean
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is boolean.
 */
goog.isBoolean = function(val) {
  return typeof val == 'boolean';
};


/**
 * Returns true if the specified value is a number
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is a number.
 */
goog.isNumber = function(val) {
  return typeof val == 'number';
};


/**
 * Returns true if the specified value is a function
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is a function.
 */
goog.isFunction = function(val) {
  return goog.typeOf(val) == 'function';
};


/**
 * Returns true if the specified value is an object.  This includes arrays
 * and functions.
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is an object.
 */
goog.isObject = function(val) {
  var type = typeof val;
  return type == 'object' && val != null || type == 'function';
  // return Object(val) === val also works, but is slower, especially if val is
  // not an object.
};


/**
 * Gets a unique ID for an object. This mutates the object so that further
 * calls with the same object as a parameter returns the same value. The unique
 * ID is guaranteed to be unique across the current session amongst objects that
 * are passed into {@code getUid}. There is no guarantee that the ID is unique
 * or consistent across sessions. It is unsafe to generate unique ID for
 * function prototypes.
 *
 * @param {Object} obj The object to get the unique ID for.
 * @return {number} The unique ID for the object.
 */
goog.getUid = function(obj) {
  // TODO(arv): Make the type stricter, do not accept null.

  // In Opera window.hasOwnProperty exists but always returns false so we avoid
  // using it. As a consequence the unique ID generated for BaseClass.prototype
  // and SubClass.prototype will be the same.
  return obj[goog.UID_PROPERTY_] ||
      (obj[goog.UID_PROPERTY_] = ++goog.uidCounter_);
};


/**
 * Removes the unique ID from an object. This is useful if the object was
 * previously mutated using {@code goog.getUid} in which case the mutation is
 * undone.
 * @param {Object} obj The object to remove the unique ID field from.
 */
goog.removeUid = function(obj) {
  // TODO(arv): Make the type stricter, do not accept null.

  // DOM nodes in IE are not instance of Object and throws exception
  // for delete. Instead we try to use removeAttribute
  if ('removeAttribute' in obj) {
    obj.removeAttribute(goog.UID_PROPERTY_);
  }
  /** @preserveTry */
  try {
    delete obj[goog.UID_PROPERTY_];
  } catch (ex) {
  }
};


/**
 * Name for unique ID property. Initialized in a way to help avoid collisions
 * with other closure javascript on the same page.
 * @type {string}
 * @private
 */
goog.UID_PROPERTY_ = 'closure_uid_' +
    Math.floor(Math.random() * 2147483648).toString(36);


/**
 * Counter for UID.
 * @type {number}
 * @private
 */
goog.uidCounter_ = 0;


/**
 * Adds a hash code field to an object. The hash code is unique for the
 * given object.
 * @param {Object} obj The object to get the hash code for.
 * @return {number} The hash code for the object.
 * @deprecated Use goog.getUid instead.
 */
goog.getHashCode = goog.getUid;


/**
 * Removes the hash code field from an object.
 * @param {Object} obj The object to remove the field from.
 * @deprecated Use goog.removeUid instead.
 */
goog.removeHashCode = goog.removeUid;


/**
 * Clones a value. The input may be an Object, Array, or basic type. Objects and
 * arrays will be cloned recursively.
 *
 * WARNINGS:
 * <code>goog.cloneObject</code> does not detect reference loops. Objects that
 * refer to themselves will cause infinite recursion.
 *
 * <code>goog.cloneObject</code> is unaware of unique identifiers, and copies
 * UIDs created by <code>getUid</code> into cloned results.
 *
 * @param {*} obj The value to clone.
 * @return {*} A clone of the input value.
 * @deprecated goog.cloneObject is unsafe. Prefer the goog.object methods.
 */
goog.cloneObject = function(obj) {
  var type = goog.typeOf(obj);
  if (type == 'object' || type == 'array') {
    if (obj.clone) {
      return obj.clone();
    }
    var clone = type == 'array' ? [] : {};
    for (var key in obj) {
      clone[key] = goog.cloneObject(obj[key]);
    }
    return clone;
  }

  return obj;
};


/**
 * Forward declaration for the clone method. This is necessary until the
 * compiler can better support duck-typing constructs as used in
 * goog.cloneObject.
 *
 * TODO(brenneman): Remove once the JSCompiler can infer that the check for
 * proto.clone is safe in goog.cloneObject.
 *
 * @type {Function}
 */
Object.prototype.clone;


/**
 * A native implementation of goog.bind.
 * @param {Function} fn A function to partially apply.
 * @param {Object|undefined} selfObj Specifies the object which |this| should
 *     point to when the function is run.
 * @param {...*} var_args Additional arguments that are partially
 *     applied to the function.
 * @return {!Function} A partially-applied form of the function bind() was
 *     invoked as a method of.
 * @private
 * @suppress {deprecated} The compiler thinks that Function.prototype.bind
 *     is deprecated because some people have declared a pure-JS version.
 *     Only the pure-JS version is truly deprecated.
 */
goog.bindNative_ = function(fn, selfObj, var_args) {
  return /** @type {!Function} */ (fn.call.apply(fn.bind, arguments));
};


/**
 * A pure-JS implementation of goog.bind.
 * @param {Function} fn A function to partially apply.
 * @param {Object|undefined} selfObj Specifies the object which |this| should
 *     point to when the function is run.
 * @param {...*} var_args Additional arguments that are partially
 *     applied to the function.
 * @return {!Function} A partially-applied form of the function bind() was
 *     invoked as a method of.
 * @private
 */
goog.bindJs_ = function(fn, selfObj, var_args) {
  if (!fn) {
    throw new Error();
  }

  if (arguments.length > 2) {
    var boundArgs = Array.prototype.slice.call(arguments, 2);
    return function() {
      // Prepend the bound arguments to the current arguments.
      var newArgs = Array.prototype.slice.call(arguments);
      Array.prototype.unshift.apply(newArgs, boundArgs);
      return fn.apply(selfObj, newArgs);
    };

  } else {
    return function() {
      return fn.apply(selfObj, arguments);
    };
  }
};


/**
 * Partially applies this function to a particular 'this object' and zero or
 * more arguments. The result is a new function with some arguments of the first
 * function pre-filled and the value of |this| 'pre-specified'.<br><br>
 *
 * Remaining arguments specified at call-time are appended to the pre-
 * specified ones.<br><br>
 *
 * Also see: {@link #partial}.<br><br>
 *
 * Usage:
 * <pre>var barMethBound = bind(myFunction, myObj, 'arg1', 'arg2');
 * barMethBound('arg3', 'arg4');</pre>
 *
 * @param {Function} fn A function to partially apply.
 * @param {Object|undefined} selfObj Specifies the object which |this| should
 *     point to when the function is run.
 * @param {...*} var_args Additional arguments that are partially
 *     applied to the function.
 * @return {!Function} A partially-applied form of the function bind() was
 *     invoked as a method of.
 * @suppress {deprecated} See above.
 */
goog.bind = function(fn, selfObj, var_args) {
  // TODO(nicksantos): narrow the type signature.
  if (Function.prototype.bind &&
      // NOTE(nicksantos): Somebody pulled base.js into the default
      // Chrome extension environment. This means that for Chrome extensions,
      // they get the implementation of Function.prototype.bind that
      // calls goog.bind instead of the native one. Even worse, we don't want
      // to introduce a circular dependency between goog.bind and
      // Function.prototype.bind, so we have to hack this to make sure it
      // works correctly.
      Function.prototype.bind.toString().indexOf('native code') != -1) {
    goog.bind = goog.bindNative_;
  } else {
    goog.bind = goog.bindJs_;
  }
  return goog.bind.apply(null, arguments);
};


/**
 * Like bind(), except that a 'this object' is not required. Useful when the
 * target function is already bound.
 *
 * Usage:
 * var g = partial(f, arg1, arg2);
 * g(arg3, arg4);
 *
 * @param {Function} fn A function to partially apply.
 * @param {...*} var_args Additional arguments that are partially
 *     applied to fn.
 * @return {!Function} A partially-applied form of the function bind() was
 *     invoked as a method of.
 */
goog.partial = function(fn, var_args) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function() {
    // Prepend the bound arguments to the current arguments.
    var newArgs = Array.prototype.slice.call(arguments);
    newArgs.unshift.apply(newArgs, args);
    return fn.apply(this, newArgs);
  };
};


/**
 * Copies all the members of a source object to a target object. This method
 * does not work on all browsers for all objects that contain keys such as
 * toString or hasOwnProperty. Use goog.object.extend for this purpose.
 * @param {Object} target Target.
 * @param {Object} source Source.
 */
goog.mixin = function(target, source) {
  for (var x in source) {
    target[x] = source[x];
  }

  // For IE7 or lower, the for-in-loop does not contain any properties that are
  // not enumerable on the prototype object (for example, isPrototypeOf from
  // Object.prototype) but also it will not include 'replace' on objects that
  // extend String and change 'replace' (not that it is common for anyone to
  // extend anything except Object).
};


/**
 * @return {number} An integer value representing the number of milliseconds
 *     between midnight, January 1, 1970 and the current time.
 */
goog.now = Date.now || (function() {
  // Unary plus operator converts its operand to a number which in the case of
  // a date is done by calling getTime().
  return +new Date();
});


/**
 * Evals javascript in the global scope.  In IE this uses execScript, other
 * browsers use goog.global.eval. If goog.global.eval does not evaluate in the
 * global scope (for example, in Safari), appends a script tag instead.
 * Throws an exception if neither execScript or eval is defined.
 * @param {string} script JavaScript string.
 */
goog.globalEval = function(script) {
  if (goog.global.execScript) {
    goog.global.execScript(script, 'JavaScript');
  } else if (goog.global.eval) {
    // Test to see if eval works
    if (goog.evalWorksForGlobals_ == null) {
      goog.global.eval('var _et_ = 1;');
      if (typeof goog.global['_et_'] != 'undefined') {
        delete goog.global['_et_'];
        goog.evalWorksForGlobals_ = true;
      } else {
        goog.evalWorksForGlobals_ = false;
      }
    }

    if (goog.evalWorksForGlobals_) {
      goog.global.eval(script);
    } else {
      var doc = goog.global.document;
      var scriptElt = doc.createElement('script');
      scriptElt.type = 'text/javascript';
      scriptElt.defer = false;
      // Note(user): can't use .innerHTML since "t('<test>')" will fail and
      // .text doesn't work in Safari 2.  Therefore we append a text node.
      scriptElt.appendChild(doc.createTextNode(script));
      doc.body.appendChild(scriptElt);
      doc.body.removeChild(scriptElt);
    }
  } else {
    throw Error('goog.globalEval not available');
  }
};


/**
 * Indicates whether or not we can call 'eval' directly to eval code in the
 * global scope. Set to a Boolean by the first call to goog.globalEval (which
 * empirically tests whether eval works for globals). @see goog.globalEval
 * @type {?boolean}
 * @private
 */
goog.evalWorksForGlobals_ = null;


/**
 * Optional map of CSS class names to obfuscated names used with
 * goog.getCssName().
 * @type {Object|undefined}
 * @private
 * @see goog.setCssNameMapping
 */
goog.cssNameMapping_;


/**
 * Optional obfuscation style for CSS class names. Should be set to either
 * 'BY_WHOLE' or 'BY_PART' if defined.
 * @type {string|undefined}
 * @private
 * @see goog.setCssNameMapping
 */
goog.cssNameMappingStyle_;


/**
 * Handles strings that are intended to be used as CSS class names.
 *
 * This function works in tandem with @see goog.setCssNameMapping.
 *
 * Without any mapping set, the arguments are simple joined with a
 * hyphen and passed through unaltered.
 *
 * When there is a mapping, there are two possible styles in which
 * these mappings are used. In the BY_PART style, each part (i.e. in
 * between hyphens) of the passed in css name is rewritten according
 * to the map. In the BY_WHOLE style, the full css name is looked up in
 * the map directly. If a rewrite is not specified by the map, the
 * compiler will output a warning.
 *
 * When the mapping is passed to the compiler, it will replace calls
 * to goog.getCssName with the strings from the mapping, e.g.
 *     var x = goog.getCssName('foo');
 *     var y = goog.getCssName(this.baseClass, 'active');
 *  becomes:
 *     var x= 'foo';
 *     var y = this.baseClass + '-active';
 *
 * If one argument is passed it will be processed, if two are passed
 * only the modifier will be processed, as it is assumed the first
 * argument was generated as a result of calling goog.getCssName.
 *
 * @param {string} className The class name.
 * @param {string=} opt_modifier A modifier to be appended to the class name.
 * @return {string} The class name or the concatenation of the class name and
 *     the modifier.
 */
goog.getCssName = function(className, opt_modifier) {
  var getMapping = function(cssName) {
    return goog.cssNameMapping_[cssName] || cssName;
  };

  var renameByParts = function(cssName) {
    // Remap all the parts individually.
    var parts = cssName.split('-');
    var mapped = [];
    for (var i = 0; i < parts.length; i++) {
      mapped.push(getMapping(parts[i]));
    }
    return mapped.join('-');
  };

  var rename;
  if (goog.cssNameMapping_) {
    rename = goog.cssNameMappingStyle_ == 'BY_WHOLE' ?
        getMapping : renameByParts;
  } else {
    rename = function(a) {
      return a;
    };
  }

  if (opt_modifier) {
    return className + '-' + rename(opt_modifier);
  } else {
    return rename(className);
  }
};


/**
 * Sets the map to check when returning a value from goog.getCssName(). Example:
 * <pre>
 * goog.setCssNameMapping({
 *   "goog": "a",
 *   "disabled": "b",
 * });
 *
 * var x = goog.getCssName('goog');
 * // The following evaluates to: "a a-b".
 * goog.getCssName('goog') + ' ' + goog.getCssName(x, 'disabled')
 * </pre>
 * When declared as a map of string literals to string literals, the JSCompiler
 * will replace all calls to goog.getCssName() using the supplied map if the
 * --closure_pass flag is set.
 *
 * @param {!Object} mapping A map of strings to strings where keys are possible
 *     arguments to goog.getCssName() and values are the corresponding values
 *     that should be returned.
 * @param {string=} opt_style The style of css name mapping. There are two valid
 *     options: 'BY_PART', and 'BY_WHOLE'.
 * @see goog.getCssName for a description.
 */
goog.setCssNameMapping = function(mapping, opt_style) {
  goog.cssNameMapping_ = mapping;
  goog.cssNameMappingStyle_ = opt_style;
};


/**
 * To use CSS renaming in compiled mode, one of the input files should have a
 * call to goog.setCssNameMapping() with an object literal that the JSCompiler
 * can extract and use to replace all calls to goog.getCssName(). In uncompiled
 * mode, JavaScript code should be loaded before this base.js file that declares
 * a global variable, CLOSURE_CSS_NAME_MAPPING, which is used below. This is
 * to ensure that the mapping is loaded before any calls to goog.getCssName()
 * are made in uncompiled mode.
 *
 * A hook for overriding the CSS name mapping.
 * @type {Object|undefined}
 */
goog.global.CLOSURE_CSS_NAME_MAPPING;


if (!COMPILED && goog.global.CLOSURE_CSS_NAME_MAPPING) {
  // This does not call goog.setCssNameMapping() because the JSCompiler
  // requires that goog.setCssNameMapping() be called with an object literal.
  goog.cssNameMapping_ = goog.global.CLOSURE_CSS_NAME_MAPPING;
}


/**
 * Abstract implementation of goog.getMsg for use with localized messages.
 * @param {string} str Translatable string, places holders in the form {$foo}.
 * @param {Object=} opt_values Map of place holder name to value.
 * @return {string} message with placeholders filled.
 */
goog.getMsg = function(str, opt_values) {
  var values = opt_values || {};
  for (var key in values) {
    var value = ('' + values[key]).replace(/\$/g, '$$$$');
    str = str.replace(new RegExp('\\{\\$' + key + '\\}', 'gi'), value);
  }
  return str;
};


/**
 * Exposes an unobfuscated global namespace path for the given object.
 * Note that fields of the exported object *will* be obfuscated,
 * unless they are exported in turn via this function or
 * goog.exportProperty
 *
 * <p>Also handy for making public items that are defined in anonymous
 * closures.
 *
 * ex. goog.exportSymbol('public.path.Foo', Foo);
 *
 * ex. goog.exportSymbol('public.path.Foo.staticFunction',
 *                       Foo.staticFunction);
 *     public.path.Foo.staticFunction();
 *
 * ex. goog.exportSymbol('public.path.Foo.prototype.myMethod',
 *                       Foo.prototype.myMethod);
 *     new public.path.Foo().myMethod();
 *
 * @param {string} publicPath Unobfuscated name to export.
 * @param {*} object Object the name should point to.
 * @param {Object=} opt_objectToExportTo The object to add the path to; default
 *     is |goog.global|.
 */
goog.exportSymbol = function(publicPath, object, opt_objectToExportTo) {
  goog.exportPath_(publicPath, object, opt_objectToExportTo);
};


/**
 * Exports a property unobfuscated into the object's namespace.
 * ex. goog.exportProperty(Foo, 'staticFunction', Foo.staticFunction);
 * ex. goog.exportProperty(Foo.prototype, 'myMethod', Foo.prototype.myMethod);
 * @param {Object} object Object whose static property is being exported.
 * @param {string} publicName Unobfuscated name to export.
 * @param {*} symbol Object the name should point to.
 */
goog.exportProperty = function(object, publicName, symbol) {
  object[publicName] = symbol;
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * Usage:
 * <pre>
 * function ParentClass(a, b) { }
 * ParentClass.prototype.foo = function(a) { }
 *
 * function ChildClass(a, b, c) {
 *   goog.base(this, a, b);
 * }
 * goog.inherits(ChildClass, ParentClass);
 *
 * var child = new ChildClass('a', 'b', 'see');
 * child.foo(); // works
 * </pre>
 *
 * In addition, a superclass' implementation of a method can be invoked
 * as follows:
 *
 * <pre>
 * ChildClass.prototype.foo = function(a) {
 *   ChildClass.superClass_.foo.call(this, a);
 *   // other code
 * };
 * </pre>
 *
 * @param {Function} childCtor Child class.
 * @param {Function} parentCtor Parent class.
 */
goog.inherits = function(childCtor, parentCtor) {
  /** @constructor */
  function tempCtor() {};
  tempCtor.prototype = parentCtor.prototype;
  childCtor.superClass_ = parentCtor.prototype;
  childCtor.prototype = new tempCtor();
  childCtor.prototype.constructor = childCtor;
};


/**
 * Call up to the superclass.
 *
 * If this is called from a constructor, then this calls the superclass
 * contructor with arguments 1-N.
 *
 * If this is called from a prototype method, then you must pass
 * the name of the method as the second argument to this function. If
 * you do not, you will get a runtime error. This calls the superclass'
 * method with arguments 2-N.
 *
 * This function only works if you use goog.inherits to express
 * inheritance relationships between your classes.
 *
 * This function is a compiler primitive. At compile-time, the
 * compiler will do macro expansion to remove a lot of
 * the extra overhead that this function introduces. The compiler
 * will also enforce a lot of the assumptions that this function
 * makes, and treat it as a compiler error if you break them.
 *
 * @param {!Object} me Should always be "this".
 * @param {*=} opt_methodName The method name if calling a super method.
 * @param {...*} var_args The rest of the arguments.
 * @return {*} The return value of the superclass method.
 */
goog.base = function(me, opt_methodName, var_args) {
  var caller = arguments.callee.caller;
  if (caller.superClass_) {
    // This is a constructor. Call the superclass constructor.
    return caller.superClass_.constructor.apply(
        me, Array.prototype.slice.call(arguments, 1));
  }

  var args = Array.prototype.slice.call(arguments, 2);
  var foundCaller = false;
  for (var ctor = me.constructor;
       ctor; ctor = ctor.superClass_ && ctor.superClass_.constructor) {
    if (ctor.prototype[opt_methodName] === caller) {
      foundCaller = true;
    } else if (foundCaller) {
      return ctor.prototype[opt_methodName].apply(me, args);
    }
  }

  // If we did not find the caller in the prototype chain,
  // then one of two things happened:
  // 1) The caller is an instance method.
  // 2) This method was not called by the right caller.
  if (me[opt_methodName] === caller) {
    return me.constructor.prototype[opt_methodName].apply(me, args);
  } else {
    throw Error(
        'goog.base called from a method of one name ' +
        'to a method of a different name');
  }
};


/**
 * Allow for aliasing within scope functions.  This function exists for
 * uncompiled code - in compiled code the calls will be inlined and the
 * aliases applied.  In uncompiled code the function is simply run since the
 * aliases as written are valid JavaScript.
 * @param {function()} fn Function to call.  This function can contain aliases
 *     to namespaces (e.g. "var dom = goog.dom") or classes
 *    (e.g. "var Timer = goog.Timer").
 */
goog.scope = function(fn) {
  fn.call(goog.global);
};


/**
 * Copyright 2000-2011 Athanasios Polychronakis. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * 
 * @author Athanasios Polychronakis <thanpolas@gmail.com>
 * createdate 25/May/2011
 *
 *********
 *  File:: system/conf.main.js 
 *  Core configurations for website / application
 *********
 */


goog.provide('core.STATIC');


/**
 * The sources (web, mob, facebook...)
 *
 * @enum {number}
 */
core.STATIC.SOURCES = {
    WEB: 1,
    MOB: 2,
    FB: 5,
    TWIT: 6
};


/**
 * Copyright 2000-2011 Athanasios Polychronakis. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * 
 * @author Athanasios Polychronakis <thanpolas@gmail.com>
 * createdate 01/Nov/2010
 *
 *********
 *  File:: web2.0/facebook/facebook.API.js
 *  wrapper for the FB js API
 *********
 */



goog.provide('core.fb.API');
goog.require('core.STATIC');


/**
 * The core of the facebook API calls
 * We use restAPI for these functions
 * for now
 *
 * @constructor
 */
core.fb.API.core = function ()
{

}; // class core.fb.API.core

/**
 * The post API class
 *
 *
 * If you want to debug posting on a JS console:
 *
 * FB.api({method:'stream.publish', auto_publish:false, message:'asd add  dd',attachment:{name:'ddd', caption:'deeee', href:'http://chat.local/b/booth_10556'}}, function(e){console.debug(e)})
 *
 * @constructor
 */
core.fb.API.post = function ()
{
    try {
    this.db = {
        editBeforePost: true,
        message: null,
        name: null,
        href: null,
        caption: null,
        properties: null,
        media: null
    }
    this.savedId = null;
    this.paramsAPI = null;

    } catch(e) {core.error(e);}
}; // class core.fb.API.post

/**
 * With this method we set all the needed
 * parameters to make the call for the post
 *
 *  Sample of parameters:

    properties: [
      { text: 'fbrell', href: 'http://fbrell.com/' }
    ],
    picture: 'http://boothchat.com/img/boothchat_logo.png',
    caption: 'this is caption',
    description:'this is description',
    name: 'Join me now',
    actions: [{name: 'action one', link: 'http://boothchat.com'}],
    link: 'http://boothchat.com/pages/about'

    We automaticaly set the 'method' and 'display' values
 *
 *
 * For full documentation see:
 * https://developers.facebook.com/docs/reference/dialogs/feed/
 *
 *
 * @param {object} params as described above
 * @return {void}
 *
 */
core.fb.API.post.prototype.setParams = function (params)
{
    try {

    this.paramsAPI = params

    this.paramsAPI['method'] = 'feed';
    //this.paramsAPI['display'] = 'popup';


    } catch(e) {core.error(e);}
}; // method core.fb.API.post.setParams

/**
 * Perform actual post of the post we have created
 *
 * @param {Function(boolean, string)} listener with state and error message or post ID
 * @return {void}
 */
core.fb.API.post.prototype.perform = function (listener)
{
    try {
    var g = goog;
    var w = core;

    var log = w.log ('core.fb.API.post.perform');

    log.info('Init');

    // check if on mobile and execute a bit differently...
    if (w.MOBILE) {
        // TBD
        return;
    } // if on mobile

    var fb = FB;
    if (this.db.editBeforePost)
        var action = fb.ui;
    else
        var action = fb.api;





    // perform action
    action(this.paramsAPI, g.bind(function (res){
        // if mode is edit before post then on error
        // res will be null
        if (g.isNull(res) || !g.isDef(res)) {
            log.warning('Error from facebook. res is null');
            listener(false, w.errmsg);
            return;
        }

        if (g.isObject(res['error'])) {
            log.warning('Error from facebook:' + res['error']['message']);
            listener(false, res['error']['message']);
        } else {
            if (this.db.editBeforePost)
                this.savedId = res['post_id'];
            else
                this.savedId = res;
            log.info('Post ok to facebook. id:' + this.savedId);



            listener(true, this.savedId);
        }
    }, this));

    } catch(e) {core.error(e);}
}; // method core.fb.API.post.perform







/**
 * Define if we want to edit before posting (true / default)
 * or direct posting to facebook (false)
 *
 * @param {boolean} value
 * @return {void}
 */
core.fb.API.post.prototype.setEditBeforePost = function (value)
{
    if (goog.isBoolean(value))
        this.db.editBeforePost = value;

}; // method setEditBeforePost
/**
 * Copyright 2000-2011 Athanasios Polychronakis. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * 
 * @author Athanasios Polychronakis <thanpolas@gmail.com>
 * createdate 25/May/2011
 *
 *********
 *  File:: user/login.user.js
 *  Core Login User file
 *********
 */

goog.provide('core.user.login');


/**
 * Will attempt to login user
 *
 * We will fire a callback as
 * callback(status, opt_error_msg)
 * status is boolean
 * if false, we get error msg as well for user
 *
 *
 * @param {string} user nickname or e-mail
 * @param {string} pass password
 * @param {boolean} perm Login permanently
 * @param {Function({boolean}, {string=})} callback Callback function
 * @return {boolean} - use callback func for handling
 */
core.user.login.submit = function(user, pass, perm, callback)
 {
    //shortcut assign
    var c = core;
    var valid = c.valid;
    var err = c.err;
    var u = c.user;
    var db = u.db;
    var g = goog;
    //var lang = c.lang.user;
    var log = c.log('core.user.login.submit');
    var genError = 'Ooops an error occured, please retry';


    log.info('Init');

    /**
     * Start Validations
     * NICKNAME / EMAIL validation
     *
     * Error reporting for user is in place in valid class method's
     */
    //validate input, check if e-mail and validate
    if ( - 1 < user.search(/\@/gi)) {
        //it's an email, check validity
        if (!valid.checkEmail(user)) {
            //not a valid e-mail
        	callback(false, err.get());
            return false;
        }
    } else {
        //it's a nickname, check validity
        if (!valid.checkNick(user)) {
            //not a valid nickname
        	callback(false, err.get());
            return false;
        }

    }
    // else not email => is nick
    /**
     * Password Validation
     * [nothing todo at the moment]
     */


    /**
     * SEND REQUEST
     *
     */
    //Parameters for AJAX
    var url = '/php/ajax/';
    var params = {
        postMethod: 'POST',
        action: 'login'


    };



    // Initialise the object
    var a = new c.ajax(url, params);

    // add needed data
    a.addData('nickname', user);
    //a.addData('password', pass);
    //if (perm)
    	//a.addData('perm_login', 1);

    //callback function
    a.callback = function(result)
    {

        // init auth...
        u.login.submitCallback(result, callback);


        return true;
    };
    //callback
    a.errorCallback = function() {

        var ajerr = a.getError();
        log.severe('Error Callback');
        err(ajerr.message);
        callback(false, ajerr.message);
    };
    //perform the execution
    if (!a.send()) {
        log.severe('Ajax Error sending');
        err(genError);
        callback(false, err.get());
        return false;
    }


    return true;
};
// method core.user.login.submit



/**
 * Initialises user authentication
 *
 * We process the data object as passed by the server
 * after a login or register operation
 *
 * If user's credentials check ok, we auth the user and start
 * loading the user's DB
 *
 *
 * Check for permanent login using:
 * core.user.auth.isPerm();
 * And get the server token using:
 * core.user.auth.getPerm();
 *
 * Your callback fn will be executed as:
 * callback(status, opt_error_msg)
 * status is boolean
 * if false, we get error msg as well for user
 *
 * @param {object} res Server result object
 * @param {Function({boolean}, {string=})} callback callback function when auth finishes
 * @return {void}
 */
core.user.login.submitCallback = function(res, callback)
 {
    //shortcut assign
    var c = core;
    var err = c.err;
    var u = c.user;
    var db = u.db;
    var g = goog;
    //var lang = c.lang.user;
    var log = c.log('core.user.login.submitCallback');
    var genError = 'An error has occured. Please retry';
    log.info('Init');

    try {



        //log.shout('res:' + g.debug.expose(res));
        // assign the recieved user data object to local db
        var user = res['user'];

        // initialise our auth
        c.user.auth.Init(user, callback);

        return;



    } catch(e) {
        core.error(e);
    }
};
// method core.user.login.submitCallback



/**
 * Logout request
 *
 * We will fire a callback as
 * callback(status, opt_error_msg)
 * status is boolean
 * if false, we get error msg as well for user
 *
 *
 * @param {Function=} callback Callback function
 * @return {boolean}
 */
core.user.login.logout = function(opt_callback)
 {
   try {
    var c = core;

    var log = goog.debug.Logger.getLogger('core.user.login.logout');

    var callback = opt_callback || function() {};

    log.info('Init');

    // clear user db
    c.user.db.clear();
    // clear web2.0 data objects
    c.fb.db.clear();
    c.web2.db.clear();

    //Parameters for AJAX
    var url = '/users/logout';
    var params = {
        typeGet: 'json',
        typeSend: 'html',
        postMethod: 'POST',
        showMsg: false // don't show default success message
     , showErrorMsg: false // don't show error message if it happens

    };

    // Initialise the object
    var a = new c.ajax(url, params);

    //callback function
    a.callback = function(result)
    {
        var res = a.getTag('status');
        log.info('logout server result:' + res);
        // trigger global auth state event
        c.web2.events.runEvent('initAuthState', false);
        callback(true);
    };
    //callback
    a.errorCallback = function(err)
    {
        callback(false, err.message);
    };

    //perform the execution
    if (!a.send()) return false;

    return true;
   } catch(e) {
     core.error(e);
    }
};
// method core.user.login.logout


/**
 * Copyright 2000-2011 Athanasios Polychronakis. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * 
 * @author Athanasios Polychronakis <thanpolas@gmail.com>
 * createdate 08/Sep/2010
 *
 *********
 *  File:: user/profile.user.js
 *  Handler for user profile
 *********
 */




goog.provide('core.user.profile');


/**
 * Account submition
 * We expect an object that has any of these keys:
 * nickname, email, userprivate[boolean]
 *
 * We execute the passed callback function with these params:
 * cb(status, opt_error_msg)
 * status is boolean
 * if false, we get error msg as well for user
 *
 * @param {object} datafields The data that we want to pass for submition
 * @param {Function} cb Callback Function
 * @return {boolean} Execution success / failure
 */
core.user.profile.submitAccount = function (datafields, cb)
{
    //shortcut assignments
    var w = core;
    var err = w.err;
    var u = w.user;
    var db = u.db;
    var g = goog;
    var genError = 'an error occured, please retry #222';
    var log = g.debug.Logger.getLogger('core.user.profile.submitAccount');

    log.info('Init');



    // validate and check if data ok
    if (!u.profile._validateAccount(datafields)) {
        // not validated, call cb with false and error message...
        cb(false, err.get());
        return false;
    }

    /**
     * All is ok, submit the form
     *
     */
    //Parameters for AJAX
    var url='/userSettings/account';
    var params = {
        typeGet: 'json',
        typeSend: 'html',
        postMethod: 'POST'

    };

    // Initialise the object
    var a = new w.ajax(url, params);

    // check which fields we have and assign them to ajax class...
    if (g.isString(datafields.nickname))
        a.addData('nickname', datafields.nickname);

    if (g.isString(datafields.email))
        a.addData('email', datafields.email);

    if (g.isBoolean(datafields.userprivate))
        if (datafields.userprivate)
            a.addData('userprivate', '1');

    //callback function
    a.callback = function (result)
    {
        var user = a.getTag('user');
        if (!w.isNotEmpty(user)) {
            //no user object passed, error
            var msg = a.getTag('msg');
            log.warning('No user object passed. msg:' + msg);
            if (g.isString(msg))
                cb(false, msg);
            else
                cb(false, genError);
            return;
        }

        /**
         * we have collected objects succesfully, now overwrite user object
         *
         */
        db.user = {};
        db.user = user;
        // great, submited ok
        cb(true);
        return;
    }; //callback

    a.errorCallback = function ()
    {
        // failed...
        var errorobj = a.getError();
        cb(false, errorobj.message);
        return;
    }

    //perform the execution
    if (!a.send()) {
        log.warning('ajax send() failed!!');
        cb(false, genError);
        return false;
    }

    return true;

}; // method core.user.profile.submitAccount

/**
 * We will validate the passed datafields object
 * We are called from .submitAccount()
 *
 * @private
 * @param {object} datafields
 * @return {boolean}
 */
core.user.profile._validateAccount = function (datafields)
{
    //shortcut assignments
    var w = core;
    var err = w.err;
    var u = w.user;
    var db = u.db;
    var g = goog;
    var log = g.debug.Logger.getLogger('core.user.profile._validateAccount');

    log.info('Init');

    // switch to let us know if we had any field
    var gotone = false;

    //TODO [3b][4][08/Sep/2010] Create real validations using regex

    // check for nickname
    if (g.isString(datafields.nickname)) {
        // we have a nickname set, validate it...
        if (1 > datafields.nickname.length) {
            err('Nickname is very short');
            return false;
        }
        // nickname good
        gotone = true;
    } // if we have a nickname

    // check for email
    if (g.isString(datafields.email)) {
        // email set, check for size...
        if (4 > datafields.email.length) {
            if (0 == datafields.email.length) {
              err('Please enter your e-mail');
              return false;
            }
            err('E-mail is very short to be valid');
            return false;
        }
        // email good
        gotone = true;
    } // if we have email

    // check for user private
    if (g.isBoolean(datafields.userprivate)) {
        gotone = true;
    }

    if (!gotone) {
        err('You did not change any fields');
        return false;
    }

    // all ok
    return true;

}; // method core.user.profile._validateAccount


/**
 * Password submition
 * We expect an object that has these keys:
 * passOld, passOne, passTwo
 *
 * We execute the passed callback function with these params:
 * cb(status, opt_error_msg)
 * status is boolean
 * if false, we get error msg as well for user
 *
 * @param {object} datafields The data that we want to pass for submition
 * @param {Function} cb Callback Function
 * @return {boolean} Execution success / failure
 */
core.user.profile.submitPassword = function (datafields, cb)
{
    try {
    //shortcut assignments
    var w = core;
    var err = w.err;
    var u = w.user;
    var db = u.db;
    var g = goog;
    var lang = w.lang.user;
    var genError = lang.errorGeneric;
    var log = g.debug.Logger.getLogger('core.user.profile.submitPassword');

    log.info('Init');

    // validate and check if data ok
    if (!u.profile._validatePassword(datafields)) {
        // not validated, call cb with false and error message...
        cb(false, err.get());
        return false;
    }

    /**
     * All is ok, submit the form
     *
     */
    //Parameters for AJAX
    var url='/';
    var params = {
        typeGet: 'json',
        typeSend: 'html',
        postMethod: 'POST',
        origin: 107,
        oper: w.update.oper.user.editPass
    };

    // Initialise the object
    var a = new w.ajax(url, params);

    // add the required fields
    a.addData('old_password', datafields.passOld);
    a.addData('password1', datafields.passOne);
    a.addData('password2', datafields.passTwo);
    log.shout('datafields:' + g.debug.expose(datafields));
    //callback function
    a.callback = function (result)
    {
        // great, submited ok
        cb(true);
        return;
    }; //callback

    a.errorCallback = function ()
    {
        // failed...
        var errorobj = a.getError();
        cb(false, errorobj.message);
        return;
    }

    //perform the execution
    if (!a.send()) {
        log.warning('ajax send() failed!!');
        cb(false, genError);
        return false;
    }

    return true;

    } catch(e) {core.error(e);}

}; // method core.user.profile.submitPassword

/**
 * We will validate the passed datafields object
 * We are called from .submitPassword()
 *
 * @private
 * @param {object} datafields
 * @return {boolean}
 */
core.user.profile._validatePassword = function (datafields)
{
    //shortcut assignments
    var w = core;
    var err = w.err;
    var u = w.user;
    var db = u.db;
    var g = goog;
    var l = w.lang.user;
    var log = g.debug.Logger.getLogger('core.user.profile._validatePassword');

    log.info('Init');


    /**
     * PASSWORD Validation
     */
    var d = datafields;

    // check for fields existance...
    if (!g.isString(d.passOld)) {
        err(l.register.no_password);
        return false;
    }
    if (!g.isString(d.passOne)) {
        err(l.register.no_password);
        return false;
    }
    if (!g.isString(d.passTwo)) {
        err(l.register.no_password);
        return false;
    }

    // check if the two passwords match
    if (d.passOne != d.passTwo) {
        err('Passwords do not match!');
        return false;
    }

    // TODO [3b][2][10/Sep/2010] Add password string length validations (hi/lo)


    // all ok
    return true;

}; // method core.user.profile._validatePassword




/**
 * Profile submition
 *
 *  We execute the passed callback function with these params:
 * cb(status, opt_error_msg)
 * status is boolean
 * if false, we get error msg as well for user
 *
 * @param {object} datafields The required data fields
 * @param {Function} cb Callback function
 * @return {void}
 */
core.user.profile.submitProfile = function (datafields, cb)
{
  try {
    //shortcut assignments
    var c = core;
    var err = c.err;
    var u = c.user;
    var db = u.db;
    var g = goog;
    var genError = 'an error occured, please retry #223';
    var log = g.debug.Logger.getLogger('core.user.profile.submitProfile');

    log.info('Init');



    /**
     * All is ok, submit the form
     *
     */
    //Parameters for AJAX
    var url='/userSettings/profile';
    var params = {
        typeGet: 'json',
        typeSend: 'html',
        postMethod: 'POST'

    };

    // Initialise the object
    var a = new c.ajax(url, params);

    // assign them to ajax class...

    a.addData('fullname', datafields.fullname);
    a.addData('location', datafields.location);
    a.addData('web', datafields.web);
    a.addData('bio', datafields.bio);

    //callback function
    a.callback = function (result)
    {
        var user = a.getTag('user');
        if (!c.isNotEmpty(user)) {
            //no user object passed, error
            var msg = a.getTag('msg');
            log.warning('No user object passed. msg:' + msg);
            if (g.isString(msg))
                cb(false, msg);
            else
                cb(false, genError);
            return;
        }

        /**
         * we have collected objects succesfully, now overwrite user object
         *
         */
        db.user = {};
        db.user = user;
        // great, submited ok
        cb(true);
        return;
    }; //callback

    a.errorCallback = function ()
    {
        // failed...
        var errorobj = a.getError();
        cb(false, errorobj.message);
        return;
    }

    //perform the execution
    if (!a.send()) {
        log.warning('ajax send() failed!!');
        cb(false, genError);
        return;
    }

    return;



  } catch (e) {
    core.error(e);
  }

}; // core.user.profile.submitProfile


/**
 * email Alerts submition
 * We expect an object that has these keys, all boolean:
 * mentions, frameComments, messages
 *
 * We execute the passed callback function with these params:
 * cb(status, opt_error_msg)
 * status is boolean
 * if false, we get error msg as well for user
 *
 * @param {object} datafields The data that we want to pass for submition
 * @param {Function} cb Callback Function
 * @return {boolean} Execution success / failure
 */
core.user.profile.submitAlerts = function (datafields, cb)
{
    //shortcut assignments
    var w = core;
    var err = w.err;
    var u = w.user;
    var db = u.db;
    var g = goog;
    var genError = 'an error occured, please retry #229';
    var log = g.debug.Logger.getLogger('core.user.profile.submitAlerts');

    log.info('Init');


    /**
     * All is ok, submit the form
     *
     */
    //Parameters for AJAX
    var url='/userSettings/alerts';
    var params = {
        typeGet: 'json',
        typeSend: 'html',
        postMethod: 'POST'

    };

    // Initialise the object
    var a = new w.ajax(url, params);

    a.addData('mentions', (datafields.mentions ? 1 : 0));
    a.addData('frameComments', (datafields.frameComments ? 1 : 0));
    a.addData('messages', (datafields.messages ? 1 : 0));

    //callback function
    a.callback = function (result)
    {
        var user = a.getTag('user');
        if (!w.isNotEmpty(user)) {
            //no user object passed, error
            var msg = a.getTag('msg');
            log.warning('No user object passed. msg:' + msg);
            if (g.isString(msg))
                cb(false, msg);
            else
                cb(false, genError);
            return;
        }

        /**
         * we have collected objects succesfully, now overwrite user object
         *
         */
        db.user = {};
        db.user = user;
        // great, submited ok
        cb(true);
        return;
    }; //callback

    a.errorCallback = function ()
    {
        // failed...
        var errorobj = a.getError();
        cb(false, errorobj.message);
        return;
    }

    //perform the execution
    if (!a.send()) {
        log.warning('ajax send() failed!!');
        cb(false, genError);
        return false;
    }

    return true;

}; // method core.user.profile.submitAlerts

/**
 * Copyright 2000-2011 Athanasios Polychronakis. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * 
 * @author Athanasios Polychronakis <thanpolas@gmail.com>
 * createdate 08/Sep/2011
 *
 *********
 *  File:: user/pub.user.js
 *  User public functions (a user requesting data for another user)
 *********
 */


goog.provide('core.user.pub');



/**
 * Retrieve a user's public data object from server
 *
 * @param {string} nickname user's nickname
 * @param {Function(boolean, string|object)} cb Callback function, first
 *    param is status (ok / not ok) second is error msg or user data
 *    object as returned from server
 * @return {void}
 */
core.user.pub.get = function(nickname, cb)
{
  try {
    var c = core;

    var aj = new c.ajax('/userp/get', {
      postMethod: 'POST'
      ,
      showMsg: false // don't show default success message
      ,
      showErrorMsg: false // don't show error message if it happens
    });

    // add our query data
    aj.addData('nickname', nickname);

    // ajax callback listener
    aj.callback = function (result)
    {
      try {
        if (20 == result['status']) {
          cb(false, 'no results');
          return;
        }
        if (10 != result['status']) {
          cb(false, 'other error');
          return;
        }

        var u = result['user'];
        if (c.user.isUserObject(u)) {
          cb(true, u);
          return;
        }

        // not valid user object
        cb(false, 'not valid user object received');


      } catch(e) {

        core.error(e);
        cb(false, 'other error1');
      }
    };

    // ajax error listener
    aj.errorCallback = function (errorobj)
    {
      try {
      // errorobj.message
      // errorobj.debugmessage
      cb(false, errorobj.message);

      } catch (e) {
        core.error(e);
      }

    };

    // send ajax request
    aj.send();


  } catch (e) {
    core.error(e);

    cb(false, 'other error2');
  }

};/**
 * Copyright 2000-2011 Athanasios Polychronakis. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * 
 * @author Athanasios Polychronakis <thanpolas@gmail.com>
 * createdate 28/Sep/2010
 *
 *********
 *  File:: system/listeners.js
 *  Global Listeners Class
 *********
 */


goog.provide('core.events');
goog.provide('core.events.listeners');

/**
 * Will provide event handling listener
 * methods to any class
 *
 * This is an abstract class that is not aware of
 * event types
 *
 * @constructor
 */
core.events.listeners = function ()
{
  try {
    /**
     * Our local db
     *
     * @type {Object}
     * @private
     */
    this._eventsdb = {
      hasEvents: false,
      /**
         * This array will contain listener objects
         * which have the following keys:
         * type: {string} // the type of the listener
         * listener: {Function} // the listener function
         * this: {this} // the context we will run the method on
         */
      listeners: new Array()

    };

  } catch(e) {
    core.error(e);
  }

}; // class core.events.listeners

/**
 * Adds an event listener for the specified type
 *
 * @param {string} type The type of the listener. An arbitrary unique string
 * @param {Function} listener The listening function
 * @param {this=} opt_this Optional this context to run the listener on
 * @param {string=} opt_id Optional id for listener (easy removal) use unique names
 * @return {void}
 */
core.events.listeners.prototype.addEventListener = function (type, listener, opt_this, opt_id)
{
  try {

    var w = core;
    var g = goog;
    var log = w.log('core.events.listeners.addEvent');

    if (!g.isFunction(listener)) {
      log.warning('listener is not a function for type:' + type);
      return;
    }



    // turn on events switch
    this._eventsdb.hasEvents = true;

    // prepare listener object
    var listObj = {
      type: type,
      runOnce: false,
      listener: listener,
      _this: opt_this || g.global,
      _id : opt_id || null
    }

    // push to listeners array
    this._eventsdb.listeners.push(listObj);

  } catch(e) {
    core.error(e);
  }

}; // core.events.listeners.addEventListener


/**
 * Adds an event listener for the specified type
 *
 * This event will execute only once
 *
 * @param {string} type The type of the listener
 * @param {Function} listener The listening function
 * @param {_this=} opt_this Optional this context to run the listener on
 * @return {void}
 */
core.events.listeners.prototype.addEventListenerOnce = function (type, listener, opt_this)
{
  try {

    var w = core;
    var g = goog;
    var log = w.log('core.events.listeners.addEventOnce');

    if (!g.isFunction(listener)) {
      log.warning('listener is not a function for type:' + type);
      return;
    }

    // turn on events switch
    this._eventsdb.hasEvents = true;

    // prepare listener object
    var listObj = {
      type: type,
      runOnce: true,
      listener: listener,
      _this: opt_this || g.global
    }

    // push to listeners array
    this._eventsdb.listeners.push(listObj);

  } catch(e) {
    core.error(e);
  }

}; // core.events.listeners.addEventOnce


/**
 * Removes an event listener for the specified type
 * and specific listener
 *
 * @param {string} type The type of the listener
 * @param {Function|string} listener The listening function or the ID of the
 *      listener if we had set one...
 * @return {void}
 */
core.events.listeners.prototype.removeEventListener = function (type, listener)
{
  try {

    var w = core;
    var g = goog;
    var log = w.log('core.events.listeners.removeEvent');

    log.info('Init. type:' + type);

    if (!this._eventsdb.hasEvents) {
      log.warning('this._eventsdb.hasEvents is FALSE');
      return;
    }

    // init required vars
    var found = false;
    var foundIndex = null;
    // check if listener is function or string
    if (g.isFunction(listener)) {

      // try to locate it
      g.array.forEach(this._eventsdb.listeners, function(listObj, index){
        // check if same type
        if (listObj.type == type) {
          // check if same listener
          if (listObj.listener == listener) {
            // great we found a listener
            //log.info('Found listener at index:' + index);
            found = true;
            foundIndex = index;
          }
        }
      }, this);
    } else if (g.isString(listener)) {
      // we have a string (ID)
      g.array.forEach(this._eventsdb.listeners, function(listObj, index){
        if (listObj.type == type) {
          if (listObj._id == listener) {
            // found it...
            //log.info('Found listener at index:' + index);
            found = true;
            foundIndex = index;
          }
        }
      }, this);
    } else {
      log.warning('listener is not a function or a string:' + listener);
      return;
    }
    if (found) {
      // remove it
      goog.array.removeAt(this._eventsdb.listeners, foundIndex);
    } else {
      log.warning('Listener not found');
    }

    // check if we are out of listeners
    if (0 == this._eventsdb.listeners.length)
      this._eventsdb.hasEvents = false;

  } catch(e) {
    core.error(e);
  }

}; // core.events.listeners.removeEvent

/**
 * Clears all listeners
 *
 * @return {void}
 * @private
 */
core.events.listeners.prototype._clearListeners = function ()
{
  this._eventsdb.listeners = new Array();
  this._eventsdb.hasEvents = false;
}; // core.events.listeners._clearListeners



/**
 * Trigger an event
 *
 * @param {string} type The type of event to trigger
 * @param {...*=} opt_var_args Additional arguments that are partially
 *     applied to listeners.
 * @return {void}
 * @private
 */
core.events.listeners.prototype._runEventType = function(type, opt_var_args)
{
  try {
    var g = goog;
    var c = core;
    var log = c.log('core.events.listeners._runEventType');

    log.finer('Init. type:' + type + ' total listeners:' + this._eventsdb.listeners.length);

    // check if no events
    if (!this._eventsdb.hasEvents) return;
    
    // look for the triggered event in the events object
    var ev = c.arFind(this.events, 'type', type);


    var args = Array.prototype.slice.call(arguments, 1);



    var removeListeners = [];
    // loop through the listeners object
    g.array.forEach(this._eventsdb.listeners, function(listObj, index){
      if (listObj.type == type) {
        // Prepend the bound arguments to the current arguments.
        var newArgs = Array.prototype.slice.call(arguments);
        newArgs.unshift.apply(newArgs, args);
        // call the listener
        listObj.listener.apply(listObj._this, newArgs);
        // check if we need to remove this cause of runOnce
        if (listObj.runOnce)
          removeListeners.push(index);
      }
    }, this);

    // now remove any listeners that were to run once...
    var substractIndex = 0;
    g.array.forEach(removeListeners, function (listIndex, index){
      g.array.removeAt(this._eventsdb.listeners, listIndex - substractIndex);
      substractIndex++;
    }, this);

  } catch(e) {
    core.error(e);
  }
}; // method core.events.listeners._runEventType


/**
 * Trigger an event (public method)
 *
 * @param {string} type The type of event to trigger
 * @param {...*=} opt_var_args Additional arguments that are partially
 *     applied to listeners.
 * @return {void}
 */
core.events.listeners.prototype.runEvent = core.events.listeners.prototype._runEventType;



/**
 * Copyright 2000-2011 Athanasios Polychronakis. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * 
 * @author Athanasios Polychronakis <thanpolas@gmail.com>
 * createdate 25/May/2011
 *
 *********
 *  File:: user/auth.user.js
 *  Core Auth User file
 *********
 */

goog.provide('core.user.auth');
goog.require('core.events');


/**
 * The core auth events. Everything about authentication is handled from
 * here.
 *
 * Valid events are, along with their parameters:
 *
 * authState (state{boolean}, opt_sourceId{core.STATIC.SOURCES=}, opt_userDataObject{object=})
 *      Whenever auth state changes, this event is triggered. facebook but
 *      state {boolean} :: Tells us if authed or not
 *      opt_sourceId :: The auth source in case of authed
 *      opt_userDataObjet :: In case of auth, the user data object
 * newUser (sourceId{core.STATIC.SOURCES}, userDataObject{object})
 *      If the authed user is a new user
 * initAuthState (state{boolean})
 *      Fired when initial check with external auth sources has finished.
 *
 */
core.user.auth.events = new core.events.listeners();

/**
 * Perform a user login.
 * We call this function after we have cleared with the authentication
 * procedures. 
 *
 * We need a user data object to be provided
 *
 * Your callback fn will be executed as:
 * callback(status, opt_error_msg)
 * status is boolean
 * if false, we get error msg as well for user
 *
 *
 *
 * @param {object} user
 * @param {Function(boolean, opt_string)} cb callback function when auth finishes
 * @param {core.STATIC.SOURCES} sourceId the source of authentication
 * @return {void}
 */
core.user.auth.login = function(user, cb, sourceId)
 {
   try {
    //shortcut assign
    var c = core;
    var u = c.user;
    var db = u.db;
    var g = goog;
    var log = c.log('core.user.auth.login');
    var genError = 'An error has occured. Please retry';

    log.info('Init. authed:' + db.isAuthed);

    if (db.isAuthed) {
      cb(true);
      return;
    }

    // assign the recieved user data object to local db
    db.user = user;

    // validate it
    if (!c.user.isUserObject(db.user)) {
        log.warning('User object provided is not valid:' + g.debug.expose(user));
        cb(false, genError);
        return;
    }

    // provide new metadata object to our metadata facility
    c.metadata.newObject(user['metadataObject']);

    // turn on authed switch
    db.isAuthed = true;

    // initialize notifications for user
    c.user.notify.Init();

    c.user.auth.events.runEvent('authState', true, sourceId, user);


    // notify our analytics
    c.analytics.userAuth(user);

    cb(true);

    log.info('Finished');
  } catch(e) {
      core.error(e);
  }
};
// method core.user.auth.loginManual

/**
 * Tells us if user is authed
 *
 * @return boolean
 */
core.user.auth.isAuthed = function()
 {
    return core.user.db.isAuthed;
};
// method core.user.auth.isAuthed

/**
 * Tells us if user if verified
 *
 * @return boolean
 */
core.user.auth.isVerified = function()
 {
    return core.user.db.user.verified;
};
// method core.user.auth.isVerified
/**
 * Tells us if the user has perm login credentials
 * stored
 *
 * @return {boolean}
 */
core.user.auth.isPerm = function()
{
    return core.user.db.permLogin;
};

/**
 * Returns the permanent login server cookie object
 *
 * permCook Object schema:
     token = "fdaabfc8d47286424445d10b9213ae608f8d072e0b97d3175e46802fac16fe16"
     uid = "babbos"
     timeset = 1284027551
     permId = 50
     duration = 1318587551
     cookieDomain = ".core.local"
     cookieName = "cookie_perm"
 *
 * @return {string}
 */
core.user.auth.getPerm = function()
 {
    return core.user.db.permCook;
};




/**
 * Execute when we have an authentication event
 * from an external source.
 *
 * If we are not authed, we will perform auth procedures
 *
 * @param {core.STATIC.SOURCES} sourceId
 * @param {object} user core user data object verified
 * @return {void}
 */
core.user.auth.extAuth = function(sourceId, user)
 {
    try {

        var c = core;
        var log = c.log('core.user.auth.extAuth');

        log.info('sourceId:' + sourceId + ' authed:' + c.isAuthed());

        // if already authed exit
        if (c.isAuthed())
          return;

        // not authed, start auth
        c.user.auth.login(user, function(){}, sourceId);

    } catch(e) {
        core.error(e);
    }
};
// function core.user.auth.extAuth

/**
 * Lets us know if currently logged in user
 * has external authentication for the provided
 * source id
 *
 * @param {core.STATIC.SOURCES} sourceId
 * @return {boolean}
 */
core.user.auth.hasExtSource = function(sourceId)
 {
    //core.user.auth.hasFacebook = function ()
    try {
        var c = core;

        if (!c.isAuthed())
        return false;

        // get user object
        var user = c.user.getUserDataObject();

        if (!user['hasExtSource'])
        return false;

        // check for the source defined noc...
        var ind = c.arFindIndex(user['extSource'], 'sourceId', sourceId);

        if ( - 1 == ind)
        return false;


        return true;

    } catch(e) {
        core.error(e);
    }
};
// function core.user.auth.hasFacebook


/**
 * Gets the external auth source user's name
 *
 * @param {core.STATIC.SOURCES.FB} sourceId
 * @return {string|null} null if error / not found
 */
core.user.auth.getExtName = function(sourceId)
 {

    try {
        var c = core;
        var g = goog;

        if (!c.isAuthed())
        return null;

        // get user object
        var user = c.user.getUserDataObject();

        if (!user['hasExtSource'])
        return null;

        // check for the source defined noc...
        var ind = c.arFindIndex(user['extSource'], 'sourceId', sourceId);

        if ( - 1 == ind)
        return null;

        // check if name value is there...
        if (g.isString(user['extSource'][ind]['extUsername']))
        // got it
        return user['extSource'][ind]['extUsername'];

        return null;

    } catch(e) {
        core.error(e);
    }
};
// function core.user.auth.hasFacebook
/**
 * Copyright 2000-2011 Athanasios Polychronakis. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * 
 * @author Athanasios Polychronakis <thanpolas@gmail.com>
 *
 *
 *
 *********
 * created on Sep 27, 2011
 * metadata.js Meta Data handler
 *
 */

goog.provide('core.metadata');
goog.provide('core.user.metadata');
// do a shortcut assign till all references have been updated
core.metadata = core.user.metadata;

/**
 * The static data object of metadata
 *
 */
core.user.metadata.db = {
  source: '',
  permId: 0,
  createDate: null,
  visitCounter: 0,
  metadata: null // null or decoded JSON string == object
}


/**
 * Receive and parse the metadataObject
 *
 * @param {object} dataobj
 * @return {void}
 */
core.user.metadata.newObject = function (dataobj)
{
  try {
    var c = core;
    var log = c.log('core.metadata.newObject');

    var db = c.metadata.db;
    db.source = dataobj['source'];
    db.permId = dataobj['permId'];
    // TODO need to parse this PHP unix timestamp to goog date object
    db.createDate = dataobj['createDate'];
    db.visitCounter = dataobj['visitCounter'];
    // now try to JSON decode the metadata
    try {
      db.metadata = JSON.parse(dataobj['metadata']);
    } catch(e) {
      db.metadata = null;
    }

    log.info('Parsed new metadataObject. source:' + db.source + ' permId:' + db.permId);

    // check if we have a valid perm id and track it in mixpanel
    if (0 != db.permId)
      c.analytics.identify(db.permId);

  } catch (e) {
    core.error(e);
  }

};

/**
 * Return a root key from the metadata object
 *
 * If metadata is not valid or key doesn't exist
 * we return null
 *
 * @param {string} key the root key we want to get
 * @return {mixed} null if doesn't exit
 */
core.user.metadata.get = function (key)
{
  try {
    var c = core;
    var db = c.metadata.db;

    if (null == db.metadata)
      return null;


    if (!goog.isDef(db.metadata[key]))
      return null;

    return db.metadata[key];

  } catch (e) {
    core.error(e);
  }

};

/**
 * Will save a new value to the specified key
 *
 * We will also save on server
 *
 * We only save on the masterkey 'metadata' in our db
 *
 * @param {string} key The key
 * @param {mixed} value
 * @return {void}
 */
core.user.metadata.save = function (key, value)
{
  try {
    var c = core, g = goog;

    var log = c.log('core.metadata.save');

    log.info('Saving metadata. key:' + key + ' value:' + value);
    var db = c.metadata.db;

    // check if we have a null metadata object
    if (g.isNull(db.metadata))
      db.metadata = {};

    // save the new value
    db.metadata[key] = value;

    var aj = new c.ajax('/md/save', {
      postMethod: 'POST'
      , showMsg: false // don't show default success message
      , showErrorMsg: false // don't show error message if it happens
    });

    aj.addData('metadata', JSON.stringify(db.metadata));

    // ajax callback listener
    aj.callback = function (){};

    // ajax error listener
    aj.errorCallback = function (errorobj) {};

    // send ajax request
    aj.send();


  } catch (e) {
    core.error(e);
  }

};


/**
 * Copyright 2000-2011 Athanasios Polychronakis. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * 
 * @author Athanasios Polychronakis <thanpolas@gmail.com>
 * createdate 25/May/2011
 *
 *********
 *  File:: user/main.user.js
 *  Core main User file
 *********
 */


goog.provide('core.user');
goog.require('core.user.auth');
goog.require('core.user.login');
goog.require('core.user.profile');
goog.require('core.user.pub');
goog.require('core.user.metadata');


/**
 * static Data storage
 *
 */
core.user.db = {
	    /**
	     * The user data object, provided from the server
	     */
	    user: {},
	    /**
	     * The cookies we have stored. This is an array
	     */
	    cookie: [],
	    isAuthed: false, //self explanotary
	    isVerified: false, //same...
	    // cookie object as passed from the server
	    serverCook: {},
	    permLogin: false,
	    permCook: {}

};

/**
 * Resets the user db to original not logged in
 * values
 *
 * @return void
 */
core.user.db.clear = function()
{
    var db = core.user.db;
    db.user = {};
    db.cookie = [];
    db.isAuthed = false;
    db.isVerified = false;
    db.serverCook = {};
    db.permLogin = false;
    db.permCook = {};
}; // method core.user.db.clear



/**
 * Get the user id number of the currently
 * logged in user
 *
 * @return {Number|null} null if not logged in or error
 */
core.user.getUserId = function ()
{
    var w = core;
    if (!w.isAuthed())
        return null;

    return w.user.db.user['userId'];
}; // method core.user.getUserId

/**
 * Get current user's nickname
 *
 * If no user is logged in we return null
 *
 * @return {string|null}
 */
core.user.getNickname = function ()
{
  var c = core;
  if (!c.isAuthed())
    return null;

  return c.user.db.user['nickname'];
}

/**
 * return the user data object
 *
 * @return {object}
 */
core.user.getUserDataObject = function ()
{
    return core.user.db.user;
}; // function core.user.getUserDataObject

/**
 * Return the logged in user's data object
 *
 * @return {object}
 */
core.user.getUserData = function ()
{
    var c = core;
    if (!c.isAuthed())
        return {};

    return c.user.db.user['userData'];
}; // function core.user.getUserData

/**
 * Perform follow user
 *
 * @param {string} uid url unique user id
 * @param {Function({boolean}, {opt_error_message})} listener callback function with state for execution
 * @return {void}
 */
core.user.follow = function (uid, listener)
{
    try {

    var w = core;
    var g = goog;

    if (!w.isAuthed()) {
        listener(false, 'Not logged in');
        return;
    }

    // create request
    var url = "/";
    var a = new w.ajax(url, {
        typeGet: 'json',
        typeSend: 'html',
        postMethod: 'POST',
        oper: w.update.oper.user.follow,
        origin: 131
    });
    a.addData("uid", uid);

    // default error message
    var errmsg = 'There was a problem, please retry';

    a.callback = function(result) {
        // inform pup that we have a follow
        w.user.pup.userFollow(uid);
        // update the user data object
        w.user.db.user['userData']['stats']['following']++;
        // check if less than 5 folloing
        if (5 > w.user.db.user['userData']['stats']['following']) {
            w.user.db.user['userData']['following'].push(uid);
        }
        // call listener
        listener(true);
    };
    a.errorCallback = function (errObj)
    {
        listener(false, errObj.message);
        return;
    };

    if (!a.send()) {
        listener(false, errmsg);
        return;
    }

    } catch(e) {core.error(e);}
}; // function core.user.follow




/**
 * Perform unfollow user
 *
 * @param {string} uid url unique user id
 * @param {Function({boolean}, {opt_error_message})} listener callback function with state for execution
 * @return {void}
 */
core.user.unfollow = function (uid, listener)
{
    try {

    var w = core;
    var g = goog;

    if (!w.isAuthed()) {
        listener(false, 'Not logged in');
        return;
    }

    // create request
    var url = "/";
    var a = new w.ajax(url, {
        typeGet: 'json',
        typeSend: 'html',
        postMethod: 'POST',
        oper: w.update.oper.user.follow,
        origin: 132
    });
    a.addData("uid", uid);

    // default error message
    var errmsg = 'There was a problem, please retry';

    a.callback = function(result) {
        // inform pup that we have an unfollow
        w.user.pup.userUnFollow(uid);
        // update the user data object
        w.user.db.user['userData']['stats']['following']--;
        // check if less than 5 following
        if (5 > w.user.db.user['userData']['stats']['following']) {
            w.user.db.user['userData']['following'].push(uid);
        }
        // call listener
        listener(true);
    };
    a.errorCallback = function (errObj)
    {
        listener(false, errObj.message);
        return;
    };

    if (!a.send()) {
        listener(false, errmsg);
        return;
    }

    } catch(e) {core.error(e);}
}; // function core.user.follow


/**
 * Checks if the given object is a valid
 * core user object
 *
 * @param {object} user
 * @return {boolean}
 */
core.user.isUserObject = function (user)
{
    try {

    var g = goog;
    var log = core.log('core.user.isUserObject');

    if (!g.isObject(user)) {
      log.warning('user object passed not an object');
      return false;
    }



    // check for vital keys
    //if (!g.isString(user['uid']))
    //    return false;


    if (!g.isString(user['nickname'])) {
      log.warning('user object checked: Has no nickname');
      return false;
    }

    if (!g.isBoolean(user['hasExtSource'])) {
      log.warning('user object checked: Has no hasExtSource');
      return false;
    }

    if (user['hasExtSource']) {
      if (!g.isArray(user['extSource'])) {
        log.warning('user object checked: Has no extSource data');
        return false;
      }

    }


    return true;
    } catch(e) {core.error(e);}
}; // function core.user.isUserObject

/**
 * Return an empty dummy user data object
 *
 * @return {object}
 */
core.user.getDummyObject = function ()
{
  try {
    return {
    'userId' : 0,
    'nickname' : '',
    'fullname' : '',
    'createDate' : '2011-06-11 13:00:23',
    'hasExtSource' : 1,
    'extSource' : [
      {
        'sourceId' : 0,
        'extUserId' : 0,
        'extUrl' : '',
        'extUsername' : '',
        'extProfileImageUrl' : ''
      }
    ]};

  } catch (e) {
    core.error(e);
  }



};// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utilities for string manipulation.
 */


/**
 * Namespace for string utilities
 */
goog.provide('goog.string');
goog.provide('goog.string.Unicode');


/**
 * Common Unicode string characters.
 * @enum {string}
 */
goog.string.Unicode = {
  NBSP: '\xa0'
};


/**
 * Fast prefix-checker.
 * @param {string} str The string to check.
 * @param {string} prefix A string to look for at the start of {@code str}.
 * @return {boolean} True if {@code str} begins with {@code prefix}.
 */
goog.string.startsWith = function(str, prefix) {
  return str.lastIndexOf(prefix, 0) == 0;
};


/**
 * Fast suffix-checker.
 * @param {string} str The string to check.
 * @param {string} suffix A string to look for at the end of {@code str}.
 * @return {boolean} True if {@code str} ends with {@code suffix}.
 */
goog.string.endsWith = function(str, suffix) {
  var l = str.length - suffix.length;
  return l >= 0 && str.indexOf(suffix, l) == l;
};


/**
 * Case-insensitive prefix-checker.
 * @param {string} str The string to check.
 * @param {string} prefix  A string to look for at the end of {@code str}.
 * @return {boolean} True if {@code str} begins with {@code prefix} (ignoring
 *     case).
 */
goog.string.caseInsensitiveStartsWith = function(str, prefix) {
  return goog.string.caseInsensitiveCompare(
      prefix, str.substr(0, prefix.length)) == 0;
};


/**
 * Case-insensitive suffix-checker.
 * @param {string} str The string to check.
 * @param {string} suffix A string to look for at the end of {@code str}.
 * @return {boolean} True if {@code str} ends with {@code suffix} (ignoring
 *     case).
 */
goog.string.caseInsensitiveEndsWith = function(str, suffix) {
  return goog.string.caseInsensitiveCompare(
      suffix, str.substr(str.length - suffix.length, suffix.length)) == 0;
};


/**
 * Does simple python-style string substitution.
 * subs("foo%s hot%s", "bar", "dog") becomes "foobar hotdog".
 * @param {string} str The string containing the pattern.
 * @param {...*} var_args The items to substitute into the pattern.
 * @return {string} A copy of {@code str} in which each occurrence of
 *     {@code %s} has been replaced an argument from {@code var_args}.
 */
goog.string.subs = function(str, var_args) {
  // This appears to be slow, but testing shows it compares more or less
  // equivalent to the regex.exec method.
  for (var i = 1; i < arguments.length; i++) {
    // We cast to String in case an argument is a Function.  Replacing $&, for
    // example, with $$$& stops the replace from subsituting the whole match
    // into the resultant string.  $$$& in the first replace becomes $$& in the
    //  second, which leaves $& in the resultant string.  Also:
    // $$, $`, $', $n $nn
    var replacement = String(arguments[i]).replace(/\$/g, '$$$$');
    str = str.replace(/\%s/, replacement);
  }
  return str;
};


/**
 * Converts multiple whitespace chars (spaces, non-breaking-spaces, new lines
 * and tabs) to a single space, and strips leading and trailing whitespace.
 * @param {string} str Input string.
 * @return {string} A copy of {@code str} with collapsed whitespace.
 */
goog.string.collapseWhitespace = function(str) {
  // Since IE doesn't include non-breaking-space (0xa0) in their \s character
  // class (as required by section 7.2 of the ECMAScript spec), we explicitly
  // include it in the regexp to enforce consistent cross-browser behavior.
  return str.replace(/[\s\xa0]+/g, ' ').replace(/^\s+|\s+$/g, '');
};


/**
 * Checks if a string is empty or contains only whitespaces.
 * @param {string} str The string to check.
 * @return {boolean} True if {@code str} is empty or whitespace only.
 */
goog.string.isEmpty = function(str) {
  // testing length == 0 first is actually slower in all browsers (about the
  // same in Opera).
  // Since IE doesn't include non-breaking-space (0xa0) in their \s character
  // class (as required by section 7.2 of the ECMAScript spec), we explicitly
  // include it in the regexp to enforce consistent cross-browser behavior.
  return /^[\s\xa0]*$/.test(str);
};


/**
 * Checks if a string is null, empty or contains only whitespaces.
 * @param {*} str The string to check.
 * @return {boolean} True if{@code str} is null, empty, or whitespace only.
 */
goog.string.isEmptySafe = function(str) {
  return goog.string.isEmpty(goog.string.makeSafe(str));
};


/**
 * Checks if a string is all breaking whitespace.
 * @param {string} str The string to check.
 * @return {boolean} Whether the string is all breaking whitespace.
 */
goog.string.isBreakingWhitespace = function(str) {
  return !/[^\t\n\r ]/.test(str);
};


/**
 * Checks if a string contains all letters.
 * @param {string} str string to check.
 * @return {boolean} True if {@code str} consists entirely of letters.
 */
goog.string.isAlpha = function(str) {
  return !/[^a-zA-Z]/.test(str);
};


/**
 * Checks if a string contains only numbers.
 * @param {*} str string to check. If not a string, it will be
 *     casted to one.
 * @return {boolean} True if {@code str} is numeric.
 */
goog.string.isNumeric = function(str) {
  return !/[^0-9]/.test(str);
};


/**
 * Checks if a string contains only numbers or letters.
 * @param {string} str string to check.
 * @return {boolean} True if {@code str} is alphanumeric.
 */
goog.string.isAlphaNumeric = function(str) {
  return !/[^a-zA-Z0-9]/.test(str);
};


/**
 * Checks if a character is a space character.
 * @param {string} ch Character to check.
 * @return {boolean} True if {code ch} is a space.
 */
goog.string.isSpace = function(ch) {
  return ch == ' ';
};


/**
 * Checks if a character is a valid unicode character.
 * @param {string} ch Character to check.
 * @return {boolean} True if {code ch} is a valid unicode character.
 */
goog.string.isUnicodeChar = function(ch) {
  return ch.length == 1 && ch >= ' ' && ch <= '~' ||
         ch >= '\u0080' && ch <= '\uFFFD';
};


/**
 * Takes a string and replaces newlines with a space. Multiple lines are
 * replaced with a single space.
 * @param {string} str The string from which to strip newlines.
 * @return {string} A copy of {@code str} stripped of newlines.
 */
goog.string.stripNewlines = function(str) {
  return str.replace(/(\r\n|\r|\n)+/g, ' ');
};


/**
 * Replaces Windows and Mac new lines with unix style: \r or \r\n with \n.
 * @param {string} str The string to in which to canonicalize newlines.
 * @return {string} {@code str} A copy of {@code} with canonicalized newlines.
 */
goog.string.canonicalizeNewlines = function(str) {
  return str.replace(/(\r\n|\r|\n)/g, '\n');
};


/**
 * Normalizes whitespace in a string, replacing all whitespace chars with
 * a space.
 * @param {string} str The string in which to normalize whitespace.
 * @return {string} A copy of {@code str} with all whitespace normalized.
 */
goog.string.normalizeWhitespace = function(str) {
  return str.replace(/\xa0|\s/g, ' ');
};


/**
 * Normalizes spaces in a string, replacing all consecutive spaces and tabs
 * with a single space. Replaces non-breaking space with a space.
 * @param {string} str The string in which to normalize spaces.
 * @return {string} A copy of {@code str} with all consecutive spaces and tabs
 *    replaced with a single space.
 */
goog.string.normalizeSpaces = function(str) {
  return str.replace(/\xa0|[ \t]+/g, ' ');
};


/**
 * Removes the breaking spaces from the left and right of the string and
 * collapses the sequences of breaking spaces in the middle into single spaces.
 * The original and the result strings render the same way in HTML.
 * @param {string} str A string in which to collapse spaces.
 * @return {string} Copy of the string with normalized breaking spaces.
 */
goog.string.collapseBreakingSpaces = function(str) {
  return str.replace(/[\t\r\n ]+/g, ' ').replace(
      /^[\t\r\n ]+|[\t\r\n ]+$/g, '');
};


/**
 * Trims white spaces to the left and right of a string.
 * @param {string} str The string to trim.
 * @return {string} A trimmed copy of {@code str}.
 */
goog.string.trim = function(str) {
  // Since IE doesn't include non-breaking-space (0xa0) in their \s character
  // class (as required by section 7.2 of the ECMAScript spec), we explicitly
  // include it in the regexp to enforce consistent cross-browser behavior.
  return str.replace(/^[\s\xa0]+|[\s\xa0]+$/g, '');
};


/**
 * Trims whitespaces at the left end of a string.
 * @param {string} str The string to left trim.
 * @return {string} A trimmed copy of {@code str}.
 */
goog.string.trimLeft = function(str) {
  // Since IE doesn't include non-breaking-space (0xa0) in their \s character
  // class (as required by section 7.2 of the ECMAScript spec), we explicitly
  // include it in the regexp to enforce consistent cross-browser behavior.
  return str.replace(/^[\s\xa0]+/, '');
};


/**
 * Trims whitespaces at the right end of a string.
 * @param {string} str The string to right trim.
 * @return {string} A trimmed copy of {@code str}.
 */
goog.string.trimRight = function(str) {
  // Since IE doesn't include non-breaking-space (0xa0) in their \s character
  // class (as required by section 7.2 of the ECMAScript spec), we explicitly
  // include it in the regexp to enforce consistent cross-browser behavior.
  return str.replace(/[\s\xa0]+$/, '');
};


/**
 * A string comparator that ignores case.
 * -1 = str1 less than str2
 *  0 = str1 equals str2
 *  1 = str1 greater than str2
 *
 * @param {string} str1 The string to compare.
 * @param {string} str2 The string to compare {@code str1} to.
 * @return {number} The comparator result, as described above.
 */
goog.string.caseInsensitiveCompare = function(str1, str2) {
  var test1 = String(str1).toLowerCase();
  var test2 = String(str2).toLowerCase();

  if (test1 < test2) {
    return -1;
  } else if (test1 == test2) {
    return 0;
  } else {
    return 1;
  }
};


/**
 * Regular expression used for splitting a string into substrings of fractional
 * numbers, integers, and non-numeric characters.
 * @type {RegExp}
 * @private
 */
goog.string.numerateCompareRegExp_ = /(\.\d+)|(\d+)|(\D+)/g;


/**
 * String comparison function that handles numbers in a way humans might expect.
 * Using this function, the string "File 2.jpg" sorts before "File 10.jpg". The
 * comparison is mostly case-insensitive, though strings that are identical
 * except for case are sorted with the upper-case strings before lower-case.
 *
 * This comparison function is significantly slower (about 500x) than either
 * the default or the case-insensitive compare. It should not be used in
 * time-critical code, but should be fast enough to sort several hundred short
 * strings (like filenames) with a reasonable delay.
 *
 * @param {string} str1 The string to compare in a numerically sensitive way.
 * @param {string} str2 The string to compare {@code str1} to.
 * @return {number} less than 0 if str1 < str2, 0 if str1 == str2, greater than
 *     0 if str1 > str2.
 */
goog.string.numerateCompare = function(str1, str2) {
  if (str1 == str2) {
    return 0;
  }
  if (!str1) {
    return -1;
  }
  if (!str2) {
    return 1;
  }

  // Using match to split the entire string ahead of time turns out to be faster
  // for most inputs than using RegExp.exec or iterating over each character.
  var tokens1 = str1.toLowerCase().match(goog.string.numerateCompareRegExp_);
  var tokens2 = str2.toLowerCase().match(goog.string.numerateCompareRegExp_);

  var count = Math.min(tokens1.length, tokens2.length);

  for (var i = 0; i < count; i++) {
    var a = tokens1[i];
    var b = tokens2[i];

    // Compare pairs of tokens, returning if one token sorts before the other.
    if (a != b) {

      // Only if both tokens are integers is a special comparison required.
      // Decimal numbers are sorted as strings (e.g., '.09' < '.1').
      var num1 = parseInt(a, 10);
      if (!isNaN(num1)) {
        var num2 = parseInt(b, 10);
        if (!isNaN(num2) && num1 - num2) {
          return num1 - num2;
        }
      }
      return a < b ? -1 : 1;
    }
  }

  // If one string is a substring of the other, the shorter string sorts first.
  if (tokens1.length != tokens2.length) {
    return tokens1.length - tokens2.length;
  }

  // The two strings must be equivalent except for case (perfect equality is
  // tested at the head of the function.) Revert to default ASCII-betical string
  // comparison to stablize the sort.
  return str1 < str2 ? -1 : 1;
};


/**
 * Regular expression used for determining if a string needs to be encoded.
 * @type {RegExp}
 * @private
 */
goog.string.encodeUriRegExp_ = /^[a-zA-Z0-9\-_.!~*'()]*$/;


/**
 * URL-encodes a string
 * @param {*} str The string to url-encode.
 * @return {string} An encoded copy of {@code str} that is safe for urls.
 *     Note that '#', ':', and other characters used to delimit portions
 *     of URLs *will* be encoded.
 */
goog.string.urlEncode = function(str) {
  str = String(str);
  // Checking if the search matches before calling encodeURIComponent avoids an
  // extra allocation in IE6. This adds about 10us time in FF and a similiar
  // over head in IE6 for lower working set apps, but for large working set
  // apps like Gmail, it saves about 70us per call.
  if (!goog.string.encodeUriRegExp_.test(str)) {
    return encodeURIComponent(str);
  }
  return str;
};


/**
 * URL-decodes the string. We need to specially handle '+'s because
 * the javascript library doesn't convert them to spaces.
 * @param {string} str The string to url decode.
 * @return {string} The decoded {@code str}.
 */
goog.string.urlDecode = function(str) {
  return decodeURIComponent(str.replace(/\+/g, ' '));
};


/**
 * Converts \n to <br>s or <br />s.
 * @param {string} str The string in which to convert newlines.
 * @param {boolean=} opt_xml Whether to use XML compatible tags.
 * @return {string} A copy of {@code str} with converted newlines.
 */
goog.string.newLineToBr = function(str, opt_xml) {
  return str.replace(/(\r\n|\r|\n)/g, opt_xml ? '<br />' : '<br>');
};


/**
 * Escape double quote '"' characters in addition to '&', '<', and '>' so that a
 * string can be included in an HTML tag attribute value within double quotes.
 *
 * It should be noted that > doesn't need to be escaped for the HTML or XML to
 * be valid, but it has been decided to escape it for consistency with other
 * implementations.
 *
 * NOTE(user):
 * HtmlEscape is often called during the generation of large blocks of HTML.
 * Using statics for the regular expressions and strings is an optimization
 * that can more than half the amount of time IE spends in this function for
 * large apps, since strings and regexes both contribute to GC allocations.
 *
 * Testing for the presence of a character before escaping increases the number
 * of function calls, but actually provides a speed increase for the average
 * case -- since the average case often doesn't require the escaping of all 4
 * characters and indexOf() is much cheaper than replace().
 * The worst case does suffer slightly from the additional calls, therefore the
 * opt_isLikelyToContainHtmlChars option has been included for situations
 * where all 4 HTML entities are very likely to be present and need escaping.
 *
 * Some benchmarks (times tended to fluctuate +-0.05ms):
 *                                     FireFox                     IE6
 * (no chars / average (mix of cases) / all 4 chars)
 * no checks                     0.13 / 0.22 / 0.22         0.23 / 0.53 / 0.80
 * indexOf                       0.08 / 0.17 / 0.26         0.22 / 0.54 / 0.84
 * indexOf + re test             0.07 / 0.17 / 0.28         0.19 / 0.50 / 0.85
 *
 * An additional advantage of checking if replace actually needs to be called
 * is a reduction in the number of object allocations, so as the size of the
 * application grows the difference between the various methods would increase.
 *
 * @param {string} str string to be escaped.
 * @param {boolean=} opt_isLikelyToContainHtmlChars Don't perform a check to see
 *     if the character needs replacing - use this option if you expect each of
 *     the characters to appear often. Leave false if you expect few html
 *     characters to occur in your strings, such as if you are escaping HTML.
 * @return {string} An escaped copy of {@code str}.
 */
goog.string.htmlEscape = function(str, opt_isLikelyToContainHtmlChars) {

  if (opt_isLikelyToContainHtmlChars) {
    return str.replace(goog.string.amperRe_, '&amp;')
          .replace(goog.string.ltRe_, '&lt;')
          .replace(goog.string.gtRe_, '&gt;')
          .replace(goog.string.quotRe_, '&quot;');

  } else {
    // quick test helps in the case when there are no chars to replace, in
    // worst case this makes barely a difference to the time taken
    if (!goog.string.allRe_.test(str)) return str;

    // str.indexOf is faster than regex.test in this case
    if (str.indexOf('&') != -1) {
      str = str.replace(goog.string.amperRe_, '&amp;');
    }
    if (str.indexOf('<') != -1) {
      str = str.replace(goog.string.ltRe_, '&lt;');
    }
    if (str.indexOf('>') != -1) {
      str = str.replace(goog.string.gtRe_, '&gt;');
    }
    if (str.indexOf('"') != -1) {
      str = str.replace(goog.string.quotRe_, '&quot;');
    }
    return str;
  }
};


/**
 * Regular expression that matches an ampersand, for use in escaping.
 * @type {RegExp}
 * @private
 */
goog.string.amperRe_ = /&/g;


/**
 * Regular expression that matches a less than sign, for use in escaping.
 * @type {RegExp}
 * @private
 */
goog.string.ltRe_ = /</g;


/**
 * Regular expression that matches a greater than sign, for use in escaping.
 * @type {RegExp}
 * @private
 */
goog.string.gtRe_ = />/g;


/**
 * Regular expression that matches a double quote, for use in escaping.
 * @type {RegExp}
 * @private
 */
goog.string.quotRe_ = /\"/g;


/**
 * Regular expression that matches any character that needs to be escaped.
 * @type {RegExp}
 * @private
 */
goog.string.allRe_ = /[&<>\"]/;


/**
 * Unescapes an HTML string.
 *
 * @param {string} str The string to unescape.
 * @return {string} An unescaped copy of {@code str}.
 */
goog.string.unescapeEntities = function(str) {
  if (goog.string.contains(str, '&')) {
    // We are careful not to use a DOM if we do not have one. We use the []
    // notation so that the JSCompiler will not complain about these objects and
    // fields in the case where we have no DOM.
    if ('document' in goog.global) {
      return goog.string.unescapeEntitiesUsingDom_(str);
    } else {
      // Fall back on pure XML entities
      return goog.string.unescapePureXmlEntities_(str);
    }
  }
  return str;
};


/**
 * Unescapes an HTML string using a DOM to resolve non-XML, non-numeric
 * entities. This function is XSS-safe and whitespace-preserving.
 * @private
 * @param {string} str The string to unescape.
 * @return {string} The unescaped {@code str} string.
 */
goog.string.unescapeEntitiesUsingDom_ = function(str) {
  var seen = {'&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"'};
  var div = document.createElement('div');
  // Match as many valid entity characters as possible. If the actual entity
  // happens to be shorter, it will still work as innerHTML will return the
  // trailing characters unchanged. Since the entity characters do not include
  // open angle bracket, there is no chance of XSS from the innerHTML use.
  // Since no whitespace is passed to innerHTML, whitespace is preserved.
  return str.replace(goog.string.HTML_ENTITY_PATTERN_, function(s, entity) {
    // Check for cached entity.
    var value = seen[s];
    if (value) {
      return value;
    }
    // Check for numeric entity.
    if (entity.charAt(0) == '#') {
      // Prefix with 0 so that hex entities (e.g. &#x10) parse as hex numbers.
      var n = Number('0' + entity.substr(1));
      if (!isNaN(n)) {
        value = String.fromCharCode(n);
      }
    }
    // Fall back to innerHTML otherwise.
    if (!value) {
      // Append a non-entity character to avoid a bug in Webkit that parses
      // an invalid entity at the end of innerHTML text as the empty string.
      div.innerHTML = s + ' ';
      // Then remove the trailing character from the result.
      value = div.firstChild.nodeValue.slice(0, -1);
    }
    // Cache and return.
    return seen[s] = value;
  });
};


/**
 * Unescapes XML entities.
 * @private
 * @param {string} str The string to unescape.
 * @return {string} An unescaped copy of {@code str}.
 */
goog.string.unescapePureXmlEntities_ = function(str) {
  return str.replace(/&([^;]+);/g, function(s, entity) {
    switch (entity) {
      case 'amp':
        return '&';
      case 'lt':
        return '<';
      case 'gt':
        return '>';
      case 'quot':
        return '"';
      default:
        if (entity.charAt(0) == '#') {
          // Prefix with 0 so that hex entities (e.g. &#x10) parse as hex.
          var n = Number('0' + entity.substr(1));
          if (!isNaN(n)) {
            return String.fromCharCode(n);
          }
        }
        // For invalid entities we just return the entity
        return s;
    }
  });
};


/**
 * Regular expression that matches an HTML entity.
 * See also HTML5: Tokenization / Tokenizing character references.
 * @private
 * @type {!RegExp}
 */
goog.string.HTML_ENTITY_PATTERN_ = /&([^;\s<&]+);?/g;


/**
 * Do escaping of whitespace to preserve spatial formatting. We use character
 * entity #160 to make it safer for xml.
 * @param {string} str The string in which to escape whitespace.
 * @param {boolean=} opt_xml Whether to use XML compatible tags.
 * @return {string} An escaped copy of {@code str}.
 */
goog.string.whitespaceEscape = function(str, opt_xml) {
  return goog.string.newLineToBr(str.replace(/  /g, ' &#160;'), opt_xml);
};


/**
 * Strip quote characters around a string.  The second argument is a string of
 * characters to treat as quotes.  This can be a single character or a string of
 * multiple character and in that case each of those are treated as possible
 * quote characters. For example:
 *
 * <pre>
 * goog.string.stripQuotes('"abc"', '"`') --> 'abc'
 * goog.string.stripQuotes('`abc`', '"`') --> 'abc'
 * </pre>
 *
 * @param {string} str The string to strip.
 * @param {string} quoteChars The quote characters to strip.
 * @return {string} A copy of {@code str} without the quotes.
 */
goog.string.stripQuotes = function(str, quoteChars) {
  var length = quoteChars.length;
  for (var i = 0; i < length; i++) {
    var quoteChar = length == 1 ? quoteChars : quoteChars.charAt(i);
    if (str.charAt(0) == quoteChar && str.charAt(str.length - 1) == quoteChar) {
      return str.substring(1, str.length - 1);
    }
  }
  return str;
};


/**
 * Truncates a string to a certain length and adds '...' if necessary.  The
 * length also accounts for the ellipsis, so a maximum length of 10 and a string
 * 'Hello World!' produces 'Hello W...'.
 * @param {string} str The string to truncate.
 * @param {number} chars Max number of characters.
 * @param {boolean=} opt_protectEscapedCharacters Whether to protect escaped
 *     characters from being cut off in the middle.
 * @return {string} The truncated {@code str} string.
 */
goog.string.truncate = function(str, chars, opt_protectEscapedCharacters) {
  if (opt_protectEscapedCharacters) {
    str = goog.string.unescapeEntities(str);
  }

  if (str.length > chars) {
    str = str.substring(0, chars - 3) + '...';
  }

  if (opt_protectEscapedCharacters) {
    str = goog.string.htmlEscape(str);
  }

  return str;
};


/**
 * Truncate a string in the middle, adding "..." if necessary,
 * and favoring the beginning of the string.
 * @param {string} str The string to truncate the middle of.
 * @param {number} chars Max number of characters.
 * @param {boolean=} opt_protectEscapedCharacters Whether to protect escaped
 *     characters from being cutoff in the middle.
 * @param {number=} opt_trailingChars Optional number of trailing characters to
 *     leave at the end of the string, instead of truncating as close to the
 *     middle as possible.
 * @return {string} A truncated copy of {@code str}.
 */
goog.string.truncateMiddle = function(str, chars,
    opt_protectEscapedCharacters, opt_trailingChars) {
  if (opt_protectEscapedCharacters) {
    str = goog.string.unescapeEntities(str);
  }

  if (opt_trailingChars && str.length > chars) {
    if (opt_trailingChars > chars) {
      opt_trailingChars = chars;
    }
    var endPoint = str.length - opt_trailingChars;
    var startPoint = chars - opt_trailingChars;
    str = str.substring(0, startPoint) + '...' + str.substring(endPoint);
  } else if (str.length > chars) {
    // Favor the beginning of the string:
    var half = Math.floor(chars / 2);
    var endPos = str.length - half;
    half += chars % 2;
    str = str.substring(0, half) + '...' + str.substring(endPos);
  }

  if (opt_protectEscapedCharacters) {
    str = goog.string.htmlEscape(str);
  }

  return str;
};


/**
 * Special chars that need to be escaped for goog.string.quote.
 * @private
 * @type {Object}
 */
goog.string.specialEscapeChars_ = {
  '\0': '\\0',
  '\b': '\\b',
  '\f': '\\f',
  '\n': '\\n',
  '\r': '\\r',
  '\t': '\\t',
  '\x0B': '\\x0B', // '\v' is not supported in JScript
  '"': '\\"',
  '\\': '\\\\'
};


/**
 * Character mappings used internally for goog.string.escapeChar.
 * @private
 * @type {Object}
 */
goog.string.jsEscapeCache_ = {
  '\'': '\\\''
};


/**
 * Encloses a string in double quotes and escapes characters so that the
 * string is a valid JS string.
 * @param {string} s The string to quote.
 * @return {string} A copy of {@code s} surrounded by double quotes.
 */
goog.string.quote = function(s) {
  s = String(s);
  if (s.quote) {
    return s.quote();
  } else {
    var sb = ['"'];
    for (var i = 0; i < s.length; i++) {
      var ch = s.charAt(i);
      var cc = ch.charCodeAt(0);
      sb[i + 1] = goog.string.specialEscapeChars_[ch] ||
          ((cc > 31 && cc < 127) ? ch : goog.string.escapeChar(ch));
    }
    sb.push('"');
    return sb.join('');
  }
};


/**
 * Takes a string and returns the escaped string for that character.
 * @param {string} str The string to escape.
 * @return {string} An escaped string representing {@code str}.
 */
goog.string.escapeString = function(str) {
  var sb = [];
  for (var i = 0; i < str.length; i++) {
    sb[i] = goog.string.escapeChar(str.charAt(i));
  }
  return sb.join('');
};


/**
 * Takes a character and returns the escaped string for that character. For
 * example escapeChar(String.fromCharCode(15)) -> "\\x0E".
 * @param {string} c The character to escape.
 * @return {string} An escaped string representing {@code c}.
 */
goog.string.escapeChar = function(c) {
  if (c in goog.string.jsEscapeCache_) {
    return goog.string.jsEscapeCache_[c];
  }

  if (c in goog.string.specialEscapeChars_) {
    return goog.string.jsEscapeCache_[c] = goog.string.specialEscapeChars_[c];
  }

  var rv = c;
  var cc = c.charCodeAt(0);
  if (cc > 31 && cc < 127) {
    rv = c;
  } else {
    // tab is 9 but handled above
    if (cc < 256) {
      rv = '\\x';
      if (cc < 16 || cc > 256) {
        rv += '0';
      }
    } else {
      rv = '\\u';
      if (cc < 4096) { // \u1000
        rv += '0';
      }
    }
    rv += cc.toString(16).toUpperCase();
  }

  return goog.string.jsEscapeCache_[c] = rv;
};


/**
 * Takes a string and creates a map (Object) in which the keys are the
 * characters in the string. The value for the key is set to true. You can
 * then use goog.object.map or goog.array.map to change the values.
 * @param {string} s The string to build the map from.
 * @return {Object} The map of characters used.
 */
// TODO(arv): It seems like we should have a generic goog.array.toMap. But do
//            we want a dependency on goog.array in goog.string?
goog.string.toMap = function(s) {
  var rv = {};
  for (var i = 0; i < s.length; i++) {
    rv[s.charAt(i)] = true;
  }
  return rv;
};


/**
 * Checks whether a string contains a given character.
 * @param {string} s The string to test.
 * @param {string} ss The substring to test for.
 * @return {boolean} True if {@code s} contains {@code ss}.
 */
goog.string.contains = function(s, ss) {
  return s.indexOf(ss) != -1;
};


/**
 * Returns the non-overlapping occurrences of ss in s.
 * If either s or ss evalutes to false, then returns zero.
 * @param {string} s The string to look in.
 * @param {string} ss The string to look for.
 * @return {number} Number of occurrences of ss in s.
 */
goog.string.countOf = function(s, ss) {
  return s && ss ? s.split(ss).length - 1 : 0;
};


/**
 * Removes a substring of a specified length at a specific
 * index in a string.
 * @param {string} s The base string from which to remove.
 * @param {number} index The index at which to remove the substring.
 * @param {number} stringLength The length of the substring to remove.
 * @return {string} A copy of {@code s} with the substring removed or the full
 *     string if nothing is removed or the input is invalid.
 */
goog.string.removeAt = function(s, index, stringLength) {
  var resultStr = s;
  // If the index is greater or equal to 0 then remove substring
  if (index >= 0 && index < s.length && stringLength > 0) {
    resultStr = s.substr(0, index) +
        s.substr(index + stringLength, s.length - index - stringLength);
  }
  return resultStr;
};


/**
 *  Removes the first occurrence of a substring from a string.
 *  @param {string} s The base string from which to remove.
 *  @param {string} ss The string to remove.
 *  @return {string} A copy of {@code s} with {@code ss} removed or the full
 *      string if nothing is removed.
 */
goog.string.remove = function(s, ss) {
  var re = new RegExp(goog.string.regExpEscape(ss), '');
  return s.replace(re, '');
};


/**
 *  Removes all occurrences of a substring from a string.
 *  @param {string} s The base string from which to remove.
 *  @param {string} ss The string to remove.
 *  @return {string} A copy of {@code s} with {@code ss} removed or the full
 *      string if nothing is removed.
 */
goog.string.removeAll = function(s, ss) {
  var re = new RegExp(goog.string.regExpEscape(ss), 'g');
  return s.replace(re, '');
};


/**
 * Escapes characters in the string that are not safe to use in a RegExp.
 * @param {*} s The string to escape. If not a string, it will be casted
 *     to one.
 * @return {string} A RegExp safe, escaped copy of {@code s}.
 */
goog.string.regExpEscape = function(s) {
  return String(s).replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, '\\$1').
      replace(/\x08/g, '\\x08');
};


/**
 * Repeats a string n times.
 * @param {string} string The string to repeat.
 * @param {number} length The number of times to repeat.
 * @return {string} A string containing {@code length} repetitions of
 *     {@code string}.
 */
goog.string.repeat = function(string, length) {
  return new Array(length + 1).join(string);
};


/**
 * Pads number to given length and optionally rounds it to a given precision.
 * For example:
 * <pre>padNumber(1.25, 2, 3) -> '01.250'
 * padNumber(1.25, 2) -> '01.25'
 * padNumber(1.25, 2, 1) -> '01.3'
 * padNumber(1.25, 0) -> '1.25'</pre>
 *
 * @param {number} num The number to pad.
 * @param {number} length The desired length.
 * @param {number=} opt_precision The desired precision.
 * @return {string} {@code num} as a string with the given options.
 */
goog.string.padNumber = function(num, length, opt_precision) {
  var s = goog.isDef(opt_precision) ? num.toFixed(opt_precision) : String(num);
  var index = s.indexOf('.');
  if (index == -1) {
    index = s.length;
  }
  return goog.string.repeat('0', Math.max(0, length - index)) + s;
};


/**
 * Returns a string representation of the given object, with
 * null and undefined being returned as the empty string.
 *
 * @param {*} obj The object to convert.
 * @return {string} A string representation of the {@code obj}.
 */
goog.string.makeSafe = function(obj) {
  return obj == null ? '' : String(obj);
};


/**
 * Concatenates string expressions. This is useful
 * since some browsers are very inefficient when it comes to using plus to
 * concat strings. Be careful when using null and undefined here since
 * these will not be included in the result. If you need to represent these
 * be sure to cast the argument to a String first.
 * For example:
 * <pre>buildString('a', 'b', 'c', 'd') -> 'abcd'
 * buildString(null, undefined) -> ''
 * </pre>
 * @param {...*} var_args A list of strings to concatenate. If not a string,
 *     it will be casted to one.
 * @return {string} The concatenation of {@code var_args}.
 */
goog.string.buildString = function(var_args) {
  return Array.prototype.join.call(arguments, '');
};


/**
 * Returns a string with at least 64-bits of randomness.
 *
 * Doesn't trust Javascript's random function entirely. Uses a combination of
 * random and current timestamp, and then encodes the string in base-36 to
 * make it shorter.
 *
 * @return {string} A random string, e.g. sn1s7vb4gcic.
 */
goog.string.getRandomString = function() {
  var x = 2147483648;
  return Math.floor(Math.random() * x).toString(36) +
         Math.abs(Math.floor(Math.random() * x) ^ goog.now()).toString(36);
};


/**
 * Compares two version numbers.
 *
 * @param {string|number} version1 Version of first item.
 * @param {string|number} version2 Version of second item.
 *
 * @return {number}  1 if {@code version1} is higher.
 *                   0 if arguments are equal.
 *                  -1 if {@code version2} is higher.
 */
goog.string.compareVersions = function(version1, version2) {
  var order = 0;
  // Trim leading and trailing whitespace and split the versions into
  // subversions.
  var v1Subs = goog.string.trim(String(version1)).split('.');
  var v2Subs = goog.string.trim(String(version2)).split('.');
  var subCount = Math.max(v1Subs.length, v2Subs.length);

  // Iterate over the subversions, as long as they appear to be equivalent.
  for (var subIdx = 0; order == 0 && subIdx < subCount; subIdx++) {
    var v1Sub = v1Subs[subIdx] || '';
    var v2Sub = v2Subs[subIdx] || '';

    // Split the subversions into pairs of numbers and qualifiers (like 'b').
    // Two different RegExp objects are needed because they are both using
    // the 'g' flag.
    var v1CompParser = new RegExp('(\\d*)(\\D*)', 'g');
    var v2CompParser = new RegExp('(\\d*)(\\D*)', 'g');
    do {
      var v1Comp = v1CompParser.exec(v1Sub) || ['', '', ''];
      var v2Comp = v2CompParser.exec(v2Sub) || ['', '', ''];
      // Break if there are no more matches.
      if (v1Comp[0].length == 0 && v2Comp[0].length == 0) {
        break;
      }

      // Parse the numeric part of the subversion. A missing number is
      // equivalent to 0.
      var v1CompNum = v1Comp[1].length == 0 ? 0 : parseInt(v1Comp[1], 10);
      var v2CompNum = v2Comp[1].length == 0 ? 0 : parseInt(v2Comp[1], 10);

      // Compare the subversion components. The number has the highest
      // precedence. Next, if the numbers are equal, a subversion without any
      // qualifier is always higher than a subversion with any qualifier. Next,
      // the qualifiers are compared as strings.
      order = goog.string.compareElements_(v1CompNum, v2CompNum) ||
          goog.string.compareElements_(v1Comp[2].length == 0,
              v2Comp[2].length == 0) ||
          goog.string.compareElements_(v1Comp[2], v2Comp[2]);
      // Stop as soon as an inequality is discovered.
    } while (order == 0);
  }

  return order;
};


/**
 * Compares elements of a version number.
 *
 * @param {string|number|boolean} left An element from a version number.
 * @param {string|number|boolean} right An element from a version number.
 *
 * @return {number}  1 if {@code left} is higher.
 *                   0 if arguments are equal.
 *                  -1 if {@code right} is higher.
 * @private
 */
goog.string.compareElements_ = function(left, right) {
  if (left < right) {
    return -1;
  } else if (left > right) {
    return 1;
  }
  return 0;
};


/**
 * Maximum value of #goog.string.hashCode, exclusive. 2^32.
 * @type {number}
 * @private
 */
goog.string.HASHCODE_MAX_ = 0x100000000;


/**
 * String hash function similar to java.lang.String.hashCode().
 * The hash code for a string is computed as
 * s[0] * 31 ^ (n - 1) + s[1] * 31 ^ (n - 2) + ... + s[n - 1],
 * where s[i] is the ith character of the string and n is the length of
 * the string. We mod the result to make it between 0 (inclusive) and 2^32
 * (exclusive).
 * @param {string} str A string.
 * @return {number} Hash value for {@code str}, between 0 (inclusive) and 2^32
 *  (exclusive). The empty string returns 0.
 */
goog.string.hashCode = function(str) {
  var result = 0;
  for (var i = 0; i < str.length; ++i) {
    result = 31 * result + str.charCodeAt(i);
    // Normalize to 4 byte range, 0 ... 2^32.
    result %= goog.string.HASHCODE_MAX_;
  }
  return result;
};


/**
 * The most recent unique ID. |0 is equivalent to Math.floor in this case.
 * @type {number}
 * @private
 */
goog.string.uniqueStringCounter_ = Math.random() * 0x80000000 | 0;


/**
 * Generates and returns a string which is unique in the current document.
 * This is useful, for example, to create unique IDs for DOM elements.
 * @return {string} A unique id.
 */
goog.string.createUniqueString = function() {
  return 'goog_' + goog.string.uniqueStringCounter_++;
};


/**
 * Converts the supplied string to a number, which may be Ininity or NaN.
 * This function strips whitespace: (toNumber(' 123') === 123)
 * This function accepts scientific notation: (toNumber('1e1') === 10)
 *
 * This is better than Javascript's built-in conversions because, sadly:
 *     (Number(' ') === 0) and (parseFloat('123a') === 123)
 *
 * @param {string} str The string to convert.
 * @return {number} The number the supplied string represents, or NaN.
 */
goog.string.toNumber = function(str) {
  var num = Number(str);
  if (num == 0 && goog.string.isEmpty(str)) {
    return NaN;
  }
  return num;
};


/**
 * Converts a string from selector-case to camelCase (e.g. from
 * "multi-part-string" to "multiPartString"), useful for converting
 * CSS selectors and HTML dataset keys to their equivalent JS properties.
 * @param {string} str The string in selector-case form.
 * @return {string} The string in camelCase form.
 */
goog.string.toCamelCase = function(str) {
  return String(str).replace(/\-([a-z])/g, function(all, match) {
    return match.toUpperCase();
  });
};


/**
 * Converts a string from camelCase to selector-case (e.g. from
 * "multiPartString" to "multi-part-string"), useful for converting JS
 * style and dataset properties to equivalent CSS selectors and HTML keys.
 * @param {string} str The string in camelCase form.
 * @return {string} The string in selector-case form.
 */
goog.string.toSelectorCase = function(str) {
  return String(str).replace(/([A-Z])/g, '-$1').toLowerCase();
};


/**
 * Converts a string into TitleCase. First character of the string is always
 * capitalized in addition to the first letter of every subsequent word.
 * Words are delimited by one or more whitespaces by default. Custom delimiters
 * can optionally be specified to replace the default, which doesn't preserve
 * whitespace delimiters and instead must be explicitly included if needed.
 *
 * Default delimiter => " ":
 *    goog.string.toTitleCase('oneTwoThree')    => 'OneTwoThree'
 *    goog.string.toTitleCase('one two three')  => 'One Two Three'
 *    goog.string.toTitleCase('  one   two   ') => '  One   Two   '
 *    goog.string.toTitleCase('one_two_three')  => 'One_two_three'
 *    goog.string.toTitleCase('one-two-three')  => 'One-two-three'
 *
 * Custom delimiter => "_-.":
 *    goog.string.toTitleCase('oneTwoThree', '_-.')       => 'OneTwoThree'
 *    goog.string.toTitleCase('one two three', '_-.')     => 'One two three'
 *    goog.string.toTitleCase('  one   two   ', '_-.')    => '  one   two   '
 *    goog.string.toTitleCase('one_two_three', '_-.')     => 'One_Two_Three'
 *    goog.string.toTitleCase('one-two-three', '_-.')     => 'One-Two-Three'
 *    goog.string.toTitleCase('one...two...three', '_-.') => 'One...Two...Three'
 *    goog.string.toTitleCase('one. two. three', '_-.')   => 'One. two. three'
 *    goog.string.toTitleCase('one-two.three', '_-.')     => 'One-Two.Three'
 *
 * @param {string} str String value in camelCase form.
 * @param {string=} opt_delimiters Custom delimiter character set used to
 *      distinguish words in the string value. Each character represents a
 *      single delimiter. When provided, default whitespace delimiter is
 *      overridden and must be explicitly included if needed.
 * @return {string} String value in TitleCase form.
 */
goog.string.toTitleCase = function(str, opt_delimiters) {
  var delimiters = goog.isString(opt_delimiters) ?
      goog.string.regExpEscape(opt_delimiters) : '\\s';

  // For IE8, we need to prevent using an empty character set. Otherwise,
  // incorrect matching will occur.
  delimiters = delimiters ? '|[' + delimiters + ']+' : '';

  var regexp = new RegExp('(^' + delimiters + ')([a-z])', 'g');
  return str.replace(regexp, function(all, p1, p2) {
    return p1 + p2.toUpperCase();
  });
};
// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Rendering engine detection.
 * @see <a href="http://www.useragentstring.com/">User agent strings</a>
 * For information on the browser brand (such as Safari versus Chrome), see
 * goog.userAgent.product.
 * @see ../demos/useragent.html
 */

goog.provide('goog.userAgent');

goog.require('goog.string');


/**
 * @define {boolean} Whether we know at compile-time that the browser is IE.
 */
goog.userAgent.ASSUME_IE = false;


/**
 * @define {boolean} Whether we know at compile-time that the browser is GECKO.
 */
goog.userAgent.ASSUME_GECKO = false;


/**
 * @define {boolean} Whether we know at compile-time that the browser is WEBKIT.
 */
goog.userAgent.ASSUME_WEBKIT = false;


/**
 * @define {boolean} Whether we know at compile-time that the browser is a
 *     mobile device running WebKit e.g. iPhone or Android.
 */
goog.userAgent.ASSUME_MOBILE_WEBKIT = false;


/**
 * @define {boolean} Whether we know at compile-time that the browser is OPERA.
 */
goog.userAgent.ASSUME_OPERA = false;


/**
 * @define {boolean} Whether the {@code goog.userAgent.isVersion} function will
 *     return true for any version.
 */
goog.userAgent.ASSUME_ANY_VERSION = false;


/**
 * Whether we know the browser engine at compile-time.
 * @type {boolean}
 * @private
 */
goog.userAgent.BROWSER_KNOWN_ =
    goog.userAgent.ASSUME_IE ||
    goog.userAgent.ASSUME_GECKO ||
    goog.userAgent.ASSUME_MOBILE_WEBKIT ||
    goog.userAgent.ASSUME_WEBKIT ||
    goog.userAgent.ASSUME_OPERA;


/**
 * Returns the userAgent string for the current browser.
 * Some user agents (I'm thinking of you, Gears WorkerPool) do not expose a
 * navigator object off the global scope.  In that case we return null.
 *
 * @return {?string} The userAgent string or null if there is none.
 */
goog.userAgent.getUserAgentString = function() {
  return goog.global['navigator'] ? goog.global['navigator'].userAgent : null;
};


/**
 * @return {Object} The native navigator object.
 */
goog.userAgent.getNavigator = function() {
  // Need a local navigator reference instead of using the global one,
  // to avoid the rare case where they reference different objects.
  // (goog.gears.FakeWorkerPool, for example).
  return goog.global['navigator'];
};


/**
 * Initializer for goog.userAgent.
 *
 * This is a named function so that it can be stripped via the jscompiler
 * option for stripping types.
 * @private
 */
goog.userAgent.init_ = function() {
  /**
   * Whether the user agent string denotes Opera.
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedOpera_ = false;

  /**
   * Whether the user agent string denotes Internet Explorer. This includes
   * other browsers using Trident as its rendering engine. For example AOL
   * and Netscape 8
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedIe_ = false;

  /**
   * Whether the user agent string denotes WebKit. WebKit is the rendering
   * engine that Safari, Android and others use.
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedWebkit_ = false;

  /**
   * Whether the user agent string denotes a mobile device.
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedMobile_ = false;

  /**
   * Whether the user agent string denotes Gecko. Gecko is the rendering
   * engine used by Mozilla, Mozilla Firefox, Camino and many more.
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedGecko_ = false;

  var ua;
  if (!goog.userAgent.BROWSER_KNOWN_ &&
      (ua = goog.userAgent.getUserAgentString())) {
    var navigator = goog.userAgent.getNavigator();
    goog.userAgent.detectedOpera_ = ua.indexOf('Opera') == 0;
    goog.userAgent.detectedIe_ = !goog.userAgent.detectedOpera_ &&
        ua.indexOf('MSIE') != -1;
    goog.userAgent.detectedWebkit_ = !goog.userAgent.detectedOpera_ &&
        ua.indexOf('WebKit') != -1;
    // WebKit also gives navigator.product string equal to 'Gecko'.
    goog.userAgent.detectedMobile_ = goog.userAgent.detectedWebkit_ &&
        ua.indexOf('Mobile') != -1;
    goog.userAgent.detectedGecko_ = !goog.userAgent.detectedOpera_ &&
        !goog.userAgent.detectedWebkit_ && navigator.product == 'Gecko';
  }
};


if (!goog.userAgent.BROWSER_KNOWN_) {
  goog.userAgent.init_();
}


/**
 * Whether the user agent is Opera.
 * @type {boolean}
 */
goog.userAgent.OPERA = goog.userAgent.BROWSER_KNOWN_ ?
    goog.userAgent.ASSUME_OPERA : goog.userAgent.detectedOpera_;


/**
 * Whether the user agent is Internet Explorer. This includes other browsers
 * using Trident as its rendering engine. For example AOL and Netscape 8
 * @type {boolean}
 */
goog.userAgent.IE = goog.userAgent.BROWSER_KNOWN_ ?
    goog.userAgent.ASSUME_IE : goog.userAgent.detectedIe_;


/**
 * Whether the user agent is Gecko. Gecko is the rendering engine used by
 * Mozilla, Mozilla Firefox, Camino and many more.
 * @type {boolean}
 */
goog.userAgent.GECKO = goog.userAgent.BROWSER_KNOWN_ ?
    goog.userAgent.ASSUME_GECKO :
    goog.userAgent.detectedGecko_;


/**
 * Whether the user agent is WebKit. WebKit is the rendering engine that
 * Safari, Android and others use.
 * @type {boolean}
 */
goog.userAgent.WEBKIT = goog.userAgent.BROWSER_KNOWN_ ?
    goog.userAgent.ASSUME_WEBKIT || goog.userAgent.ASSUME_MOBILE_WEBKIT :
    goog.userAgent.detectedWebkit_;


/**
 * Whether the user agent is running on a mobile device.
 * @type {boolean}
 */
goog.userAgent.MOBILE = goog.userAgent.ASSUME_MOBILE_WEBKIT ||
                        goog.userAgent.detectedMobile_;


/**
 * Used while transitioning code to use WEBKIT instead.
 * @type {boolean}
 * @deprecated Use {@link goog.userAgent.product.SAFARI} instead.
 * TODO(nicksantos): Delete this from goog.userAgent.
 */
goog.userAgent.SAFARI = goog.userAgent.WEBKIT;


/**
 * @return {string} the platform (operating system) the user agent is running
 *     on. Default to empty string because navigator.platform may not be defined
 *     (on Rhino, for example).
 * @private
 */
goog.userAgent.determinePlatform_ = function() {
  var navigator = goog.userAgent.getNavigator();
  return navigator && navigator.platform || '';
};


/**
 * The platform (operating system) the user agent is running on. Default to
 * empty string because navigator.platform may not be defined (on Rhino, for
 * example).
 * @type {string}
 */
goog.userAgent.PLATFORM = goog.userAgent.determinePlatform_();


/**
 * @define {boolean} Whether the user agent is running on a Macintosh operating
 *     system.
 */
goog.userAgent.ASSUME_MAC = false;


/**
 * @define {boolean} Whether the user agent is running on a Windows operating
 *     system.
 */
goog.userAgent.ASSUME_WINDOWS = false;


/**
 * @define {boolean} Whether the user agent is running on a Linux operating
 *     system.
 */
goog.userAgent.ASSUME_LINUX = false;


/**
 * @define {boolean} Whether the user agent is running on a X11 windowing
 *     system.
 */
goog.userAgent.ASSUME_X11 = false;


/**
 * @type {boolean}
 * @private
 */
goog.userAgent.PLATFORM_KNOWN_ =
    goog.userAgent.ASSUME_MAC ||
    goog.userAgent.ASSUME_WINDOWS ||
    goog.userAgent.ASSUME_LINUX ||
    goog.userAgent.ASSUME_X11;


/**
 * Initialize the goog.userAgent constants that define which platform the user
 * agent is running on.
 * @private
 */
goog.userAgent.initPlatform_ = function() {
  /**
   * Whether the user agent is running on a Macintosh operating system.
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedMac_ = goog.string.contains(goog.userAgent.PLATFORM,
      'Mac');

  /**
   * Whether the user agent is running on a Windows operating system.
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedWindows_ = goog.string.contains(
      goog.userAgent.PLATFORM, 'Win');

  /**
   * Whether the user agent is running on a Linux operating system.
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedLinux_ = goog.string.contains(goog.userAgent.PLATFORM,
      'Linux');

  /**
   * Whether the user agent is running on a X11 windowing system.
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedX11_ = !!goog.userAgent.getNavigator() &&
      goog.string.contains(goog.userAgent.getNavigator()['appVersion'] || '',
          'X11');
};


if (!goog.userAgent.PLATFORM_KNOWN_) {
  goog.userAgent.initPlatform_();
}


/**
 * Whether the user agent is running on a Macintosh operating system.
 * @type {boolean}
 */
goog.userAgent.MAC = goog.userAgent.PLATFORM_KNOWN_ ?
    goog.userAgent.ASSUME_MAC : goog.userAgent.detectedMac_;


/**
 * Whether the user agent is running on a Windows operating system.
 * @type {boolean}
 */
goog.userAgent.WINDOWS = goog.userAgent.PLATFORM_KNOWN_ ?
    goog.userAgent.ASSUME_WINDOWS : goog.userAgent.detectedWindows_;


/**
 * Whether the user agent is running on a Linux operating system.
 * @type {boolean}
 */
goog.userAgent.LINUX = goog.userAgent.PLATFORM_KNOWN_ ?
    goog.userAgent.ASSUME_LINUX : goog.userAgent.detectedLinux_;


/**
 * Whether the user agent is running on a X11 windowing system.
 * @type {boolean}
 */
goog.userAgent.X11 = goog.userAgent.PLATFORM_KNOWN_ ?
    goog.userAgent.ASSUME_X11 : goog.userAgent.detectedX11_;


/**
 * @return {string} The string that describes the version number of the user
 *     agent.
 * @private
 */
goog.userAgent.determineVersion_ = function() {
  // All browsers have different ways to detect the version and they all have
  // different naming schemes.

  // version is a string rather than a number because it may contain 'b', 'a',
  // and so on.
  var version = '', re;

  if (goog.userAgent.OPERA && goog.global['opera']) {
    var operaVersion = goog.global['opera'].version;
    version = typeof operaVersion == 'function' ? operaVersion() : operaVersion;
  } else {
    if (goog.userAgent.GECKO) {
      re = /rv\:([^\);]+)(\)|;)/;
    } else if (goog.userAgent.IE) {
      re = /MSIE\s+([^\);]+)(\)|;)/;
    } else if (goog.userAgent.WEBKIT) {
      // WebKit/125.4
      re = /WebKit\/(\S+)/;
    }
    if (re) {
      var arr = re.exec(goog.userAgent.getUserAgentString());
      version = arr ? arr[1] : '';
    }
  }
  if (goog.userAgent.IE) {
    // IE9 can be in document mode 9 but be reporting an inconsistent user agent
    // version.  If it is identifying as a version lower than 9 we take the
    // documentMode as the version instead.  IE8 has similar behavior.
    // It is recommended to set the X-UA-Compatible header to ensure that IE9
    // uses documentMode 9.
    var docMode = goog.userAgent.getDocumentMode_();
    if (docMode > parseFloat(version)) {
      return String(docMode);
    }
  }
  return version;
};


/**
 * @return {number|undefined} Returns the document mode (for testing).
 * @private
 */
goog.userAgent.getDocumentMode_ = function() {
  // NOTE(user): goog.userAgent may be used in context where there is no DOM.
  var doc = goog.global['document'];
  return doc ? doc['documentMode'] : undefined;
};


/**
 * The version of the user agent. This is a string because it might contain
 * 'b' (as in beta) as well as multiple dots.
 * @type {string}
 */
goog.userAgent.VERSION = goog.userAgent.determineVersion_();


/**
 * Compares two version numbers.
 *
 * @param {string} v1 Version of first item.
 * @param {string} v2 Version of second item.
 *
 * @return {number}  1 if first argument is higher
 *                   0 if arguments are equal
 *                  -1 if second argument is higher.
 * @deprecated Use goog.string.compareVersions.
 */
goog.userAgent.compare = function(v1, v2) {
  return goog.string.compareVersions(v1, v2);
};


/**
 * Cache for {@link goog.userAgent.isVersion}. Calls to compareVersions are
 * surprisingly expensive and as a browsers version number is unlikely to change
 * during a session we cache the results.
 * @type {Object}
 * @private
 */
goog.userAgent.isVersionCache_ = {};


/**
 * Whether the user agent version is higher or the same as the given version.
 * NOTE: When checking the version numbers for Firefox and Safari, be sure to
 * use the engine's version, not the browser's version number.  For example,
 * Firefox 3.0 corresponds to Gecko 1.9 and Safari 3.0 to Webkit 522.11.
 * Opera and Internet Explorer versions match the product release number.<br>
 * @see <a href="http://en.wikipedia.org/wiki/Safari_version_history">
 *     Webkit</a>
 * @see <a href="http://en.wikipedia.org/wiki/Gecko_engine">Gecko</a>
 *
 * @param {string|number} version The version to check.
 * @return {boolean} Whether the user agent version is higher or the same as
 *     the given version.
 */
goog.userAgent.isVersion = function(version) {
  return goog.userAgent.ASSUME_ANY_VERSION ||
      goog.userAgent.isVersionCache_[version] ||
      (goog.userAgent.isVersionCache_[version] =
          goog.string.compareVersions(goog.userAgent.VERSION, version) >= 0);
};


/**
 * Cache for {@link goog.userAgent.isDocumentMode}.
 * Browsers document mode version number is unlikely to change during a session
 * we cache the results.
 * @type {Object}
 * @private
 */
goog.userAgent.isDocumentModeCache_ = {};


/**
 * Whether the IE effective document mode is higher or the same as the given
 * document mode version.
 * NOTE: Only for IE, return false for another browser.
 *
 * @param {number} documentMode The document mode version to check.
 * @return {boolean} Whether the IE effective document mode is higher or the
 *     same as the given version.
 */
goog.userAgent.isDocumentMode = function(documentMode) {
  return goog.userAgent.isDocumentModeCache_[documentMode] ||
      (goog.userAgent.isDocumentModeCache_[documentMode] = goog.userAgent.IE &&
      !!document.documentMode && document.documentMode >= documentMode);
};
// Copyright 2009 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Provides a base class for custom Error objects such that the
 * stack is correctly maintained.
 *
 * You should never need to throw goog.debug.Error(msg) directly, Error(msg) is
 * sufficient.
 *
 */

goog.provide('goog.debug.Error');



/**
 * Base class for custom error objects.
 * @param {*=} opt_msg The message associated with the error.
 * @constructor
 * @extends {Error}
 */
goog.debug.Error = function(opt_msg) {

  // Ensure there is a stack trace.
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, goog.debug.Error);
  } else {
    this.stack = new Error().stack || '';
  }

  if (opt_msg) {
    this.message = String(opt_msg);
  }
};
goog.inherits(goog.debug.Error, Error);


/** @override */
goog.debug.Error.prototype.name = 'CustomError';
// Copyright 2008 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utilities to check the preconditions, postconditions and
 * invariants runtime.
 *
 * Methods in this package should be given special treatment by the compiler
 * for type-inference. For example, <code>goog.asserts.assert(foo)</code>
 * will restrict <code>foo</code> to a truthy value.
 *
 * The compiler has an option to disable asserts. So code like:
 * <code>
 * var x = goog.asserts.assert(foo()); goog.asserts.assert(bar());
 * </code>
 * will be transformed into:
 * <code>
 * var x = foo();
 * </code>
 * The compiler will leave in foo() (because its return value is used),
 * but it will remove bar() because it assumes it does not have side-effects.
 *
 */

goog.provide('goog.asserts');
goog.provide('goog.asserts.AssertionError');

goog.require('goog.debug.Error');
goog.require('goog.string');


/**
 * @define {boolean} Whether to strip out asserts or to leave them in.
 */
goog.asserts.ENABLE_ASSERTS = goog.DEBUG;



/**
 * Error object for failed assertions.
 * @param {string} messagePattern The pattern that was used to form message.
 * @param {!Array.<*>} messageArgs The items to substitute into the pattern.
 * @constructor
 * @extends {goog.debug.Error}
 */
goog.asserts.AssertionError = function(messagePattern, messageArgs) {
  messageArgs.unshift(messagePattern);
  goog.debug.Error.call(this, goog.string.subs.apply(null, messageArgs));
  // Remove the messagePattern afterwards to avoid permenantly modifying the
  // passed in array.
  messageArgs.shift();

  /**
   * The message pattern used to format the error message. Error handlers can
   * use this to uniquely identify the assertion.
   * @type {string}
   */
  this.messagePattern = messagePattern;
};
goog.inherits(goog.asserts.AssertionError, goog.debug.Error);


/** @override */
goog.asserts.AssertionError.prototype.name = 'AssertionError';


/**
 * Throws an exception with the given message and "Assertion failed" prefixed
 * onto it.
 * @param {string} defaultMessage The message to use if givenMessage is empty.
 * @param {Array.<*>} defaultArgs The substitution arguments for defaultMessage.
 * @param {string|undefined} givenMessage Message supplied by the caller.
 * @param {Array.<*>} givenArgs The substitution arguments for givenMessage.
 * @throws {goog.asserts.AssertionError} When the value is not a number.
 * @private
 */
goog.asserts.doAssertFailure_ =
    function(defaultMessage, defaultArgs, givenMessage, givenArgs) {
  var message = 'Assertion failed';
  if (givenMessage) {
    message += ': ' + givenMessage;
    var args = givenArgs;
  } else if (defaultMessage) {
    message += ': ' + defaultMessage;
    args = defaultArgs;
  }
  // The '' + works around an Opera 10 bug in the unit tests. Without it,
  // a stack trace is added to var message above. With this, a stack trace is
  // not added until this line (it causes the extra garbage to be added after
  // the assertion message instead of in the middle of it).
  throw new goog.asserts.AssertionError('' + message, args || []);
};


/**
 * Checks if the condition evaluates to true if goog.asserts.ENABLE_ASSERTS is
 * true.
 * @param {*} condition The condition to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {*} The value of the condition.
 * @throws {goog.asserts.AssertionError} When the condition evaluates to false.
 */
goog.asserts.assert = function(condition, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !condition) {
    goog.asserts.doAssertFailure_('', null, opt_message,
        Array.prototype.slice.call(arguments, 2));
  }
  return condition;
};


/**
 * Fails if goog.asserts.ENABLE_ASSERTS is true. This function is useful in case
 * when we want to add a check in the unreachable area like switch-case
 * statement:
 *
 * <pre>
 *  switch(type) {
 *    case FOO: doSomething(); break;
 *    case BAR: doSomethingElse(); break;
 *    default: goog.assert.fail('Unrecognized type: ' + type);
 *      // We have only 2 types - "default:" section is unreachable code.
 *  }
 * </pre>
 *
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @throws {goog.asserts.AssertionError} Failure.
 */
goog.asserts.fail = function(opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS) {
    throw new goog.asserts.AssertionError(
        'Failure' + (opt_message ? ': ' + opt_message : ''),
        Array.prototype.slice.call(arguments, 1));
  }
};


/**
 * Checks if the value is a number if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {number} The value, guaranteed to be a number when asserts enabled.
 * @throws {goog.asserts.AssertionError} When the value is not a number.
 */
goog.asserts.assertNumber = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isNumber(value)) {
    goog.asserts.doAssertFailure_('Expected number but got %s: %s.',
        [goog.typeOf(value), value], opt_message,
        Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {number} */ (value);
};


/**
 * Checks if the value is a string if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {string} The value, guaranteed to be a string when asserts enabled.
 * @throws {goog.asserts.AssertionError} When the value is not a string.
 */
goog.asserts.assertString = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isString(value)) {
    goog.asserts.doAssertFailure_('Expected string but got %s: %s.',
        [goog.typeOf(value), value], opt_message,
        Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {string} */ (value);
};


/**
 * Checks if the value is a function if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {!Function} The value, guaranteed to be a function when asserts
 *     enabled.
 * @throws {goog.asserts.AssertionError} When the value is not a function.
 */
goog.asserts.assertFunction = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isFunction(value)) {
    goog.asserts.doAssertFailure_('Expected function but got %s: %s.',
        [goog.typeOf(value), value], opt_message,
        Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {!Function} */ (value);
};


/**
 * Checks if the value is an Object if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {!Object} The value, guaranteed to be a non-null object.
 * @throws {goog.asserts.AssertionError} When the value is not an object.
 */
goog.asserts.assertObject = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isObject(value)) {
    goog.asserts.doAssertFailure_('Expected object but got %s: %s.',
        [goog.typeOf(value), value],
        opt_message, Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {!Object} */ (value);
};


/**
 * Checks if the value is an Array if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {!Array} The value, guaranteed to be a non-null array.
 * @throws {goog.asserts.AssertionError} When the value is not an array.
 */
goog.asserts.assertArray = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isArray(value)) {
    goog.asserts.doAssertFailure_('Expected array but got %s: %s.',
        [goog.typeOf(value), value], opt_message,
        Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {!Array} */ (value);
};


/**
 * Checks if the value is a boolean if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {boolean} The value, guaranteed to be a boolean when asserts are
 *     enabled.
 * @throws {goog.asserts.AssertionError} When the value is not a boolean.
 */
goog.asserts.assertBoolean = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isBoolean(value)) {
    goog.asserts.doAssertFailure_('Expected boolean but got %s: %s.',
        [goog.typeOf(value), value], opt_message,
        Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {boolean} */ (value);
};


/**
 * Checks if the value is an instance of the user-defined type if
 * goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {!Function} type A user-defined constructor.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @throws {goog.asserts.AssertionError} When the value is not an instance of
 *     type.
 */
goog.asserts.assertInstanceof = function(value, type, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !(value instanceof type)) {
    goog.asserts.doAssertFailure_('instanceof check failed.', null,
        opt_message, Array.prototype.slice.call(arguments, 3));
  }
};

// Copyright 2008 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Simple utilities for dealing with URI strings.
 *
 * This is intended to be a lightweight alternative to constructing goog.Uri
 * objects.  Whereas goog.Uri adds several kilobytes to the binary regardless
 * of how much of its functionality you use, this is designed to be a set of
 * mostly-independent utilities so that the compiler includes only what is
 * necessary for the task.  Estimated savings of porting is 5k pre-gzip and
 * 1.5k post-gzip.  To ensure the savings remain, future developers should
 * avoid adding new functionality to existing functions, but instead create
 * new ones and factor out shared code.
 *
 * Many of these utilities have limited functionality, tailored to common
 * cases.  The query parameter utilities assume that the parameter keys are
 * already encoded, since most keys are compile-time alphanumeric strings.  The
 * query parameter mutation utilities also do not tolerate fragment identifiers.
 *
 * By design, these functions can be slower than goog.Uri equivalents.
 * Repeated calls to some of functions may be quadratic in behavior for IE,
 * although the effect is somewhat limited given the 2kb limit.
 *
 * One advantage of the limited functionality here is that this approach is
 * less sensitive to differences in URI encodings than goog.Uri, since these
 * functions modify the strings in place, rather than decoding and
 * re-encoding.
 *
 * Uses features of RFC 3986 for parsing/formatting URIs:
 *   http://gbiv.com/protocols/uri/rfc/rfc3986.html
 *
 * @author gboyer@google.com (Garrett Boyer) - The "lightened" design.
 * @author msamuel@google.com (Mike Samuel) - Domain knowledge and regexes.
 */

goog.provide('goog.uri.utils');
goog.provide('goog.uri.utils.ComponentIndex');
goog.provide('goog.uri.utils.QueryArray');
goog.provide('goog.uri.utils.QueryValue');
goog.provide('goog.uri.utils.StandardQueryParam');

goog.require('goog.asserts');
goog.require('goog.string');
goog.require('goog.userAgent');


/**
 * Character codes inlined to avoid object allocations due to charCode.
 * @enum {number}
 * @private
 */
goog.uri.utils.CharCode_ = {
  AMPERSAND: 38,
  EQUAL: 61,
  HASH: 35,
  QUESTION: 63
};


/**
 * Builds a URI string from already-encoded parts.
 *
 * No encoding is performed.  Any component may be omitted as either null or
 * undefined.
 *
 * @param {?string=} opt_scheme The scheme such as 'http'.
 * @param {?string=} opt_userInfo The user name before the '@'.
 * @param {?string=} opt_domain The domain such as 'www.google.com', already
 *     URI-encoded.
 * @param {(string|number|null)=} opt_port The port number.
 * @param {?string=} opt_path The path, already URI-encoded.  If it is not
 *     empty, it must begin with a slash.
 * @param {?string=} opt_queryData The URI-encoded query data.
 * @param {?string=} opt_fragment The URI-encoded fragment identifier.
 * @return {string} The fully combined URI.
 */
goog.uri.utils.buildFromEncodedParts = function(opt_scheme, opt_userInfo,
    opt_domain, opt_port, opt_path, opt_queryData, opt_fragment) {
  var out = [];

  if (opt_scheme) {
    out.push(opt_scheme, ':');
  }

  if (opt_domain) {
    out.push('//');

    if (opt_userInfo) {
      out.push(opt_userInfo, '@');
    }

    out.push(opt_domain);

    if (opt_port) {
      out.push(':', opt_port);
    }
  }

  if (opt_path) {
    out.push(opt_path);
  }

  if (opt_queryData) {
    out.push('?', opt_queryData);
  }

  if (opt_fragment) {
    out.push('#', opt_fragment);
  }

  return out.join('');
};


/**
 * A regular expression for breaking a URI into its component parts.
 *
 * {@link http://www.gbiv.com/protocols/uri/rfc/rfc3986.html#RFC2234} says
 * As the "first-match-wins" algorithm is identical to the "greedy"
 * disambiguation method used by POSIX regular expressions, it is natural and
 * commonplace to use a regular expression for parsing the potential five
 * components of a URI reference.
 *
 * The following line is the regular expression for breaking-down a
 * well-formed URI reference into its components.
 *
 * <pre>
 * ^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?
 *  12            3  4          5       6  7        8 9
 * </pre>
 *
 * The numbers in the second line above are only to assist readability; they
 * indicate the reference points for each subexpression (i.e., each paired
 * parenthesis). We refer to the value matched for subexpression <n> as $<n>.
 * For example, matching the above expression to
 * <pre>
 *     http://www.ics.uci.edu/pub/ietf/uri/#Related
 * </pre>
 * results in the following subexpression matches:
 * <pre>
 *    $1 = http:
 *    $2 = http
 *    $3 = //www.ics.uci.edu
 *    $4 = www.ics.uci.edu
 *    $5 = /pub/ietf/uri/
 *    $6 = <undefined>
 *    $7 = <undefined>
 *    $8 = #Related
 *    $9 = Related
 * </pre>
 * where <undefined> indicates that the component is not present, as is the
 * case for the query component in the above example. Therefore, we can
 * determine the value of the five components as
 * <pre>
 *    scheme    = $2
 *    authority = $4
 *    path      = $5
 *    query     = $7
 *    fragment  = $9
 * </pre>
 *
 * The regular expression has been modified slightly to expose the
 * userInfo, domain, and port separately from the authority.
 * The modified version yields
 * <pre>
 *    $1 = http              scheme
 *    $2 = <undefined>       userInfo -\
 *    $3 = www.ics.uci.edu   domain     | authority
 *    $4 = <undefined>       port     -/
 *    $5 = /pub/ietf/uri/    path
 *    $6 = <undefined>       query without ?
 *    $7 = Related           fragment without #
 * </pre>
 * @type {!RegExp}
 * @private
 */
goog.uri.utils.splitRe_ = new RegExp(
    '^' +
    '(?:' +
      '([^:/?#.]+)' +                     // scheme - ignore special characters
                                          // used by other URL parts such as :,
                                          // ?, /, #, and .
    ':)?' +
    '(?://' +
      '(?:([^/?#]*)@)?' +                 // userInfo
      '([\\w\\d\\-\\u0100-\\uffff.%]*)' + // domain - restrict to letters,
                                          // digits, dashes, dots, percent
                                          // escapes, and unicode characters.
      '(?::([0-9]+))?' +                  // port
    ')?' +
    '([^?#]+)?' +                         // path
    '(?:\\?([^#]*))?' +                   // query
    '(?:#(.*))?' +                        // fragment
    '$');


/**
 * The index of each URI component in the return value of goog.uri.utils.split.
 * @enum {number}
 */
goog.uri.utils.ComponentIndex = {
  SCHEME: 1,
  USER_INFO: 2,
  DOMAIN: 3,
  PORT: 4,
  PATH: 5,
  QUERY_DATA: 6,
  FRAGMENT: 7
};


/**
 * Splits a URI into its component parts.
 *
 * Each component can be accessed via the component indices; for example:
 * <pre>
 * goog.uri.utils.split(someStr)[goog.uri.utils.CompontentIndex.QUERY_DATA];
 * </pre>
 *
 * @param {string} uri The URI string to examine.
 * @return {!Array.<string|undefined>} Each component still URI-encoded.
 *     Each component that is present will contain the encoded value, whereas
 *     components that are not present will be undefined or empty, depending
 *     on the browser's regular expression implementation.  Never null, since
 *     arbitrary strings may still look like path names.
 */
goog.uri.utils.split = function(uri) {

  // See @return comment -- never null.
  return /** @type {!Array.<string|undefined>} */ (
      uri.match(goog.uri.utils.splitRe_));
};




/**
 * @param {?string} uri A possibly null string.
 * @return {?string} The string URI-decoded, or null if uri is null.
 * @private
 */
goog.uri.utils.decodeIfPossible_ = function(uri) {
  return uri && decodeURIComponent(uri);
};


/**
 * Gets a URI component by index.
 *
 * It is preferred to use the getPathEncoded() variety of functions ahead,
 * since they are more readable.
 *
 * @param {goog.uri.utils.ComponentIndex} componentIndex The component index.
 * @param {string} uri The URI to examine.
 * @return {?string} The still-encoded component, or null if the component
 *     is not present.
 * @private
 */
goog.uri.utils.getComponentByIndex_ = function(componentIndex, uri) {
  // Convert undefined, null, and empty string into null.
  return goog.uri.utils.split(uri)[componentIndex] || null;
};


/**
 * @param {string} uri The URI to examine.
 * @return {?string} The protocol or scheme, or null if none.  Does not
 *     include trailing colons or slashes.
 */
goog.uri.utils.getScheme = function(uri) {
  return goog.uri.utils.getComponentByIndex_(
      goog.uri.utils.ComponentIndex.SCHEME, uri);
};


/**
 * Gets the effective scheme for the URL.  If the URL is relative then the
 * scheme is derived from the page's location.
 * @param {string} uri The URI to examine.
 * @return {string} The protocol or scheme, always lower case.
 */
goog.uri.utils.getEffectiveScheme = function(uri) {
  var scheme = goog.uri.utils.getScheme(uri);
  if (!scheme && self.location) {
    var protocol = self.location.protocol;
    scheme = protocol.substr(0, protocol.length - 1);
  }
  // NOTE: When called from a web worker in Firefox 3.5, location maybe null.
  // All other browsers with web workers support self.location from the worker.
  return scheme ? scheme.toLowerCase() : '';
};


/**
 * @param {string} uri The URI to examine.
 * @return {?string} The user name still encoded, or null if none.
 */
goog.uri.utils.getUserInfoEncoded = function(uri) {
  return goog.uri.utils.getComponentByIndex_(
      goog.uri.utils.ComponentIndex.USER_INFO, uri);
};


/**
 * @param {string} uri The URI to examine.
 * @return {?string} The decoded user info, or null if none.
 */
goog.uri.utils.getUserInfo = function(uri) {
  return goog.uri.utils.decodeIfPossible_(
      goog.uri.utils.getUserInfoEncoded(uri));
};


/**
 * @param {string} uri The URI to examine.
 * @return {?string} The domain name still encoded, or null if none.
 */
goog.uri.utils.getDomainEncoded = function(uri) {
  return goog.uri.utils.getComponentByIndex_(
      goog.uri.utils.ComponentIndex.DOMAIN, uri);
};


/**
 * @param {string} uri The URI to examine.
 * @return {?string} The decoded domain, or null if none.
 */
goog.uri.utils.getDomain = function(uri) {
  return goog.uri.utils.decodeIfPossible_(goog.uri.utils.getDomainEncoded(uri));
};


/**
 * @param {string} uri The URI to examine.
 * @return {?number} The port number, or null if none.
 */
goog.uri.utils.getPort = function(uri) {
  // Coerce to a number.  If the result of getComponentByIndex_ is null or
  // non-numeric, the number coersion yields NaN.  This will then return
  // null for all non-numeric cases (though also zero, which isn't a relevant
  // port number).
  return Number(goog.uri.utils.getComponentByIndex_(
      goog.uri.utils.ComponentIndex.PORT, uri)) || null;
};


/**
 * @param {string} uri The URI to examine.
 * @return {?string} The path still encoded, or null if none. Includes the
 *     leading slash, if any.
 */
goog.uri.utils.getPathEncoded = function(uri) {
  return goog.uri.utils.getComponentByIndex_(
      goog.uri.utils.ComponentIndex.PATH, uri);
};


/**
 * @param {string} uri The URI to examine.
 * @return {?string} The decoded path, or null if none.  Includes the leading
 *     slash, if any.
 */
goog.uri.utils.getPath = function(uri) {
  return goog.uri.utils.decodeIfPossible_(goog.uri.utils.getPathEncoded(uri));
};


/**
 * @param {string} uri The URI to examine.
 * @return {?string} The query data still encoded, or null if none.  Does not
 *     include the question mark itself.
 */
goog.uri.utils.getQueryData = function(uri) {
  return goog.uri.utils.getComponentByIndex_(
      goog.uri.utils.ComponentIndex.QUERY_DATA, uri);
};


/**
 * @param {string} uri The URI to examine.
 * @return {?string} The fragment identifier, or null if none.  Does not
 *     include the hash mark itself.
 */
goog.uri.utils.getFragmentEncoded = function(uri) {
  // The hash mark may not appear in any other part of the URL.
  var hashIndex = uri.indexOf('#');
  return hashIndex < 0 ? null : uri.substr(hashIndex + 1);
};


/**
 * @param {string} uri The URI to examine.
 * @param {?string} fragment The encoded fragment identifier, or null if none.
 *     Does not include the hash mark itself.
 * @return {string} The URI with the fragment set.
 */
goog.uri.utils.setFragmentEncoded = function(uri, fragment) {
  return goog.uri.utils.removeFragment(uri) + (fragment ? '#' + fragment : '');
};


/**
 * @param {string} uri The URI to examine.
 * @return {?string} The decoded fragment identifier, or null if none.  Does
 *     not include the hash mark.
 */
goog.uri.utils.getFragment = function(uri) {
  return goog.uri.utils.decodeIfPossible_(
      goog.uri.utils.getFragmentEncoded(uri));
};


/**
 * Extracts everything up to the port of the URI.
 * @param {string} uri The URI string.
 * @return {string} Everything up to and including the port.
 */
goog.uri.utils.getHost = function(uri) {
  var pieces = goog.uri.utils.split(uri);
  return goog.uri.utils.buildFromEncodedParts(
      pieces[goog.uri.utils.ComponentIndex.SCHEME],
      pieces[goog.uri.utils.ComponentIndex.USER_INFO],
      pieces[goog.uri.utils.ComponentIndex.DOMAIN],
      pieces[goog.uri.utils.ComponentIndex.PORT]);
};


/**
 * Extracts the path of the URL and everything after.
 * @param {string} uri The URI string.
 * @return {string} The URI, starting at the path and including the query
 *     parameters and fragment identifier.
 */
goog.uri.utils.getPathAndAfter = function(uri) {
  var pieces = goog.uri.utils.split(uri);
  return goog.uri.utils.buildFromEncodedParts(null, null, null, null,
      pieces[goog.uri.utils.ComponentIndex.PATH],
      pieces[goog.uri.utils.ComponentIndex.QUERY_DATA],
      pieces[goog.uri.utils.ComponentIndex.FRAGMENT]);
};


/**
 * Gets the URI with the fragment identifier removed.
 * @param {string} uri The URI to examine.
 * @return {string} Everything preceding the hash mark.
 */
goog.uri.utils.removeFragment = function(uri) {
  // The hash mark may not appear in any other part of the URL.
  var hashIndex = uri.indexOf('#');
  return hashIndex < 0 ? uri : uri.substr(0, hashIndex);
};


/**
 * Ensures that two URI's have the exact same domain, scheme, and port.
 *
 * Unlike the version in goog.Uri, this checks protocol, and therefore is
 * suitable for checking against the browser's same-origin policy.
 *
 * @param {string} uri1 The first URI.
 * @param {string} uri2 The second URI.
 * @return {boolean} Whether they have the same domain and port.
 */
goog.uri.utils.haveSameDomain = function(uri1, uri2) {
  var pieces1 = goog.uri.utils.split(uri1);
  var pieces2 = goog.uri.utils.split(uri2);
  return pieces1[goog.uri.utils.ComponentIndex.DOMAIN] ==
             pieces2[goog.uri.utils.ComponentIndex.DOMAIN] &&
         pieces1[goog.uri.utils.ComponentIndex.SCHEME] ==
             pieces2[goog.uri.utils.ComponentIndex.SCHEME] &&
         pieces1[goog.uri.utils.ComponentIndex.PORT] ==
             pieces2[goog.uri.utils.ComponentIndex.PORT];
};


/**
 * Asserts that there are no fragment or query identifiers, only in uncompiled
 * mode.
 * @param {string} uri The URI to examine.
 * @private
 */
goog.uri.utils.assertNoFragmentsOrQueries_ = function(uri) {
  // NOTE: would use goog.asserts here, but jscompiler doesn't know that
  // indexOf has no side effects.
  if (goog.DEBUG && (uri.indexOf('#') >= 0 || uri.indexOf('?') >= 0)) {
    throw Error('goog.uri.utils: Fragment or query identifiers are not ' +
        'supported: [' + uri + ']');
  }
};


/**
 * Supported query parameter values by the parameter serializing utilities.
 *
 * If a value is null or undefined, the key-value pair is skipped, as an easy
 * way to omit parameters conditionally.  Non-array parameters are converted
 * to a string and URI encoded.  Array values are expanded into multiple
 * &key=value pairs, with each element stringized and URI-encoded.
 *
 * @typedef {*}
 */
goog.uri.utils.QueryValue;


/**
 * An array representing a set of query parameters with alternating keys
 * and values.
 *
 * Keys are assumed to be URI encoded already and live at even indices.  See
 * goog.uri.utils.QueryValue for details on how parameter values are encoded.
 *
 * Example:
 * <pre>
 * var data = [
 *   // Simple param: ?name=BobBarker
 *   'name', 'BobBarker',
 *   // Conditional param -- may be omitted entirely.
 *   'specialDietaryNeeds', hasDietaryNeeds() ? getDietaryNeeds() : null,
 *   // Multi-valued param: &house=LosAngeles&house=NewYork&house=null
 *   'house', ['LosAngeles', 'NewYork', null]
 * ];
 * </pre>
 *
 * @typedef {!Array.<string|goog.uri.utils.QueryValue>}
 */
goog.uri.utils.QueryArray;


/**
 * Appends a URI and query data in a string buffer with special preconditions.
 *
 * Internal implementation utility, performing very few object allocations.
 *
 * @param {!Array.<string|undefined>} buffer A string buffer.  The first element
 *     must be the base URI, and may have a fragment identifier.  If the array
 *     contains more than one element, the second element must be an ampersand,
 *     and may be overwritten, depending on the base URI.  Undefined elements
 *     are treated as empty-string.
 * @return {string} The concatenated URI and query data.
 * @private
 */
goog.uri.utils.appendQueryData_ = function(buffer) {
  if (buffer[1]) {
    // At least one query parameter was added.  We need to check the
    // punctuation mark, which is currently an ampersand, and also make sure
    // there aren't any interfering fragment identifiers.
    var baseUri = /** @type {string} */ (buffer[0]);
    var hashIndex = baseUri.indexOf('#');
    if (hashIndex >= 0) {
      // Move the fragment off the base part of the URI into the end.
      buffer.push(baseUri.substr(hashIndex));
      buffer[0] = baseUri = baseUri.substr(0, hashIndex);
    }
    var questionIndex = baseUri.indexOf('?');
    if (questionIndex < 0) {
      // No question mark, so we need a question mark instead of an ampersand.
      buffer[1] = '?';
    } else if (questionIndex == baseUri.length - 1) {
      // Question mark is the very last character of the existing URI, so don't
      // append an additional delimiter.
      buffer[1] = undefined;
    }
  }

  return buffer.join('');
};


/**
 * Appends key=value pairs to an array, supporting multi-valued objects.
 * @param {string} key The key prefix.
 * @param {goog.uri.utils.QueryValue} value The value to serialize.
 * @param {!Array.<string>} pairs The array to which the 'key=value' strings
 *     should be appended.
 * @private
 */
goog.uri.utils.appendKeyValuePairs_ = function(key, value, pairs) {
  if (goog.isArray(value)) {
    // It's an array, so append all elements.  Here, we must convince
    // jscompiler that it is, indeed, an array.
    value = /** @type {Array} */ (value);
    for (var j = 0; j < value.length; j++) {
      pairs.push('&', key);
      // Check for empty string, null and undefined get encoded
      // into the url as literal strings
      if (value[j] !== '') {
        pairs.push('=', goog.string.urlEncode(value[j]));
      }
    }
  } else if (value != null) {
    // Not null or undefined, so safe to append.
    pairs.push('&', key);
    // Check for empty string, null and undefined get encoded
    // into the url as literal strings
    if (value !== '') {
      pairs.push('=', goog.string.urlEncode(value));
    }
  }
};


/**
 * Builds a buffer of query data from a sequence of alternating keys and values.
 *
 * @param {!Array.<string|undefined>} buffer A string buffer to append to.  The
 *     first element appended will be an '&', and may be replaced by the caller.
 * @param {goog.uri.utils.QueryArray|Arguments} keysAndValues An array with
 *     alternating keys and values -- see the typedef.
 * @param {number=} opt_startIndex A start offset into the arary, defaults to 0.
 * @return {!Array.<string|undefined>} The buffer argument.
 * @private
 */
goog.uri.utils.buildQueryDataBuffer_ = function(
    buffer, keysAndValues, opt_startIndex) {
  goog.asserts.assert(Math.max(keysAndValues.length - (opt_startIndex || 0),
      0) % 2 == 0, 'goog.uri.utils: Key/value lists must be even in length.');

  for (var i = opt_startIndex || 0; i < keysAndValues.length; i += 2) {
    goog.uri.utils.appendKeyValuePairs_(
        keysAndValues[i], keysAndValues[i + 1], buffer);
  }

  return buffer;
};


/**
 * Builds a query data string from a sequence of alternating keys and values.
 * Currently generates "&key&" for empty args.
 *
 * @param {goog.uri.utils.QueryArray} keysAndValues Alternating keys and
 *     values.  See the typedef.
 * @param {number=} opt_startIndex A start offset into the arary, defaults to 0.
 * @return {string} The encoded query string, in the for 'a=1&b=2'.
 */
goog.uri.utils.buildQueryData = function(keysAndValues, opt_startIndex) {
  var buffer = goog.uri.utils.buildQueryDataBuffer_(
      [], keysAndValues, opt_startIndex);
  buffer[0] = ''; // Remove the leading ampersand.
  return buffer.join('');
};


/**
 * Builds a buffer of query data from a map.
 *
 * @param {!Array.<string|undefined>} buffer A string buffer to append to.  The
 *     first element appended will be an '&', and may be replaced by the caller.
 * @param {Object.<goog.uri.utils.QueryValue>} map An object where keys are
 *     URI-encoded parameter keys, and the values conform to the contract
 *     specified in the goog.uri.utils.QueryValue typedef.
 * @return {!Array.<string|undefined>} The buffer argument.
 * @private
 */
goog.uri.utils.buildQueryDataBufferFromMap_ = function(buffer, map) {
  for (var key in map) {
    goog.uri.utils.appendKeyValuePairs_(key, map[key], buffer);
  }

  return buffer;
};


/**
 * Builds a query data string from a map.
 * Currently generates "&key&" for empty args.
 *
 * @param {Object} map An object where keys are URI-encoded parameter keys,
 *     and the values are arbitrary types or arrays.  Keys with a null value
 *     are dropped.
 * @return {string} The encoded query string, in the for 'a=1&b=2'.
 */
goog.uri.utils.buildQueryDataFromMap = function(map) {
  var buffer = goog.uri.utils.buildQueryDataBufferFromMap_([], map);
  buffer[0] = '';
  return buffer.join('');
};


/**
 * Appends URI parameters to an existing URI.
 *
 * The variable arguments may contain alternating keys and values.  Keys are
 * assumed to be already URI encoded.  The values should not be URI-encoded,
 * and will instead be encoded by this function.
 * <pre>
 * appendParams('http://www.foo.com?existing=true',
 *     'key1', 'value1',
 *     'key2', 'value?willBeEncoded',
 *     'key3', ['valueA', 'valueB', 'valueC'],
 *     'key4', null);
 * result: 'http://www.foo.com?existing=true&' +
 *     'key1=value1&' +
 *     'key2=value%3FwillBeEncoded&' +
 *     'key3=valueA&key3=valueB&key3=valueC'
 * </pre>
 *
 * A single call to this function will not exhibit quadratic behavior in IE,
 * whereas multiple repeated calls may, although the effect is limited by
 * fact that URL's generally can't exceed 2kb.
 *
 * @param {string} uri The original URI, which may already have query data.
 * @param {...(goog.uri.utils.QueryArray|string|goog.uri.utils.QueryValue)} var_args
 *     An array or argument list conforming to goog.uri.utils.QueryArray.
 * @return {string} The URI with all query parameters added.
 */
goog.uri.utils.appendParams = function(uri, var_args) {
  return goog.uri.utils.appendQueryData_(
      arguments.length == 2 ?
      goog.uri.utils.buildQueryDataBuffer_([uri], arguments[1], 0) :
      goog.uri.utils.buildQueryDataBuffer_([uri], arguments, 1));
};


/**
 * Appends query parameters from a map.
 *
 * @param {string} uri The original URI, which may already have query data.
 * @param {Object} map An object where keys are URI-encoded parameter keys,
 *     and the values are arbitrary types or arrays.  Keys with a null value
 *     are dropped.
 * @return {string} The new parameters.
 */
goog.uri.utils.appendParamsFromMap = function(uri, map) {
  return goog.uri.utils.appendQueryData_(
      goog.uri.utils.buildQueryDataBufferFromMap_([uri], map));
};


/**
 * Appends a single URI parameter.
 *
 * Repeated calls to this can exhibit quadratic behavior in IE6 due to the
 * way string append works, though it should be limited given the 2kb limit.
 *
 * @param {string} uri The original URI, which may already have query data.
 * @param {string} key The key, which must already be URI encoded.
 * @param {*} value The value, which will be stringized and encoded (assumed
 *     not already to be encoded).
 * @return {string} The URI with the query parameter added.
 */
goog.uri.utils.appendParam = function(uri, key, value) {
  return goog.uri.utils.appendQueryData_(
      [uri, '&', key, '=', goog.string.urlEncode(value)]);
};


/**
 * Finds the next instance of a query parameter with the specified name.
 *
 * Does not instantiate any objects.
 *
 * @param {string} uri The URI to search.  May contain a fragment identifier
 *     if opt_hashIndex is specified.
 * @param {number} startIndex The index to begin searching for the key at.  A
 *     match may be found even if this is one character after the ampersand.
 * @param {string} keyEncoded The URI-encoded key.
 * @param {number} hashOrEndIndex Index to stop looking at.  If a hash
 *     mark is present, it should be its index, otherwise it should be the
 *     length of the string.
 * @return {number} The position of the first character in the key's name,
 *     immediately after either a question mark or a dot.
 * @private
 */
goog.uri.utils.findParam_ = function(
    uri, startIndex, keyEncoded, hashOrEndIndex) {
  var index = startIndex;
  var keyLength = keyEncoded.length;

  // Search for the key itself and post-filter for surronuding punctuation,
  // rather than expensively building a regexp.
  while ((index = uri.indexOf(keyEncoded, index)) >= 0 &&
      index < hashOrEndIndex) {
    var precedingChar = uri.charCodeAt(index - 1);
    // Ensure that the preceding character is '&' or '?'.
    if (precedingChar == goog.uri.utils.CharCode_.AMPERSAND ||
        precedingChar == goog.uri.utils.CharCode_.QUESTION) {
      // Ensure the following character is '&', '=', '#', or NaN
      // (end of string).
      var followingChar = uri.charCodeAt(index + keyLength);
      if (!followingChar ||
          followingChar == goog.uri.utils.CharCode_.EQUAL ||
          followingChar == goog.uri.utils.CharCode_.AMPERSAND ||
          followingChar == goog.uri.utils.CharCode_.HASH) {
        return index;
      }
    }
    index += keyLength + 1;
  }

  return -1;
};


/**
 * Regular expression for finding a hash mark or end of string.
 * @type {RegExp}
 * @private
 */
goog.uri.utils.hashOrEndRe_ = /#|$/;


/**
 * Determines if the URI contains a specific key.
 *
 * Performs no object instantiations.
 *
 * @param {string} uri The URI to process.  May contain a fragment
 *     identifier.
 * @param {string} keyEncoded The URI-encoded key.  Case-sensitive.
 * @return {boolean} Whether the key is present.
 */
goog.uri.utils.hasParam = function(uri, keyEncoded) {
  return goog.uri.utils.findParam_(uri, 0, keyEncoded,
      uri.search(goog.uri.utils.hashOrEndRe_)) >= 0;
};


/**
 * Gets the first value of a query parameter.
 * @param {string} uri The URI to process.  May contain a fragment.
 * @param {string} keyEncoded The URI-encoded key.  Case-sensitive.
 * @return {?string} The first value of the parameter (URI-decoded), or null
 *     if the parameter is not found.
 */
goog.uri.utils.getParamValue = function(uri, keyEncoded) {
  var hashOrEndIndex = uri.search(goog.uri.utils.hashOrEndRe_);
  var foundIndex = goog.uri.utils.findParam_(
      uri, 0, keyEncoded, hashOrEndIndex);

  if (foundIndex < 0) {
    return null;
  } else {
    var endPosition = uri.indexOf('&', foundIndex);
    if (endPosition < 0 || endPosition > hashOrEndIndex) {
      endPosition = hashOrEndIndex;
    }
    // Progress forth to the end of the "key=" or "key&" substring.
    foundIndex += keyEncoded.length + 1;
    // Use substr, because it (unlike substring) will return empty string
    // if foundIndex > endPosition.
    return goog.string.urlDecode(
        uri.substr(foundIndex, endPosition - foundIndex));
  }
};


/**
 * Gets all values of a query parameter.
 * @param {string} uri The URI to process.  May contain a framgnet.
 * @param {string} keyEncoded The URI-encoded key.  Case-snsitive.
 * @return {!Array.<string>} All URI-decoded values with the given key.
 *     If the key is not found, this will have length 0, but never be null.
 */
goog.uri.utils.getParamValues = function(uri, keyEncoded) {
  var hashOrEndIndex = uri.search(goog.uri.utils.hashOrEndRe_);
  var position = 0;
  var foundIndex;
  var result = [];

  while ((foundIndex = goog.uri.utils.findParam_(
      uri, position, keyEncoded, hashOrEndIndex)) >= 0) {
    // Find where this parameter ends, either the '&' or the end of the
    // query parameters.
    position = uri.indexOf('&', foundIndex);
    if (position < 0 || position > hashOrEndIndex) {
      position = hashOrEndIndex;
    }

    // Progress forth to the end of the "key=" or "key&" substring.
    foundIndex += keyEncoded.length + 1;
    // Use substr, because it (unlike substring) will return empty string
    // if foundIndex > position.
    result.push(goog.string.urlDecode(uri.substr(
        foundIndex, position - foundIndex)));
  }

  return result;
};


/**
 * Regexp to find trailing question marks and ampersands.
 * @type {RegExp}
 * @private
 */
goog.uri.utils.trailingQueryPunctuationRe_ = /[?&]($|#)/;


/**
 * Removes all instances of a query parameter.
 * @param {string} uri The URI to process.  Must not contain a fragment.
 * @param {string} keyEncoded The URI-encoded key.
 * @return {string} The URI with all instances of the parameter removed.
 */
goog.uri.utils.removeParam = function(uri, keyEncoded) {
  var hashOrEndIndex = uri.search(goog.uri.utils.hashOrEndRe_);
  var position = 0;
  var foundIndex;
  var buffer = [];

  // Look for a query parameter.
  while ((foundIndex = goog.uri.utils.findParam_(
      uri, position, keyEncoded, hashOrEndIndex)) >= 0) {
    // Get the portion of the query string up to, but not including, the ?
    // or & starting the parameter.
    buffer.push(uri.substring(position, foundIndex));
    // Progress to immediately after the '&'.  If not found, go to the end.
    // Avoid including the hash mark.
    position = Math.min((uri.indexOf('&', foundIndex) + 1) || hashOrEndIndex,
        hashOrEndIndex);
  }

  // Append everything that is remaining.
  buffer.push(uri.substr(position));

  // Join the buffer, and remove trailing punctuation that remains.
  return buffer.join('').replace(
      goog.uri.utils.trailingQueryPunctuationRe_, '$1');
};


/**
 * Replaces all existing definitions of a parameter with a single definition.
 *
 * Repeated calls to this can exhibit quadratic behavior due to the need to
 * find existing instances and reconstruct the string, though it should be
 * limited given the 2kb limit.  Consider using appendParams to append multiple
 * parameters in bulk.
 *
 * @param {string} uri The original URI, which may already have query data.
 * @param {string} keyEncoded The key, which must already be URI encoded.
 * @param {*} value The value, which will be stringized and encoded (assumed
 *     not already to be encoded).
 * @return {string} The URI with the query parameter added.
 */
goog.uri.utils.setParam = function(uri, keyEncoded, value) {
  return goog.uri.utils.appendParam(
      goog.uri.utils.removeParam(uri, keyEncoded), keyEncoded, value);
};


/**
 * Generates a URI path using a given URI and a path with checks to
 * prevent consecutive "//". The baseUri passed in must not contain
 * query or fragment identifiers. The path to append may not contain query or
 * fragment identifiers.
 *
 * @param {string} baseUri URI to use as the base.
 * @param {string} path Path to append.
 * @return {string} Updated URI.
 */
goog.uri.utils.appendPath = function(baseUri, path) {
  goog.uri.utils.assertNoFragmentsOrQueries_(baseUri);

  // Remove any trailing '/'
  if (goog.string.endsWith(baseUri, '/')) {
    baseUri = baseUri.substr(0, baseUri.length - 1);
  }
  // Remove any leading '/'
  if (goog.string.startsWith(path, '/')) {
    path = path.substr(1);
  }
  return goog.string.buildString(baseUri, '/', path);
};


/**
 * Standard supported query parameters.
 * @enum {string}
 */
goog.uri.utils.StandardQueryParam = {

  /** Unused parameter for unique-ifying. */
  RANDOM: 'zx'
};


/**
 * Sets the zx parameter of a URI to a random value.
 * @param {string} uri Any URI.
 * @return {string} That URI with the "zx" parameter added or replaced to
 *     contain a random string.
 */
goog.uri.utils.makeUnique = function(uri) {
  return goog.uri.utils.setParam(uri,
      goog.uri.utils.StandardQueryParam.RANDOM, goog.string.getRandomString());
};
// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utilities for manipulating objects/maps/hashes.
 */

goog.provide('goog.object');


/**
 * Calls a function for each element in an object/map/hash.
 *
 * @param {Object} obj The object over which to iterate.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the object)
 *     and the return value is irrelevant.
 * @param {Object=} opt_obj This is used as the 'this' object within f.
 */
goog.object.forEach = function(obj, f, opt_obj) {
  for (var key in obj) {
    f.call(opt_obj, obj[key], key, obj);
  }
};


/**
 * Calls a function for each element in an object/map/hash. If that call returns
 * true, adds the element to a new object.
 *
 * @param {Object} obj The object over which to iterate.
 * @param {Function} f The function to call for every element. This
 *     function takes 3 arguments (the element, the index and the object)
 *     and should return a boolean. If the return value is true the
 *     element is added to the result object. If it is false the
 *     element is not included.
 * @param {Object=} opt_obj This is used as the 'this' object within f.
 * @return {!Object} a new object in which only elements that passed the test
 *     are present.
 */
goog.object.filter = function(obj, f, opt_obj) {
  var res = {};
  for (var key in obj) {
    if (f.call(opt_obj, obj[key], key, obj)) {
      res[key] = obj[key];
    }
  }
  return res;
};


/**
 * For every element in an object/map/hash calls a function and inserts the
 * result into a new object.
 *
 * @param {Object} obj The object over which to iterate.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the object)
 *     and should return something. The result will be inserted
 *     into a new object.
 * @param {Object=} opt_obj This is used as the 'this' object within f.
 * @return {!Object} a new object with the results from f.
 */
goog.object.map = function(obj, f, opt_obj) {
  var res = {};
  for (var key in obj) {
    res[key] = f.call(opt_obj, obj[key], key, obj);
  }
  return res;
};


/**
 * Calls a function for each element in an object/map/hash. If any
 * call returns true, returns true (without checking the rest). If
 * all calls return false, returns false.
 *
 * @param {Object} obj The object to check.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the object) and should
 *     return a boolean.
 * @param {Object=} opt_obj This is used as the 'this' object within f.
 * @return {boolean} true if any element passes the test.
 */
goog.object.some = function(obj, f, opt_obj) {
  for (var key in obj) {
    if (f.call(opt_obj, obj[key], key, obj)) {
      return true;
    }
  }
  return false;
};


/**
 * Calls a function for each element in an object/map/hash. If
 * all calls return true, returns true. If any call returns false, returns
 * false at this point and does not continue to check the remaining elements.
 *
 * @param {Object} obj The object to check.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the object) and should
 *     return a boolean.
 * @param {Object=} opt_obj This is used as the 'this' object within f.
 * @return {boolean} false if any element fails the test.
 */
goog.object.every = function(obj, f, opt_obj) {
  for (var key in obj) {
    if (!f.call(opt_obj, obj[key], key, obj)) {
      return false;
    }
  }
  return true;
};


/**
 * Returns the number of key-value pairs in the object map.
 *
 * @param {Object} obj The object for which to get the number of key-value
 *     pairs.
 * @return {number} The number of key-value pairs in the object map.
 */
goog.object.getCount = function(obj) {
  // JS1.5 has __count__ but it has been deprecated so it raises a warning...
  // in other words do not use. Also __count__ only includes the fields on the
  // actual object and not in the prototype chain.
  var rv = 0;
  for (var key in obj) {
    rv++;
  }
  return rv;
};


/**
 * Returns one key from the object map, if any exists.
 * For map literals the returned key will be the first one in most of the
 * browsers (a know exception is Konqueror).
 *
 * @param {Object} obj The object to pick a key from.
 * @return {string|undefined} The key or undefined if the object is empty.
 */
goog.object.getAnyKey = function(obj) {
  for (var key in obj) {
    return key;
  }
};


/**
 * Returns one value from the object map, if any exists.
 * For map literals the returned value will be the first one in most of the
 * browsers (a know exception is Konqueror).
 *
 * @param {Object} obj The object to pick a value from.
 * @return {*} The value or undefined if the object is empty.
 */
goog.object.getAnyValue = function(obj) {
  for (var key in obj) {
    return obj[key];
  }
};


/**
 * Whether the object/hash/map contains the given object as a value.
 * An alias for goog.object.containsValue(obj, val).
 *
 * @param {Object} obj The object in which to look for val.
 * @param {*} val The object for which to check.
 * @return {boolean} true if val is present.
 */
goog.object.contains = function(obj, val) {
  return goog.object.containsValue(obj, val);
};


/**
 * Returns the values of the object/map/hash.
 *
 * @param {Object} obj The object from which to get the values.
 * @return {!Array} The values in the object/map/hash.
 */
goog.object.getValues = function(obj) {
  var res = [];
  var i = 0;
  for (var key in obj) {
    res[i++] = obj[key];
  }
  return res;
};


/**
 * Returns the keys of the object/map/hash.
 *
 * @param {Object} obj The object from which to get the keys.
 * @return {!Array.<string>} Array of property keys.
 */
goog.object.getKeys = function(obj) {
  var res = [];
  var i = 0;
  for (var key in obj) {
    res[i++] = key;
  }
  return res;
};


/**
 * Get a value from an object multiple levels deep.  This is useful for
 * pulling values from deeply nested objects, such as JSON responses.
 * Example usage: getValueByKeys(jsonObj, 'foo', 'entries', 3)
 *
 * @param {!Object} obj An object to get the value from.  Can be array-like.
 * @param {...(string|number|!Array.<number|string>)} var_args A number of keys
 *     (as strings, or nubmers, for array-like objects).  Can also be
 *     specified as a single array of keys.
 * @return {*} The resulting value.  If, at any point, the value for a key
 *     is undefined, returns undefined.
 */
goog.object.getValueByKeys = function(obj, var_args) {
  var isArrayLike = goog.isArrayLike(var_args);
  var keys = isArrayLike ? var_args : arguments;

  // Start with the 2nd parameter for the variable parameters syntax.
  for (var i = isArrayLike ? 0 : 1; i < keys.length; i++) {
    obj = obj[keys[i]];
    if (!goog.isDef(obj)) {
      break;
    }
  }

  return obj;
};


/**
 * Whether the object/map/hash contains the given key.
 *
 * @param {Object} obj The object in which to look for key.
 * @param {*} key The key for which to check.
 * @return {boolean} true If the map contains the key.
 */
goog.object.containsKey = function(obj, key) {
  return key in obj;
};


/**
 * Whether the object/map/hash contains the given value. This is O(n).
 *
 * @param {Object} obj The object in which to look for val.
 * @param {*} val The value for which to check.
 * @return {boolean} true If the map contains the value.
 */
goog.object.containsValue = function(obj, val) {
  for (var key in obj) {
    if (obj[key] == val) {
      return true;
    }
  }
  return false;
};


/**
 * Searches an object for an element that satisfies the given condition and
 * returns its key.
 * @param {Object} obj The object to search in.
 * @param {function(*, string, Object): boolean} f The function to call for
 *     every element. Takes 3 arguments (the value, the key and the object) and
 *     should return a boolean.
 * @param {Object=} opt_this An optional "this" context for the function.
 * @return {string|undefined} The key of an element for which the function
 *     returns true or undefined if no such element is found.
 */
goog.object.findKey = function(obj, f, opt_this) {
  for (var key in obj) {
    if (f.call(opt_this, obj[key], key, obj)) {
      return key;
    }
  }
  return undefined;
};


/**
 * Searches an object for an element that satisfies the given condition and
 * returns its value.
 * @param {Object} obj The object to search in.
 * @param {function(*, string, Object): boolean} f The function to call for
 *     every element. Takes 3 arguments (the value, the key and the object) and
 *     should return a boolean.
 * @param {Object=} opt_this An optional "this" context for the function.
 * @return {*} The value of an element for which the function returns true or
 *     undefined if no such element is found.
 */
goog.object.findValue = function(obj, f, opt_this) {
  var key = goog.object.findKey(obj, f, opt_this);
  return key && obj[key];
};


/**
 * Whether the object/map/hash is empty.
 *
 * @param {Object} obj The object to test.
 * @return {boolean} true if obj is empty.
 */
goog.object.isEmpty = function(obj) {
  for (var key in obj) {
    return false;
  }
  return true;
};


/**
 * Removes all key value pairs from the object/map/hash.
 *
 * @param {Object} obj The object to clear.
 */
goog.object.clear = function(obj) {
  for (var i in obj) {
    delete obj[i];
  }
};


/**
 * Removes a key-value pair based on the key.
 *
 * @param {Object} obj The object from which to remove the key.
 * @param {*} key The key to remove.
 * @return {boolean} Whether an element was removed.
 */
goog.object.remove = function(obj, key) {
  var rv;
  if ((rv = key in obj)) {
    delete obj[key];
  }
  return rv;
};


/**
 * Adds a key-value pair to the object. Throws an exception if the key is
 * already in use. Use set if you want to change an existing pair.
 *
 * @param {Object} obj The object to which to add the key-value pair.
 * @param {string} key The key to add.
 * @param {*} val The value to add.
 */
goog.object.add = function(obj, key, val) {
  if (key in obj) {
    throw Error('The object already contains the key "' + key + '"');
  }
  goog.object.set(obj, key, val);
};


/**
 * Returns the value for the given key.
 *
 * @param {Object} obj The object from which to get the value.
 * @param {string} key The key for which to get the value.
 * @param {*=} opt_val The value to return if no item is found for the given
 *     key (default is undefined).
 * @return {*} The value for the given key.
 */
goog.object.get = function(obj, key, opt_val) {
  if (key in obj) {
    return obj[key];
  }
  return opt_val;
};


/**
 * Adds a key-value pair to the object/map/hash.
 *
 * @param {Object} obj The object to which to add the key-value pair.
 * @param {string} key The key to add.
 * @param {*} value The value to add.
 */
goog.object.set = function(obj, key, value) {
  obj[key] = value;
};


/**
 * Adds a key-value pair to the object/map/hash if it doesn't exist yet.
 *
 * @param {Object} obj The object to which to add the key-value pair.
 * @param {string} key The key to add.
 * @param {*} value The value to add if the key wasn't present.
 * @return {*} The value of the entry at the end of the function.
 */
goog.object.setIfUndefined = function(obj, key, value) {
  return key in obj ? obj[key] : (obj[key] = value);
};


/**
 * Does a flat clone of the object.
 *
 * @param {Object} obj Object to clone.
 * @return {!Object} Clone of the input object.
 */
goog.object.clone = function(obj) {
  // We cannot use the prototype trick because a lot of methods depend on where
  // the actual key is set.

  var res = {};
  for (var key in obj) {
    res[key] = obj[key];
  }
  return res;
  // We could also use goog.mixin but I wanted this to be independent from that.
};


/**
 * Clones a value. The input may be an Object, Array, or basic type. Objects and
 * arrays will be cloned recursively.
 *
 * WARNINGS:
 * <code>goog.object.unsafeClone</code> does not detect reference loops. Objects
 * that refer to themselves will cause infinite recursion.
 *
 * <code>goog.object.unsafeClone</code> is unaware of unique identifiers, and
 * copies UIDs created by <code>getUid</code> into cloned results.
 *
 * @param {*} obj The value to clone.
 * @return {*} A clone of the input value.
 */
goog.object.unsafeClone = function(obj) {
  var type = goog.typeOf(obj);
  if (type == 'object' || type == 'array') {
    if (obj.clone) {
      return obj.clone();
    }
    var clone = type == 'array' ? [] : {};
    for (var key in obj) {
      clone[key] = goog.object.unsafeClone(obj[key]);
    }
    return clone;
  }

  return obj;
};


/**
 * Returns a new object in which all the keys and values are interchanged
 * (keys become values and values become keys). If multiple keys map to the
 * same value, the chosen transposed value is implementation-dependent.
 *
 * @param {Object} obj The object to transpose.
 * @return {!Object} The transposed object.
 */
goog.object.transpose = function(obj) {
  var transposed = {};
  for (var key in obj) {
    transposed[obj[key]] = key;
  }
  return transposed;
};


/**
 * The names of the fields that are defined on Object.prototype.
 * @type {Array.<string>}
 * @private
 */
goog.object.PROTOTYPE_FIELDS_ = [
  'constructor',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
  'toString',
  'valueOf'
];


/**
 * Extends an object with another object.
 * This operates 'in-place'; it does not create a new Object.
 *
 * Example:
 * var o = {};
 * goog.object.extend(o, {a: 0, b: 1});
 * o; // {a: 0, b: 1}
 * goog.object.extend(o, {c: 2});
 * o; // {a: 0, b: 1, c: 2}
 *
 * @param {Object} target  The object to modify.
 * @param {...Object} var_args The objects from which values will be copied.
 */
goog.object.extend = function(target, var_args) {
  var key, source;
  for (var i = 1; i < arguments.length; i++) {
    source = arguments[i];
    for (key in source) {
      target[key] = source[key];
    }

    // For IE the for-in-loop does not contain any properties that are not
    // enumerable on the prototype object (for example isPrototypeOf from
    // Object.prototype) and it will also not include 'replace' on objects that
    // extend String and change 'replace' (not that it is common for anyone to
    // extend anything except Object).

    for (var j = 0; j < goog.object.PROTOTYPE_FIELDS_.length; j++) {
      key = goog.object.PROTOTYPE_FIELDS_[j];
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }
};


/**
 * Creates a new object built from the key-value pairs provided as arguments.
 * @param {...*} var_args If only one argument is provided and it is an array
 *     then this is used as the arguments,  otherwise even arguments are used as
 *     the property names and odd arguments are used as the property values.
 * @return {!Object} The new object.
 * @throws {Error} If there are uneven number of arguments or there is only one
 *     non array argument.
 */
goog.object.create = function(var_args) {
  var argLength = arguments.length;
  if (argLength == 1 && goog.isArray(arguments[0])) {
    return goog.object.create.apply(null, arguments[0]);
  }

  if (argLength % 2) {
    throw Error('Uneven number of arguments');
  }

  var rv = {};
  for (var i = 0; i < argLength; i += 2) {
    rv[arguments[i]] = arguments[i + 1];
  }
  return rv;
};


/**
 * Creates a new object where the property names come from the arguments but
 * the value is always set to true
 * @param {...*} var_args If only one argument is provided and it is an array
 *     then this is used as the arguments,  otherwise the arguments are used
 *     as the property names.
 * @return {!Object} The new object.
 */
goog.object.createSet = function(var_args) {
  var argLength = arguments.length;
  if (argLength == 1 && goog.isArray(arguments[0])) {
    return goog.object.createSet.apply(null, arguments[0]);
  }

  var rv = {};
  for (var i = 0; i < argLength; i++) {
    rv[arguments[i]] = true;
  }
  return rv;
};
// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utilities for manipulating arrays.
 *
 */


goog.provide('goog.array');
goog.provide('goog.array.ArrayLike');

goog.require('goog.asserts');


/**
 * @define {boolean} NATIVE_ARRAY_PROTOTYPES indicates whether the code should
 * rely on Array.prototype functions, if available.
 *
 * The Array.prototype functions can be defined by external libraries like
 * Prototype and setting this flag to false forces closure to use its own
 * goog.array implementation.
 *
 * If your javascript can be loaded by a third party site and you are wary about
 * relying on the prototype functions, specify
 * "--define goog.NATIVE_ARRAY_PROTOTYPES=false" to the JSCompiler.
 */
goog.NATIVE_ARRAY_PROTOTYPES = true;


/**
 * @typedef {Array|NodeList|Arguments|{length: number}}
 */
goog.array.ArrayLike;


/**
 * Returns the last element in an array without removing it.
 * @param {goog.array.ArrayLike} array The array.
 * @return {*} Last item in array.
 */
goog.array.peek = function(array) {
  return array[array.length - 1];
};


/**
 * Reference to the original {@code Array.prototype}.
 * @private
 */
goog.array.ARRAY_PROTOTYPE_ = Array.prototype;


// NOTE(arv): Since most of the array functions are generic it allows you to
// pass an array-like object. Strings have a length and are considered array-
// like. However, the 'in' operator does not work on strings so we cannot just
// use the array path even if the browser supports indexing into strings. We
// therefore end up splitting the string.


/**
 * Returns the index of the first element of an array with a specified
 * value, or -1 if the element is not present in the array.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-indexof}
 *
 * @param {goog.array.ArrayLike} arr The array to be searched.
 * @param {*} obj The object for which we are searching.
 * @param {number=} opt_fromIndex The index at which to start the search. If
 *     omitted the search starts at index 0.
 * @return {number} The index of the first matching array element.
 */
goog.array.indexOf = goog.NATIVE_ARRAY_PROTOTYPES &&
                     goog.array.ARRAY_PROTOTYPE_.indexOf ?
    function(arr, obj, opt_fromIndex) {
      goog.asserts.assert(arr.length != null);

      return goog.array.ARRAY_PROTOTYPE_.indexOf.call(arr, obj, opt_fromIndex);
    } :
    function(arr, obj, opt_fromIndex) {
      var fromIndex = opt_fromIndex == null ?
          0 : (opt_fromIndex < 0 ?
               Math.max(0, arr.length + opt_fromIndex) : opt_fromIndex);

      if (goog.isString(arr)) {
        // Array.prototype.indexOf uses === so only strings should be found.
        if (!goog.isString(obj) || obj.length != 1) {
          return -1;
        }
        return arr.indexOf(obj, fromIndex);
      }

      for (var i = fromIndex; i < arr.length; i++) {
        if (i in arr && arr[i] === obj)
          return i;
      }
      return -1;
    };


/**
 * Returns the index of the last element of an array with a specified value, or
 * -1 if the element is not present in the array.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-lastindexof}
 *
 * @param {goog.array.ArrayLike} arr The array to be searched.
 * @param {*} obj The object for which we are searching.
 * @param {?number=} opt_fromIndex The index at which to start the search. If
 *     omitted the search starts at the end of the array.
 * @return {number} The index of the last matching array element.
 */
goog.array.lastIndexOf = goog.NATIVE_ARRAY_PROTOTYPES &&
                         goog.array.ARRAY_PROTOTYPE_.lastIndexOf ?
    function(arr, obj, opt_fromIndex) {
      goog.asserts.assert(arr.length != null);

      // Firefox treats undefined and null as 0 in the fromIndex argument which
      // leads it to always return -1
      var fromIndex = opt_fromIndex == null ? arr.length - 1 : opt_fromIndex;
      return goog.array.ARRAY_PROTOTYPE_.lastIndexOf.call(arr, obj, fromIndex);
    } :
    function(arr, obj, opt_fromIndex) {
      var fromIndex = opt_fromIndex == null ? arr.length - 1 : opt_fromIndex;

      if (fromIndex < 0) {
        fromIndex = Math.max(0, arr.length + fromIndex);
      }

      if (goog.isString(arr)) {
        // Array.prototype.lastIndexOf uses === so only strings should be found.
        if (!goog.isString(obj) || obj.length != 1) {
          return -1;
        }
        return arr.lastIndexOf(obj, fromIndex);
      }

      for (var i = fromIndex; i >= 0; i--) {
        if (i in arr && arr[i] === obj)
          return i;
      }
      return -1;
    };


/**
 * Calls a function for each element in an array.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-foreach}
 *
 * @param {goog.array.ArrayLike} arr Array or array like object over
 *     which to iterate.
 * @param {?function(this: T, ...)} f The function to call for every element.
 *     This function takes 3 arguments (the element, the index and the array).
 *     The return value is ignored. The function is called only for indexes of
 *     the array which have assigned values; it is not called for indexes which
 *     have been deleted or which have never been assigned values.
 * @param {T=} opt_obj The object to be used as the value of 'this'
 *     within f.
 * @template T
 */
goog.array.forEach = goog.NATIVE_ARRAY_PROTOTYPES &&
                     goog.array.ARRAY_PROTOTYPE_.forEach ?
    function(arr, f, opt_obj) {
      goog.asserts.assert(arr.length != null);

      goog.array.ARRAY_PROTOTYPE_.forEach.call(arr, f, opt_obj);
    } :
    function(arr, f, opt_obj) {
      var l = arr.length;  // must be fixed during loop... see docs
      var arr2 = goog.isString(arr) ? arr.split('') : arr;
      for (var i = 0; i < l; i++) {
        if (i in arr2) {
          f.call(opt_obj, arr2[i], i, arr);
        }
      }
    };


/**
 * Calls a function for each element in an array, starting from the last
 * element rather than the first.
 *
 * @param {goog.array.ArrayLike} arr The array over which to iterate.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the array). The return
 *     value is ignored.
 * @param {Object=} opt_obj The object to be used as the value of 'this'
 *     within f.
 */
goog.array.forEachRight = function(arr, f, opt_obj) {
  var l = arr.length;  // must be fixed during loop... see docs
  var arr2 = goog.isString(arr) ? arr.split('') : arr;
  for (var i = l - 1; i >= 0; --i) {
    if (i in arr2) {
      f.call(opt_obj, arr2[i], i, arr);
    }
  }
};


/**
 * Calls a function for each element in an array, and if the function returns
 * true adds the element to a new array.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-filter}
 *
 * @param {goog.array.ArrayLike} arr The array over which to iterate.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the array) and must
 *     return a Boolean. If the return value is true the element is added to the
 *     result array. If it is false the element is not included.
 * @param {Object=} opt_obj The object to be used as the value of 'this'
 *     within f.
 * @return {!Array} a new array in which only elements that passed the test are
 *     present.
 */
goog.array.filter = goog.NATIVE_ARRAY_PROTOTYPES &&
                    goog.array.ARRAY_PROTOTYPE_.filter ?
    function(arr, f, opt_obj) {
      goog.asserts.assert(arr.length != null);

      return goog.array.ARRAY_PROTOTYPE_.filter.call(arr, f, opt_obj);
    } :
    function(arr, f, opt_obj) {
      var l = arr.length;  // must be fixed during loop... see docs
      var res = [];
      var resLength = 0;
      var arr2 = goog.isString(arr) ? arr.split('') : arr;
      for (var i = 0; i < l; i++) {
        if (i in arr2) {
          var val = arr2[i];  // in case f mutates arr2
          if (f.call(opt_obj, val, i, arr)) {
            res[resLength++] = val;
          }
        }
      }
      return res;
    };


/**
 * Calls a function for each element in an array and inserts the result into a
 * new array.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-map}
 *
 * @param {goog.array.ArrayLike} arr The array over which to iterate.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the array) and should
 *     return something. The result will be inserted into a new array.
 * @param {Object=} opt_obj The object to be used as the value of 'this'
 *     within f.
 * @return {!Array} a new array with the results from f.
 */
goog.array.map = goog.NATIVE_ARRAY_PROTOTYPES &&
                 goog.array.ARRAY_PROTOTYPE_.map ?
    function(arr, f, opt_obj) {
      goog.asserts.assert(arr.length != null);

      return goog.array.ARRAY_PROTOTYPE_.map.call(arr, f, opt_obj);
    } :
    function(arr, f, opt_obj) {
      var l = arr.length;  // must be fixed during loop... see docs
      var res = new Array(l);
      var arr2 = goog.isString(arr) ? arr.split('') : arr;
      for (var i = 0; i < l; i++) {
        if (i in arr2) {
          res[i] = f.call(opt_obj, arr2[i], i, arr);
        }
      }
      return res;
    };


/**
 * Passes every element of an array into a function and accumulates the result.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-reduce}
 *
 * For example:
 * var a = [1, 2, 3, 4];
 * goog.array.reduce(a, function(r, v, i, arr) {return r + v;}, 0);
 * returns 10
 *
 * @param {goog.array.ArrayLike} arr The array over which to iterate.
 * @param {Function} f The function to call for every element. This function
 *     takes 4 arguments (the function's previous result or the initial value,
 *     the value of the current array element, the current array index, and the
 *     array itself)
 *     function(previousValue, currentValue, index, array).
 * @param {*} val The initial value to pass into the function on the first call.
 * @param {Object=} opt_obj  The object to be used as the value of 'this'
 *     within f.
 * @return {*} Result of evaluating f repeatedly across the values of the array.
 */
goog.array.reduce = function(arr, f, val, opt_obj) {
  if (arr.reduce) {
    if (opt_obj) {
      return arr.reduce(goog.bind(f, opt_obj), val);
    } else {
      return arr.reduce(f, val);
    }
  }
  var rval = val;
  goog.array.forEach(arr, function(val, index) {
    rval = f.call(opt_obj, rval, val, index, arr);
  });
  return rval;
};


/**
 * Passes every element of an array into a function and accumulates the result,
 * starting from the last element and working towards the first.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-reduceright}
 *
 * For example:
 * var a = ['a', 'b', 'c'];
 * goog.array.reduceRight(a, function(r, v, i, arr) {return r + v;}, '');
 * returns 'cba'
 *
 * @param {goog.array.ArrayLike} arr The array over which to iterate.
 * @param {Function} f The function to call for every element. This function
 *     takes 4 arguments (the function's previous result or the initial value,
 *     the value of the current array element, the current array index, and the
 *     array itself)
 *     function(previousValue, currentValue, index, array).
 * @param {*} val The initial value to pass into the function on the first call.
 * @param {Object=} opt_obj The object to be used as the value of 'this'
 *     within f.
 * @return {*} Object returned as a result of evaluating f repeatedly across the
 *     values of the array.
 */
goog.array.reduceRight = function(arr, f, val, opt_obj) {
  if (arr.reduceRight) {
    if (opt_obj) {
      return arr.reduceRight(goog.bind(f, opt_obj), val);
    } else {
      return arr.reduceRight(f, val);
    }
  }
  var rval = val;
  goog.array.forEachRight(arr, function(val, index) {
    rval = f.call(opt_obj, rval, val, index, arr);
  });
  return rval;
};


/**
 * Calls f for each element of an array. If any call returns true, some()
 * returns true (without checking the remaining elements). If all calls
 * return false, some() returns false.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-some}
 *
 * @param {goog.array.ArrayLike} arr The array to check.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the array) and must
 *     return a Boolean.
 * @param {Object=} opt_obj  The object to be used as the value of 'this'
 *     within f.
 * @return {boolean} true if any element passes the test.
 */
goog.array.some = goog.NATIVE_ARRAY_PROTOTYPES &&
                  goog.array.ARRAY_PROTOTYPE_.some ?
    function(arr, f, opt_obj) {
      goog.asserts.assert(arr.length != null);

      return goog.array.ARRAY_PROTOTYPE_.some.call(arr, f, opt_obj);
    } :
    function(arr, f, opt_obj) {
      var l = arr.length;  // must be fixed during loop... see docs
      var arr2 = goog.isString(arr) ? arr.split('') : arr;
      for (var i = 0; i < l; i++) {
        if (i in arr2 && f.call(opt_obj, arr2[i], i, arr)) {
          return true;
        }
      }
      return false;
    };


/**
 * Call f for each element of an array. If all calls return true, every()
 * returns true. If any call returns false, every() returns false and
 * does not continue to check the remaining elements.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-every}
 *
 * @param {goog.array.ArrayLike} arr The array to check.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the array) and must
 *     return a Boolean.
 * @param {Object=} opt_obj The object to be used as the value of 'this'
 *     within f.
 * @return {boolean} false if any element fails the test.
 */
goog.array.every = goog.NATIVE_ARRAY_PROTOTYPES &&
                   goog.array.ARRAY_PROTOTYPE_.every ?
    function(arr, f, opt_obj) {
      goog.asserts.assert(arr.length != null);

      return goog.array.ARRAY_PROTOTYPE_.every.call(arr, f, opt_obj);
    } :
    function(arr, f, opt_obj) {
      var l = arr.length;  // must be fixed during loop... see docs
      var arr2 = goog.isString(arr) ? arr.split('') : arr;
      for (var i = 0; i < l; i++) {
        if (i in arr2 && !f.call(opt_obj, arr2[i], i, arr)) {
          return false;
        }
      }
      return true;
    };


/**
 * Search an array for the first element that satisfies a given condition and
 * return that element.
 * @param {goog.array.ArrayLike} arr The array to search.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the array) and should
 *     return a boolean.
 * @param {Object=} opt_obj An optional "this" context for the function.
 * @return {*} The first array element that passes the test, or null if no
 *     element is found.
 */
goog.array.find = function(arr, f, opt_obj) {
  var i = goog.array.findIndex(arr, f, opt_obj);
  return i < 0 ? null : goog.isString(arr) ? arr.charAt(i) : arr[i];
};


/**
 * Search an array for the first element that satisfies a given condition and
 * return its index.
 * @param {goog.array.ArrayLike} arr The array to search.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the array) and should
 *     return a boolean.
 * @param {Object=} opt_obj An optional "this" context for the function.
 * @return {number} The index of the first array element that passes the test,
 *     or -1 if no element is found.
 */
goog.array.findIndex = function(arr, f, opt_obj) {
  var l = arr.length;  // must be fixed during loop... see docs
  var arr2 = goog.isString(arr) ? arr.split('') : arr;
  for (var i = 0; i < l; i++) {
    if (i in arr2 && f.call(opt_obj, arr2[i], i, arr)) {
      return i;
    }
  }
  return -1;
};


/**
 * Search an array (in reverse order) for the last element that satisfies a
 * given condition and return that element.
 * @param {goog.array.ArrayLike} arr The array to search.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the array) and should
 *     return a boolean.
 * @param {Object=} opt_obj An optional "this" context for the function.
 * @return {*} The last array element that passes the test, or null if no
 *     element is found.
 */
goog.array.findRight = function(arr, f, opt_obj) {
  var i = goog.array.findIndexRight(arr, f, opt_obj);
  return i < 0 ? null : goog.isString(arr) ? arr.charAt(i) : arr[i];
};


/**
 * Search an array (in reverse order) for the last element that satisfies a
 * given condition and return its index.
 * @param {goog.array.ArrayLike} arr The array to search.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the array) and should
 *     return a boolean.
 * @param {Object=} opt_obj An optional "this" context for the function.
 * @return {number} The index of the last array element that passes the test,
 *     or -1 if no element is found.
 */
goog.array.findIndexRight = function(arr, f, opt_obj) {
  var l = arr.length;  // must be fixed during loop... see docs
  var arr2 = goog.isString(arr) ? arr.split('') : arr;
  for (var i = l - 1; i >= 0; i--) {
    if (i in arr2 && f.call(opt_obj, arr2[i], i, arr)) {
      return i;
    }
  }
  return -1;
};


/**
 * Whether the array contains the given object.
 * @param {goog.array.ArrayLike} arr The array to test for the presence of the
 *     element.
 * @param {*} obj The object for which to test.
 * @return {boolean} true if obj is present.
 */
goog.array.contains = function(arr, obj) {
  return goog.array.indexOf(arr, obj) >= 0;
};


/**
 * Whether the array is empty.
 * @param {goog.array.ArrayLike} arr The array to test.
 * @return {boolean} true if empty.
 */
goog.array.isEmpty = function(arr) {
  return arr.length == 0;
};


/**
 * Clears the array.
 * @param {goog.array.ArrayLike} arr Array or array like object to clear.
 */
goog.array.clear = function(arr) {
  // For non real arrays we don't have the magic length so we delete the
  // indices.
  if (!goog.isArray(arr)) {
    for (var i = arr.length - 1; i >= 0; i--) {
      delete arr[i];
    }
  }
  arr.length = 0;
};


/**
 * Pushes an item into an array, if it's not already in the array.
 * @param {Array} arr Array into which to insert the item.
 * @param {*} obj Value to add.
 */
goog.array.insert = function(arr, obj) {
  if (!goog.array.contains(arr, obj)) {
    arr.push(obj);
  }
};


/**
 * Inserts an object at the given index of the array.
 * @param {goog.array.ArrayLike} arr The array to modify.
 * @param {*} obj The object to insert.
 * @param {number=} opt_i The index at which to insert the object. If omitted,
 *      treated as 0. A negative index is counted from the end of the array.
 */
goog.array.insertAt = function(arr, obj, opt_i) {
  goog.array.splice(arr, opt_i, 0, obj);
};


/**
 * Inserts at the given index of the array, all elements of another array.
 * @param {goog.array.ArrayLike} arr The array to modify.
 * @param {goog.array.ArrayLike} elementsToAdd The array of elements to add.
 * @param {number=} opt_i The index at which to insert the object. If omitted,
 *      treated as 0. A negative index is counted from the end of the array.
 */
goog.array.insertArrayAt = function(arr, elementsToAdd, opt_i) {
  goog.partial(goog.array.splice, arr, opt_i, 0).apply(null, elementsToAdd);
};


/**
 * Inserts an object into an array before a specified object.
 * @param {Array} arr The array to modify.
 * @param {*} obj The object to insert.
 * @param {*=} opt_obj2 The object before which obj should be inserted. If obj2
 *     is omitted or not found, obj is inserted at the end of the array.
 */
goog.array.insertBefore = function(arr, obj, opt_obj2) {
  var i;
  if (arguments.length == 2 || (i = goog.array.indexOf(arr, opt_obj2)) < 0) {
    arr.push(obj);
  } else {
    goog.array.insertAt(arr, obj, i);
  }
};


/**
 * Removes the first occurrence of a particular value from an array.
 * @param {goog.array.ArrayLike} arr Array from which to remove value.
 * @param {*} obj Object to remove.
 * @return {boolean} True if an element was removed.
 */
goog.array.remove = function(arr, obj) {
  var i = goog.array.indexOf(arr, obj);
  var rv;
  if ((rv = i >= 0)) {
    goog.array.removeAt(arr, i);
  }
  return rv;
};


/**
 * Removes from an array the element at index i
 * @param {goog.array.ArrayLike} arr Array or array like object from which to
 *     remove value.
 * @param {number} i The index to remove.
 * @return {boolean} True if an element was removed.
 */
goog.array.removeAt = function(arr, i) {
  goog.asserts.assert(arr.length != null);

  // use generic form of splice
  // splice returns the removed items and if successful the length of that
  // will be 1
  return goog.array.ARRAY_PROTOTYPE_.splice.call(arr, i, 1).length == 1;
};


/**
 * Removes the first value that satisfies the given condition.
 * @param {goog.array.ArrayLike} arr Array from which to remove value.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the array) and should
 *     return a boolean.
 * @param {Object=} opt_obj An optional "this" context for the function.
 * @return {boolean} True if an element was removed.
 */
goog.array.removeIf = function(arr, f, opt_obj) {
  var i = goog.array.findIndex(arr, f, opt_obj);
  if (i >= 0) {
    goog.array.removeAt(arr, i);
    return true;
  }
  return false;
};


/**
 * Returns a new array that is the result of joining the arguments.  If arrays
 * are passed then their items are added, however, if non-arrays are passed they
 * will be added to the return array as is.
 *
 * Note that ArrayLike objects will be added as is, rather than having their
 * items added.
 *
 * goog.array.concat([1, 2], [3, 4]) -> [1, 2, 3, 4]
 * goog.array.concat(0, [1, 2]) -> [0, 1, 2]
 * goog.array.concat([1, 2], null) -> [1, 2, null]
 *
 * There is bug in all current versions of IE (6, 7 and 8) where arrays created
 * in an iframe become corrupted soon (not immediately) after the iframe is
 * destroyed. This is common if loading data via goog.net.IframeIo, for example.
 * This corruption only affects the concat method which will start throwing
 * Catastrophic Errors (#-2147418113).
 *
 * See http://endoflow.com/scratch/corrupted-arrays.html for a test case.
 *
 * Internally goog.array should use this, so that all methods will continue to
 * work on these broken array objects.
 *
 * @param {...*} var_args Items to concatenate.  Arrays will have each item
 *     added, while primitives and objects will be added as is.
 * @return {!Array} The new resultant array.
 */
goog.array.concat = function(var_args) {
  return goog.array.ARRAY_PROTOTYPE_.concat.apply(
      goog.array.ARRAY_PROTOTYPE_, arguments);
};


/**
 * Does a shallow copy of an array.
 * @param {goog.array.ArrayLike} arr  Array or array-like object to clone.
 * @return {!Array} Clone of the input array.
 */
goog.array.clone = function(arr) {
  if (goog.isArray(arr)) {
    return goog.array.concat(/** @type {!Array} */ (arr));
  } else { // array like
    // Concat does not work with non arrays.
    var rv = [];
    for (var i = 0, len = arr.length; i < len; i++) {
      rv[i] = arr[i];
    }
    return rv;
  }
};


/**
 * Converts an object to an array.
 * @param {goog.array.ArrayLike} object  The object to convert to an array.
 * @return {!Array} The object converted into an array. If object has a
 *     length property, every property indexed with a non-negative number
 *     less than length will be included in the result. If object does not
 *     have a length property, an empty array will be returned.
 */
goog.array.toArray = function(object) {
  if (goog.isArray(object)) {
    // This fixes the JS compiler warning and forces the Object to an Array type
    return goog.array.concat(/** @type {!Array} */ (object));
  }
  // Clone what we hope to be an array-like object to an array.
  // We could check isArrayLike() first, but no check we perform would be as
  // reliable as simply making the call.
  return goog.array.clone(/** @type {Array} */ (object));
};


/**
 * Extends an array with another array, element, or "array like" object.
 * This function operates 'in-place', it does not create a new Array.
 *
 * Example:
 * var a = [];
 * goog.array.extend(a, [0, 1]);
 * a; // [0, 1]
 * goog.array.extend(a, 2);
 * a; // [0, 1, 2]
 *
 * @param {Array} arr1  The array to modify.
 * @param {...*} var_args The elements or arrays of elements to add to arr1.
 */
goog.array.extend = function(arr1, var_args) {
  for (var i = 1; i < arguments.length; i++) {
    var arr2 = arguments[i];
    // If we have an Array or an Arguments object we can just call push
    // directly.
    var isArrayLike;
    if (goog.isArray(arr2) ||
        // Detect Arguments. ES5 says that the [[Class]] of an Arguments object
        // is "Arguments" but only V8 and JSC/Safari gets this right. We instead
        // detect Arguments by checking for array like and presence of "callee".
        (isArrayLike = goog.isArrayLike(arr2)) &&
            // The getter for callee throws an exception in strict mode
            // according to section 10.6 in ES5 so check for presence instead.
            arr2.hasOwnProperty('callee')) {
      arr1.push.apply(arr1, arr2);

    } else if (isArrayLike) {
      // Otherwise loop over arr2 to prevent copying the object.
      var len1 = arr1.length;
      var len2 = arr2.length;
      for (var j = 0; j < len2; j++) {
        arr1[len1 + j] = arr2[j];
      }
    } else {
      arr1.push(arr2);
    }
  }
};


/**
 * Adds or removes elements from an array. This is a generic version of Array
 * splice. This means that it might work on other objects similar to arrays,
 * such as the arguments object.
 *
 * @param {goog.array.ArrayLike} arr The array to modify.
 * @param {number|undefined} index The index at which to start changing the
 *     array. If not defined, treated as 0.
 * @param {number} howMany How many elements to remove (0 means no removal. A
 *     value below 0 is treated as zero and so is any other non number. Numbers
 *     are floored).
 * @param {...*} var_args Optional, additional elements to insert into the
 *     array.
 * @return {!Array} the removed elements.
 */
goog.array.splice = function(arr, index, howMany, var_args) {
  goog.asserts.assert(arr.length != null);

  return goog.array.ARRAY_PROTOTYPE_.splice.apply(
      arr, goog.array.slice(arguments, 1));
};


/**
 * Returns a new array from a segment of an array. This is a generic version of
 * Array slice. This means that it might work on other objects similar to
 * arrays, such as the arguments object.
 *
 * @param {goog.array.ArrayLike} arr The array from which to copy a segment.
 * @param {number} start The index of the first element to copy.
 * @param {number=} opt_end The index after the last element to copy.
 * @return {!Array} A new array containing the specified segment of the original
 *     array.
 */
goog.array.slice = function(arr, start, opt_end) {
  goog.asserts.assert(arr.length != null);

  // passing 1 arg to slice is not the same as passing 2 where the second is
  // null or undefined (in that case the second argument is treated as 0).
  // we could use slice on the arguments object and then use apply instead of
  // testing the length
  if (arguments.length <= 2) {
    return goog.array.ARRAY_PROTOTYPE_.slice.call(arr, start);
  } else {
    return goog.array.ARRAY_PROTOTYPE_.slice.call(arr, start, opt_end);
  }
};


/**
 * Removes all duplicates from an array (retaining only the first
 * occurrence of each array element).  This function modifies the
 * array in place and doesn't change the order of the non-duplicate items.
 *
 * For objects, duplicates are identified as having the same unique ID as
 * defined by {@link goog.getUid}.
 *
 * Runtime: N,
 * Worstcase space: 2N (no dupes)
 *
 * @param {goog.array.ArrayLike} arr The array from which to remove duplicates.
 * @param {Array=} opt_rv An optional array in which to return the results,
 *     instead of performing the removal inplace.  If specified, the original
 *     array will remain unchanged.
 */
goog.array.removeDuplicates = function(arr, opt_rv) {
  var returnArray = opt_rv || arr;

  var seen = {}, cursorInsert = 0, cursorRead = 0;
  while (cursorRead < arr.length) {
    var current = arr[cursorRead++];

    // Prefix each type with a single character representing the type to
    // prevent conflicting keys (e.g. true and 'true').
    var key = goog.isObject(current) ?
        'o' + goog.getUid(current) :
        (typeof current).charAt(0) + current;

    if (!Object.prototype.hasOwnProperty.call(seen, key)) {
      seen[key] = true;
      returnArray[cursorInsert++] = current;
    }
  }
  returnArray.length = cursorInsert;
};


/**
 * Searches the specified array for the specified target using the binary
 * search algorithm.  If no opt_compareFn is specified, elements are compared
 * using <code>goog.array.defaultCompare</code>, which compares the elements
 * using the built in < and > operators.  This will produce the expected
 * behavior for homogeneous arrays of String(s) and Number(s). The array
 * specified <b>must</b> be sorted in ascending order (as defined by the
 * comparison function).  If the array is not sorted, results are undefined.
 * If the array contains multiple instances of the specified target value, any
 * of these instances may be found.
 *
 * Runtime: O(log n)
 *
 * @param {goog.array.ArrayLike} arr The array to be searched.
 * @param {*} target The sought value.
 * @param {Function=} opt_compareFn Optional comparison function by which the
 *     array is ordered. Should take 2 arguments to compare, and return a
 *     negative number, zero, or a positive number depending on whether the
 *     first argument is less than, equal to, or greater than the second.
 * @return {number} Lowest index of the target value if found, otherwise
 *     (-(insertion point) - 1). The insertion point is where the value should
 *     be inserted into arr to preserve the sorted property.  Return value >= 0
 *     iff target is found.
 */
goog.array.binarySearch = function(arr, target, opt_compareFn) {
  return goog.array.binarySearch_(arr,
      opt_compareFn || goog.array.defaultCompare, false /* isEvaluator */,
      target);
};


/**
 * Selects an index in the specified array using the binary search algorithm.
 * The evaluator receives an element and determines whether the desired index
 * is before, at, or after it.  The evaluator must be consistent (formally,
 * goog.array.map(goog.array.map(arr, evaluator, opt_obj), goog.math.sign)
 * must be monotonically non-increasing).
 *
 * Runtime: O(log n)
 *
 * @param {goog.array.ArrayLike} arr The array to be searched.
 * @param {Function} evaluator Evaluator function that receives 3 arguments
 *     (the element, the index and the array). Should return a negative number,
 *     zero, or a positive number depending on whether the desired index is
 *     before, at, or after the element passed to it.
 * @param {Object=} opt_obj The object to be used as the value of 'this'
 *     within evaluator.
 * @return {number} Index of the leftmost element matched by the evaluator, if
 *     such exists; otherwise (-(insertion point) - 1). The insertion point is
 *     the index of the first element for which the evaluator returns negative,
 *     or arr.length if no such element exists. The return value is non-negative
 *     iff a match is found.
 */
goog.array.binarySelect = function(arr, evaluator, opt_obj) {
  return goog.array.binarySearch_(arr, evaluator, true /* isEvaluator */,
      undefined /* opt_target */, opt_obj);
};


/**
 * Implementation of a binary search algorithm which knows how to use both
 * comparison functions and evaluators. If an evaluator is provided, will call
 * the evaluator with the given optional data object, conforming to the
 * interface defined in binarySelect. Otherwise, if a comparison function is
 * provided, will call the comparison function against the given data object.
 *
 * This implementation purposefully does not use goog.bind or goog.partial for
 * performance reasons.
 *
 * Runtime: O(log n)
 *
 * @param {goog.array.ArrayLike} arr The array to be searched.
 * @param {Function} compareFn Either an evaluator or a comparison function,
 *     as defined by binarySearch and binarySelect above.
 * @param {boolean} isEvaluator Whether the function is an evaluator or a
 *     comparison function.
 * @param {*=} opt_target If the function is a comparison function, then this is
 *     the target to binary search for.
 * @param {Object=} opt_selfObj If the function is an evaluator, this is an
  *    optional this object for the evaluator.
 * @return {number} Lowest index of the target value if found, otherwise
 *     (-(insertion point) - 1). The insertion point is where the value should
 *     be inserted into arr to preserve the sorted property.  Return value >= 0
 *     iff target is found.
 * @private
 */
goog.array.binarySearch_ = function(arr, compareFn, isEvaluator, opt_target,
    opt_selfObj) {
  var left = 0;  // inclusive
  var right = arr.length;  // exclusive
  var found;
  while (left < right) {
    var middle = (left + right) >> 1;
    var compareResult;
    if (isEvaluator) {
      compareResult = compareFn.call(opt_selfObj, arr[middle], middle, arr);
    } else {
      compareResult = compareFn(opt_target, arr[middle]);
    }
    if (compareResult > 0) {
      left = middle + 1;
    } else {
      right = middle;
      // We are looking for the lowest index so we can't return immediately.
      found = !compareResult;
    }
  }
  // left is the index if found, or the insertion point otherwise.
  // ~left is a shorthand for -left - 1.
  return found ? left : ~left;
};


/**
 * Sorts the specified array into ascending order.  If no opt_compareFn is
 * specified, elements are compared using
 * <code>goog.array.defaultCompare</code>, which compares the elements using
 * the built in < and > operators.  This will produce the expected behavior
 * for homogeneous arrays of String(s) and Number(s), unlike the native sort,
 * but will give unpredictable results for heterogenous lists of strings and
 * numbers with different numbers of digits.
 *
 * This sort is not guaranteed to be stable.
 *
 * Runtime: Same as <code>Array.prototype.sort</code>
 *
 * @param {Array} arr The array to be sorted.
 * @param {Function=} opt_compareFn Optional comparison function by which the
 *     array is to be ordered. Should take 2 arguments to compare, and return a
 *     negative number, zero, or a positive number depending on whether the
 *     first argument is less than, equal to, or greater than the second.
 */
goog.array.sort = function(arr, opt_compareFn) {
  // TODO(arv): Update type annotation since null is not accepted.
  goog.asserts.assert(arr.length != null);

  goog.array.ARRAY_PROTOTYPE_.sort.call(
      arr, opt_compareFn || goog.array.defaultCompare);
};


/**
 * Sorts the specified array into ascending order in a stable way.  If no
 * opt_compareFn is specified, elements are compared using
 * <code>goog.array.defaultCompare</code>, which compares the elements using
 * the built in < and > operators.  This will produce the expected behavior
 * for homogeneous arrays of String(s) and Number(s).
 *
 * Runtime: Same as <code>Array.prototype.sort</code>, plus an additional
 * O(n) overhead of copying the array twice.
 *
 * @param {Array} arr The array to be sorted.
 * @param {function(*, *): number=} opt_compareFn Optional comparison function
 *     by which the array is to be ordered. Should take 2 arguments to compare,
 *     and return a negative number, zero, or a positive number depending on
 *     whether the first argument is less than, equal to, or greater than the
 *     second.
 */
goog.array.stableSort = function(arr, opt_compareFn) {
  for (var i = 0; i < arr.length; i++) {
    arr[i] = {index: i, value: arr[i]};
  }
  var valueCompareFn = opt_compareFn || goog.array.defaultCompare;
  function stableCompareFn(obj1, obj2) {
    return valueCompareFn(obj1.value, obj2.value) || obj1.index - obj2.index;
  };
  goog.array.sort(arr, stableCompareFn);
  for (var i = 0; i < arr.length; i++) {
    arr[i] = arr[i].value;
  }
};


/**
 * Sorts an array of objects by the specified object key and compare
 * function. If no compare function is provided, the key values are
 * compared in ascending order using <code>goog.array.defaultCompare</code>.
 * This won't work for keys that get renamed by the compiler. So use
 * {'foo': 1, 'bar': 2} rather than {foo: 1, bar: 2}.
 * @param {Array.<Object>} arr An array of objects to sort.
 * @param {string} key The object key to sort by.
 * @param {Function=} opt_compareFn The function to use to compare key
 *     values.
 */
goog.array.sortObjectsByKey = function(arr, key, opt_compareFn) {
  var compare = opt_compareFn || goog.array.defaultCompare;
  goog.array.sort(arr, function(a, b) {
    return compare(a[key], b[key]);
  });
};


/**
 * Tells if the array is sorted.
 * @param {!Array} arr The array.
 * @param {Function=} opt_compareFn Function to compare the array elements.
 *     Should take 2 arguments to compare, and return a negative number, zero,
 *     or a positive number depending on whether the first argument is less
 *     than, equal to, or greater than the second.
 * @param {boolean=} opt_strict If true no equal elements are allowed.
 * @return {boolean} Whether the array is sorted.
 */
goog.array.isSorted = function(arr, opt_compareFn, opt_strict) {
  var compare = opt_compareFn || goog.array.defaultCompare;
  for (var i = 1; i < arr.length; i++) {
    var compareResult = compare(arr[i - 1], arr[i]);
    if (compareResult > 0 || compareResult == 0 && opt_strict) {
      return false;
    }
  }
  return true;
};


/**
 * Compares two arrays for equality. Two arrays are considered equal if they
 * have the same length and their corresponding elements are equal according to
 * the comparison function.
 *
 * @param {goog.array.ArrayLike} arr1 The first array to compare.
 * @param {goog.array.ArrayLike} arr2 The second array to compare.
 * @param {Function=} opt_equalsFn Optional comparison function.
 *     Should take 2 arguments to compare, and return true if the arguments
 *     are equal. Defaults to {@link goog.array.defaultCompareEquality} which
 *     compares the elements using the built-in '===' operator.
 * @return {boolean} Whether the two arrays are equal.
 */
goog.array.equals = function(arr1, arr2, opt_equalsFn) {
  if (!goog.isArrayLike(arr1) || !goog.isArrayLike(arr2) ||
      arr1.length != arr2.length) {
    return false;
  }
  var l = arr1.length;
  var equalsFn = opt_equalsFn || goog.array.defaultCompareEquality;
  for (var i = 0; i < l; i++) {
    if (!equalsFn(arr1[i], arr2[i])) {
      return false;
    }
  }
  return true;
};


/**
 * @deprecated Use {@link goog.array.equals}.
 * @param {goog.array.ArrayLike} arr1 See {@link goog.array.equals}.
 * @param {goog.array.ArrayLike} arr2 See {@link goog.array.equals}.
 * @param {Function=} opt_equalsFn See {@link goog.array.equals}.
 * @return {boolean} See {@link goog.array.equals}.
 */
goog.array.compare = function(arr1, arr2, opt_equalsFn) {
  return goog.array.equals(arr1, arr2, opt_equalsFn);
};


/**
 * 3-way array compare function.
 * @param {!goog.array.ArrayLike} arr1 The first array to compare.
 * @param {!goog.array.ArrayLike} arr2 The second array to compare.
 * @param {(function(*, *): number)=} opt_compareFn Optional comparison function
 *     by which the array is to be ordered. Should take 2 arguments to compare,
 *     and return a negative number, zero, or a positive number depending on
 *     whether the first argument is less than, equal to, or greater than the
 *     second.
 * @return {number} Negative number, zero, or a positive number depending on
 *     whether the first argument is less than, equal to, or greater than the
 *     second.
 */
goog.array.compare3 = function(arr1, arr2, opt_compareFn) {
  var compare = opt_compareFn || goog.array.defaultCompare;
  var l = Math.min(arr1.length, arr2.length);
  for (var i = 0; i < l; i++) {
    var result = compare(arr1[i], arr2[i]);
    if (result != 0) {
      return result;
    }
  }
  return goog.array.defaultCompare(arr1.length, arr2.length);
};


/**
 * Compares its two arguments for order, using the built in < and >
 * operators.
 * @param {*} a The first object to be compared.
 * @param {*} b The second object to be compared.
 * @return {number} A negative number, zero, or a positive number as the first
 *     argument is less than, equal to, or greater than the second.
 */
goog.array.defaultCompare = function(a, b) {
  return a > b ? 1 : a < b ? -1 : 0;
};


/**
 * Compares its two arguments for equality, using the built in === operator.
 * @param {*} a The first object to compare.
 * @param {*} b The second object to compare.
 * @return {boolean} True if the two arguments are equal, false otherwise.
 */
goog.array.defaultCompareEquality = function(a, b) {
  return a === b;
};


/**
 * Inserts a value into a sorted array. The array is not modified if the
 * value is already present.
 * @param {Array} array The array to modify.
 * @param {*} value The object to insert.
 * @param {Function=} opt_compareFn Optional comparison function by which the
 *     array is ordered. Should take 2 arguments to compare, and return a
 *     negative number, zero, or a positive number depending on whether the
 *     first argument is less than, equal to, or greater than the second.
 * @return {boolean} True if an element was inserted.
 */
goog.array.binaryInsert = function(array, value, opt_compareFn) {
  var index = goog.array.binarySearch(array, value, opt_compareFn);
  if (index < 0) {
    goog.array.insertAt(array, value, -(index + 1));
    return true;
  }
  return false;
};


/**
 * Removes a value from a sorted array.
 * @param {Array} array The array to modify.
 * @param {*} value The object to remove.
 * @param {Function=} opt_compareFn Optional comparison function by which the
 *     array is ordered. Should take 2 arguments to compare, and return a
 *     negative number, zero, or a positive number depending on whether the
 *     first argument is less than, equal to, or greater than the second.
 * @return {boolean} True if an element was removed.
 */
goog.array.binaryRemove = function(array, value, opt_compareFn) {
  var index = goog.array.binarySearch(array, value, opt_compareFn);
  return (index >= 0) ? goog.array.removeAt(array, index) : false;
};


/**
 * Splits an array into disjoint buckets according to a splitting function.
 * @param {Array} array The array.
 * @param {Function} sorter Function to call for every element.  This
 *     takes 3 arguments (the element, the index and the array) and must
 *     return a valid object key (a string, number, etc), or undefined, if
 *     that object should not be placed in a bucket.
 * @return {!Object} An object, with keys being all of the unique return values
 *     of sorter, and values being arrays containing the items for
 *     which the splitter returned that key.
 */
goog.array.bucket = function(array, sorter) {
  var buckets = {};

  for (var i = 0; i < array.length; i++) {
    var value = array[i];
    var key = sorter(value, i, array);
    if (goog.isDef(key)) {
      // Push the value to the right bucket, creating it if necessary.
      var bucket = buckets[key] || (buckets[key] = []);
      bucket.push(value);
    }
  }

  return buckets;
};


/**
 * Returns an array consisting of the given value repeated N times.
 *
 * @param {*} value The value to repeat.
 * @param {number} n The repeat count.
 * @return {!Array.<*>} An array with the repeated value.
 */
goog.array.repeat = function(value, n) {
  var array = [];
  for (var i = 0; i < n; i++) {
    array[i] = value;
  }
  return array;
};


/**
 * Returns an array consisting of every argument with all arrays
 * expanded in-place recursively.
 *
 * @param {...*} var_args The values to flatten.
 * @return {!Array.<*>} An array containing the flattened values.
 */
goog.array.flatten = function(var_args) {
  var result = [];
  for (var i = 0; i < arguments.length; i++) {
    var element = arguments[i];
    if (goog.isArray(element)) {
      result.push.apply(result, goog.array.flatten.apply(null, element));
    } else {
      result.push(element);
    }
  }
  return result;
};


/**
 * Rotates an array in-place. After calling this method, the element at
 * index i will be the element previously at index (i - n) %
 * array.length, for all values of i between 0 and array.length - 1,
 * inclusive.
 *
 * For example, suppose list comprises [t, a, n, k, s]. After invoking
 * rotate(array, 1) (or rotate(array, -4)), array will comprise [s, t, a, n, k].
 *
 * @param {!Array.<*>} array The array to rotate.
 * @param {number} n The amount to rotate.
 * @return {!Array.<*>} The array.
 */
goog.array.rotate = function(array, n) {
  goog.asserts.assert(array.length != null);

  if (array.length) {
    n %= array.length;
    if (n > 0) {
      goog.array.ARRAY_PROTOTYPE_.unshift.apply(array, array.splice(-n, n));
    } else if (n < 0) {
      goog.array.ARRAY_PROTOTYPE_.push.apply(array, array.splice(0, -n));
    }
  }
  return array;
};


/**
 * Creates a new array for which the element at position i is an array of the
 * ith element of the provided arrays.  The returned array will only be as long
 * as the shortest array provided; additional values are ignored.  For example,
 * the result of zipping [1, 2] and [3, 4, 5] is [[1,3], [2, 4]].
 *
 * This is similar to the zip() function in Python.  See {@link
 * http://docs.python.org/library/functions.html#zip}
 *
 * @param {...!goog.array.ArrayLike} var_args Arrays to be combined.
 * @return {!Array.<!Array>} A new array of arrays created from provided arrays.
 */
goog.array.zip = function(var_args) {
  if (!arguments.length) {
    return [];
  }
  var result = [];
  for (var i = 0; true; i++) {
    var value = [];
    for (var j = 0; j < arguments.length; j++) {
      var arr = arguments[j];
      // If i is larger than the array length, this is the shortest array.
      if (i >= arr.length) {
        return result;
      }
      value.push(arr[i]);
    }
    result.push(value);
  }
};


/**
 * Shuffles the values in the specified array using the Fisher-Yates in-place
 * shuffle (also known as the Knuth Shuffle). By default, calls Math.random()
 * and so resets the state of that random number generator. Similarly, may reset
 * the state of the any other specified random number generator.
 *
 * Runtime: O(n)
 *
 * @param {!Array} arr The array to be shuffled.
 * @param {Function=} opt_randFn Optional random function to use for shuffling.
 *     Takes no arguments, and returns a random number on the interval [0, 1).
 *     Defaults to Math.random() using JavaScript's built-in Math library.
 */
goog.array.shuffle = function(arr, opt_randFn) {
  var randFn = opt_randFn || Math.random;

  for (var i = arr.length - 1; i > 0; i--) {
    // Choose a random array index in [0, i] (inclusive with i).
    var j = Math.floor(randFn() * (i + 1));

    var tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
};
// Copyright 2007 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Python style iteration utilities.
 * @author arv@google.com (Erik Arvidsson)
 */


goog.provide('goog.iter');
goog.provide('goog.iter.Iterator');
goog.provide('goog.iter.StopIteration');

goog.require('goog.array');
goog.require('goog.asserts');


// TODO(nnaze): Add more functions from Python's itertools.
// http://docs.python.org/library/itertools.html


/**
 * @typedef {goog.iter.Iterator|{length:number}|{__iterator__}}
 */
goog.iter.Iterable;


// For script engines that already support iterators.
if ('StopIteration' in goog.global) {
  /**
   * Singleton Error object that is used to terminate iterations.
   * @type {Error}
   */
  goog.iter.StopIteration = goog.global['StopIteration'];
} else {
  /**
   * Singleton Error object that is used to terminate iterations.
   * @type {Error}
   * @suppress {duplicate}
   */
  goog.iter.StopIteration = Error('StopIteration');
}



/**
 * Class/interface for iterators.  An iterator needs to implement a {@code next}
 * method and it needs to throw a {@code goog.iter.StopIteration} when the
 * iteration passes beyond the end.  Iterators have no {@code hasNext} method.
 * It is recommended to always use the helper functions to iterate over the
 * iterator or in case you are only targeting JavaScript 1.7 for in loops.
 * @constructor
 */
goog.iter.Iterator = function() {};


/**
 * Returns the next value of the iteration.  This will throw the object
 * {@see goog.iter#StopIteration} when the iteration passes the end.
 * @return {*} Any object or value.
 */
goog.iter.Iterator.prototype.next = function() {
  throw goog.iter.StopIteration;
};


/**
 * Returns the {@code Iterator} object itself.  This is used to implement
 * the iterator protocol in JavaScript 1.7
 * @param {boolean=} opt_keys  Whether to return the keys or values. Default is
 *     to only return the values.  This is being used by the for-in loop (true)
 *     and the for-each-in loop (false).  Even though the param gives a hint
 *     about what the iterator will return there is no guarantee that it will
 *     return the keys when true is passed.
 * @return {!goog.iter.Iterator} The object itself.
 */
goog.iter.Iterator.prototype.__iterator__ = function(opt_keys) {
  return this;
};


/**
 * Returns an iterator that knows how to iterate over the values in the object.
 * @param {goog.iter.Iterable} iterable  If the object is an iterator it
 *     will be returned as is.  If the object has a {@code __iterator__} method
 *     that will be called to get the value iterator.  If the object is an
 *     array-like object we create an iterator for that.
 * @return {!goog.iter.Iterator} An iterator that knows how to iterate over the
 *     values in {@code iterable}.
 */
goog.iter.toIterator = function(iterable) {
  if (iterable instanceof goog.iter.Iterator) {
    return iterable;
  }
  if (typeof iterable.__iterator__ == 'function') {
    return iterable.__iterator__(false);
  }
  if (goog.isArrayLike(iterable)) {
    var i = 0;
    var newIter = new goog.iter.Iterator;
    newIter.next = function() {
      while (true) {
        if (i >= iterable.length) {
          throw goog.iter.StopIteration;
        }
        // Don't include deleted elements.
        if (!(i in iterable)) {
          i++;
          continue;
        }
        return iterable[i++];
      }
    };
    return newIter;
  }


  // TODO(arv): Should we fall back on goog.structs.getValues()?
  throw Error('Not implemented');
};


/**
 * Calls a function for each element in the iterator with the element of the
 * iterator passed as argument.
 *
 * @param {goog.iter.Iterable} iterable  The iterator to iterate
 *     over.  If the iterable is an object {@code toIterator} will be called on
 *     it.
 * @param {Function} f  The function to call for every element.  This function
 *     takes 3 arguments (the element, undefined, and the iterator) and the
 *     return value is irrelevant.  The reason for passing undefined as the
 *     second argument is so that the same function can be used in
 *     {@see goog.array#forEach} as well as others.
 * @param {Object=} opt_obj  The object to be used as the value of 'this' within
 *     {@code f}.
 */
goog.iter.forEach = function(iterable, f, opt_obj) {
  if (goog.isArrayLike(iterable)) {
    /** @preserveTry */
    try {
      goog.array.forEach((/** @type {goog.array.ArrayLike} */ iterable), f,
                         opt_obj);
    } catch (ex) {
      if (ex !== goog.iter.StopIteration) {
        throw ex;
      }
    }
  } else {
    iterable = goog.iter.toIterator(iterable);
    /** @preserveTry */
    try {
      while (true) {
        f.call(opt_obj, iterable.next(), undefined, iterable);
      }
    } catch (ex) {
      if (ex !== goog.iter.StopIteration) {
        throw ex;
      }
    }
  }
};


/**
 * Calls a function for every element in the iterator, and if the function
 * returns true adds the element to a new iterator.
 *
 * @param {goog.iter.Iterable} iterable The iterator to iterate over.
 * @param {Function} f The function to call for every element.  This function
 *     takes 3 arguments (the element, undefined, and the iterator) and should
 *     return a boolean.  If the return value is true the element will be
 *     included  in the returned iteror.  If it is false the element is not
 *     included.
 * @param {Object=} opt_obj The object to be used as the value of 'this' within
 *     {@code f}.
 * @return {!goog.iter.Iterator} A new iterator in which only elements that
 *     passed the test are present.
 */
goog.iter.filter = function(iterable, f, opt_obj) {
  iterable = goog.iter.toIterator(iterable);
  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    while (true) {
      var val = iterable.next();
      if (f.call(opt_obj, val, undefined, iterable)) {
        return val;
      }
    }
  };
  return newIter;
};


/**
 * Creates a new iterator that returns the values in a range.  This function
 * can take 1, 2 or 3 arguments:
 * <pre>
 * range(5) same as range(0, 5, 1)
 * range(2, 5) same as range(2, 5, 1)
 * </pre>
 *
 * @param {number} startOrStop  The stop value if only one argument is provided.
 *     The start value if 2 or more arguments are provided.  If only one
 *     argument is used the start value is 0.
 * @param {number=} opt_stop  The stop value.  If left out then the first
 *     argument is used as the stop value.
 * @param {number=} opt_step  The number to increment with between each call to
 *     next.  This can be negative.
 * @return {!goog.iter.Iterator} A new iterator that returns the values in the
 *     range.
 */
goog.iter.range = function(startOrStop, opt_stop, opt_step) {
  var start = 0;
  var stop = startOrStop;
  var step = opt_step || 1;
  if (arguments.length > 1) {
    start = startOrStop;
    stop = opt_stop;
  }
  if (step == 0) {
    throw Error('Range step argument must not be zero');
  }

  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    if (step > 0 && start >= stop || step < 0 && start <= stop) {
      throw goog.iter.StopIteration;
    }
    var rv = start;
    start += step;
    return rv;
  };
  return newIter;
};


/**
 * Joins the values in a iterator with a delimiter.
 * @param {goog.iter.Iterable} iterable  The iterator to get the values from.
 * @param {string} deliminator  The text to put between the values.
 * @return {string} The joined value string.
 */
goog.iter.join = function(iterable, deliminator) {
  return goog.iter.toArray(iterable).join(deliminator);
};


/**
 * For every element in the iterator call a function and return a new iterator
 * with that value.
 *
 * @param {goog.iter.Iterable} iterable The iterator to iterate over.
 * @param {Function} f The function to call for every element.  This function
 *     takes 3 arguments (the element, undefined, and the iterator) and should
 *     return a new value.
 * @param {Object=} opt_obj The object to be used as the value of 'this' within
 *     {@code f}.
 * @return {!goog.iter.Iterator} A new iterator that returns the results of
 *     applying the function to each element in the original iterator.
 */
goog.iter.map = function(iterable, f, opt_obj) {
  iterable = goog.iter.toIterator(iterable);
  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    while (true) {
      var val = iterable.next();
      return f.call(opt_obj, val, undefined, iterable);
    }
  };
  return newIter;
};


/**
 * Passes every element of an iterator into a function and accumulates the
 * result.
 *
 * @param {goog.iter.Iterable} iterable The iterator to iterate over.
 * @param {Function} f The function to call for every element. This function
 *     takes 2 arguments (the function's previous result or the initial value,
 *     and the value of the current element).
 *     function(previousValue, currentElement) : newValue.
 * @param {*} val The initial value to pass into the function on the first call.
 * @param {Object=} opt_obj  The object to be used as the value of 'this'
 *     within f.
 * @return {*} Result of evaluating f repeatedly across the values of
 *     the iterator.
 */
goog.iter.reduce = function(iterable, f, val, opt_obj) {
  var rval = val;
  goog.iter.forEach(iterable, function(val) {
    rval = f.call(opt_obj, rval, val);
  });
  return rval;
};


/**
 * Goes through the values in the iterator. Calls f for each these and if any of
 * them returns true, this returns true (without checking the rest). If all
 * return false this will return false.
 *
 * @param {goog.iter.Iterable} iterable  The iterator object.
 * @param {Function} f  The function to call for every value. This function
 *     takes 3 arguments (the value, undefined, and the iterator) and should
 *     return a boolean.
 * @param {Object=} opt_obj The object to be used as the value of 'this' within
 *     {@code f}.
 * @return {boolean} true if any value passes the test.
 */
goog.iter.some = function(iterable, f, opt_obj) {
  iterable = goog.iter.toIterator(iterable);
  /** @preserveTry */
  try {
    while (true) {
      if (f.call(opt_obj, iterable.next(), undefined, iterable)) {
        return true;
      }
    }
  } catch (ex) {
    if (ex !== goog.iter.StopIteration) {
      throw ex;
    }
  }
  return false;
};


/**
 * Goes through the values in the iterator. Calls f for each these and if any of
 * them returns false this returns false (without checking the rest). If all
 * return true this will return true.
 *
 * @param {goog.iter.Iterable} iterable  The iterator object.
 * @param {Function} f  The function to call for every value. This function
 *     takes 3 arguments (the value, undefined, and the iterator) and should
 *     return a boolean.
 * @param {Object=} opt_obj The object to be used as the value of 'this' within
 *     {@code f}.
 * @return {boolean} true if every value passes the test.
 */
goog.iter.every = function(iterable, f, opt_obj) {
  iterable = goog.iter.toIterator(iterable);
  /** @preserveTry */
  try {
    while (true) {
      if (!f.call(opt_obj, iterable.next(), undefined, iterable)) {
        return false;
      }
    }
  } catch (ex) {
    if (ex !== goog.iter.StopIteration) {
      throw ex;
    }
  }
  return true;
};


/**
 * Takes zero or more iterators and returns one iterator that will iterate over
 * them in the order chained.
 * @param {...goog.iter.Iterator} var_args  Any number of iterator objects.
 * @return {!goog.iter.Iterator} Returns a new iterator that will iterate over
 *     all the given iterators' contents.
 */
goog.iter.chain = function(var_args) {
  var args = arguments;
  var length = args.length;
  var i = 0;
  var newIter = new goog.iter.Iterator;

  /**
   * @return {*} The next item in the iteration.
   * @this {goog.iter.Iterator}
   */
  newIter.next = function() {
    /** @preserveTry */
    try {
      if (i >= length) {
        throw goog.iter.StopIteration;
      }
      var current = goog.iter.toIterator(args[i]);
      return current.next();
    } catch (ex) {
      if (ex !== goog.iter.StopIteration || i >= length) {
        throw ex;
      } else {
        // In case we got a StopIteration increment counter and try again.
        i++;
        return this.next();
      }
    }
  };

  return newIter;
};


/**
 * Builds a new iterator that iterates over the original, but skips elements as
 * long as a supplied function returns true.
 * @param {goog.iter.Iterable} iterable  The iterator object.
 * @param {Function} f  The function to call for every value. This function
 *     takes 3 arguments (the value, undefined, and the iterator) and should
 *     return a boolean.
 * @param {Object=} opt_obj The object to be used as the value of 'this' within
 *     {@code f}.
 * @return {!goog.iter.Iterator} A new iterator that drops elements from the
 *     original iterator as long as {@code f} is true.
 */
goog.iter.dropWhile = function(iterable, f, opt_obj) {
  iterable = goog.iter.toIterator(iterable);
  var newIter = new goog.iter.Iterator;
  var dropping = true;
  newIter.next = function() {
    while (true) {
      var val = iterable.next();
      if (dropping && f.call(opt_obj, val, undefined, iterable)) {
        continue;
      } else {
        dropping = false;
      }
      return val;
    }
  };
  return newIter;
};


/**
 * Builds a new iterator that iterates over the original, but only as long as a
 * supplied function returns true.
 * @param {goog.iter.Iterable} iterable  The iterator object.
 * @param {Function} f  The function to call for every value. This function
 *     takes 3 arguments (the value, undefined, and the iterator) and should
 *     return a boolean.
 * @param {Object=} opt_obj This is used as the 'this' object in f when called.
 * @return {!goog.iter.Iterator} A new iterator that keeps elements in the
 *     original iterator as long as the function is true.
 */
goog.iter.takeWhile = function(iterable, f, opt_obj) {
  iterable = goog.iter.toIterator(iterable);
  var newIter = new goog.iter.Iterator;
  var taking = true;
  newIter.next = function() {
    while (true) {
      if (taking) {
        var val = iterable.next();
        if (f.call(opt_obj, val, undefined, iterable)) {
          return val;
        } else {
          taking = false;
        }
      } else {
        throw goog.iter.StopIteration;
      }
    }
  };
  return newIter;
};


/**
 * Converts the iterator to an array
 * @param {goog.iter.Iterable} iterable  The iterator to convert to an array.
 * @return {!Array} An array of the elements the iterator iterates over.
 */
goog.iter.toArray = function(iterable) {
  // Fast path for array-like.
  if (goog.isArrayLike(iterable)) {
    return goog.array.toArray((/** @type {!goog.array.ArrayLike} */ iterable));
  }
  iterable = goog.iter.toIterator(iterable);
  var array = [];
  goog.iter.forEach(iterable, function(val) {
    array.push(val);
  });
  return array;
};


/**
 * Iterates over 2 iterators and returns true if they contain the same sequence
 * of elements and have the same length.
 * @param {goog.iter.Iterable} iterable1  The first iterable object.
 * @param {goog.iter.Iterable} iterable2  The second iterable object.
 * @return {boolean} true if the iterators contain the same sequence of
 *     elements and have the same length.
 */
goog.iter.equals = function(iterable1, iterable2) {
  iterable1 = goog.iter.toIterator(iterable1);
  iterable2 = goog.iter.toIterator(iterable2);
  var b1, b2;
  /** @preserveTry */
  try {
    while (true) {
      b1 = b2 = false;
      var val1 = iterable1.next();
      b1 = true;
      var val2 = iterable2.next();
      b2 = true;
      if (val1 != val2) {
        return false;
      }
    }
  } catch (ex) {
    if (ex !== goog.iter.StopIteration) {
      throw ex;
    } else {
      if (b1 && !b2) {
        // iterable1 done but iterable2 is not done.
        return false;
      }
      if (!b2) {
        /** @preserveTry */
        try {
          // iterable2 not done?
          val2 = iterable2.next();
          // iterable2 not done but iterable1 is done
          return false;
        } catch (ex1) {
          if (ex1 !== goog.iter.StopIteration) {
            throw ex1;
          }
          // iterable2 done as well... They are equal
          return true;
        }
      }
    }
  }
  return false;
};


/**
 * Advances the iterator to the next position, returning the given default value
 * instead of throwing an exception if the iterator has no more entries.
 * @param {goog.iter.Iterable} iterable The iterable object.
 * @param {*} defaultValue The value to return if the iterator is empty.
 * @return {*} The next item in the iteration, or defaultValue if the iterator
 *     was empty.
 */
goog.iter.nextOrValue = function(iterable, defaultValue) {
  try {
    return goog.iter.toIterator(iterable).next();
  } catch (e) {
    if (e != goog.iter.StopIteration) {
      throw e;
    }
    return defaultValue;
  }
};


/**
 * Cartesian product of zero or more sets.  Gives an iterator that gives every
 * combination of one element chosen from each set.  For example,
 * ([1, 2], [3, 4]) gives ([1, 3], [1, 4], [2, 3], [2, 4]).
 * @see http://docs.python.org/library/itertools.html#itertools.product
 * @param {...!goog.array.ArrayLike.<*>} var_args Zero or more sets, as arrays.
 * @return {!goog.iter.Iterator} An iterator that gives each n-tuple (as an
 *     array).
 */
goog.iter.product = function(var_args) {
  var someArrayEmpty = goog.array.some(arguments, function(arr) {
    return !arr.length;
  });

  // An empty set in a cartesian product gives an empty set.
  if (someArrayEmpty || !arguments.length) {
    return new goog.iter.Iterator();
  }

  var iter = new goog.iter.Iterator();
  var arrays = arguments;

  // The first indicies are [0, 0, ...]
  var indicies = goog.array.repeat(0, arrays.length);

  iter.next = function() {

    if (indicies) {
      var retVal = goog.array.map(indicies, function(valueIndex, arrayIndex) {
        return arrays[arrayIndex][valueIndex];
      });

      // Generate the next-largest indicies for the next call.
      // Increase the rightmost index. If it goes over, increase the next
      // rightmost (like carry-over addition).
      for (var i = indicies.length - 1; i >= 0; i--) {
        // Assertion prevents compiler warning below.
        goog.asserts.assert(indicies);
        if (indicies[i] < arrays[i].length - 1) {
          indicies[i]++;
          break;
        }

        // We're at the last indicies (the last element of every array), so
        // the iteration is over on the next call.
        if (i == 0) {
          indicies = null;
          break;
        }
        // Reset the index in this column and loop back to increment the
        // next one.
        indicies[i] = 0;
      }
      return retVal;
    }

    throw goog.iter.StopIteration;
  };

  return iter;
};


/**
 * Create an iterator to cycle over the iterable's elements indefinitely.
 * For example, ([1, 2, 3]) would return : 1, 2, 3, 1, 2, 3, ...
 * @see: http://docs.python.org/library/itertools.html#itertools.cycle.
 * @param {!goog.iter.Iterable} iterable The iterable object.
 * @return {!goog.iter.Iterator} An iterator that iterates indefinitely over
 * the values in {@code iterable}.
 */
goog.iter.cycle = function(iterable) {

  var baseIterator = goog.iter.toIterator(iterable);

  // We maintain a cache to store the iterable elements as we iterate
  // over them. The cache is used to return elements once we have
  // iterated over the iterable once.
  var cache = [];
  var cacheIndex = 0;

  var iter = new goog.iter.Iterator();

  // This flag is set after the iterable is iterated over once
  var useCache = false;

  iter.next = function() {
    var returnElement = null;

    // Pull elements off the original iterator if not using cache
    if (!useCache) {

      try {
        // Return the element from the iterable
        returnElement = baseIterator.next();
        cache.push(returnElement);
        return returnElement;
      } catch (e) {
        // If an exception other than StopIteration is thrown
        // or if there are no elements to iterate over (the iterable was empty)
        // throw an exception
        if (e != goog.iter.StopIteration || goog.array.isEmpty(cache)) {
          throw e;
        }
        // set useCache to true after we know that a 'StopIteration' exception
        // was thrown and the cache is not empty (to handle the 'empty iterable'
        // use case)
        useCache = true;
      }
    }

    returnElement = cache[cacheIndex];
    cacheIndex = (cacheIndex + 1) % cache.length;

    return returnElement;
  };

  return iter;
};
// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Generics method for collection-like classes and objects.
 *
 * @author arv@google.com (Erik Arvidsson)
 *
 * This file contains functions to work with collections. It supports using
 * Map, Set, Array and Object and other classes that implement collection-like
 * methods.
 */


goog.provide('goog.structs');

goog.require('goog.array');
goog.require('goog.object');


// We treat an object as a dictionary if it has getKeys or it is an object that
// isn't arrayLike.


/**
 * Returns the number of values in the collection-like object.
 * @param {Object} col The collection-like object.
 * @return {number} The number of values in the collection-like object.
 */
goog.structs.getCount = function(col) {
  if (typeof col.getCount == 'function') {
    return col.getCount();
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    return col.length;
  }
  return goog.object.getCount(col);
};


/**
 * Returns the values of the collection-like object.
 * @param {Object} col The collection-like object.
 * @return {!Array} The values in the collection-like object.
 */
goog.structs.getValues = function(col) {
  if (typeof col.getValues == 'function') {
    return col.getValues();
  }
  if (goog.isString(col)) {
    return col.split('');
  }
  if (goog.isArrayLike(col)) {
    var rv = [];
    var l = col.length;
    for (var i = 0; i < l; i++) {
      rv.push(col[i]);
    }
    return rv;
  }
  return goog.object.getValues(col);
};


/**
 * Returns the keys of the collection. Some collections have no notion of
 * keys/indexes and this function will return undefined in those cases.
 * @param {Object} col The collection-like object.
 * @return {!Array|undefined} The keys in the collection.
 */
goog.structs.getKeys = function(col) {
  if (typeof col.getKeys == 'function') {
    return col.getKeys();
  }
  // if we have getValues but no getKeys we know this is a key-less collection
  if (typeof col.getValues == 'function') {
    return undefined;
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    var rv = [];
    var l = col.length;
    for (var i = 0; i < l; i++) {
      rv.push(i);
    }
    return rv;
  }

  return goog.object.getKeys(col);
};


/**
 * Whether the collection contains the given value. This is O(n) and uses
 * equals (==) to test the existence.
 * @param {Object} col The collection-like object.
 * @param {*} val The value to check for.
 * @return {boolean} True if the map contains the value.
 */
goog.structs.contains = function(col, val) {
  if (typeof col.contains == 'function') {
    return col.contains(val);
  }
  if (typeof col.containsValue == 'function') {
    return col.containsValue(val);
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.contains(/** @type {Array} */ (col), val);
  }
  return goog.object.containsValue(col, val);
};


/**
 * Whether the collection is empty.
 * @param {Object} col The collection-like object.
 * @return {boolean} True if empty.
 */
goog.structs.isEmpty = function(col) {
  if (typeof col.isEmpty == 'function') {
    return col.isEmpty();
  }

  // We do not use goog.string.isEmpty because here we treat the string as
  // collection and as such even whitespace matters

  if (goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.isEmpty(/** @type {Array} */ (col));
  }
  return goog.object.isEmpty(col);
};


/**
 * Removes all the elements from the collection.
 * @param {Object} col The collection-like object.
 */
goog.structs.clear = function(col) {
  // NOTE(arv): This should not contain strings because strings are immutable
  if (typeof col.clear == 'function') {
    col.clear();
  } else if (goog.isArrayLike(col)) {
    goog.array.clear((/** @type {goog.array.ArrayLike} */ col));
  } else {
    goog.object.clear(col);
  }
};


/**
 * Calls a function for each value in a collection. The function takes
 * three arguments; the value, the key and the collection.
 *
 * @param {Object} col The collection-like object.
 * @param {Function} f The function to call for every value. This function takes
 *     3 arguments (the value, the key or undefined if the collection has no
 *     notion of keys, and the collection) and the return value is irrelevant.
 * @param {Object=} opt_obj The object to be used as the value of 'this'
 *     within {@code f}.
 */
goog.structs.forEach = function(col, f, opt_obj) {
  if (typeof col.forEach == 'function') {
    col.forEach(f, opt_obj);
  } else if (goog.isArrayLike(col) || goog.isString(col)) {
    goog.array.forEach(/** @type {Array} */ (col), f, opt_obj);
  } else {
    var keys = goog.structs.getKeys(col);
    var values = goog.structs.getValues(col);
    var l = values.length;
    for (var i = 0; i < l; i++) {
      f.call(opt_obj, values[i], keys && keys[i], col);
    }
  }
};


/**
 * Calls a function for every value in the collection. When a call returns true,
 * adds the value to a new collection (Array is returned by default).
 *
 * @param {Object} col The collection-like object.
 * @param {Function} f The function to call for every value. This function takes
 *     3 arguments (the value, the key or undefined if the collection has no
 *     notion of keys, and the collection) and should return a Boolean. If the
 *     return value is true the value is added to the result collection. If it
 *     is false the value is not included.
 * @param {Object=} opt_obj The object to be used as the value of 'this'
 *     within {@code f}.
 * @return {!Object|!Array} A new collection where the passed values are
 *     present. If col is a key-less collection an array is returned.  If col
 *     has keys and values a plain old JS object is returned.
 */
goog.structs.filter = function(col, f, opt_obj) {
  if (typeof col.filter == 'function') {
    return col.filter(f, opt_obj);
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.filter(/** @type {!Array} */ (col), f, opt_obj);
  }

  var rv;
  var keys = goog.structs.getKeys(col);
  var values = goog.structs.getValues(col);
  var l = values.length;
  if (keys) {
    rv = {};
    for (var i = 0; i < l; i++) {
      if (f.call(opt_obj, values[i], keys[i], col)) {
        rv[keys[i]] = values[i];
      }
    }
  } else {
    // We should not use goog.array.filter here since we want to make sure that
    // the index is undefined as well as make sure that col is passed to the
    // function.
    rv = [];
    for (var i = 0; i < l; i++) {
      if (f.call(opt_obj, values[i], undefined, col)) {
        rv.push(values[i]);
      }
    }
  }
  return rv;
};


/**
 * Calls a function for every value in the collection and adds the result into a
 * new collection (defaults to creating a new Array).
 *
 * @param {Object} col The collection-like object.
 * @param {Function} f The function to call for every value. This function
 *     takes 3 arguments (the value, the key or undefined if the collection has
 *     no notion of keys, and the collection) and should return something. The
 *     result will be used as the value in the new collection.
 * @param {Object=} opt_obj  The object to be used as the value of 'this'
 *     within {@code f}.
 * @return {!Object|!Array} A new collection with the new values.  If col is a
 *     key-less collection an array is returned.  If col has keys and values a
 *     plain old JS object is returned.
 */
goog.structs.map = function(col, f, opt_obj) {
  if (typeof col.map == 'function') {
    return col.map(f, opt_obj);
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.map(/** @type {!Array} */ (col), f, opt_obj);
  }

  var rv;
  var keys = goog.structs.getKeys(col);
  var values = goog.structs.getValues(col);
  var l = values.length;
  if (keys) {
    rv = {};
    for (var i = 0; i < l; i++) {
      rv[keys[i]] = f.call(opt_obj, values[i], keys[i], col);
    }
  } else {
    // We should not use goog.array.map here since we want to make sure that
    // the index is undefined as well as make sure that col is passed to the
    // function.
    rv = [];
    for (var i = 0; i < l; i++) {
      rv[i] = f.call(opt_obj, values[i], undefined, col);
    }
  }
  return rv;
};


/**
 * Calls f for each value in a collection. If any call returns true this returns
 * true (without checking the rest). If all returns false this returns false.
 *
 * @param {Object|Array|string} col The collection-like object.
 * @param {Function} f The function to call for every value. This function takes
 *     3 arguments (the value, the key or undefined if the collection has no
 *     notion of keys, and the collection) and should return a Boolean.
 * @param {Object=} opt_obj  The object to be used as the value of 'this'
 *     within {@code f}.
 * @return {boolean} True if any value passes the test.
 */
goog.structs.some = function(col, f, opt_obj) {
  if (typeof col.some == 'function') {
    return col.some(f, opt_obj);
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.some(/** @type {!Array} */ (col), f, opt_obj);
  }
  var keys = goog.structs.getKeys(col);
  var values = goog.structs.getValues(col);
  var l = values.length;
  for (var i = 0; i < l; i++) {
    if (f.call(opt_obj, values[i], keys && keys[i], col)) {
      return true;
    }
  }
  return false;
};


/**
 * Calls f for each value in a collection. If all calls return true this return
 * true this returns true. If any returns false this returns false at this point
 *  and does not continue to check the remaining values.
 *
 * @param {Object} col The collection-like object.
 * @param {Function} f The function to call for every value. This function takes
 *     3 arguments (the value, the key or undefined if the collection has no
 *     notion of keys, and the collection) and should return a Boolean.
 * @param {Object=} opt_obj  The object to be used as the value of 'this'
 *     within {@code f}.
 * @return {boolean} True if all key-value pairs pass the test.
 */
goog.structs.every = function(col, f, opt_obj) {
  if (typeof col.every == 'function') {
    return col.every(f, opt_obj);
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.every(/** @type {!Array} */ (col), f, opt_obj);
  }
  var keys = goog.structs.getKeys(col);
  var values = goog.structs.getValues(col);
  var l = values.length;
  for (var i = 0; i < l; i++) {
    if (!f.call(opt_obj, values[i], keys && keys[i], col)) {
      return false;
    }
  }
  return true;
};
// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Datastructure: Hash Map.
 *
 * @author arv@google.com (Erik Arvidsson)
 * @author jonp@google.com (Jon Perlow) Optimized for IE6
 *
 * This file contains an implementation of a Map structure. It implements a lot
 * of the methods used in goog.structs so those functions work on hashes.  For
 * convenience with common usage the methods accept any type for the key, though
 * internally they will be cast to strings.
 */


goog.provide('goog.structs.Map');

goog.require('goog.iter.Iterator');
goog.require('goog.iter.StopIteration');
goog.require('goog.object');
goog.require('goog.structs');



/**
 * Class for Hash Map datastructure.
 * @param {*=} opt_map Map or Object to initialize the map with.
 * @param {...*} var_args If 2 or more arguments are present then they
 *     will be used as key-value pairs.
 * @constructor
 */
goog.structs.Map = function(opt_map, var_args) {

  /**
   * Underlying JS object used to implement the map.
   * @type {!Object}
   * @private
   */
  this.map_ = {};

  /**
   * An array of keys. This is necessary for two reasons:
   *   1. Iterating the keys using for (var key in this.map_) allocates an
   *      object for every key in IE which is really bad for IE6 GC perf.
   *   2. Without a side data structure, we would need to escape all the keys
   *      as that would be the only way we could tell during iteration if the
   *      key was an internal key or a property of the object.
   *
   * This array can contain deleted keys so it's necessary to check the map
   * as well to see if the key is still in the map (this doesn't require a
   * memory allocation in IE).
   * @type {!Array.<string>}
   * @private
   */
  this.keys_ = [];

  var argLength = arguments.length;

  if (argLength > 1) {
    if (argLength % 2) {
      throw Error('Uneven number of arguments');
    }
    for (var i = 0; i < argLength; i += 2) {
      this.set(arguments[i], arguments[i + 1]);
    }
  } else if (opt_map) {
    this.addAll(/** @type {Object} */ (opt_map));
  }
};


/**
 * The number of key value pairs in the map.
 * @private
 * @type {number}
 */
goog.structs.Map.prototype.count_ = 0;


/**
 * Version used to detect changes while iterating.
 * @private
 * @type {number}
 */
goog.structs.Map.prototype.version_ = 0;


/**
 * @return {number} The number of key-value pairs in the map.
 */
goog.structs.Map.prototype.getCount = function() {
  return this.count_;
};


/**
 * Returns the values of the map.
 * @return {!Array} The values in the map.
 */
goog.structs.Map.prototype.getValues = function() {
  this.cleanupKeysArray_();

  var rv = [];
  for (var i = 0; i < this.keys_.length; i++) {
    var key = this.keys_[i];
    rv.push(this.map_[key]);
  }
  return rv;
};


/**
 * Returns the keys of the map.
 * @return {!Array.<string>} Array of string values.
 */
goog.structs.Map.prototype.getKeys = function() {
  this.cleanupKeysArray_();
  return /** @type {!Array.<string>} */ (this.keys_.concat());
};


/**
 * Whether the map contains the given key.
 * @param {*} key The key to check for.
 * @return {boolean} Whether the map contains the key.
 */
goog.structs.Map.prototype.containsKey = function(key) {
  return goog.structs.Map.hasKey_(this.map_, key);
};


/**
 * Whether the map contains the given value. This is O(n).
 * @param {*} val The value to check for.
 * @return {boolean} Whether the map contains the value.
 */
goog.structs.Map.prototype.containsValue = function(val) {
  for (var i = 0; i < this.keys_.length; i++) {
    var key = this.keys_[i];
    if (goog.structs.Map.hasKey_(this.map_, key) && this.map_[key] == val) {
      return true;
    }
  }
  return false;
};


/**
 * Whether this map is equal to the argument map.
 * @param {goog.structs.Map} otherMap The map against which to test equality.
 * @param {function(*, *) : boolean=} opt_equalityFn Optional equality function
 *     to test equality of values. If not specified, this will test whether
 *     the values contained in each map are identical objects.
 * @return {boolean} Whether the maps are equal.
 */
goog.structs.Map.prototype.equals = function(otherMap, opt_equalityFn) {
  if (this === otherMap) {
    return true;
  }

  if (this.count_ != otherMap.getCount()) {
    return false;
  }

  var equalityFn = opt_equalityFn || goog.structs.Map.defaultEquals;

  this.cleanupKeysArray_();
  for (var key, i = 0; key = this.keys_[i]; i++) {
    if (!equalityFn(this.get(key), otherMap.get(key))) {
      return false;
    }
  }

  return true;
};


/**
 * Default equality test for values.
 * @param {*} a The first value.
 * @param {*} b The second value.
 * @return {boolean} Whether a and b reference the same object.
 */
goog.structs.Map.defaultEquals = function(a, b) {
  return a === b;
};


/**
 * @return {boolean} Whether the map is empty.
 */
goog.structs.Map.prototype.isEmpty = function() {
  return this.count_ == 0;
};


/**
 * Removes all key-value pairs from the map.
 */
goog.structs.Map.prototype.clear = function() {
  this.map_ = {};
  this.keys_.length = 0;
  this.count_ = 0;
  this.version_ = 0;
};


/**
 * Removes a key-value pair based on the key. This is O(logN) amortized due to
 * updating the keys array whenever the count becomes half the size of the keys
 * in the keys array.
 * @param {*} key  The key to remove.
 * @return {boolean} Whether object was removed.
 */
goog.structs.Map.prototype.remove = function(key) {
  if (goog.structs.Map.hasKey_(this.map_, key)) {
    delete this.map_[key];
    this.count_--;
    this.version_++;

    // clean up the keys array if the threshhold is hit
    if (this.keys_.length > 2 * this.count_) {
      this.cleanupKeysArray_();
    }

    return true;
  }
  return false;
};


/**
 * Cleans up the temp keys array by removing entries that are no longer in the
 * map.
 * @private
 */
goog.structs.Map.prototype.cleanupKeysArray_ = function() {
  if (this.count_ != this.keys_.length) {
    // First remove keys that are no longer in the map.
    var srcIndex = 0;
    var destIndex = 0;
    while (srcIndex < this.keys_.length) {
      var key = this.keys_[srcIndex];
      if (goog.structs.Map.hasKey_(this.map_, key)) {
        this.keys_[destIndex++] = key;
      }
      srcIndex++;
    }
    this.keys_.length = destIndex;
  }

  if (this.count_ != this.keys_.length) {
    // If the count still isn't correct, that means we have duplicates. This can
    // happen when the same key is added and removed multiple times. Now we have
    // to allocate one extra Object to remove the duplicates. This could have
    // been done in the first pass, but in the common case, we can avoid
    // allocating an extra object by only doing this when necessary.
    var seen = {};
    var srcIndex = 0;
    var destIndex = 0;
    while (srcIndex < this.keys_.length) {
      var key = this.keys_[srcIndex];
      if (!(goog.structs.Map.hasKey_(seen, key))) {
        this.keys_[destIndex++] = key;
        seen[key] = 1;
      }
      srcIndex++;
    }
    this.keys_.length = destIndex;
  }
};


/**
 * Returns the value for the given key.  If the key is not found and the default
 * value is not given this will return {@code undefined}.
 * @param {*} key The key to get the value for.
 * @param {*=} opt_val The value to return if no item is found for the given
 *     key, defaults to undefined.
 * @return {*} The value for the given key.
 */
goog.structs.Map.prototype.get = function(key, opt_val) {
  if (goog.structs.Map.hasKey_(this.map_, key)) {
    return this.map_[key];
  }
  return opt_val;
};


/**
 * Adds a key-value pair to the map.
 * @param {*} key The key.
 * @param {*} value The value to add.
 */
goog.structs.Map.prototype.set = function(key, value) {
  if (!(goog.structs.Map.hasKey_(this.map_, key))) {
    this.count_++;
    this.keys_.push(key);
    // Only change the version if we add a new key.
    this.version_++;
  }
  this.map_[key] = value;
};


/**
 * Adds multiple key-value pairs from another goog.structs.Map or Object.
 * @param {Object} map  Object containing the data to add.
 */
goog.structs.Map.prototype.addAll = function(map) {
  var keys, values;
  if (map instanceof goog.structs.Map) {
    keys = map.getKeys();
    values = map.getValues();
  } else {
    keys = goog.object.getKeys(map);
    values = goog.object.getValues(map);
  }
  // we could use goog.array.forEach here but I don't want to introduce that
  // dependency just for this.
  for (var i = 0; i < keys.length; i++) {
    this.set(keys[i], values[i]);
  }
};


/**
 * Clones a map and returns a new map.
 * @return {!goog.structs.Map} A new map with the same key-value pairs.
 */
goog.structs.Map.prototype.clone = function() {
  return new goog.structs.Map(this);
};


/**
 * Returns a new map in which all the keys and values are interchanged
 * (keys become values and values become keys). If multiple keys map to the
 * same value, the chosen transposed value is implementation-dependent.
 *
 * It acts very similarly to {goog.object.transpose(Object)}.
 *
 * @return {!goog.structs.Map} The transposed map.
 */
goog.structs.Map.prototype.transpose = function() {
  var transposed = new goog.structs.Map();
  for (var i = 0; i < this.keys_.length; i++) {
    var key = this.keys_[i];
    var value = this.map_[key];
    transposed.set(value, key);
  }

  return transposed;
};


/**
 * @return {!Object} Object representation of the map.
 */
goog.structs.Map.prototype.toObject = function() {
  this.cleanupKeysArray_();
  var obj = {};
  for (var i = 0; i < this.keys_.length; i++) {
    var key = this.keys_[i];
    obj[key] = this.map_[key];
  }
  return obj;
};


/**
 * Returns an iterator that iterates over the keys in the map.  Removal of keys
 * while iterating might have undesired side effects.
 * @return {!goog.iter.Iterator} An iterator over the keys in the map.
 */
goog.structs.Map.prototype.getKeyIterator = function() {
  return this.__iterator__(true);
};


/**
 * Returns an iterator that iterates over the values in the map.  Removal of
 * keys while iterating might have undesired side effects.
 * @return {!goog.iter.Iterator} An iterator over the values in the map.
 */
goog.structs.Map.prototype.getValueIterator = function() {
  return this.__iterator__(false);
};


/**
 * Returns an iterator that iterates over the values or the keys in the map.
 * This throws an exception if the map was mutated since the iterator was
 * created.
 * @param {boolean=} opt_keys True to iterate over the keys. False to iterate
 *     over the values.  The default value is false.
 * @return {!goog.iter.Iterator} An iterator over the values or keys in the map.
 */
goog.structs.Map.prototype.__iterator__ = function(opt_keys) {
  // Clean up keys to minimize the risk of iterating over dead keys.
  this.cleanupKeysArray_();

  var i = 0;
  var keys = this.keys_;
  var map = this.map_;
  var version = this.version_;
  var selfObj = this;

  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    while (true) {
      if (version != selfObj.version_) {
        throw Error('The map has changed since the iterator was created');
      }
      if (i >= keys.length) {
        throw goog.iter.StopIteration;
      }
      var key = keys[i++];
      return opt_keys ? key : map[key];
    }
  };
  return newIter;
};


/**
 * Safe way to test for hasOwnProperty.  It even allows testing for
 * 'hasOwnProperty'.
 * @param {Object} obj The object to test for presence of the given key.
 * @param {*} key The key to check for.
 * @return {boolean} Whether the object has the key.
 * @private
 */
goog.structs.Map.hasKey_ = function(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
};
// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Class for parsing and formatting URIs.
 *
 * Use goog.Uri(string) to parse a URI string.  Use goog.Uri.create(...) to
 * create a new instance of the goog.Uri object from Uri parts.
 *
 * e.g: <code>var myUri = new goog.Uri(window.location);</code>
 *
 * Implements RFC 3986 for parsing/formatting URIs.
 * http://gbiv.com/protocols/uri/rfc/rfc3986.html
 *
 * Some changes have been made to the interface (more like .NETs), though the
 * internal representation is now of un-encoded parts, this will change the
 * behavior slightly.
 *
 */

goog.provide('goog.Uri');
goog.provide('goog.Uri.QueryData');

goog.require('goog.array');
goog.require('goog.string');
goog.require('goog.structs');
goog.require('goog.structs.Map');
goog.require('goog.uri.utils');
goog.require('goog.uri.utils.ComponentIndex');



/**
 * This class contains setters and getters for the parts of the URI.
 * The <code>getXyz</code>/<code>setXyz</code> methods return the decoded part
 * -- so<code>goog.Uri.parse('/foo%20bar').getPath()</code> will return the
 * decoded path, <code>/foo bar</code>.
 *
 * The constructor accepts an optional unparsed, raw URI string.  The parser
 * is relaxed, so special characters that aren't escaped but don't cause
 * ambiguities will not cause parse failures.
 *
 * All setters return <code>this</code> and so may be chained, a la
 * <code>goog.Uri.parse('/foo').setFragment('part').toString()</code>.
 *
 * @param {*=} opt_uri Optional string URI to parse
 *        (use goog.Uri.create() to create a URI from parts), or if
 *        a goog.Uri is passed, a clone is created.
 * @param {boolean=} opt_ignoreCase If true, #getParameterValue will ignore
 * the case of the parameter name.
 *
 * @constructor
 */
goog.Uri = function(opt_uri, opt_ignoreCase) {
  // Parse in the uri string
  var m;
  if (opt_uri instanceof goog.Uri) {
    this.setIgnoreCase(opt_ignoreCase == null ?
        opt_uri.getIgnoreCase() : opt_ignoreCase);
    this.setScheme(opt_uri.getScheme());
    this.setUserInfo(opt_uri.getUserInfo());
    this.setDomain(opt_uri.getDomain());
    this.setPort(opt_uri.getPort());
    this.setPath(opt_uri.getPath());
    this.setQueryData(opt_uri.getQueryData().clone());
    this.setFragment(opt_uri.getFragment());
  } else if (opt_uri && (m = goog.uri.utils.split(String(opt_uri)))) {
    // Set the parts -- decoding as we do so.
    this.setIgnoreCase(!!opt_ignoreCase);
    // COMPATABILITY NOTE - In IE, unmatched fields may be empty strings,
    // whereas in other browsers they will be undefined.
    this.setScheme(m[goog.uri.utils.ComponentIndex.SCHEME] || '', true);
    this.setUserInfo(m[goog.uri.utils.ComponentIndex.USER_INFO] || '', true);
    this.setDomain(m[goog.uri.utils.ComponentIndex.DOMAIN] || '', true);
    this.setPort(m[goog.uri.utils.ComponentIndex.PORT]);
    this.setPath(m[goog.uri.utils.ComponentIndex.PATH] || '', true);

    this.setQuery(m[goog.uri.utils.ComponentIndex.QUERY_DATA] || '', true);

    this.setFragment(m[goog.uri.utils.ComponentIndex.FRAGMENT] || '', true);

  } else {
    this.setIgnoreCase(!!opt_ignoreCase);
    this.queryData_ = new goog.Uri.QueryData(null, this, this.ignoreCase_);
  }
};


/**
 * Parameter name added to stop caching.
 * @type {string}
 */
goog.Uri.RANDOM_PARAM = goog.uri.utils.StandardQueryParam.RANDOM;


/**
 * Scheme such as "http".
 * @type {string}
 * @private
 */
goog.Uri.prototype.scheme_ = '';


/**
 * User credentials in the form "username:password".
 * @type {string}
 * @private
 */
goog.Uri.prototype.userInfo_ = '';


/**
 * Domain part, e.g. "www.google.com".
 * @type {string}
 * @private
 */
goog.Uri.prototype.domain_ = '';


/**
 * Port, e.g. 8080.
 * @type {?number}
 * @private
 */
goog.Uri.prototype.port_ = null;


/**
 * Path, e.g. "/tests/img.png".
 * @type {string}
 * @private
 */
goog.Uri.prototype.path_ = '';


/**
 * Object representing query data.
 * @type {!goog.Uri.QueryData}
 * @private
 */
goog.Uri.prototype.queryData_;


/**
 * The fragment without the #.
 * @type {string}
 * @private
 */
goog.Uri.prototype.fragment_ = '';


/**
 * Whether or not this Uri should be treated as Read Only.
 * @type {boolean}
 * @private
 */
goog.Uri.prototype.isReadOnly_ = false;


/**
 * Whether or not to ignore case when comparing query params.
 * @type {boolean}
 * @private
 */
goog.Uri.prototype.ignoreCase_ = false;


/**
 * @return {string} The string form of the url.
 */
goog.Uri.prototype.toString = function() {
  if (this.cachedToString_) {
    return this.cachedToString_;
  }

  var out = [];

  if (this.scheme_) {
    out.push(goog.Uri.encodeSpecialChars_(
        this.scheme_, goog.Uri.reDisallowedInSchemeOrUserInfo_), ':');
  }

  if (this.domain_) {
    out.push('//');

    if (this.userInfo_) {
      out.push(goog.Uri.encodeSpecialChars_(
          this.userInfo_, goog.Uri.reDisallowedInSchemeOrUserInfo_), '@');
    }

    out.push(goog.Uri.encodeString_(this.domain_));

    if (this.port_ != null) {
      out.push(':', String(this.getPort()));
    }
  }

  if (this.path_) {
    if (this.hasDomain() && this.path_.charAt(0) != '/') {
      out.push('/');
    }
    out.push(goog.Uri.encodeSpecialChars_(
        this.path_,
        this.path_.charAt(0) == '/' ?
            goog.Uri.reDisallowedInAbsolutePath_ :
            goog.Uri.reDisallowedInRelativePath_));
  }

  var query = String(this.queryData_);
  if (query) {
    out.push('?', query);
  }

  if (this.fragment_) {
    out.push('#', goog.Uri.encodeSpecialChars_(
        this.fragment_, goog.Uri.reDisallowedInFragment_));
  }
  return this.cachedToString_ = out.join('');
};


/**
 * Resolves a relative url string to a this base uri.
 *
 * There are several kinds of relative urls:<br>
 * 1. foo - replaces the last part of the path, the whole query and fragment<br>
 * 2. /foo - replaces the the path, the query and fragment<br>
 * 3. //foo - replaces everything from the domain on.  foo is a domain name<br>
 * 4. ?foo - replace the query and fragment<br>
 * 5. #foo - replace the fragment only
 *
 * Additionally, if relative url has a non-empty path, all ".." and "."
 * segments will be resolved, as described in RFC 3986.
 *
 * @param {goog.Uri} relativeUri The relative url to resolve.
 * @return {!goog.Uri} The resolved URI.
 */
goog.Uri.prototype.resolve = function(relativeUri) {

  var absoluteUri = this.clone();

  // we satisfy these conditions by looking for the first part of relativeUri
  // that is not blank and applying defaults to the rest

  var overridden = relativeUri.hasScheme();

  if (overridden) {
    absoluteUri.setScheme(relativeUri.getScheme());
  } else {
    overridden = relativeUri.hasUserInfo();
  }

  if (overridden) {
    absoluteUri.setUserInfo(relativeUri.getUserInfo());
  } else {
    overridden = relativeUri.hasDomain();
  }

  if (overridden) {
    absoluteUri.setDomain(relativeUri.getDomain());
  } else {
    overridden = relativeUri.hasPort();
  }

  var path = relativeUri.getPath();
  if (overridden) {
    absoluteUri.setPort(relativeUri.getPort());
  } else {
    overridden = relativeUri.hasPath();
    if (overridden) {
      // resolve path properly
      if (path.charAt(0) != '/') {
        // path is relative
        if (this.hasDomain() && !this.hasPath()) {
          // RFC 3986, section 5.2.3, case 1
          path = '/' + path;
        } else {
          // RFC 3986, section 5.2.3, case 2
          var lastSlashIndex = absoluteUri.getPath().lastIndexOf('/');
          if (lastSlashIndex != -1) {
            path = absoluteUri.getPath().substr(0, lastSlashIndex + 1) + path;
          }
        }
      }
      path = goog.Uri.removeDotSegments(path);
    }
  }

  if (overridden) {
    absoluteUri.setPath(path);
  } else {
    overridden = relativeUri.hasQuery();
  }

  if (overridden) {
    absoluteUri.setQuery(relativeUri.getDecodedQuery());
  } else {
    overridden = relativeUri.hasFragment();
  }

  if (overridden) {
    absoluteUri.setFragment(relativeUri.getFragment());
  }

  return absoluteUri;
};


/**
 * Clones the URI instance.
 * @return {!goog.Uri} New instance of the URI objcet.
 */
goog.Uri.prototype.clone = function() {
  return goog.Uri.create(this.scheme_, this.userInfo_, this.domain_,
                         this.port_, this.path_, this.queryData_.clone(),
                         this.fragment_, this.ignoreCase_);
};


/**
 * @return {string} The encoded scheme/protocol for the URI.
 */
goog.Uri.prototype.getScheme = function() {
  return this.scheme_;
};


/**
 * Sets the scheme/protocol.
 * @param {string} newScheme New scheme value.
 * @param {boolean=} opt_decode Optional param for whether to decode new value.
 * @return {!goog.Uri} Reference to this URI object.
 */
goog.Uri.prototype.setScheme = function(newScheme, opt_decode) {
  this.enforceReadOnly();
  delete this.cachedToString_;
  this.scheme_ = opt_decode ? goog.Uri.decodeOrEmpty_(newScheme) : newScheme;

  // remove an : at the end of the scheme so somebody can pass in
  // window.location.protocol
  if (this.scheme_) {
    this.scheme_ = this.scheme_.replace(/:$/, '');
  }
  return this;
};


/**
 * @return {boolean} Whether the scheme has been set.
 */
goog.Uri.prototype.hasScheme = function() {
  return !!this.scheme_;
};


/**
 * @return {string} The decoded user info.
 */
goog.Uri.prototype.getUserInfo = function() {
  return this.userInfo_;
};


/**
 * Sets the userInfo.
 * @param {string} newUserInfo New userInfo value.
 * @param {boolean=} opt_decode Optional param for whether to decode new value.
 * @return {!goog.Uri} Reference to this URI object.
 */
goog.Uri.prototype.setUserInfo = function(newUserInfo, opt_decode) {
  this.enforceReadOnly();
  delete this.cachedToString_;
  this.userInfo_ = opt_decode ? goog.Uri.decodeOrEmpty_(newUserInfo) :
                   newUserInfo;
  return this;
};


/**
 * @return {boolean} Whether the user info has been set.
 */
goog.Uri.prototype.hasUserInfo = function() {
  return !!this.userInfo_;
};


/**
 * @return {string} The decoded domain.
 */
goog.Uri.prototype.getDomain = function() {
  return this.domain_;
};


/**
 * Sets the domain.
 * @param {string} newDomain New domain value.
 * @param {boolean=} opt_decode Optional param for whether to decode new value.
 * @return {!goog.Uri} Reference to this URI object.
 */
goog.Uri.prototype.setDomain = function(newDomain, opt_decode) {
  this.enforceReadOnly();
  delete this.cachedToString_;
  this.domain_ = opt_decode ? goog.Uri.decodeOrEmpty_(newDomain) : newDomain;
  return this;
};


/**
 * @return {boolean} Whether the domain has been set.
 */
goog.Uri.prototype.hasDomain = function() {
  return !!this.domain_;
};


/**
 * @return {?number} The port number.
 */
goog.Uri.prototype.getPort = function() {
  return this.port_;
};


/**
 * Sets the port number.
 * @param {*} newPort Port number. Will be explicitly casted to a number.
 * @return {!goog.Uri} Reference to this URI object.
 */
goog.Uri.prototype.setPort = function(newPort) {
  this.enforceReadOnly();
  delete this.cachedToString_;

  if (newPort) {
    newPort = Number(newPort);
    if (isNaN(newPort) || newPort < 0) {
      throw Error('Bad port number ' + newPort);
    }
    this.port_ = newPort;
  } else {
    this.port_ = null;
  }

  return this;
};


/**
 * @return {boolean} Whether the port has been set.
 */
goog.Uri.prototype.hasPort = function() {
  return this.port_ != null;
};


/**
  * @return {string} The decoded path.
 */
goog.Uri.prototype.getPath = function() {
  return this.path_;
};


/**
 * Sets the path.
 * @param {string} newPath New path value.
 * @param {boolean=} opt_decode Optional param for whether to decode new value.
 * @return {!goog.Uri} Reference to this URI object.
 */
goog.Uri.prototype.setPath = function(newPath, opt_decode) {
  this.enforceReadOnly();
  delete this.cachedToString_;
  this.path_ = opt_decode ? goog.Uri.decodeOrEmpty_(newPath) : newPath;
  return this;
};


/**
 * @return {boolean} Whether the path has been set.
 */
goog.Uri.prototype.hasPath = function() {
  return !!this.path_;
};


/**
 * @return {boolean} Whether the query string has been set.
 */
goog.Uri.prototype.hasQuery = function() {
  return this.queryData_.toString() !== '';
};


/**
 * Sets the query data.
 * @param {goog.Uri.QueryData|string|undefined} queryData QueryData object.
 * @param {boolean=} opt_decode Optional param for whether to decode new value.
 *     Applies only if queryData is a string.
 * @return {!goog.Uri} Reference to this URI object.
 */
goog.Uri.prototype.setQueryData = function(queryData, opt_decode) {
  this.enforceReadOnly();
  delete this.cachedToString_;

  if (queryData instanceof goog.Uri.QueryData) {
    this.queryData_ = queryData;
    this.queryData_.uri_ = this;
    this.queryData_.setIgnoreCase(this.ignoreCase_);
  } else {
    // QueryData accepts encoded query string,
    // so encode it if opt_decode flag is not true.
    if (!opt_decode) {
      queryData = goog.Uri.encodeSpecialChars_(queryData,
                                               goog.Uri.reDisallowedInQuery_);
    }
    this.queryData_ =
        new goog.Uri.QueryData(queryData, this, this.ignoreCase_);
  }

  return this;
};


/**
 * Sets the URI query.
 * @param {string} newQuery New query value.
 * @param {boolean=} opt_decode Optional param for whether to decode new value.
 * @return {!goog.Uri} Reference to this URI object.
 */
goog.Uri.prototype.setQuery = function(newQuery, opt_decode) {
  return this.setQueryData(newQuery, opt_decode);
};


/**
 * @return {string} The encoded URI query, not including the ?.
 */
goog.Uri.prototype.getEncodedQuery = function() {
  return this.queryData_.toString();
};


/**
 * @return {string} The decoded URI query, not including the ?.
 */
goog.Uri.prototype.getDecodedQuery = function() {
  return this.queryData_.toDecodedString();
};


/**
 * Returns the query data.
 * @return {goog.Uri.QueryData} QueryData object.
 */
goog.Uri.prototype.getQueryData = function() {
  return this.queryData_;
};


/**
 * @return {string} The encoded URI query, not including the ?.
 *
 * Warning: This method, unlike other getter methods, returns encoded
 * value, instead of decoded one.
 */
goog.Uri.prototype.getQuery = function() {
  return this.getEncodedQuery();
};


/**
 * Sets the value of the named query parameters, clearing previous values for
 * that key.
 *
 * @param {string} key The parameter to set.
 * @param {*} value The new value.
 * @return {!goog.Uri} Reference to this URI object.
 */
goog.Uri.prototype.setParameterValue = function(key, value) {
  this.enforceReadOnly();
  delete this.cachedToString_;

  this.queryData_.set(key, value);
  return this;
};


/**
 * Sets the values of the named query parameters, clearing previous values for
 * that key.  Not new values will currently be moved to the end of the query
 * string.
 *
 * So, <code>goog.Uri.parse('foo?a=b&c=d&e=f').setParameterValues('c', ['new'])
 * </code> yields <tt>foo?a=b&e=f&c=new</tt>.</p>
 *
 * @param {string} key The parameter to set.
 * @param {*} values The new values. If values is a single
 *     string then it will be treated as the sole value.
 * @return {!goog.Uri} Reference to this URI object.
 */
goog.Uri.prototype.setParameterValues = function(key, values) {
  this.enforceReadOnly();
  delete this.cachedToString_;

  if (!goog.isArray(values)) {
    values = [String(values)];
  }

  // TODO(nicksantos): This cast shouldn't be necessary.
  this.queryData_.setValues(key, /** @type {Array} */ (values));

  return this;
};


/**
 * Returns the value<b>s</b> for a given cgi parameter as a list of decoded
 * query parameter values.
 * @param {string} name The parameter to get values for.
 * @return {Array} The values for a given cgi parameter as a list of
 *     decoded query parameter values.
 */
goog.Uri.prototype.getParameterValues = function(name) {
  return this.queryData_.getValues(name);
};


/**
 * Returns the first value for a given cgi parameter or undefined if the given
 * parameter name does not appear in the query string.
 * @param {string} paramName Unescaped parameter name.
 * @return {*} The first value for a given cgi parameter or
 *     undefined if the given parameter name does not appear in the query
 *     string.
 */
goog.Uri.prototype.getParameterValue = function(paramName) {
  return this.queryData_.get(paramName);
};


/**
 * @return {string} The URI fragment, not including the #.
 */
goog.Uri.prototype.getFragment = function() {
  return this.fragment_;
};


/**
 * Sets the URI fragment.
 * @param {string} newFragment New fragment value.
 * @param {boolean=} opt_decode Optional param for whether to decode new value.
 * @return {!goog.Uri} Reference to this URI object.
 */
goog.Uri.prototype.setFragment = function(newFragment, opt_decode) {
  this.enforceReadOnly();
  delete this.cachedToString_;
  this.fragment_ = opt_decode ? goog.Uri.decodeOrEmpty_(newFragment) :
                   newFragment;
  return this;
};


/**
 * @return {boolean} Whether the URI has a fragment set.
 */
goog.Uri.prototype.hasFragment = function() {
  return !!this.fragment_;
};


/**
 * Returns true if this has the same domain as that of uri2.
 * @param {goog.Uri} uri2 The URI object to compare to.
 * @return {boolean} true if same domain; false otherwise.
 */
goog.Uri.prototype.hasSameDomainAs = function(uri2) {
  return ((!this.hasDomain() && !uri2.hasDomain()) ||
          this.getDomain() == uri2.getDomain()) &&
      ((!this.hasPort() && !uri2.hasPort()) ||
          this.getPort() == uri2.getPort());
};


/**
 * Adds a random parameter to the Uri.
 * @return {!goog.Uri} Reference to this Uri object.
 */
goog.Uri.prototype.makeUnique = function() {
  this.enforceReadOnly();
  this.setParameterValue(goog.Uri.RANDOM_PARAM, goog.string.getRandomString());

  return this;
};


/**
 * Removes the named query parameter.
 *
 * @param {string} key The parameter to remove.
 * @return {!goog.Uri} Reference to this URI object.
 */
goog.Uri.prototype.removeParameter = function(key) {
  this.enforceReadOnly();
  this.queryData_.remove(key);
  return this;
};


/**
 * Sets whether Uri is read only. If this goog.Uri is read-only,
 * enforceReadOnly_ will be called at the start of any function that may modify
 * this Uri.
 * @param {boolean} isReadOnly whether this goog.Uri should be read only.
 * @return {!goog.Uri} Reference to this Uri object.
 */
goog.Uri.prototype.setReadOnly = function(isReadOnly) {
  this.isReadOnly_ = isReadOnly;
  return this;
};


/**
 * @return {boolean} Whether the URI is read only.
 */
goog.Uri.prototype.isReadOnly = function() {
  return this.isReadOnly_;
};


/**
 * Checks if this Uri has been marked as read only, and if so, throws an error.
 * This should be called whenever any modifying function is called.
 */
goog.Uri.prototype.enforceReadOnly = function() {
  if (this.isReadOnly_) {
    throw Error('Tried to modify a read-only Uri');
  }
};


/**
 * Sets whether to ignore case.
 * NOTE: If there are already key/value pairs in the QueryData, and
 * ignoreCase_ is set to false, the keys will all be lower-cased.
 * @param {boolean} ignoreCase whether this goog.Uri should ignore case.
 * @return {!goog.Uri} Reference to this Uri object.
 */
goog.Uri.prototype.setIgnoreCase = function(ignoreCase) {
  this.ignoreCase_ = ignoreCase;
  if (this.queryData_) {
    this.queryData_.setIgnoreCase(ignoreCase);
  }
  return this;
};


/**
 * @return {boolean} Whether to ignore case.
 */
goog.Uri.prototype.getIgnoreCase = function() {
  return this.ignoreCase_;
};


//==============================================================================
// Static members
//==============================================================================


/**
 * Creates a uri from the string form.  Basically an alias of new goog.Uri().
 * If a Uri object is passed to parse then it will return a clone of the object.
 *
 * @param {*} uri Raw URI string or instance of Uri
 *     object.
 * @param {boolean=} opt_ignoreCase Whether to ignore the case of parameter
 * names in #getParameterValue.
 * @return {!goog.Uri} The new URI object.
 */
goog.Uri.parse = function(uri, opt_ignoreCase) {
  return uri instanceof goog.Uri ?
         uri.clone() : new goog.Uri(uri, opt_ignoreCase);
};


/**
 * Creates a new goog.Uri object from unencoded parts.
 *
 * @param {?string=} opt_scheme Scheme/protocol or full URI to parse.
 * @param {?string=} opt_userInfo username:password.
 * @param {?string=} opt_domain www.google.com.
 * @param {?number=} opt_port 9830.
 * @param {?string=} opt_path /some/path/to/a/file.html.
 * @param {string|goog.Uri.QueryData=} opt_query a=1&b=2.
 * @param {?string=} opt_fragment The fragment without the #.
 * @param {boolean=} opt_ignoreCase Whether to ignore parameter name case in
 *     #getParameterValue.
 *
 * @return {!goog.Uri} The new URI object.
 */
goog.Uri.create = function(opt_scheme, opt_userInfo, opt_domain, opt_port,
                           opt_path, opt_query, opt_fragment, opt_ignoreCase) {

  var uri = new goog.Uri(null, opt_ignoreCase);

  // Only set the parts if they are defined and not empty strings.
  opt_scheme && uri.setScheme(opt_scheme);
  opt_userInfo && uri.setUserInfo(opt_userInfo);
  opt_domain && uri.setDomain(opt_domain);
  opt_port && uri.setPort(opt_port);
  opt_path && uri.setPath(opt_path);
  opt_query && uri.setQueryData(opt_query);
  opt_fragment && uri.setFragment(opt_fragment);

  return uri;
};


/**
 * Resolves a relative Uri against a base Uri, accepting both strings and
 * Uri objects.
 *
 * @param {*} base Base Uri.
 * @param {*} rel Relative Uri.
 * @return {!goog.Uri} Resolved uri.
 */
goog.Uri.resolve = function(base, rel) {
  if (!(base instanceof goog.Uri)) {
    base = goog.Uri.parse(base);
  }

  if (!(rel instanceof goog.Uri)) {
    rel = goog.Uri.parse(rel);
  }

  return base.resolve(rel);
};


/**
 * Removes dot segments in given path component, as described in
 * RFC 3986, section 5.2.4.
 *
 * @param {string} path A non-empty path component.
 * @return {string} Path component with removed dot segments.
 */
goog.Uri.removeDotSegments = function(path) {
  if (path == '..' || path == '.') {
    return '';

  } else if (!goog.string.contains(path, './') &&
             !goog.string.contains(path, '/.')) {
    // This optimization detects uris which do not contain dot-segments,
    // and as a consequence do not require any processing.
    return path;

  } else {
    var leadingSlash = goog.string.startsWith(path, '/');
    var segments = path.split('/');
    var out = [];

    for (var pos = 0; pos < segments.length; ) {
      var segment = segments[pos++];

      if (segment == '.') {
        if (leadingSlash && pos == segments.length) {
          out.push('');
        }
      } else if (segment == '..') {
        if (out.length > 1 || out.length == 1 && out[0] != '') {
          out.pop();
        }
        if (leadingSlash && pos == segments.length) {
          out.push('');
        }
      } else {
        out.push(segment);
        leadingSlash = true;
      }
    }

    return out.join('/');
  }
};


/**
 * Decodes a value or returns the empty string if it isn't defined or empty.
 * @param {string|undefined} val Value to decode.
 * @return {string} Decoded value.
 * @private
 */
goog.Uri.decodeOrEmpty_ = function(val) {
  // Don't use UrlDecode() here because val is not a query parameter.
  return val ? decodeURIComponent(val) : '';
};


/**
 * URI encode a string, or return null if it's not a string.
 * @param {*} unescapedPart Unescaped string.
 * @return {?string} Escaped string.
 * @private
 */
goog.Uri.encodeString_ = function(unescapedPart) {
  if (goog.isString(unescapedPart)) {
    return encodeURIComponent(unescapedPart);
  }
  return null;
};


/**
 * Regular expression used for determining if a string needs to be encoded.
 * @type {RegExp}
 * @private
 */
goog.Uri.encodeSpecialRegExp_ = /^[a-zA-Z0-9\-_.!~*'():\/;?]*$/;


/**
 * If unescapedPart is non null, then escapes any characters in it that aren't
 * valid characters in a url and also escapes any special characters that
 * appear in extra.
 *
 * @param {*} unescapedPart The string to encode.
 * @param {RegExp} extra A character set of characters in [\01-\177].
 * @return {?string} null iff unescapedPart == null.
 * @private
 */
goog.Uri.encodeSpecialChars_ = function(unescapedPart, extra) {
  var ret = null;
  if (goog.isString(unescapedPart)) {
    ret = unescapedPart;
    // Checking if the search matches before calling encodeURI avoids an extra
    // allocation in IE6
    if (!goog.Uri.encodeSpecialRegExp_.test(ret)) {
      ret = encodeURI(unescapedPart);
    }
    // Checking if the search matches before calling replace avoids an extra
    // allocation in IE6
    if (ret.search(extra) >= 0) {
      ret = ret.replace(extra, goog.Uri.encodeChar_);
    }
  }
  return ret;
};


/**
 * Converts a character in [\01-\177] to its unicode character equivalent.
 * @param {string} ch One character string.
 * @return {string} Encoded string.
 * @private
 */
goog.Uri.encodeChar_ = function(ch) {
  var n = ch.charCodeAt(0);
  return '%' + ((n >> 4) & 0xf).toString(16) + (n & 0xf).toString(16);
};


/**
 * Regular expression for characters that are disallowed in the scheme or
 * userInfo part of the URI.
 * @type {RegExp}
 * @private
 */
goog.Uri.reDisallowedInSchemeOrUserInfo_ = /[#\/\?@]/g;


/**
 * Regular expression for characters that are disallowed in a relative path.
 * @type {RegExp}
 * @private
 */
goog.Uri.reDisallowedInRelativePath_ = /[\#\?:]/g;


/**
 * Regular expression for characters that are disallowed in an absolute path.
 * @type {RegExp}
 * @private
 */
goog.Uri.reDisallowedInAbsolutePath_ = /[\#\?]/g;


/**
 * Regular expression for characters that are disallowed in the query.
 * @type {RegExp}
 * @private
 */
goog.Uri.reDisallowedInQuery_ = /[\#\?@]/g;


/**
 * Regular expression for characters that are disallowed in the fragment.
 * @type {RegExp}
 * @private
 */
goog.Uri.reDisallowedInFragment_ = /#/g;


/**
 * Checks whether two URIs have the same domain.
 * @param {string} uri1String First URI string.
 * @param {string} uri2String Second URI string.
 * @return {boolean} true if the two URIs have the same domain; false otherwise.
 */
goog.Uri.haveSameDomain = function(uri1String, uri2String) {
  // Differs from goog.uri.utils.haveSameDomain, since this ignores scheme.
  // TODO(gboyer): Have this just call goog.uri.util.haveSameDomain.
  var pieces1 = goog.uri.utils.split(uri1String);
  var pieces2 = goog.uri.utils.split(uri2String);
  return pieces1[goog.uri.utils.ComponentIndex.DOMAIN] ==
             pieces2[goog.uri.utils.ComponentIndex.DOMAIN] &&
         pieces1[goog.uri.utils.ComponentIndex.PORT] ==
             pieces2[goog.uri.utils.ComponentIndex.PORT];
};



/**
 * Class used to represent URI query parameters.  It is essentially a hash of
 * name-value pairs, though a name can be present more than once.
 *
 * Has the same interface as the collections in goog.structs.
 *
 * @param {?string=} opt_query Optional encoded query string to parse into
 *     the object.
 * @param {goog.Uri=} opt_uri Optional uri object that should have its cache
 *     invalidated when this object updates.
 * @param {boolean=} opt_ignoreCase If true, ignore the case of the parameter
 *     name in #get.
 * @constructor
 */
goog.Uri.QueryData = function(opt_query, opt_uri, opt_ignoreCase) {
  /**
   * Encoded query string, or null if it requires computing from the key map.
   * @type {?string}
   * @private
   */
  this.encodedQuery_ = opt_query || null;

  /**
   * Reference to a uri object which uses the query data.  This allows the
   * QueryData object to invalidate the cache.
   * @type {goog.Uri}
   * @private
   */
  this.uri_ = opt_uri || null;

  /**
   * If true, ignore the case of the parameter name in #get.
   * @type {boolean}
   * @private
   */
  this.ignoreCase_ = !!opt_ignoreCase;
};


/**
 * If the underlying key map is not yet initialized, it parses the
 * query string and fills the map with parsed data.
 * @private
 */
goog.Uri.QueryData.prototype.ensureKeyMapInitialized_ = function() {
  if (!this.keyMap_) {
    this.keyMap_ = new goog.structs.Map();
    this.count_ = 0;

    if (this.encodedQuery_) {
      var pairs = this.encodedQuery_.split('&');
      for (var i = 0; i < pairs.length; i++) {
        var indexOfEquals = pairs[i].indexOf('=');
        var name = null;
        var value = null;
        if (indexOfEquals >= 0) {
          name = pairs[i].substring(0, indexOfEquals);
          value = pairs[i].substring(indexOfEquals + 1);
        } else {
          name = pairs[i];
        }
        name = goog.string.urlDecode(name);
        name = this.getKeyName_(name);
        this.add(name, value ? goog.string.urlDecode(value) : '');
      }
    }
  }
};


/**
 * Creates a new query data instance from a map of names and values.
 *
 * @param {!goog.structs.Map|!Object} map Map of string parameter names to
 *     string parameter values.
 * @param {goog.Uri=} opt_uri URI object that should have its cache
 *     invalidated when this object updates.
 * @param {boolean=} opt_ignoreCase If true, ignore the case of the parameter
 *     name in #get.
 * @return {!goog.Uri.QueryData} The populated query data instance.
 */
goog.Uri.QueryData.createFromMap = function(map, opt_uri, opt_ignoreCase) {
  var keys = goog.structs.getKeys(map);
  if (typeof keys == 'undefined') {
    throw Error('Keys are undefined');
  }
  return goog.Uri.QueryData.createFromKeysValues(
      keys,
      goog.structs.getValues(map),
      opt_uri,
      opt_ignoreCase);
};


/**
 * Creates a new query data instance from parallel arrays of parameter names
 * and values. Allows for duplicate parameter names. Throws an error if the
 * lengths of the arrays differ.
 *
 * @param {Array.<string>} keys Parameter names.
 * @param {Array} values Parameter values.
 * @param {goog.Uri=} opt_uri URI object that should have its cache
 *     invalidated when this object updates.
 * @param {boolean=} opt_ignoreCase If true, ignore the case of the parameter
 *     name in #get.
 * @return {!goog.Uri.QueryData} The populated query data instance.
 */
goog.Uri.QueryData.createFromKeysValues = function(
    keys, values, opt_uri, opt_ignoreCase) {
  if (keys.length != values.length) {
    throw Error('Mismatched lengths for keys/values');
  }
  var queryData = new goog.Uri.QueryData(null, opt_uri, opt_ignoreCase);
  for (var i = 0; i < keys.length; i++) {
    queryData.add(keys[i], values[i]);
  }
  return queryData;
};


/**
 * The map containing name/value or name/array-of-values pairs.
 * May be null if it requires parsing from the query string.
 *
 * We need to use a Map because we cannot guarantee that the key names will
 * not be problematic for IE.
 *
 * @type {goog.structs.Map}
 * @private
 */
goog.Uri.QueryData.prototype.keyMap_ = null;


/**
 * The number of params, or null if it requires computing.
 * @type {?number}
 * @private
 */
goog.Uri.QueryData.prototype.count_ = null;


/**
 * Decoded query string, or null if it requires computing.
 * @type {?string}
 * @private
 */
goog.Uri.QueryData.decodedQuery_ = null;


/**
 * @return {?number} The number of parameters.
 */
goog.Uri.QueryData.prototype.getCount = function() {
  this.ensureKeyMapInitialized_();
  return this.count_;
};


/**
 * Adds a key value pair.
 * @param {string} key Name.
 * @param {*} value Value.
 * @return {!goog.Uri.QueryData} Instance of this object.
 */
goog.Uri.QueryData.prototype.add = function(key, value) {
  this.ensureKeyMapInitialized_();
  this.invalidateCache_();

  key = this.getKeyName_(key);
  if (!this.containsKey(key)) {
    this.keyMap_.set(key, value);
  } else {
    var current = this.keyMap_.get(key);
    if (goog.isArray(current)) {
      current.push(value);
    } else {
      this.keyMap_.set(key, [current, value]);
    }
  }

  this.count_++;

  return this;
};


/**
 * Removes all the params with the given key.
 * @param {string} key Name.
 * @return {boolean} Whether any parameter was removed.
 */
goog.Uri.QueryData.prototype.remove = function(key) {
  this.ensureKeyMapInitialized_();

  key = this.getKeyName_(key);
  if (this.keyMap_.containsKey(key)) {
    this.invalidateCache_();

    // we need to get it to know how many to decrement the count with
    var old = this.keyMap_.get(key);
    if (goog.isArray(old)) {
      this.count_ -= old.length;
    } else {
      this.count_--;
    }
    return this.keyMap_.remove(key);
  }
  return false;
};


/**
 * Clears the parameters.
 */
goog.Uri.QueryData.prototype.clear = function() {
  this.invalidateCache_();
  if (this.keyMap_) {
    this.keyMap_.clear();
  }
  this.count_ = 0;
};


/**
 * @return {boolean} Whether we have any parameters.
 */
goog.Uri.QueryData.prototype.isEmpty = function() {
  this.ensureKeyMapInitialized_();
  return this.count_ == 0;
};


/**
 * Whether there is a parameter with the given name
 * @param {string} key The parameter name to check for.
 * @return {boolean} Whether there is a parameter with the given name.
 */
goog.Uri.QueryData.prototype.containsKey = function(key) {
  this.ensureKeyMapInitialized_();
  key = this.getKeyName_(key);
  return this.keyMap_.containsKey(key);
};


/**
 * Whether there is a parameter with the given value.
 * @param {*} value The value to check for.
 * @return {boolean} Whether there is a parameter with the given value.
 */
goog.Uri.QueryData.prototype.containsValue = function(value) {
  // NOTE(arv): This solution goes through all the params even if it was the
  // first param. We can get around this by not reusing code or by switching to
  // iterators.
  var vals = this.getValues();
  return goog.array.contains(vals, value);
};


/**
 * Returns all the keys of the parameters. If a key is used multiple times
 * it will be included multiple times in the returned array
 * @return {!Array} All the keys of the parameters.
 */
goog.Uri.QueryData.prototype.getKeys = function() {
  this.ensureKeyMapInitialized_();
  // We need to get the values to know how many keys to add.
  var vals = /** @type {Array.<Array|*>} */ (this.keyMap_.getValues());
  var keys = this.keyMap_.getKeys();
  var rv = [];
  for (var i = 0; i < keys.length; i++) {
    var val = vals[i];
    if (goog.isArray(val)) {
      for (var j = 0; j < val.length; j++) {
        rv.push(keys[i]);
      }
    } else {
      rv.push(keys[i]);
    }
  }
  return rv;
};


/**
 * Returns all the values of the parameters with the given name. If the query
 * data has no such key this will return an empty array. If no key is given
 * all values wil be returned.
 * @param {string=} opt_key The name of the parameter to get the values for.
 * @return {!Array} All the values of the parameters with the given name.
 */
goog.Uri.QueryData.prototype.getValues = function(opt_key) {
  this.ensureKeyMapInitialized_();
  var rv = [];
  if (opt_key) {
    var key = this.getKeyName_(opt_key);
    if (this.containsKey(key)) {
      rv = goog.array.concat(rv, this.keyMap_.get(key));
    }
  } else {
    // Return all values.
    var values = /** @type {Array.<Array|*>} */ (this.keyMap_.getValues());
    for (var i = 0; i < values.length; i++) {
      rv = goog.array.concat(rv, values[i]);
    }
  }
  return rv;
};


/**
 * Sets a key value pair and removes all other keys with the same value.
 *
 * @param {string} key Name.
 * @param {*} value Value.
 * @return {!goog.Uri.QueryData} Instance of this object.
 */
goog.Uri.QueryData.prototype.set = function(key, value) {
  this.ensureKeyMapInitialized_();
  this.invalidateCache_();

  key = this.getKeyName_(key);
  if (this.containsKey(key)) {
    var old = this.keyMap_.get(key);
    if (goog.isArray(old)) {
      this.count_ -= old.length;
    } else {
      this.count_--;
    }
  }

  this.keyMap_.set(key, value);
  this.count_++;
  return this;
};


/**
 * Returns the first value associated with the key. If the query data has no
 * such key this will return undefined or the optional default.
 * @param {string} key The name of the parameter to get the value for.
 * @param {*=} opt_default The default value to return if the query data
 *     has no such key.
 * @return {*} The first value associated with the key.
 */
goog.Uri.QueryData.prototype.get = function(key, opt_default) {
  this.ensureKeyMapInitialized_();
  key = this.getKeyName_(key);
  if (this.containsKey(key)) {
    var val = this.keyMap_.get(key);
    if (goog.isArray(val)) {
      return val[0];
    } else {
      return val;
    }
  } else {
    return opt_default;
  }
};


/**
 * Sets the values for a key, if the key has already got values defined, this
 * will override the existing values then remove any left over
 * @param {string} key The key to set values for.
 * @param {Array} values The values to set.
 */
goog.Uri.QueryData.prototype.setValues = function(key, values) {
  this.ensureKeyMapInitialized_();
  this.invalidateCache_();

  key = this.getKeyName_(key);
  if (this.containsKey(key)) {
    var old = this.keyMap_.get(key);
    if (goog.isArray(old)) {
      this.count_ -= old.length;
    } else {
      this.count_--;
    }
  }

  if (values.length > 0) {
    this.keyMap_.set(key, values);
    this.count_ += values.length;
  }
};


/**
 * @return {string} Encoded query string.
 */
goog.Uri.QueryData.prototype.toString = function() {
  if (this.encodedQuery_) {
    return this.encodedQuery_;
  }

  if (!this.keyMap_) {
    return '';
  }

  var sb = [];

  // this used to use this.getKeys and this.getVals but that generates a lot
  // allocations than just iterating over the keys
  var count = 0;
  var keys = this.keyMap_.getKeys();
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var encodedKey = goog.string.urlEncode(key);
    var val = this.keyMap_.get(key);
    if (goog.isArray(val)) {
      for (var j = 0; j < val.length; j++) {
        if (count > 0) {
          sb.push('&');
        }
        sb.push(encodedKey);
        // Check for empty string, null and undefined get encoded
        // into the url as literal strings
        if (val[j] !== '') {
          sb.push('=', goog.string.urlEncode(val[j]));
        }
        count++;
      }
    } else {
      if (count > 0) {
        sb.push('&');
      }
      sb.push(encodedKey);
      // Check for empty string, null and undefined get encoded
      // into the url as literal strings
      if (val !== '') {
        sb.push('=', goog.string.urlEncode(val));
      }
      count++;
    }
  }

  return this.encodedQuery_ = sb.join('');
};


/**
 * @return {string} Decoded query string.
 */
goog.Uri.QueryData.prototype.toDecodedString = function() {
  if (!this.decodedQuery_) {
    this.decodedQuery_ = goog.Uri.decodeOrEmpty_(this.toString());
  }

  return this.decodedQuery_;
};


/**
 * Invalidate the cache.
 * @private
 */
goog.Uri.QueryData.prototype.invalidateCache_ = function() {
  delete this.decodedQuery_;
  delete this.encodedQuery_;
  if (this.uri_) {
    delete this.uri_.cachedToString_;
  }
};


/**
 * Removes all keys that are not in the provided list. (Modifies this object.)
 * @param {Array.<string>} keys The desired keys.
 * @return {!goog.Uri.QueryData} a reference to this object.
 */
goog.Uri.QueryData.prototype.filterKeys = function(keys) {
  this.ensureKeyMapInitialized_();
  goog.structs.forEach(this.keyMap_,
      /** @this {goog.Uri.QueryData} */
      function(value, key, map) {
        if (!goog.array.contains(keys, key)) {
          this.remove(key);
        }
      }, this);
  return this;
};


/**
 * Clone the query data instance.
 * @return {!goog.Uri.QueryData} New instance of the QueryData object.
 */
goog.Uri.QueryData.prototype.clone = function() {
  var rv = new goog.Uri.QueryData();
  if (this.decodedQuery_) {
    rv.decodedQuery_ = this.decodedQuery_;
  }
  if (this.encodedQuery_) {
    rv.encodedQuery_ = this.encodedQuery_;
  }
  if (this.keyMap_) {
    rv.keyMap_ = this.keyMap_.clone();
  }
  return rv;
};


/**
 * Helper function to get the key name from a JavaScript object. Converts
 * the object to a string, and to lower case if necessary.
 * @private
 * @param {*} arg The object to get a key name from.
 * @return {string} valid key name which can be looked up in #keyMap_.
 */
goog.Uri.QueryData.prototype.getKeyName_ = function(arg) {
  var keyName = String(arg);
  if (this.ignoreCase_) {
    keyName = keyName.toLowerCase();
  }
  return keyName;
};


/**
 * Ignore case in parameter names.
 * NOTE: If there are already key/value pairs in the QueryData, and
 * ignoreCase_ is set to false, the keys will all be lower-cased.
 * @param {boolean} ignoreCase whether this goog.Uri should ignore case.
 */
goog.Uri.QueryData.prototype.setIgnoreCase = function(ignoreCase) {
  var resetKeys = ignoreCase && !this.ignoreCase_;
  if (resetKeys) {
    this.ensureKeyMapInitialized_();
    this.invalidateCache_();
    goog.structs.forEach(this.keyMap_,
        /** @this {goog.Uri.QueryData} */
        function(value, key) {
          var lowerCase = key.toLowerCase();
          if (key != lowerCase) {
            this.remove(key);
            this.add(lowerCase, value);
          }
        }, this);
  }
  this.ignoreCase_ = ignoreCase;
};


/**
 * Extends a query data object with another query data or map like object. This
 * operates 'in-place', it does not create a new QueryData object.
 *
 * @param {...(goog.Uri.QueryData|goog.structs.Map|Object)} var_args The object
 *     from which key value pairs will be copied.
 */
goog.Uri.QueryData.prototype.extend = function(var_args) {
  for (var i = 0; i < arguments.length; i++) {
    var data = arguments[i];
    goog.structs.forEach(data,
        /** @this {goog.Uri.QueryData} */
        function(value, key) {
          this.add(key, value);
        }, this);
  }
};
/**
 * Copyright 2000-2011 Athanasios Polychronakis. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * 
 * @author Athanasios Polychronakis <thanpolas@gmail.com>
 * createdate 28/Oct/2010
 *
 *********
 *  File:: web2.0/facebook/facebook.local.js
 *  Facebook interaction from out JS Client to our local server
 *********
 */



goog.provide('core.fb.local');
goog.require('core.STATIC');

/**
 * Triggers when we have a facebook auth event
 *
 * If we are not authed we will request the server
 * to authenticate us with these credentials
 *
 * @param {Function(boolean)} listener callback function
 * @return {void}
 */
core.fb.local.checkFacebookAuth = function (listener)
{
    try {

    var w = core;
    var log = w.log('core.fb.local.checkFacebookAuth');

    log.info('Init. Authed:' + w.isAuthed());

    // if authed exit
    if (w.isAuthed()) {
        listener(true);
        return;
    }


    // create request
    var url = "/users/facebook";
    var a = new w.ajax(url, {
        typeGet: 'json',
        typeSend: 'json',
        postMethod: 'POST',
        showMsg: false,
        showErrorMsg: false

    });


    // responce from server
    a.callback = function(result) {



        var user = a.getTag('user');
        var newuser = a.getTag('newuser');



        // check if user is valid user object
        if (!w.user.isUserObject(user)) {
            listener(false);
            return; // no need to continue further
        }

        // user logged in
        w.web2.extLogin(w.STATIC.SOURCES.FB, user);

        // check if newuser
        if (newuser) {
            // open welcome window
            web.user.ui.newUser();
        }

        listener(true);


    }; //callback of AJAX

    a.errorCallback = function(errorobj) {
        log.warning('Server did not authorize us! msg:' + errorobj.message + ' ::debug::' + errorobj.debugmessage);
        listener(false);
    }; // errorCallback of spot request

    //send the query
    if (!a.send()) {
        listener(false);
        return;
    }

    } catch(e) {core.error(e);}

}; // function core.fb.local.checkFacebookAuth


/**
 * Triggers when we have a facebook auth event
 *
 * If we are not authed we will request the server
 * to authenticate us with these credentials
 *
 * @param {Function(boolean)=} opt_listener callback function
 * @return {void}
 */
core.fb.local.loginSubmit = function (opt_listener)
{
    try {

    var fb = FB;
    var w = core;
    var g = goog;
    var log = w.log('core.fb.local.loginSubmit');

    log.info('Init. Authed:' + w.isAuthed());

    var listener = opt_listener || function (){};

    // if authed exit
    if (w.isAuthed()) {
        w.web2.extLogin(w.STATIC.SOURCES.FB, w.user.getUserDataObject());
        listener(true);
        return;
    }


    // create request
    var url = "/users/facebook";
    var a = new w.ajax(url, {
        typeGet: 'json',
        typeSend: 'json',
        postMethod: 'POST',
        showMsg: false


    });


    // responce from server
    a.callback = function(result) {
      try {

        var user = a.getTag('user');
        var newuser = a.getTag('newuser');

        log.info('Got callback. newuser:' + newuser);

        //log.info('user:' + g.debug.expose(user));

        // check if user is valid user object
        if (!w.user.isUserObject(user)) {
            listener(false);
            return; // no need to continue further
        }


        // user logged in
        w.web2.extLogin(w.STATIC.SOURCES.FB, user, newuser);

        listener(true);

        if (newuser) {
          log.shout('New USER FB!!!');
          w.analytics.trackPageview('/mtr/users/new');
          w.analytics.trackMP('newUser', {source:'FB'});
        }

      } catch(e) {
        core.error(e);
        listener(false);
      }

    }; //callback of AJAX

    a.errorCallback = function(errorobj) {
        log.warning('Server did not authorize us! msg:' + errorobj.message + ' ::debug::' + errorobj.debugmessage);
        listener(false);
    }; // errorCallback of spot request

    //send the query
    if (!a.send()) {
        listener(false);
        return;
    }

    } catch(e) {
      listener(false);
      core.error(e);
    }

}; // function core.fb.local.loginSubmit



/**
 * Triggers when we have a facebook auth event
 * for the currently logged in user. This means
 * we have to link the user with the now authorized
 * facebook account...
 *
 * Do that
 *
 * @param {Function({boolean})=} opt_listener callback function
 * @param {object=} opt_fbuser if on mobile mode we need the fb user data object
 * @return {void}
 */
core.fb.local.linkUser = function (opt_listener, opt_fbuser)
{
    try {


    var w = core;
    var log = w.log('core.fb.local.linkUser');

    log.info('Init. Authed:' + w.isAuthed());

    var listener = opt_listener || function (){};

    // create request
    var url = "/";
    var a = new w.ajax(url, {
        typeGet: 'json',
        typeSend: 'json',
        postMethod: 'POST',
        origin: 400


    });

    // if on mobile add the user data object
    if (w.MOBILE) {
        a.addData('fbuser', opt_fbuser);
    }


    // responce from server
    a.callback = function(result) {


        var user = a.getTag('user');


        //log.info('user:' + g.debug.expose(user));

        // check if user is valid user object
        if (!w.user.isUserObject(user))
            return; // no need to continue further

        // user has linked successfully his account
        // we will force the new object recieved in our
        // localy stored data object
        w.user.db.user = user;
        w.web2.extLogin(w.STATIC.SOURCES.FB, user);

        listener(true);


    }; //callback of AJAX

    a.errorCallback = function(errorobj) {
        log.warning('Server did not authorize us! msg:' + errorobj.message + ' ::debug::' + errorobj.debugmessage);
        listener(false);
    }; // errorCallback of spot request

    //send the query
    if (!a.send()) {
        listener(false);
        return;
    }

    } catch(e) {core.error(e);}

}; // function core.fb.local.linkUser


/**
 * Inform server that we have a new comment
 *
 * @param {object} data Data object as passed from FB
 * @param {boolean=} opt_rem Set to true if action is REMOVE
 * @param {Function=} opt_cb Callback function (status, opt_errmsg)
 * @return {void}
 */
core.fb.local.commentCreate = function (data, opt_rem, opt_cb)
{
  try {
    var c = core;

    var cb = opt_cb || function(){};

    // set REMOVE switch
    var rem = opt_rem || false;

    var aj = new c.ajax((rem ? '/cmnts/fbremove' : '/cmnts/fbcreate'), {
      postMethod: 'POST'
      , showMsg: false // don't show default success message
      , showErrorMsg: false // don't show error message if it happens
    });
    /**
     * Our passed variables are:
     * commentID :: string (id number)
     * href :: Url of object that was commented
     * parentCommentId :: undefined|string (id number)
     *
     */
    aj.addData('commentID', data['commentID']);
    aj.addData('href', data['href']);
    if (!rem)
      aj.addData('parentCommentId', data['parentCommentId']);

    // ajax callback listener
    aj.callback = function (result)
    {
      try {
        cb(true);
      } catch(e) {
        core.error(e);
        cb(true);
      }
    };

    // ajax error listener
    aj.errorCallback = function (errorobj)
    {
      try {
      // errorobj.message
      // errorobj.debugmessage
      cb(false, errorobj.message);

      } catch (e) {
        core.error(e);
      }

    };

    // send ajax request
    aj.send();



  } catch (e) {
    core.error(e);
    cb(false, 'error');
  }

}; // core.fb.local.commentCreate



/**
 * Copyright 2000-2011 Athanasios Polychronakis. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * 
 * @author Athanasios Polychronakis <thanpolas@gmail.com>
 * createdate 20/Aug/2010
 *
 *********
 *  File:: web2.0/facebook/facebook.comments.js
 *  wrapper for the FB comments API
 *********
 */



goog.provide('core.fb.com');



/**
 * Listen for comment create events
 *
 * @param {object} event FB passed object
 * @return {void}
 */
core.fb.com.create = function (event)
{
  try {
    var c = core, g = goog;

    var log = c.log('core.fb.com.create');

    log.info('Init');

    /**
     * Our passed variables are:
     * commentID :: string (id number)
     * href :: Url of object that was commented
     * parentCommentId :: undefined|string (id number)
     *
     */

     // inform server
     c.fb.local.commentCreate(event);

     // track event
     c.analytics.trackEvent('comments', 'created');
     c.analytics.trackSocial('facebook', 'comment', event.href);
     
  } catch (e) {
    core.error(e);
  }

}; // core.fb.com.create

/**
 * Listen for comment remove events
 *
 * @param {object} event FB passed object
 * @return {void}
 */
core.fb.com.remove = function (event)
{
  try {
    var c = core, g = goog;

    var log = c.log('core.fb.com.remove');

    log.info('Init');
    /**
     * Our passed variables are:
     * commentID :: string (id number)
     * href :: Url of object that was commented
     */

     // inform server
     c.fb.local.commentCreate(event, true);
     // track event
     c.analytics.trackEvent('comments', 'removed');
     c.analytics.trackSocial('facebook', 'commentRemoved', event.href);


  } catch (e) {
    core.error(e);
  }

}; // core.fb.com.remove


/**
 * A simple getter for the FB comments html tag
 *
 * params can have any of the following:
 * width :: Number, default 500
 * num_posts :: Number, default 2
 * colorscheme :: String light, dark. Default light
 *
 * @param {string} href The url we are attaching the comments on
 * @param {object=} opt_params Additional parameters as described above
 * @return {string}
 */
core.fb.com.getElement = function (href, opt_params)
{
  try {

  var p = opt_params || {};
  var params = {
    posts: p.num_posts || 2,
    width: p.width || 500,
    color: p.colorscheme || 'light'
  };

  var str = '<fb:comments href="' + href;
  str += '" num_posts="' + params.posts + '" ';
  str += 'width="' + params.width + '" ';
  str += 'colorscheme="' + params.color + '"';
  str += '></fb:comments>';

  return str;

  } catch (e) {
    core.error(e);
  }


};/**
 * Copyright 2000-2011 Athanasios Polychronakis. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * 
 * @author Athanasios Polychronakis <thanpolas@gmail.com>
 * createdate 25/Oct/2010
 *
 *********
 *  File:: web2.0/facebook/facebook.main.js
 *  Our main FB bundler file
 *********
 */


/**
 * In this file we have the main facebook event listeners
 * and basic functions.
 *
 * core Server interaction is in facebook.local.js
 *
 *
 */
goog.provide('core.fb');
goog.require('core.fb.local');
goog.require('core.STATIC');
goog.require('core.fb.com');
goog.require('goog.Uri');

/**
 * Facebook static needed data object
 *
 * @enum {*}
 */
core.fb.db = {
  haveInitialAuthStatus: false,
  initialAuthStatus: false,
  /**
     * Needed permitions
     *
     * http://developers.facebook.com/docs/authentication/permissions
     * //permitions: 'publish_stream, email, user_about_me, user_website, user_checkins',
     * @deprecated
     */
  permitions: '',
  /**
     * All known permitions will be stored
     * as keys in this object with a boolean value
     *
     * e.g. {publish_stream: true, email: false} [..]
     */
  hasPerms: {}
}


/**
 * Let's us know if we have checked with Facebook
 * for our authentication status
 *
 * @return {boolean}
 */
core.fb.haveAuthStatus = function ()
{
  return core.fb.db.haveInitialAuthStatus;
};

/**
 * Returns the correct Facebook AppId
 * based on which mode we are on (Local server, production)
 *
 * @return {string}
 */
core.fb.getAppId = function ()
{
  var c = core;

  return c.conf.fb.app_id;

};



/**
 * Clear the db of values, called by a user logout
 *
 * @return {void}
 */
core.fb.db.clear = function ()
{
  var db = core.fb.db;

  db.permitions = '';
  db.hasPerms = [];
  db.initialAuthStatus = false;

}; // function core.fb.db.clear



/**
 * Will execute when DOM is ready. (called from main.Init)
 *
 * Will initialize the web FB API by inserting
 * script tags in the DOM to load external FB sources
 *
 * @return {void}
 */
core.fb.InitWeb = function ()
{
  try {
    var c = core, g = goog;
    var log = c.log('core.fb.InitWeb');

    log.info('Init');

    c.ready('fb');
    c.ready.addCheck('fb', 'loaded');

    // create fb-auth check
    c.ready('fb-auth');
    c.ready.addCheck('fb-auth', 'done');


    // capture FB API Load event
    g.global.fbAsyncInit = function() {
      c.fb.Init();
    };

    // request the facebook api
    var e = document.createElement('script');
    var src = document.location.protocol;
    if (c.DEVEL)
      src += '//static.ak.fbcdn.net/connect/en_US/core.debug.js';
    else
      src += '//connect.facebook.net/en_US/all.js';
    e.src = src;
    e.async = true;
    document.getElementById('fb-root').appendChild(e);

    c.web2.db.initialCheck.timeout = setTimeout(c.web2.authStateTimeout,
      c.web2.db.initialCheck.timeoutTime);


  } catch(e){
    core.error(e);
  }
}; // core.fb.InitWeb


/**
 * Fires when facebook API is ready and loaded
 *
 * We initialize the FB API and add event listeners
 * register ourselves
 *
 * @return {void}
 */
core.fb.Init = function ()
{
  try {

    var fb = FB;
    var c = core;
    var log = c.log('core.fb.Init');

    log.info('Init - FB LIB LOADED');

    fb.init({
      appId  : c.fb.getAppId(),
      status : true, // check login status
      cookie : true, // enable cookies to allow the server to access the session
      xfbml  : true,  // parse XFBML
      oauth  : true
    });

    // catch session change events
    fb.Event.subscribe('auth.sessionChange', c.fb.sessionChange);

    // catch commenting and uncommenting
    fb.Event.subscribe('comment.create', c.fb.com.create);
    fb.Event.subscribe('comment.remove', c.fb.com.remove);

    // catch initial login status
    fb.getLoginStatus(c.fb.getInitialLoginStatus);

    // catch edge events 'like'
    // fired when the user likes something (fb:like)
    fb.Event.subscribe('edge.create', c.fb.edgeCreate);
    // unlike event
    fb.Event.subscribe('edge.remove', c.fb.edgeRemove);

    // finish the ready watch, we are loaded
    c.ready.check('fb', 'loaded');

  } catch(e) {
    core.error(e);
  }
}; // function core.fb.Init

/**
 * Initial login status of user
 *
 * @param {object} response
 * @return {void}
 */
core.fb.getInitialLoginStatus = function (response)
{
  try {
    var c = core;
    var g = goog;
    var log = c.log('core.fb.getInitialLoginStatus');

    // store the result
    c.fb.db.haveInitialAuthStatus = true;

    if (c.fb.isAuthedFromResponse(response)) {
      log.info('FACEBOOK We are CONNECTED.');
      c.web2.collectInitialAuthChecks(c.STATIC.SOURCES.FB, true);
      // validate the auth with our server
      c.fb.local.checkFacebookAuth(function(state){

        if (state) {
          c.fb.db.initialAuthStatus = true;
          c.web2.collectInitialAuthChecks(c.STATIC.SOURCES.FB, true, true);
        } else {
          c.fb.db.initialAuthStatus = false;
          c.web2.collectInitialAuthChecks(c.STATIC.SOURCES.FB, true, false);
        }

        // inform that our FB auth check is done
        c.ready.check('fb-auth', 'done');
      });
      return;
    } else {
      log.info('FACEBOOK NOT connected. status:' + response.status);
      c.fb.db.initialAuthStatus = false;
      // notify web2.0 of no login here
      c.web2.collectInitialAuthChecks(c.STATIC.SOURCES.FB, false);

      // inform that our FB auth check is done
      c.ready.check('fb-auth', 'done');


      // check if the auth source is facebook and we are authed
      if (c.STATIC.SOURCES.FB == Number(c.ajax.dbstatic.session.sessSourceId) && c.isAuthed()) {
        // it is, Perform logout
        log.info('User is logged in and source is facebook. Logging out');
        c.user.login.logout();
      }

    }

  } catch(e) {
    core.error(e);
  }
}; // function getInitialLoginStatus


/**
 * Request the permissions we have for the currently logged
 * in user.
 * 
 *
 * @param {Function()} Callback function for the result
 * @return {void}
 */
core.fb.getPermissions = function (callback)
{
  try {
    
    FB.api('/me/permissions', function (response) {
    } );
  } catch(e) {
    core.error(e);
  }
};

/**
 * Session Change event
 *
 * @param {object} responce Served from FB SDK
 * @return {void}
 */
core.fb.sessionChange = function (response)
{
  try {
    var c = core, g = goog;
    var log = c.log('core.fb.sessionChange');

    log.info('Init. response.perms:' + response.perms);
    log.info('Init. response.session.expose:' + g.debug.expose(response.session));
    /**
     * response expose:
     *

    session = {
        session_key = 2.nE7AVOAY5BDd9apfn4yAAQ__.3600.1288249200-100001091766371
        uid = 100001091766371
        expires = 1288249200
        secret = ITO3HqGTvylmHuYerITx_g__
        access_token = 119565011437683|2.nE7AVOAY5BDd9apfn4yAAQ__.3600.1288249200-100001091766371|PHzP-T8P8mAq5-eMNUbha6ZjdzY
        sig = 58c78d0312a0419b553be394a73c801f
    }
    // The status of the User. One of connected, notConnected or unknown.
    status = connected
    perms = publish_stream,email,user_about_me,user_website,user_checkins

    */


    if (c.fb.isAuthedFromResponse(response)) {
      // A user has logged in, and a new cookie has been saved
      // check if already logged in
      if (c.isAuthed())
        return;

    // neat, register ourselves with the server

    } else {
  // The user has logged out, and the cookie has been cleared
  }

  } catch(e) {
    core.error(e);
  }
}; // function sessionChange


/** 
 * When an auth event / action is performed FB returns a response 
 * object. This object changes from times to times so we have
 * to create this function to rule them all
 *
 * We check the response if we have a successfull authentication
 * and respond acordingly 
 *
 * @param {object} response the FB response object
 * @return {boolean} if we are authed or not
 */
core.fb.isAuthedFromResponse = function(response)
{
  try {
    if('connected' == response.status)
      return true;
    return false;
  } catch(e) {
    core.error(e);
  }
};

/**
 * Facebook Login Listener.
 * We listen for the completion of the fb login modal
 *
 * @param {object} response
 * @param {Function(boolean)=} opt_callback
 * @return {void}
 */
core.fb.loginListener = function (response, opt_callback)
{
  try {
    var c = core;
    var g = goog;
    var log = c.log('core.fb.loginListener');

    log.info('Init. response.status:' + response.status);

    var callback = opt_callback || function (){};

    if (c.fb.isAuthedFromResponse(response)) {
      c.fb.local.loginSubmit(callback);
    } else
      callback(false);



  //FB.api('/me', function(res){

  //log.info('me expose:' + g.debug.expose(res));
  //})

  } catch(e) {
    core.error(e);
  }
}; // function core.fb.loginListener




/**
 * Open the login dialog
 *
 * @param  {function(boolean)=} opt_callback optional callback
 * @param {string=} opt_perms set permitions if we need to...
 *      comma separate them
 * @this {DOM}
 * @return {void}
 */
core.fb.loginOpen = function (opt_callback, opt_perms)
{
  var c = core;
  var g = goog;
  var fb = FB;

  var callback = opt_callback || function (){};

  if (g.isString(opt_perms))
    var paramsObj = {
      perms: opt_perms
    };
  else
    var paramsObj = {
      perms: c.conf.fb.permitions
    };

  if (c.WEB) {
    fb.login(function(response){

      c.fb.loginListener(response, callback)
    }, paramsObj);
  }
}; // function core.fb.loginOpen



/**
 * We will attempt to link the logged in current user
 * with his facebook account
 *
 * @param {Function(boolean)=} opt_callback function
 * @return {void}
 */
core.fb.linkUser = function(opt_callback)
{
  try {

    var c = core;
    var g = goog;
    var fb = FB;
    var log = c.log('core.fb.linkUser');

    var callback = opt_callback || function(){};

    if (!c.isAuthed()) {
      callback(false);
      return;
    }


    // check if user already on facebook
    if (c.user.auth.hasExtSource(c.STATIC.SOURCES.FB)) {
      callback(true);
      return;
    }



    if (c.WEB) {
      fb.login(function(response){
        if (response.session) {
          //console.debug(response);
          c.fb.local.linkUser(callback);
        } else
          callback(false);
      }, {});
    }


  } catch(e) {
    core.error(e);
  }
}; // function core.fb.linkUser

/**
 * Fires when we have an edge event like fb:like
 *
 * @param {object} result
 * @param {object} fbobj an uknown object returned by FB
 * @return {void}
 */
core.fb.edgeCreate = function (result, fbobj)
{
  try {

    var c = core;
    var g = goog;
    var fb = FB;
    var log = c.log('core.fb.edgeCreate');



    // we can locate the ref inside the fobj, go carefully...
    var ref = '';
    if (g.isObject(fbobj._attr)) {
      if (g.isString(fbobj._attr.ref)) {
        ref = fbobj._attr.ref;
      }
    }

    log.info('Like Event fired:' + result + ' ref:' + ref);
    //var uri = new g.Uri(result)
    //var uriPath = uri.getPath();

    //strip

    c.analytics.trackEvent('Share-Frame', 'Facebook-LIKE', ref + '::' + result, 1);
    c.analytics.trackMetrics('Share', 'facebook-like', result, ref);
    c.analytics.trackSocial('facebook', 'like', result);


  } catch(e) {
    core.error(e);
  }
}; // function core.fb.edgeCreate


/**
 * Fires when we have an edge REMOVE event like fb:unlike
 *
 * @param {object} result targetURL
 * @param {object} fbobj an uknown object returned by FB
 * @return {void}
 */
core.fb.edgeRemove = function (result, fbobj)
{
  try {

    var c = core;
    var g = goog;
    var log = c.log('core.fb.edgeRemove');

    // we can locate the ref inside the fobj, go carefully...
    var ref = '';
    if (g.isObject(fbobj._attr)) {
      if (g.isString(fbobj._attr.ref)) {
        ref = fbobj._attr.ref;
      }
    }

    log.info('UNLike Event fired:' + result + ' ref:' + ref);
    //var uri = new g.Uri(result)
    //var uriPath = uri.getPath();

    //strip

    c.analytics.trackEvent('Share-Frame', 'Facebook-UNLIKE', ref + '::' + result, -1);
    c.analytics.trackMetrics('Share', 'facebook-unlike', result, ref);
    c.analytics.trackSocial('facebook', 'unlike', result);


  } catch(e) {
    core.error(e);
  }
}; // function core.fb.edgeRemove


/**
 *
 * Dummy Code for debug console
 *
 *
FB.login(function(ret){
    console.debug(ret);
}, {'perms': 'publish_stream, email, user_about_me, user_website, user_checkins'});

    FB.api('/me', function(res){
        console.debug(res)
    })


jQuery("#mc_header").html('<fb:login-button></fb:login-button>')

*/

/**
 * Get a proper XFBML like button
 *
 * Mostly for web ?
 *
 * For documentation go to:
 * https://developers.facebook.com/docs/reference/plugins/like/
 *
 * @param {string} url
 * @param {Number=} opt_width default is 400
 * @param {Object=} opt_params Any number of parameter/value keys as 
 *      described in FB Docs
 * @param {Number=} opt_width width for like button
 * @return {string}
 */
core.fb.getLikeButton = function (url, opt_params, opt_width)
{
  var g = goog;

  var params = opt_params || null;
  var width = opt_width || 60;
  var likeUrl = '<fb:like href="' + url + '" ';
  if (!g.isNull(params)) {
    g.object.forEach(params, function (value, key){
      likeUrl += key + '="' + value + '" ';
    });
  }


  return likeUrl + '></fb:like>';
  return '<fb:like href="' + url + '" width="' + width + '"></fb:like>';





}; // function core.fb.getLikeButton

/**
 * Checks if user has defined permitions
 *
 * For a list of permitions check:
 * http://developers.facebook.com/docs/authentication/permissions
 *
 * @param {string} value
 * @param {Function(boolean)} callback responce is provided through a callback
 * @return {void}
 */
core.fb.hasPerm = function (value, callback)
{
  try {
    var c = core;
    var g = goog;
    var db = c.fb.db;
    var log = c.log('core.fb.hasPerm');

    log.info('Init for:' + value);

    // check if on mobile
    if (c.MOBILE) {
        // TBD
      return;
    }

    // check if we have this perm cached localy
    if (g.isBoolean(db.hasPerms[value])) {
      callback(db.hasPerms[value]);
      return;
    }

    // request permition check by facebook
    FB.api({
      method:'users.hasAppPermission',
      ext_perm: value
    },
    function(response){
      log.info('Got response:' + response);
      // we expect 1 or 0 or error... check for '1'
      if ('1' === response) {
        // user has permition, store it
        db.hasPerms[value] = true;
        callback(true);
      } else {
        // not
        db.hasPerms[value] = false;
        callback(false);
      }
    }
    );


  } catch(e) {
    core.error(e);
  }
}; // core.fb.hasPerm
/**
 * Copyright 2000-2011 Athanasios Polychronakis. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * 
 * @author Athanasios Polychronakis <thanpolas@gmail.com>
 * createdate 25/Oct/2010
 *
 *********
 *  File:: web2.0/twitter/twitter.main.js
 *  twitter library (auth/share/etc)
 *********
 */


goog.provide('core.twit');

//goog.require('TwitterHelper');

/**
 * Our static db
 *
 */
core.twit.db = {
    loginUrl: '/users/twitter',
    loginLinkAccountParams: '?link=1', // use when user wants to link account not login
    twttrPoll: null,
    target: null
}

/**
 * We are triggered right after the script tag for
 * lazy loading has been injected into DOM
 * Twitter (window.twttr) has not loaded yet
 * so we will loop until we find it...
 *
 * @return {void}
 */
core.twit.Init = function ()
{
  var c = core;
  c.twit.db.twttrPoll = setInterval(c.twit._checkTwttrLoad, 300);
}; // function core.twit.Init

/**
 * This is the polling function that checks if twttr lib
 * is loaded. If it's loaded then it breaks the interval
 * and executes c.twit.libLoaded();
 *
 * @return {void}
 */
core.twit._checkTwttrLoad = function()
{
  try {

    if (goog.isDef(window.twttr)){
      var c = core;
      clearInterval(c.twit.db.twttrPoll);
      c.twit.libLoaded();
    }
  } catch (e) {
    core.error(e);
  }

};

/**
 * Executes when the twitter widget library is loaded
 *
 * We do proper binds
 *
 * @return {void}
 */
core.twit.libLoaded = function()
{
  try {
   var t = twttr, c = core;
   var log = c.log('core.twit.libLoaded');

   log.info('TWITTER LOADED');
   t.events.bind('tweet', c.twit.eventTweet);

  } catch (e) {
    core.error(e);
  }

};

/**
 * Triggers when user has tweeted from our modal...
 *
 * event data object contains:
 * data : null
 * region : "intent"
 * target : a.item_share_tw tweet?te...58114481
 * type : "tweet"
 *
 *
 * @param {object} event
 * @return {void}
 */
core.twit.eventTweet = function (event)
{
  try {


    //event.target.id
    var j = $, c = core;

    var twShare = j(event.target).data('twShare');


    /**
     * the twShare data is an object with these two keys:
     * source: Can be one of:
     *    frame_hover
     *    frame_modal
     *    booth_invite
     *    sfv_main
     * item_id: The id that applies on each different item...
     */

    // succesfully shared on Twitter
    c.analytics.trackSocial('twitter', 'tweet', twShare.shareUrl);


    switch(twShare.source) {
      case 'frame_hover':
        c.analytics.trackEvent('Share-Frame', 'Twitter-hover-shared', '', 1);
        c.analytics.trackMetrics('Share-frame', 'twitter-hover', twShare.item_id, 1);

      break;
      case 'frame_modal':
        c.analytics.trackEvent('Share-Frame', 'Twitter-modal-shared', '', 1);
        c.analytics.trackMetrics('Share-frame', 'modal-twitter', twShare.item_id, 1);
      break;
      case 'sfv_main':
        c.analytics.trackEvent('Share-Frame', 'Twitter-sfv-shared', '', 1);
        c.analytics.trackMetrics('Share-frame', 'sfv-twitter', twShare.item_id, 1);
      break;
      case 'booth_invite':
        c.analytics.trackEvent('Invite', 'Twitter-shared', '', 1);
        c.analytics.trackMetrics('Invite', 'twitter', 'shared', twShare.item_id);
      break;
    }


  } catch (e) {
    core.error(e);
  }

};

/**
 * When a user Tweets, the callback function receives an
 * object which can usually be used to get the URL of the
 * resource being tweeted. Once the Twitter JavaScript code loads,
 * it transforms the annotated tweet link into an iFrame and the URL
 * being tweeted gets encoded and appended as a query parameter to the
 * URL of the iFrame. The event object passed to our callback has a reference
 * to this iFrame and we can use that to get the URL of the resource
 * being tweeted.
 *
 * The callback function above makes sure the iFrame reference is indeed
 * an iFrame and then tries to extract the resource being tweeted by
 * looking at the url query parameter.
 *
 * Here's an example function to extract a query parameter from a URI:
 *
 * @link http://code.google.com/apis/analytics/docs/tracking/gaTrackingSocial.html
 * @param {string} uri
 * @param {string} paramName
 * @return {string|void}
 */
core.twit.extractParamFromUri = function(uri, paramName) {
  if (!uri) {
    return;
  }
  var uri = uri.split('#')[0];  // Remove anchor.
  var parts = uri.split('?');  // Check for query params.
  if (parts.length == 1) {
    return;
  }
  var query = decodeURI(parts[1]);

  // Find url param.
  paramName += '=';
  var params = query.split('&');
  for (var i = 0, param; param = params[i]; ++i) {
    if (param.indexOf(paramName) === 0) {
      return unescape(param.split('=')[1]);
    }
  }
};


/**
 * Will compile and return a proper url link to
 * share content to twitter
 *
 *
 * Info from: http://dev.twitter.com/pages/tweet_button
 *
 * Params can include (via twitter doc)
    url :: URL of the page to share
    via :: Screen name of the user to attribute the Tweet to
    text :: Default Tweet text
    related :: Related accounts
    count :: Count box position (none, horizontal, vertical)
    lang :: The language for the Tweet Button
    counturl :: The URL to which your shared URL resolves to
 *
 *
 * @param {string} text What we want to say
 * @param {string} uri The URI part of our link without a leading slash (/)
 * @param {object=} opt_params Parameters as per documentation
 * @return {string}
 */
core.twit.getHref = function (text, uri, opt_params)
{
  try {
    var c = core, g = goog;

    var params = opt_params || {};

    //var href = 'http://twitter.com/share?text=';
    var href = 'https://twitter.com/intent/tweet?text=';
    href += c.encURI(text);
    href += '&url=' + c.encURI(uri);

    if (g.isString(params.via))
      href += '&via=' + c.encURI(params.via);

    if (g.isString(params.related))
      href += '&related=' + c.encURI(params.related);
    else
      href += '&related=' + c.encURI('boothchat');

    if (g.isString(params.count))
      href += '&count=' + c.encURI(params.count);
    if (g.isString(params.lang))
      href += '&lang=' + c.encURI(params.lang);
    if (g.isString(params.counturl))
      href += '&counturl=' + c.encURI(params.counturl);

    href += '&_=' + new Date().getTime();

    return href;
  } catch(e){core.error(e);}
};

/**
 * We will attempt to link the logged in current user
 * with his twitter account
 *
 * @return {void}
 */
core.twit.linkUser = function()
{
    try {

    var w = core;
    var g = goog;
    var fb = FB;
    var log = w.log('core.twit.linkUser');

    if (!w.isAuthed())
        return;

    // check if user already on facebook
    if (w.user.auth.hasExtSource(w.STATIC.SOURCES.TWIT))
        return;



    if (w.WEB) {
        // we have to redirect user to /signup/twitter.php
        // to start the authentication process
        // we will add the var link=1 to indicate that
        // we want to link user, not log in...

        // first we will capture the current url of the user
        var url = window.location.hash;

        // assign it as a url var for GET
        url = '&url=' + w.encURI(url);


        window.location.href =  w.twit.db.loginUrl + w.twit.db.loginLinkAccountParams + url;
    }


    } catch(e) {core.error(e);}
}; // function core.twit.linkUser


/**
 * Open the login dialog
 *
 * NOTE this is very WEB stuff, amend when using for
 * mobile
 *
 * @this {DOM}
 * @return {void}
 */
core.twit.loginOpen = function ()
{
    try {
    var c = core, win = window;
    var log = c.log('core.twit.loginOpen');
    // we have to redirect user to /signup/twitter.php
    // to start the authentication process

    // use the current path of the user for return
    var returnPath = '?url=' + c.encURI(win.location.pathname);
    log.info('Redirecting user to:' + returnPath);
    // redirect the browser now
    win.location.href = c.twit.db.loginUrl + returnPath;

    } catch(e) {core.error(e);}
}; // function core.twit.loginOpen


/**
 * Will open a new window on the browser prompting the user
 * to share content on twitter
 *
 * @param {string} url the target url properly formed by core.twit.getHref()
 * @return {void}
 */
core.twit.openShareWindow = function (url)
{
  try {
    var j = $;
    var win = window;

    var width  = 575,
    height = 400,
    left   = (j(win).width()  - width)  / 2,
    top    = (j(win).height() - height) / 2,
    opts   = 'status=1' +
    ',width='  + width  +
    ',height=' + height +
    ',top='    + top    +
    ',left='   + left;

    win.open(url, 'twitter', opts);
  } catch (e) {
    core.error(e);
  }

}


/**
 * Post a tweet
 *
 * DOESNT WORK
 *
 * @param {string} warpmsg the message
 * @return {void}
 * @deprecated
 */
core.twit.post = function (warpmsg)
{
	try {

	var log = core.log('core.twit.post');

	log.info('Init');
	var throbber = false;

	var tw = new TwitterHelper('','', throbber, 'twitter');

	tw.statuses.update(function(aTwitterHelper, aAnswer, aContext){
		log.info('callback:' + goog.debug.expose(aAnswer));

	},function(aTwitterHelper, aRequest, aContext){
		log.info('errorcallback:' + goog.debug.expose(aRequest));
	}, this, 'json', warpmsg);

	/*
	var afeedURL = 'http://api.twitter.com/' + "statuses/update.json";
	afeedURL += "?status=" + core.encURI(warpmsg);



	// we can't use |new XMLHttpRequest()| in a JS module...
	var xmlRequest = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]
	                     .createInstance(Components.interfaces.nsIXMLHttpRequest);



	xmlRequest.onreadystatechange = function() {

		//_self._onreadystatechangeTwitter(xmlRequest, aCallback, aErrorCallback, aContext, _self);
	};

	//xmlRequest.mozBackgroundRequest = true;
	xmlRequest.open("POST", afeedURL, true);
	xmlRequest.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2005 00:00:00 GMT");


	xmlRequest.setRequestHeader("Content-length", 0);
	xmlRequest.send(null);
	*/
	} catch(e) {core.error(e);}
};



/**
 * Copyright 2000-2011 Athanasios Polychronakis. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * 
 * @author Athanasios Polychronakis <thanpolas@gmail.com>
 * createdate 29/Oct/2010
 *
 *********
 *  File:: web2.0/web2.0.main.js
 *  main file for social integration libraries (auth/share/etc)
 *********
 */


goog.provide('core.web2');
goog.require('core.user');
goog.require('core.events');
goog.require('core.fb');
goog.require('core.fb.API');
goog.require('core.twit');

/**
 * Local data object
 */
core.web2.db = {

    /**
     * If we have external sources authentication
     *
     * @type {boolean}
     */
    isExtAuthed: false,

    /**
     * This var contains an array of core.STATIC.SOURCES
     * values, indicates that we are authed on these
     * external sources
     *
     * @type {Array<core.STATIC.SOURCES>}
     */
    extAuthSources: [],

    /**
     * Add here the external sources we have integraded
     * for authentication on client side
     *
     * @type {Array<core.STATIC.SOURCES>}
     */
    supportedSources: [core.STATIC.SOURCES.FB],

    /**
     * Initial external auth check needed vars
     */
    initialCheck: {
        timeoutTime: 2000, // ultimate timeout for waiting external sources auth
        timeout: null, // setTimeout pointer
        finished: false, // Indicates that we fired the authState event

        /**
         * The checks array contains the external sources that
         * have checked and their status.
         *
         * Object structure:
         * {
         *      sourceId: 0,
         *      initState: false,
         *      endState: false
         * }
         */
        checks: []
    }

};

/**
 * Call this method whenever we want to clear the data objects
 *
 * because of a logout action...
 *
 * @return {void}
 */
core.web2.db.clear = function ()
{
    var c = core;
    var db = c.web2.db;

    // check if we were authed from external source
    if (db.isExtAuthed) {
        c.web2.extLogout();
    }

    db.isExtAuthed = false;
    db.extAuthSources = [];
}; // funtion core.web2.db.clear



/**
 * We will return one external source data object
 * from the user data obejct provided.
 *
 * Optionaly we may set a preffered source
 *
 * We return an object with these keys:
  [sourceId] => 6
  [extUserId] => 47002318
  [extUrl] => http://twitter.com/thanpolas
  [extUsername] => thanpolas
  [extProfileImageUrl] => 'htpt:/...'

 *
 * @param {object} userObj The user data object
 * @param {core.STATIC.SOURCES} opt_prefferedSource
 * @return {object}
 */
core.web2.getUserExt = function(userObj, opt_prefferedSource)
{
  try {
    var g = goog, c = core;

    var prefSource = opt_prefferedSource || c.STATIC.SOURCES.FB;

    var u = userObj;
    var extObj = {};
    var foundPref = false;

    if (!g.isArray(u.extSource)) {
      // got a broken object...
      var user = c.user.getDummyObject();
      return user.extSource[0];

    }

    g.array.forEach(u.extSource, function (extSource, index){
      if (foundPref) return;
      extObj =  c.copy(extSource);
      if (prefSource == extSource.sourceId)
        foundPref = true;
    });



    return extObj;
  } catch(e) {core.error(e);}
};


/**
 * This function must be called whenever we have
 * an authentication verification from the
 * server for an external source auth.
 *
 *
 * @param {core.STATIC.SOURCES} sourceId The external source id
 * @param {object} user core user data object
 * @param {boolean=} opt_newuser If user logged in is new
 * @return {void}
 */
core.web2.extLogin = function (sourceId, user, opt_newuser)
{
    try {

    var g = goog;
    var c = core;
    var w2 = c.web2;
    var log = c.log('core.web2.extLogin');

    log.info('Init. sourceId:' + sourceId + ' opt_newuser:' + opt_newuser);

    // check if we already know that
    if (w2.isExtAuthed(sourceId)) {
        // yes we do
        log.warning('We already know that we are authed with this source');
        return;
    }


    // assign the login
    w2.db.isExtAuthed = true;
    w2.db.extAuthSources.push(sourceId);

    // auth the user localy
    c.user.auth.extAuth(sourceId, user);

    // check if new user and fire said event
    if (opt_newuser)
        c.user.auth.events.runEvent('newuser', sourceId, user);


    } catch(e) {core.error(e);}
}; // function core.web2.extLogin

/**
 * Checks if we are authed for the specified
 * external source.
 *
 * CAUTION
 * This function only checks if we activly know
 * we have an external authentication (for now
 * only from FB).
 *
 * We do not check if user has external linked
 * sources... use the .hasExtSource() function
 * for this...
 *
 * @param {core.STATIC.SOURCES} sourceId
 * @return {boolean}
 */
core.web2.isExtAuthed = function (sourceId)
{
    try {
    var g = goog;
    var w = core;
    var w2 = w.web2;

    // ugly patch for mobile (FB Only now)
    if (w.MOBILE) {
        // TBD
    }

    if (!w2.db.isExtAuthed)
        return false;

    if (g.array.contains(w2.db.extAuthSources, sourceId))
        return true;

    return false;

    } catch(e) {core.error(e);}
}; // function core.web2.isExtAuthed

/**
 * Checks if user has linked his account with
 * an external source
 *
 * @param {core.STATIC.SOURCES} sourceId
 * @return boolean
 * @deprecated use core.user.auth.hasExtSource
 */
core.web2.hasExtSource = function (sourceId)
{
    try {
    return core.user.auth.hasExtSource(sourceId);
    } catch(e) {core.error(e);}
}; // function core.web2.hasExtSource


/**
 * Get the external sources that we
 * are currently authenticated at (only FB
 * has auth at client side)
 *
 * @return {Array<core.STATIC.SOURCES>}
 */
core.web2.getExtSources = function ()
{
    return core.web2.db.extAuthSources;

}; // func core.web2.getExtSources

/**
 * We collect initial authentication checks from
 * external sources.
 *
 * This function is aware of each external source
 * we integrade for auth. These are set at: core.web2.db.supportedSources
 * On startup we check the auth states for these sources
 *
 * As each external source responds it calls this function
 *
 * There is an initial state (initState) which is the response
 * as we get it from the external source. And if true we expect
 * another call with an endState which let's us know if
 * our server honors this authentication request
 *
 * When all external auth requests finish we fire the 'authState'
 * event from our events instance
 *
 * @param {core.STATIC.SOURCES} sourceId The source id
 * @param {boolean} initState Initial responce from ext source. If true we wait for final state
 * @param {boolean=} opt_endState If initState was true we check with our servers to validate
 *      the auth. This lets us know if server honored us
 * @return {void}
 */
core.web2.collectInitialAuthChecks = function (sourceId, initState, opt_endState)
{
    try {
    var g = goog;
    var c = core;
    var w2 = c.web2;
    var db = w2.db;

    var log = c.log('core.web2.collectInitialAuthChecks');

    log.fine('Init. sourceId:' + sourceId + ' initState:' + initState + ' endState:' + opt_endState
        + ' finished:' + db.initialCheck.finished);



    // decide on endState
    if (g.isBoolean(opt_endState))
        var endState = opt_endState;
    else
        var endState = null;

    log.fine('endState type:' + g.typeOf(endState) + ' typeOf opt_endState:' + g.typeOf(opt_endState));

    // check if we have checked this sourceId before
    var ind = c.arFindIndex(db.initialCheck.checks, 'sourceId', sourceId);
    if (-1 == ind) {
        // not found, create it
        var checkObj = {
            sourceId: sourceId,
            initState: initState,
            endState:  endState
        };
        db.initialCheck.checks.push(checkObj);

        // decide on our fate now
        _checkState(checkObj);
    } else {
        //get the check
        var checkObj = db.initialCheck.checks[ind];
        // update the end state
        checkObj['endState'] = endState;
        // decide on our fate
        _checkState(checkObj);

    }

    } catch(e) {core.error(e);}

    /**
     * Perform auth checks, if we need to trigger the event and on...
     *
     * @param {object} checkObj
     * @return {void}
     * @private
     */
    function _checkState (checkObj)
    {
        try {

        if (db.initialCheck.finished) {
          log.info('_checkState we were already finished, exiting');
          return;
        }
        // open this switch if check object needs closing
        var checkClosed = false;

        //log.info('_checkState called. checkObj:' + g.debug.expose(checkObj));

        if (checkObj.initState) {
            if (checkObj.endState) {
                // user authed fire event and exit, we are done
                db.initialCheck.finished = true;
                // remove timeout
                clearTimeout(db.initialCheck.timeout);
                db.initialCheck.timeout = null;
                // notify local data object
                log.info('Notifying local data object for sourceId:' + checkObj.sourceId);
                db.isExtAuthed = true;
                if (!w2.isExtAuthed(checkObj.sourceId))
                    db.extAuthSources.push(checkObj.sourceId);

                // check if already finished or is already authed... (sour grapes)
                if (db.initialCheck.finished || c.isAuthed()) {
                    //return;
                }

                // trigger the event
                c.user.auth.events.runEvent('initAuthState', true);
                // exit
                return;
            }

            if (g.isNull(checkObj.endState)) {
                // core server auth validation pending...
                log.fine('endState is null exiting');
                return;
            }

            // this is a false state of endState for our
            // server validation, close this object
            checkClosed = true;
        } else {
            // initial state is false
            checkClosed = true;

        }

        //log.info('here:' + checkClosed);

        // if the object closed
        if (checkClosed) {
            // object closed (with a false outcome)
            // check if we have more ext sources pending
            // for auth

            // TODO it...
            // now exec event
                // user authed fire event and exit, we are done
                db.initialCheck.finished = true;
                // remove timeout
                clearTimeout(db.initialCheck.timeout);
                db.initialCheck.timeout = null;

                // trigger the event
                c.user.auth.events.runEvent('initAuthState', false);
                // exit
                return;

        }


        } catch(e) {core.error(e);}
    } // function _checkState



}; // function core.web2.collectInitialAuthChecks

/**
 * Fires when ultimate auth state timeout fires
 *
 * ext auth sources have timed out... we fire
 * the event ...
 *
 * @return {void}
 */
core.web2.authStateTimeout = function ()
{
    try {

    var g = goog;
    var c = core;
    var w2 = c.web2;
    var db = w2.db;

    var log = c.log('core.web2.authStateTimeout');

    log.info('web2.0 Ultimate timeout fired. db.finished:' + db.initialCheck.finished + ' Authed:' + c.isAuthed());



    // check if already finished or is already authed... (sour grapes)
    //if (db.initialCheck.finished || w.isAuthed())
      //  return;

    // user authed fire event and exit, we are done
    // db.initialCheck.finished = true;
    // remove timeout

    db.initialCheck.timeout = null;

    // trigger the event
    c.user.auth.events.runEvent('initAuthState', false);

    } catch(e) {core.error(e);}
}; // function core.web2.authStateTimeout


/**
 * Log out the user from external source as well
 *
 * @return {void}
 */
core.web2.extLogout = function ()
{
    // if on mobile, exit... (no solution yet)
    if (core.MOBILE)
        return;

    FB.logout(function(response) {
      // user is now logged out
    });
}; // function core.web2.extLogout
/**
 * Copyright 2000-2011 Athanasios Polychronakis. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * 
 * @author Athanasios Polychronakis <thanpolas@gmail.com>
 * createdate 19/Nov/2010
 *
 *********
 *  File:: system/analytics.js 
 * Wrapper for analytics
 *********
 */



goog.provide('core.analytics');

/**
 * Constructs and sends the event tracking call to the Google
 * Analytics Tracking Code. Use this to track visitor behavior
 * on your website that is not related to a web page visit,
 * such as interaction with a Flash video movie control or
 * any user event that does not trigger a page request.
 *
 * http://code.google.com/apis/analytics/docs/gaJS/gaJSApiEventTracking.html#_gat.GA_EventTracker_._trackEvent
 *
 *
 * @param {string} category The name you supply for the group of
 *      objects you want to track.
 * @param {string} action A string that is uniquely paired with
 *      each category, and commonly used to define the type of user interaction for the web object.
 * @param {string=} opt_label An optional string to provide additional dimensions to the event data.
 * @param {Number=} opt_value An integer that you can use to provide numerical data about the user event.
 * @return {void}
 */
core.analytics.trackEvent = function (category, action, opt_label, opt_value)
{
    try {
    var w = window, c = core;

    if (!core.WEBTRACK)
        return;

    // send the event to GA
    w._gaq.push(['_trackEvent', category, action, opt_label, opt_value]);

    // send the event to Mixpanel
    var props = {
      'action': action,
      'label' : opt_label || '',
      'value' : opt_value || ''

    };

    c.analytics.trackMP(category, props);



    } catch (e) {core.error(e);}
}; // core.analytics.trackEvent


/**
 * Server metrics counter - Use it to store metrics to server
 *
 * @param {string} category The name you supply for the group of
 *      objects you want to track.
 * @param {string} action A string that is uniquely paired with
 *      each category, and commonly used to define the type of user interaction for the web object.
 * @param {string=} opt_label An optional string to provide additional dimensions to the event data.
 * @param {string=} opt_value A string that you can use to provide numerical data about the user event.
 * @param {string=} opt_value2 Additional data to store
 * @param {string=} opt_value3 Additional data to store
 * @param {string=} opt_value4 Additional data to store
 * @return {void}
 */
core.analytics.trackMetrics = function (category, action, opt_label, opt_value,
    opt_value2, opt_value3, opt_value4)
{
  try {
    var c = core;


    var aj = new c.ajax('/mtr/track', {
      postMethod: 'POST'
     , showMsg: false // don't show default success message
     , showErrorMsg: false // don't show error message if it happens
    });

    aj.addData('category', category);
    aj.addData('mtraction', action);
    aj.addData('label', opt_label || '');
    aj.addData('value', opt_value || '');
    aj.addData('value2', opt_value2 || '');
    aj.addData('value3', opt_value3 || '');
    aj.addData('value4', opt_value4 || '');


    // send ajax request
    aj.send();


  } catch (e) {
    core.error(e);
  }

}; // core.analytics.trackMetrics









/**
 * Main logic for GATC (Google Analytic Tracker Code).
 * If linker functionalities are enabled, it attempts to extract
 * cookie values from the URL. Otherwise, it tries to extract cookie
 * values from document.cookie. It also updates or creates cookies
 * as necessary, then writes them back to the document object.
 * Gathers all the appropriate metrics to send to the UCFE
 * (Urchin Collector Front-end).
 *
 * http://code.google.com/apis/analytics/docs/gaJS/gaJSApiBasicConfiguration.html#_gat.GA_Tracker_._trackPageview
 *
 *
 * @param {string=} opt_pageURL Values from s.ui.History.tokens.spot.sdv
 *      Optional parameter to indicate what page URL to
 *      track metrics under.
 *      When using this option, use a beginning slash (/)
 *      to indicate the page URL.
 * @return {void}
 */
core.analytics.trackPageview = function (opt_pageURL)
{
    try {
    var w = window;

    if (!core.WEBTRACK)
        return;

    // check if we have a string value, append hash tag '/#'
    //if (g.isString(opt_pageURL))
      //  opt_pageURL = '/#' + opt_pageURL;

    // send the request
    w._gaq.push(['_trackPageview', opt_pageURL]);

    // send the pageview to Mixpanel
    var props = {
      'page': opt_pageURL,
      'mp_note': opt_pageURL
    };
    w.mpq.track('pageview', props);


    } catch (e) {core.error(e);}
}; // core.analytics.trackPageview


/**
 * Trigger whenever we have an authentication event
 *
 * @param {object} user user standard object
 * @return {void}
 */
core.analytics.userAuth = function (user)
{
  try {
    var w = window;
    if (!core.WEBTRACK)
        return;

    // Google CUSTOM VAR SLOT 1
    // this is also set in the header.php view
     w._gaq.push(['_setCustomVar',
      1,                   // This custom var is set to slot #1.  Required parameter.
      'userAuthed',     // The name acts as a kind of category for the user activity.  Required parameter.
      'true',               // This value of the custom variable.  Required parameter.
      2                    // Sets the scope to session-level.  Optional parameter.
   ]);

   // mixpanel name tag
   w.mpq.name_tag(user.userId + '::' + user.nickname);


  } catch (e) {
    core.error(e);
  }

};

/**
 * Implements mixpanel's identify function for uniquely identifying
 * visitors.
 *
 * For now we track our visitors using the permanent Cook ID
 * Called from: core.metadata.newObject();
 *
 *
 * @param {Number} permId
 * @return {void}
 */
core.analytics.identify = function (permId)
{
  try {

    if (!core.WEBTRACK)
        return;
    window.mpq.identify(permId);


  } catch (e) {
    core.error(e);
  }

};


/**
 * MixPanel implementation of event tracking
 *
 * @param {string} name
 * @param {object=} props custom properties
 * @return {void}
 */
core.analytics.trackMP = function (name, props)
{
  try {
    var w = window;

    if (!core.WEBTRACK)
        return;

    props = props || {};
    
    // patch for MP not showing the properties on the stream
    // views, we will use mp_note
    var mp_note = '';
    goog.object.forEach(props, function(val, index) {
      mp_note += index + ':' + val + ' / ';
    });
    props.mp_note = mp_note;
    //console.debug(properties);
    w.mpq.track(name, props || {});

  } catch (e) {
    core.error(e);
  }

};

/**
 * Track a social event (Sharing)
 *
 * @link http://code.google.com/apis/analytics/docs/tracking/gaTrackingSocial.html
 * @param {string} network Required. A string representing the social
 *        network being tracked (e.g. Facebook, Twitter, LinkedIn)
 * @param {string} socialAction Required. A string representing the social
 *        action being tracked (e.g. Like, Share, Tweet)
 * @param {string=} opt_target Optional. A string representing the URL
 *        (or resource) which receives the action. For example, if a
 *        user clicks the Like button on a page on a site, the the
 *        opt_target might be set to the title of the page, or an ID used to
 *        identify the page in a content management system. In many cases,
 *        the page you Like is the same page you are on. So if this
 *        parameter is undefined, or omitted, the tracking code defaults to
 *        using document.location.href.
 * @param {string=} opt_pagePath Optional. A string representing the page
 * by path (including parameters) from which the action occurred.
 * For example, if you click a Like button on
 * http://code.google.com/apis/analytics/docs/index.html, then
 * opt_pagePath should be set to /apis/analytics/docs/index.html.
 * Almost always, the path of the page is the source of the social action.
 * So if this parameter is undefined or omitted, the tracking code defaults
 * to using location.pathname plus location.search. You generally only need
 * to set this if you are tracking virtual pageviews by modifying the
 * optional page path parameter with the Google Analytics
 * _trackPageview method.
 *
 */
core.analytics.trackSocial = function (network, socialAction, opt_target, opt_pagePath)
{
  try {
    var w = window;

    if (!core.WEBTRACK)
        return;

    w._gaq.push(['_trackSocial', network, socialAction, opt_target, opt_pagePath]);

  } catch (e) {
    core.error(e);
  }

};/**
 * Copyright 2000-2011 Athanasios Polychronakis. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * 
 * @author Athanasios Polychronakis <thanpolas@gmail.com>
 * createdate 25/May/2011
 *
 *********
 *  File:: system/conf.main.js 
 *  Core configurations for website / application
 *********
 */

goog.provide('core.conf');

/**
 * Master configuration hash
 *
 * @type {Object}
 */
core.conf = {
  fb: {
    app_id: '186392014808053',
    permitions: 'email,publish_stream'
  }
};// Copyright 2011 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Defines the collection interface.
 *
 * @author nnaze@google.com (Nathan Naze)
 */

goog.provide('goog.structs.Collection');



/**
 * An interface for a collection of values.
 * @interface
 */
goog.structs.Collection = function() {};


/**
 * @param {*} value Value to add to the collection.
 */
goog.structs.Collection.prototype.add;


/**
 * @param {*} value Value to remove from the collection.
 */
goog.structs.Collection.prototype.remove;


/**
 * @param {*} value Value to find in the tree.
 * @return {boolean} Whether the collection contains the specified value.
 */
goog.structs.Collection.prototype.contains;


/**
 * @return {number} The number of values stored in the collection.
 */
goog.structs.Collection.prototype.getCount;

// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Datastructure: Set.
 *
 * @author arv@google.com (Erik Arvidsson)
 * @author pallosp@google.com (Peter Pallos)
 *
 * This class implements a set data structure. Adding and removing is O(1). It
 * supports both object and primitive values. Be careful because you can add
 * both 1 and new Number(1), because these are not the same. You can even add
 * multiple new Number(1) because these are not equal.
 */


goog.provide('goog.structs.Set');

goog.require('goog.structs');
goog.require('goog.structs.Collection');
goog.require('goog.structs.Map');



/**
 * A set that can contain both primitives and objects.  Adding and removing
 * elements is O(1).  Primitives are treated as identical if they have the same
 * type and convert to the same string.  Objects are treated as identical only
 * if they are references to the same object.  WARNING: A goog.structs.Set can
 * contain both 1 and (new Number(1)), because they are not the same.  WARNING:
 * Adding (new Number(1)) twice will yield two distinct elements, because they
 * are two different objects.  WARNING: Any object that is added to a
 * goog.structs.Set will be modified!  Because goog.getUid() is used to
 * identify objects, every object in the set will be mutated.
 * @param {Array|Object=} opt_values Initial values to start with.
 * @constructor
 * @implements {goog.structs.Collection}
 */
goog.structs.Set = function(opt_values) {
  this.map_ = new goog.structs.Map;
  if (opt_values) {
    this.addAll(opt_values);
  }
};


/**
 * Obtains a unique key for an element of the set.  Primitives will yield the
 * same key if they have the same type and convert to the same string.  Object
 * references will yield the same key only if they refer to the same object.
 * @param {*} val Object or primitive value to get a key for.
 * @return {string} A unique key for this value/object.
 * @private
 */
goog.structs.Set.getKey_ = function(val) {
  var type = typeof val;
  if (type == 'object' && val || type == 'function') {
    return 'o' + goog.getUid(/** @type {Object} */ (val));
  } else {
    return type.substr(0, 1) + val;
  }
};


/**
 * @return {number} The number of elements in the set.
 */
goog.structs.Set.prototype.getCount = function() {
  return this.map_.getCount();
};


/**
 * Add a primitive or an object to the set.
 * @param {*} element The primitive or object to add.
 */
goog.structs.Set.prototype.add = function(element) {
  this.map_.set(goog.structs.Set.getKey_(element), element);
};


/**
 * Adds all the values in the given collection to this set.
 * @param {Array|Object} col A collection containing the elements to add.
 */
goog.structs.Set.prototype.addAll = function(col) {
  var values = goog.structs.getValues(col);
  var l = values.length;
  for (var i = 0; i < l; i++) {
    this.add(values[i]);
  }
};


/**
 * Removes all values in the given collection from this set.
 * @param {Array|Object} col A collection containing the elements to remove.
 */
goog.structs.Set.prototype.removeAll = function(col) {
  var values = goog.structs.getValues(col);
  var l = values.length;
  for (var i = 0; i < l; i++) {
    this.remove(values[i]);
  }
};


/**
 * Removes the given element from this set.
 * @param {*} element The primitive or object to remove.
 * @return {boolean} Whether the element was found and removed.
 */
goog.structs.Set.prototype.remove = function(element) {
  return this.map_.remove(goog.structs.Set.getKey_(element));
};


/**
 * Removes all elements from this set.
 */
goog.structs.Set.prototype.clear = function() {
  this.map_.clear();
};


/**
 * Tests whether this set is empty.
 * @return {boolean} True if there are no elements in this set.
 */
goog.structs.Set.prototype.isEmpty = function() {
  return this.map_.isEmpty();
};


/**
 * Tests whether this set contains the given element.
 * @param {*} element The primitive or object to test for.
 * @return {boolean} True if this set contains the given element.
 */
goog.structs.Set.prototype.contains = function(element) {
  return this.map_.containsKey(goog.structs.Set.getKey_(element));
};


/**
 * Tests whether this set contains all the values in a given collection.
 * Repeated elements in the collection are ignored, e.g.  (new
 * goog.structs.Set([1, 2])).containsAll([1, 1]) is True.
 * @param {Object} col A collection-like object.
 * @return {boolean} True if the set contains all elements.
 */
goog.structs.Set.prototype.containsAll = function(col) {
  return goog.structs.every(col, this.contains, this);
};


/**
 * Finds all values that are present in both this set and the given collection.
 * @param {Array|Object} col A collection.
 * @return {!goog.structs.Set} A new set containing all the values (primitives
 *     or objects) present in both this set and the given collection.
 */
goog.structs.Set.prototype.intersection = function(col) {
  var result = new goog.structs.Set();

  var values = goog.structs.getValues(col);
  for (var i = 0; i < values.length; i++) {
    var value = values[i];
    if (this.contains(value)) {
      result.add(value);
    }
  }

  return result;
};


/**
 * Finds all values that are present in this set and not in the given
 * collection.
 * @param {Array|Object} col A collection.
 * @return {!goog.structs.Set} A new set containing all the values
 *     (primitives or objects) present in this set but not in the given
 *     collection.
 */
goog.structs.Set.prototype.difference = function(col) {
  var result = this.clone();
  result.removeAll(col);
  return result;
};


/**
 * Returns an array containing all the elements in this set.
 * @return {!Array} An array containing all the elements in this set.
 */
goog.structs.Set.prototype.getValues = function() {
  return this.map_.getValues();
};


/**
 * Creates a shallow clone of this set.
 * @return {!goog.structs.Set} A new set containing all the same elements as
 *     this set.
 */
goog.structs.Set.prototype.clone = function() {
  return new goog.structs.Set(this);
};


/**
 * Tests whether the given collection consists of the same elements as this set,
 * regardless of order, without repetition.  Primitives are treated as equal if
 * they have the same type and convert to the same string; objects are treated
 * as equal if they are references to the same object.  This operation is O(n).
 * @param {Object} col A collection.
 * @return {boolean} True if the given collection consists of the same elements
 *     as this set, regardless of order, without repetition.
 */
goog.structs.Set.prototype.equals = function(col) {
  return this.getCount() == goog.structs.getCount(col) && this.isSubsetOf(col);
};


/**
 * Tests whether the given collection contains all the elements in this set.
 * Primitives are treated as equal if they have the same type and convert to the
 * same string; objects are treated as equal if they are references to the same
 * object.  This operation is O(n).
 * @param {Object} col A collection.
 * @return {boolean} True if this set is a subset of the given collection.
 */
goog.structs.Set.prototype.isSubsetOf = function(col) {
  var colCount = goog.structs.getCount(col);
  if (this.getCount() > colCount) {
    return false;
  }
  // TODO(user) Find the minimal collection size where the conversion makes
  // the contains() method faster.
  if (!(col instanceof goog.structs.Set) && colCount > 5) {
    // Convert to a goog.structs.Set so that goog.structs.contains runs in
    // O(1) time instead of O(n) time.
    col = new goog.structs.Set(col);
  }
  return goog.structs.every(this, function(value) {
    return goog.structs.contains(col, value);
  });
};


/**
 * Returns an iterator that iterates over the elements in this set.
 * @param {boolean=} opt_keys This argument is ignored.
 * @return {!goog.iter.Iterator} An iterator over the elements in this set.
 */
goog.structs.Set.prototype.__iterator__ = function(opt_keys) {
  return this.map_.__iterator__(false);
};
// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Logging and debugging utilities.
 *
 * @see ../demos/debug.html
 */

goog.provide('goog.debug');

goog.require('goog.array');
goog.require('goog.string');
goog.require('goog.structs.Set');
goog.require('goog.userAgent');


/**
 * Catches onerror events fired by windows and similar objects.
 * @param {function(Object)} logFunc The function to call with the error
 *    information.
 * @param {boolean=} opt_cancel Whether to stop the error from reaching the
 *    browser.
 * @param {Object=} opt_target Object that fires onerror events.
 */
goog.debug.catchErrors = function(logFunc, opt_cancel, opt_target) {
  var target = opt_target || goog.global;
  var oldErrorHandler = target.onerror;
  var retVal = !!opt_cancel;

  // Chrome interprets onerror return value backwards (http://crbug.com/92062)
  // until it was fixed in webkit revision r94061 (Webkit 535.3). This
  // workaround still needs to be skipped in Safari after the webkit change
  // gets pushed out in Safari.
  // See https://bugs.webkit.org/show_bug.cgi?id=67119
  if (goog.userAgent.WEBKIT && !goog.userAgent.isVersion('535.3')) {
    retVal = !retVal;
  }
  target.onerror = function(message, url, line) {
    if (oldErrorHandler) {
      oldErrorHandler(message, url, line);
    }
    logFunc({
      message: message,
      fileName: url,
      line: line
    });
    return retVal;
  };
};


/**
 * Creates a string representing an object and all its properties.
 * @param {Object|null|undefined} obj Object to expose.
 * @param {boolean=} opt_showFn Show the functions as well as the properties,
 *     default is false.
 * @return {string} The string representation of {@code obj}.
 */
goog.debug.expose = function(obj, opt_showFn) {
  if (typeof obj == 'undefined') {
    return 'undefined';
  }
  if (obj == null) {
    return 'NULL';
  }
  var str = [];

  for (var x in obj) {
    if (!opt_showFn && goog.isFunction(obj[x])) {
      continue;
    }
    var s = x + ' = ';
    /** @preserveTry */
    try {
      s += obj[x];
    } catch (e) {
      s += '*** ' + e + ' ***';
    }
    str.push(s);
  }
  return str.join('\n');
};


/**
 * Creates a string representing a given primitive or object, and for an
 * object, all its properties and nested objects.  WARNING: If an object is
 * given, it and all its nested objects will be modified.  To detect reference
 * cycles, this method identifies objects using goog.getUid() which mutates the
 * object.
 * @param {*} obj Object to expose.
 * @param {boolean=} opt_showFn Also show properties that are functions (by
 *     default, functions are omitted).
 * @return {string} A string representation of {@code obj}.
 */
goog.debug.deepExpose = function(obj, opt_showFn) {
  var previous = new goog.structs.Set();
  var str = [];

  var helper = function(obj, space) {
    var nestspace = space + '  ';

    var indentMultiline = function(str) {
      return str.replace(/\n/g, '\n' + space);
    };

    /** @preserveTry */
    try {
      if (!goog.isDef(obj)) {
        str.push('undefined');
      } else if (goog.isNull(obj)) {
        str.push('NULL');
      } else if (goog.isString(obj)) {
        str.push('"' + indentMultiline(obj) + '"');
      } else if (goog.isFunction(obj)) {
        str.push(indentMultiline(String(obj)));
      } else if (goog.isObject(obj)) {
        if (previous.contains(obj)) {
          // TODO(user): This is a bug; it falsely detects non-loops as loops
          // when the reference tree contains two references to the same object.
          str.push('*** reference loop detected ***');
        } else {
          previous.add(obj);
          str.push('{');
          for (var x in obj) {
            if (!opt_showFn && goog.isFunction(obj[x])) {
              continue;
            }
            str.push('\n');
            str.push(nestspace);
            str.push(x + ' = ');
            helper(obj[x], nestspace);
          }
          str.push('\n' + space + '}');
        }
      } else {
        str.push(obj);
      }
    } catch (e) {
      str.push('*** ' + e + ' ***');
    }
  };

  helper(obj, '');
  return str.join('');
};


/**
 * Recursively outputs a nested array as a string.
 * @param {Array} arr The array.
 * @return {string} String representing nested array.
 */
goog.debug.exposeArray = function(arr) {
  var str = [];
  for (var i = 0; i < arr.length; i++) {
    if (goog.isArray(arr[i])) {
      str.push(goog.debug.exposeArray(arr[i]));
    } else {
      str.push(arr[i]);
    }
  }
  return '[ ' + str.join(', ') + ' ]';
};


/**
 * Exposes an exception that has been caught by a try...catch and outputs the
 * error with a stack trace.
 * @param {Object} err Error object or string.
 * @param {Function=} opt_fn Optional function to start stack trace from.
 * @return {string} Details of exception.
 */
goog.debug.exposeException = function(err, opt_fn) {
  /** @preserveTry */
  try {
    var e = goog.debug.normalizeErrorObject(err);

    // Create the error message
    var error = 'Message: ' + goog.string.htmlEscape(e.message) +
        '\nUrl: <a href="view-source:' + e.fileName + '" target="_new">' +
        e.fileName + '</a>\nLine: ' + e.lineNumber + '\n\nBrowser stack:\n' +
        goog.string.htmlEscape(e.stack + '-> ') +
        '[end]\n\nJS stack traversal:\n' + goog.string.htmlEscape(
            goog.debug.getStacktrace(opt_fn) + '-> ');
    return error;
  } catch (e2) {
    return 'Exception trying to expose exception! You win, we lose. ' + e2;
  }
};


/**
 * Normalizes the error/exception object between browsers.
 * @param {Object} err Raw error object.
 * @return {Object} Normalized error object.
 */
goog.debug.normalizeErrorObject = function(err) {
  var href = goog.getObjectByName('window.location.href');
  if (goog.isString(err)) {
    return {
      'message': err,
      'name': 'Unknown error',
      'lineNumber': 'Not available',
      'fileName': href,
      'stack': 'Not available'
    };
  }

  var lineNumber, fileName;
  var threwError = false;

  try {
    lineNumber = err.lineNumber || err.line || 'Not available';
  } catch (e) {
    // Firefox 2 sometimes throws an error when accessing 'lineNumber':
    // Message: Permission denied to get property UnnamedClass.lineNumber
    lineNumber = 'Not available';
    threwError = true;
  }

  try {
    fileName = err.fileName || err.filename || err.sourceURL || href;
  } catch (e) {
    // Firefox 2 may also throw an error when accessing 'filename'.
    fileName = 'Not available';
    threwError = true;
  }

  // The IE Error object contains only the name and the message.
  // The Safari Error object uses the line and sourceURL fields.
  if (threwError || !err.lineNumber || !err.fileName || !err.stack) {
    return {
      'message': err.message,
      'name': err.name,
      'lineNumber': lineNumber,
      'fileName': fileName,
      'stack': err.stack || 'Not available'
    };
  }

  // Standards error object
  return err;
};


/**
 * Converts an object to an Error if it's a String,
 * adds a stacktrace if there isn't one,
 * and optionally adds an extra message.
 * @param {Error|string} err  the original thrown object or string.
 * @param {string=} opt_message  optional additional message to add to the
 *     error.
 * @return {Error} If err is a string, it is used to create a new Error,
 *     which is enhanced and returned.  Otherwise err itself is enhanced
 *     and returned.
 */
goog.debug.enhanceError = function(err, opt_message) {
  var error = typeof err == 'string' ? Error(err) : err;
  if (!error.stack) {
    error.stack = goog.debug.getStacktrace(arguments.callee.caller);
  }
  if (opt_message) {
    // find the first unoccupied 'messageX' property
    var x = 0;
    while (error['message' + x]) {
      ++x;
    }
    error['message' + x] = String(opt_message);
  }
  return error;
};


/**
 * Gets the current stack trace. Simple and iterative - doesn't worry about
 * catching circular references or getting the args.
 * @param {number=} opt_depth Optional maximum depth to trace back to.
 * @return {string} A string with the function names of all functions in the
 *     stack, separated by \n.
 */
goog.debug.getStacktraceSimple = function(opt_depth) {
  var sb = [];
  var fn = arguments.callee.caller;
  var depth = 0;

  while (fn && (!opt_depth || depth < opt_depth)) {
    sb.push(goog.debug.getFunctionName(fn));
    sb.push('()\n');
    /** @preserveTry */
    try {
      fn = fn.caller;
    } catch (e) {
      sb.push('[exception trying to get caller]\n');
      break;
    }
    depth++;
    if (depth >= goog.debug.MAX_STACK_DEPTH) {
      sb.push('[...long stack...]');
      break;
    }
  }
  if (opt_depth && depth >= opt_depth) {
    sb.push('[...reached max depth limit...]');
  } else {
    sb.push('[end]');
  }

  return sb.join('');
};


/**
 * Max length of stack to try and output
 * @type {number}
 */
goog.debug.MAX_STACK_DEPTH = 50;


/**
 * Gets the current stack trace, either starting from the caller or starting
 * from a specified function that's currently on the call stack.
 * @param {Function=} opt_fn Optional function to start getting the trace from.
 *     If not provided, defaults to the function that called this.
 * @return {string} Stack trace.
 */
goog.debug.getStacktrace = function(opt_fn) {
  return goog.debug.getStacktraceHelper_(opt_fn || arguments.callee.caller, []);
};


/**
 * Private helper for getStacktrace().
 * @param {Function} fn Function to start getting the trace from.
 * @param {Array} visited List of functions visited so far.
 * @return {string} Stack trace starting from function fn.
 * @private
 */
goog.debug.getStacktraceHelper_ = function(fn, visited) {
  var sb = [];

  // Circular reference, certain functions like bind seem to cause a recursive
  // loop so we need to catch circular references
  if (goog.array.contains(visited, fn)) {
    sb.push('[...circular reference...]');

  // Traverse the call stack until function not found or max depth is reached
  } else if (fn && visited.length < goog.debug.MAX_STACK_DEPTH) {
    sb.push(goog.debug.getFunctionName(fn) + '(');
    var args = fn.arguments;
    for (var i = 0; i < args.length; i++) {
      if (i > 0) {
        sb.push(', ');
      }
      var argDesc;
      var arg = args[i];
      switch (typeof arg) {
        case 'object':
          argDesc = arg ? 'object' : 'null';
          break;

        case 'string':
          argDesc = arg;
          break;

        case 'number':
          argDesc = String(arg);
          break;

        case 'boolean':
          argDesc = arg ? 'true' : 'false';
          break;

        case 'function':
          argDesc = goog.debug.getFunctionName(arg);
          argDesc = argDesc ? argDesc : '[fn]';
          break;

        case 'undefined':
        default:
          argDesc = typeof arg;
          break;
      }

      if (argDesc.length > 40) {
        argDesc = argDesc.substr(0, 40) + '...';
      }
      sb.push(argDesc);
    }
    visited.push(fn);
    sb.push(')\n');
    /** @preserveTry */
    try {
      sb.push(goog.debug.getStacktraceHelper_(fn.caller, visited));
    } catch (e) {
      sb.push('[exception trying to get caller]\n');
    }

  } else if (fn) {
    sb.push('[...long stack...]');
  } else {
    sb.push('[end]');
  }
  return sb.join('');
};


/**
 * Set a custom function name resolver.
 * @param {function(Function): string} resolver Resolves functions to their
 *     names.
 */
goog.debug.setFunctionResolver = function(resolver) {
  goog.debug.fnNameResolver_ = resolver;
};


/**
 * Gets a function name
 * @param {Function} fn Function to get name of.
 * @return {string} Function's name.
 */
goog.debug.getFunctionName = function(fn) {
  if (goog.debug.fnNameCache_[fn]) {
    return goog.debug.fnNameCache_[fn];
  }
  if (goog.debug.fnNameResolver_) {
    var name = goog.debug.fnNameResolver_(fn);
    if (name) {
      goog.debug.fnNameCache_[fn] = name;
      return name;
    }
  }

  // Heuristically determine function name based on code.
  var functionSource = String(fn);
  if (!goog.debug.fnNameCache_[functionSource]) {
    var matches = /function ([^\(]+)/.exec(functionSource);
    if (matches) {
      var method = matches[1];
      goog.debug.fnNameCache_[functionSource] = method;
    } else {
      goog.debug.fnNameCache_[functionSource] = '[Anonymous]';
    }
  }

  return goog.debug.fnNameCache_[functionSource];
};


/**
 * Makes whitespace visible by replacing it with printable characters.
 * This is useful in finding diffrences between the expected and the actual
 * output strings of a testcase.
 * @param {string} string whose whitespace needs to be made visible.
 * @return {string} string whose whitespace is made visible.
 */
goog.debug.makeWhitespaceVisible = function(string) {
  return string.replace(/ /g, '[_]')
      .replace(/\f/g, '[f]')
      .replace(/\n/g, '[n]\n')
      .replace(/\r/g, '[r]')
      .replace(/\t/g, '[t]');
};


/**
 * Hash map for storing function names that have already been looked up.
 * @type {Object}
 * @private
 */
goog.debug.fnNameCache_ = {};


/**
 * Resolves functions to their names.  Resolved function names will be cached.
 * @type {function(Function):string}
 * @private
 */
goog.debug.fnNameResolver_;
// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Definition of the LogRecord class. Please minimize
 * dependencies this file has on other closure classes as any dependency it
 * takes won't be able to use the logging infrastructure.
 *
 */

goog.provide('goog.debug.LogRecord');



/**
 * LogRecord objects are used to pass logging requests between
 * the logging framework and individual log Handlers.
 * @constructor
 * @param {goog.debug.Logger.Level} level One of the level identifiers.
 * @param {string} msg The string message.
 * @param {string} loggerName The name of the source logger.
 * @param {number=} opt_time Time this log record was created if other than now.
 *     If 0, we use #goog.now.
 * @param {number=} opt_sequenceNumber Sequence number of this log record. This
 *     should only be passed in when restoring a log record from persistence.
 */
goog.debug.LogRecord = function(level, msg, loggerName,
    opt_time, opt_sequenceNumber) {
  this.reset(level, msg, loggerName, opt_time, opt_sequenceNumber);
};


/**
 * Time the LogRecord was created.
 * @type {number}
 * @private
 */
goog.debug.LogRecord.prototype.time_;


/**
 * Level of the LogRecord
 * @type {goog.debug.Logger.Level}
 * @private
 */
goog.debug.LogRecord.prototype.level_;


/**
 * Message associated with the record
 * @type {string}
 * @private
 */
goog.debug.LogRecord.prototype.msg_;


/**
 * Name of the logger that created the record.
 * @type {string}
 * @private
 */
goog.debug.LogRecord.prototype.loggerName_;


/**
 * Sequence number for the LogRecord. Each record has a unique sequence number
 * that is greater than all log records created before it.
 * @type {number}
 * @private
 */
goog.debug.LogRecord.prototype.sequenceNumber_ = 0;


/**
 * Exception associated with the record
 * @type {Object}
 * @private
 */
goog.debug.LogRecord.prototype.exception_ = null;


/**
 * Exception text associated with the record
 * @type {?string}
 * @private
 */
goog.debug.LogRecord.prototype.exceptionText_ = null;


/**
 * @define {boolean} Whether to enable log sequence numbers.
 */
goog.debug.LogRecord.ENABLE_SEQUENCE_NUMBERS = true;


/**
 * A sequence counter for assigning increasing sequence numbers to LogRecord
 * objects.
 * @type {number}
 * @private
 */
goog.debug.LogRecord.nextSequenceNumber_ = 0;


/**
 * Sets all fields of the log record.
 * @param {goog.debug.Logger.Level} level One of the level identifiers.
 * @param {string} msg The string message.
 * @param {string} loggerName The name of the source logger.
 * @param {number=} opt_time Time this log record was created if other than now.
 *     If 0, we use #goog.now.
 * @param {number=} opt_sequenceNumber Sequence number of this log record. This
 *     should only be passed in when restoring a log record from persistence.
 */
goog.debug.LogRecord.prototype.reset = function(level, msg, loggerName,
    opt_time, opt_sequenceNumber) {
  if (goog.debug.LogRecord.ENABLE_SEQUENCE_NUMBERS) {
    this.sequenceNumber_ = typeof opt_sequenceNumber == 'number' ?
        opt_sequenceNumber : goog.debug.LogRecord.nextSequenceNumber_++;
  }

  this.time_ = opt_time || goog.now();
  this.level_ = level;
  this.msg_ = msg;
  this.loggerName_ = loggerName;
  delete this.exception_;
  delete this.exceptionText_;
};


/**
 * Get the source Logger's name.
 *
 * @return {string} source logger name (may be null).
 */
goog.debug.LogRecord.prototype.getLoggerName = function() {
  return this.loggerName_;
};


/**
 * Get the exception that is part of the log record.
 *
 * @return {Object} the exception.
 */
goog.debug.LogRecord.prototype.getException = function() {
  return this.exception_;
};


/**
 * Set the exception that is part of the log record.
 *
 * @param {Object} exception the exception.
 */
goog.debug.LogRecord.prototype.setException = function(exception) {
  this.exception_ = exception;
};


/**
 * Get the exception text that is part of the log record.
 *
 * @return {?string} Exception text.
 */
goog.debug.LogRecord.prototype.getExceptionText = function() {
  return this.exceptionText_;
};


/**
 * Set the exception text that is part of the log record.
 *
 * @param {string} text The exception text.
 */
goog.debug.LogRecord.prototype.setExceptionText = function(text) {
  this.exceptionText_ = text;
};


/**
 * Get the source Logger's name.
 *
 * @param {string} loggerName source logger name (may be null).
 */
goog.debug.LogRecord.prototype.setLoggerName = function(loggerName) {
  this.loggerName_ = loggerName;
};


/**
 * Get the logging message level, for example Level.SEVERE.
 * @return {goog.debug.Logger.Level} the logging message level.
 */
goog.debug.LogRecord.prototype.getLevel = function() {
  return this.level_;
};


/**
 * Set the logging message level, for example Level.SEVERE.
 * @param {goog.debug.Logger.Level} level the logging message level.
 */
goog.debug.LogRecord.prototype.setLevel = function(level) {
  this.level_ = level;
};


/**
 * Get the "raw" log message, before localization or formatting.
 *
 * @return {string} the raw message string.
 */
goog.debug.LogRecord.prototype.getMessage = function() {
  return this.msg_;
};


/**
 * Set the "raw" log message, before localization or formatting.
 *
 * @param {string} msg the raw message string.
 */
goog.debug.LogRecord.prototype.setMessage = function(msg) {
  this.msg_ = msg;
};


/**
 * Get event time in milliseconds since 1970.
 *
 * @return {number} event time in millis since 1970.
 */
goog.debug.LogRecord.prototype.getMillis = function() {
  return this.time_;
};


/**
 * Set event time in milliseconds since 1970.
 *
 * @param {number} time event time in millis since 1970.
 */
goog.debug.LogRecord.prototype.setMillis = function(time) {
  this.time_ = time;
};


/**
 * Get the sequence number.
 * <p>
 * Sequence numbers are normally assigned in the LogRecord
 * constructor, which assigns unique sequence numbers to
 * each new LogRecord in increasing order.
 * @return {number} the sequence number.
 */
goog.debug.LogRecord.prototype.getSequenceNumber = function() {
  return this.sequenceNumber_;
};

// Copyright 2010 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview A buffer for log records. The purpose of this is to improve
 * logging performance by re-using old objects when the buffer becomes full and
 * to eliminate the need for each app to implement their own log buffer. The
 * disadvantage to doing this is that log handlers cannot maintain references to
 * log records and expect that they are not overwriten at a later point.
 *
 * @author agrieve@google.com (Andrew Grieve)
 */

goog.provide('goog.debug.LogBuffer');

goog.require('goog.asserts');
goog.require('goog.debug.LogRecord');



/**
 * Creates the log buffer.
 * @constructor
 */
goog.debug.LogBuffer = function() {
  goog.asserts.assert(goog.debug.LogBuffer.isBufferingEnabled(),
      'Cannot use goog.debug.LogBuffer without defining ' +
      'goog.debug.LogBuffer.CAPACITY.');
  this.clear();
};


/**
 * A static method that always returns the same instance of LogBuffer.
 * @return {!goog.debug.LogBuffer} The LogBuffer singleton instance.
 */
goog.debug.LogBuffer.getInstance = function() {
  if (!goog.debug.LogBuffer.instance_) {
    // This function is written with the return statement after the assignment
    // to avoid the jscompiler StripCode bug described in http://b/2608064.
    // After that bug is fixed this can be refactored.
    goog.debug.LogBuffer.instance_ = new goog.debug.LogBuffer();
  }
  return goog.debug.LogBuffer.instance_;
};


/**
 * @define {number} The number of log records to buffer. 0 means disable
 * buffering.
 */
goog.debug.LogBuffer.CAPACITY = 0;


/**
 * The array to store the records.
 * @type {!Array.<!goog.debug.LogRecord|undefined>}
 * @private
 */
goog.debug.LogBuffer.prototype.buffer_;


/**
 * The index of the most recently added record or -1 if there are no records.
 * @type {number}
 * @private
 */
goog.debug.LogBuffer.prototype.curIndex_;


/**
 * Whether the buffer is at capacity.
 * @type {boolean}
 * @private
 */
goog.debug.LogBuffer.prototype.isFull_;


/**
 * Adds a log record to the buffer, possibly overwriting the oldest record.
 * @param {goog.debug.Logger.Level} level One of the level identifiers.
 * @param {string} msg The string message.
 * @param {string} loggerName The name of the source logger.
 * @return {!goog.debug.LogRecord} The log record.
 */
goog.debug.LogBuffer.prototype.addRecord = function(level, msg, loggerName) {
  var curIndex = (this.curIndex_ + 1) % goog.debug.LogBuffer.CAPACITY;
  this.curIndex_ = curIndex;
  if (this.isFull_) {
    var ret = this.buffer_[curIndex];
    ret.reset(level, msg, loggerName);
    return ret;
  }
  this.isFull_ = curIndex == goog.debug.LogBuffer.CAPACITY - 1;
  return this.buffer_[curIndex] =
      new goog.debug.LogRecord(level, msg, loggerName);
};


/**
 * @return {boolean} Whether the log buffer is enabled.
 */
goog.debug.LogBuffer.isBufferingEnabled = function() {
  return goog.debug.LogBuffer.CAPACITY > 0;
};


/**
 * Removes all buffered log records.
 */
goog.debug.LogBuffer.prototype.clear = function() {
  this.buffer_ = new Array(goog.debug.LogBuffer.CAPACITY);
  this.curIndex_ = -1;
  this.isFull_ = false;
};


/**
 * Calls the given function for each buffered log record, starting with the
 * oldest one.
 * @param {function(!goog.debug.LogRecord)} func The function to call.
 */
goog.debug.LogBuffer.prototype.forEachRecord = function(func) {
  var buffer = this.buffer_;
  // Corner case: no records.
  if (!buffer[0]) {
    return;
  }
  var curIndex = this.curIndex_;
  var i = this.isFull_ ? curIndex : -1;
  do {
    i = (i + 1) % goog.debug.LogBuffer.CAPACITY;
    func(/** @type {!goog.debug.LogRecord} */ (buffer[i]));
  } while (i != curIndex);
};

// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Definition of the Logger class. Please minimize dependencies
 * this file has on other closure classes as any dependency it takes won't be
 * able to use the logging infrastructure.
 *
 * @see ../demos/debug.html
 */

goog.provide('goog.debug.LogManager');
goog.provide('goog.debug.Logger');
goog.provide('goog.debug.Logger.Level');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.debug');
goog.require('goog.debug.LogBuffer');
goog.require('goog.debug.LogRecord');



/**
 * The Logger is an object used for logging debug messages. Loggers are
 * normally named, using a hierarchical dot-separated namespace. Logger names
 * can be arbitrary strings, but they should normally be based on the package
 * name or class name of the logged component, such as goog.net.BrowserChannel.
 *
 * The Logger object is loosely based on the java class
 * java.util.logging.Logger. It supports different levels of filtering for
 * different loggers.
 *
 * The logger object should never be instantiated by application code. It
 * should always use the goog.debug.Logger.getLogger function.
 *
 * @constructor
 * @param {string} name The name of the Logger.
 */
goog.debug.Logger = function(name) {
  /**
   * Name of the Logger. Generally a dot-separated namespace
   * @type {string}
   * @private
   */
  this.name_ = name;
};


/**
 * Parent Logger.
 * @type {goog.debug.Logger}
 * @private
 */
goog.debug.Logger.prototype.parent_ = null;


/**
 * Level that this logger only filters above. Null indicates it should
 * inherit from the parent.
 * @type {goog.debug.Logger.Level}
 * @private
 */
goog.debug.Logger.prototype.level_ = null;


/**
 * Map of children loggers. The keys are the leaf names of the children and
 * the values are the child loggers.
 * @type {Object}
 * @private
 */
goog.debug.Logger.prototype.children_ = null;


/**
 * Handlers that are listening to this logger.
 * @type {Array.<Function>}
 * @private
 */
goog.debug.Logger.prototype.handlers_ = null;


/**
 * @define {boolean} Toggles whether loggers other than the root logger can have
 *     log handlers attached to them and whether they can have their log level
 *     set. Logging is a bit faster when this is set to false.
 */
goog.debug.Logger.ENABLE_HIERARCHY = true;


if (!goog.debug.Logger.ENABLE_HIERARCHY) {
  /**
   * @type {!Array.<Function>}
   * @private
   */
  goog.debug.Logger.rootHandlers_ = [];


  /**
   * @type {goog.debug.Logger.Level}
   * @private
   */
  goog.debug.Logger.rootLevel_;
}



/**
 * The Level class defines a set of standard logging levels that
 * can be used to control logging output.  The logging Level objects
 * are ordered and are specified by ordered integers.  Enabling logging
 * at a given level also enables logging at all higher levels.
 * <p>
 * Clients should normally use the predefined Level constants such
 * as Level.SEVERE.
 * <p>
 * The levels in descending order are:
 * <ul>
 * <li>SEVERE (highest value)
 * <li>WARNING
 * <li>INFO
 * <li>CONFIG
 * <li>FINE
 * <li>FINER
 * <li>FINEST  (lowest value)
 * </ul>
 * In addition there is a level OFF that can be used to turn
 * off logging, and a level ALL that can be used to enable
 * logging of all messages.
 *
 * @param {string} name The name of the level.
 * @param {number} value The numeric value of the level.
 * @constructor
 */
goog.debug.Logger.Level = function(name, value) {
  /**
   * The name of the level
   * @type {string}
   */
  this.name = name;

  /**
   * The numeric value of the level
   * @type {number}
   */
  this.value = value;
};


/**
 * @return {string} String representation of the logger level.
 */
goog.debug.Logger.Level.prototype.toString = function() {
  return this.name;
};


/**
 * OFF is a special level that can be used to turn off logging.
 * This level is initialized to <CODE>Number.MAX_VALUE</CODE>.
 * @type {!goog.debug.Logger.Level}
 */
goog.debug.Logger.Level.OFF =
    new goog.debug.Logger.Level('OFF', Infinity);


/**
 * SHOUT is a message level for extra debugging loudness.
 * This level is initialized to <CODE>1200</CODE>.
 * @type {!goog.debug.Logger.Level}
 */
goog.debug.Logger.Level.SHOUT = new goog.debug.Logger.Level('SHOUT', 1200);


/**
 * SEVERE is a message level indicating a serious failure.
 * This level is initialized to <CODE>1000</CODE>.
 * @type {!goog.debug.Logger.Level}
 */
goog.debug.Logger.Level.SEVERE = new goog.debug.Logger.Level('SEVERE', 1000);


/**
 * WARNING is a message level indicating a potential problem.
 * This level is initialized to <CODE>900</CODE>.
 * @type {!goog.debug.Logger.Level}
 */
goog.debug.Logger.Level.WARNING = new goog.debug.Logger.Level('WARNING', 900);


/**
 * INFO is a message level for informational messages.
 * This level is initialized to <CODE>800</CODE>.
 * @type {!goog.debug.Logger.Level}
 */
goog.debug.Logger.Level.INFO = new goog.debug.Logger.Level('INFO', 800);


/**
 * CONFIG is a message level for static configuration messages.
 * This level is initialized to <CODE>700</CODE>.
 * @type {!goog.debug.Logger.Level}
 */
goog.debug.Logger.Level.CONFIG = new goog.debug.Logger.Level('CONFIG', 700);


/**
 * FINE is a message level providing tracing information.
 * This level is initialized to <CODE>500</CODE>.
 * @type {!goog.debug.Logger.Level}
 */
goog.debug.Logger.Level.FINE = new goog.debug.Logger.Level('FINE', 500);


/**
 * FINER indicates a fairly detailed tracing message.
 * This level is initialized to <CODE>400</CODE>.
 * @type {!goog.debug.Logger.Level}
 */
goog.debug.Logger.Level.FINER = new goog.debug.Logger.Level('FINER', 400);

/**
 * FINEST indicates a highly detailed tracing message.
 * This level is initialized to <CODE>300</CODE>.
 * @type {!goog.debug.Logger.Level}
 */

goog.debug.Logger.Level.FINEST = new goog.debug.Logger.Level('FINEST', 300);


/**
 * ALL indicates that all messages should be logged.
 * This level is initialized to <CODE>Number.MIN_VALUE</CODE>.
 * @type {!goog.debug.Logger.Level}
 */
goog.debug.Logger.Level.ALL = new goog.debug.Logger.Level('ALL', 0);


/**
 * The predefined levels.
 * @type {!Array.<!goog.debug.Logger.Level>}
 * @final
 */
goog.debug.Logger.Level.PREDEFINED_LEVELS = [
  goog.debug.Logger.Level.OFF,
  goog.debug.Logger.Level.SHOUT,
  goog.debug.Logger.Level.SEVERE,
  goog.debug.Logger.Level.WARNING,
  goog.debug.Logger.Level.INFO,
  goog.debug.Logger.Level.CONFIG,
  goog.debug.Logger.Level.FINE,
  goog.debug.Logger.Level.FINER,
  goog.debug.Logger.Level.FINEST,
  goog.debug.Logger.Level.ALL];


/**
 * A lookup map used to find the level object based on the name or value of
 * the level object.
 * @type {Object}
 * @private
 */
goog.debug.Logger.Level.predefinedLevelsCache_ = null;


/**
 * Creates the predefined levels cache and populates it.
 * @private
 */
goog.debug.Logger.Level.createPredefinedLevelsCache_ = function() {
  goog.debug.Logger.Level.predefinedLevelsCache_ = {};
  for (var i = 0, level; level = goog.debug.Logger.Level.PREDEFINED_LEVELS[i];
       i++) {
    goog.debug.Logger.Level.predefinedLevelsCache_[level.value] = level;
    goog.debug.Logger.Level.predefinedLevelsCache_[level.name] = level;
  }
};


/**
 * Gets the predefined level with the given name.
 * @param {string} name The name of the level.
 * @return {goog.debug.Logger.Level} The level, or null if none found.
 */
goog.debug.Logger.Level.getPredefinedLevel = function(name) {
  if (!goog.debug.Logger.Level.predefinedLevelsCache_) {
    goog.debug.Logger.Level.createPredefinedLevelsCache_();
  }

  return goog.debug.Logger.Level.predefinedLevelsCache_[name] || null;
};


/**
 * Gets the highest predefined level <= #value.
 * @param {number} value Level value.
 * @return {goog.debug.Logger.Level} The level, or null if none found.
 */
goog.debug.Logger.Level.getPredefinedLevelByValue = function(value) {
  if (!goog.debug.Logger.Level.predefinedLevelsCache_) {
    goog.debug.Logger.Level.createPredefinedLevelsCache_();
  }

  if (value in goog.debug.Logger.Level.predefinedLevelsCache_) {
    return goog.debug.Logger.Level.predefinedLevelsCache_[value];
  }

  for (var i = 0; i < goog.debug.Logger.Level.PREDEFINED_LEVELS.length; ++i) {
    var level = goog.debug.Logger.Level.PREDEFINED_LEVELS[i];
    if (level.value <= value) {
      return level;
    }
  }
  return null;
};


/**
 * Find or create a logger for a named subsystem. If a logger has already been
 * created with the given name it is returned. Otherwise a new logger is
 * created. If a new logger is created its log level will be configured based
 * on the LogManager configuration and it will configured to also send logging
 * output to its parent's handlers. It will be registered in the LogManager
 * global namespace.
 *
 * @param {string} name A name for the logger. This should be a dot-separated
 * name and should normally be based on the package name or class name of the
 * subsystem, such as goog.net.BrowserChannel.
 * @return {!goog.debug.Logger} The named logger.
 */
goog.debug.Logger.getLogger = function(name) {
  return goog.debug.LogManager.getLogger(name);
};


/**
 * Logs a message to profiling tools, if available.
 * {@see http://code.google.com/webtoolkit/speedtracer/logging-api.html}
 * {@see http://msdn.microsoft.com/en-us/library/dd433074(VS.85).aspx}
 * @param {string} msg The message to log.
 */
goog.debug.Logger.logToProfilers = function(msg) {
  // Using goog.global, as loggers might be used in window-less contexts.
  if (goog.global['console']) {
    if (goog.global['console']['timeStamp']) {
      // Logs a message to Firebug, Web Inspector, SpeedTracer, etc.
      goog.global['console']['timeStamp'](msg);
    } else if (goog.global['console']['markTimeline']) {
      // TODO(user): markTimeline is deprecated. Drop this else clause entirely
      // after Chrome M14 hits stable.
      goog.global['console']['markTimeline'](msg);
    }
  }

  if (goog.global['msWriteProfilerMark']) {
    // Logs a message to the Microsoft profiler
    goog.global['msWriteProfilerMark'](msg);
  }
};


/**
 * Gets the name of this logger.
 * @return {string} The name of this logger.
 */
goog.debug.Logger.prototype.getName = function() {
  return this.name_;
};


/**
 * Adds a handler to the logger. This doesn't use the event system because
 * we want to be able to add logging to the event system.
 * @param {Function} handler Handler function to add.
 */
goog.debug.Logger.prototype.addHandler = function(handler) {
  if (goog.debug.Logger.ENABLE_HIERARCHY) {
    if (!this.handlers_) {
      this.handlers_ = [];
    }
    this.handlers_.push(handler);
  } else {
    goog.asserts.assert(!this.name_,
        'Cannot call addHandler on a non-root logger when ' +
        'goog.debug.Logger.ENABLE_HIERARCHY is false.');
    goog.debug.Logger.rootHandlers_.push(handler);
  }
};


/**
 * Removes a handler from the logger. This doesn't use the event system because
 * we want to be able to add logging to the event system.
 * @param {Function} handler Handler function to remove.
 * @return {boolean} Whether the handler was removed.
 */
goog.debug.Logger.prototype.removeHandler = function(handler) {
  var handlers = goog.debug.Logger.ENABLE_HIERARCHY ? this.handlers_ :
      goog.debug.Logger.rootHandlers_;
  return !!handlers && goog.array.remove(handlers, handler);
};


/**
 * Returns the parent of this logger.
 * @return {goog.debug.Logger} The parent logger or null if this is the root.
 */
goog.debug.Logger.prototype.getParent = function() {
  return this.parent_;
};


/**
 * Returns the children of this logger as a map of the child name to the logger.
 * @return {!Object} The map where the keys are the child leaf names and the
 *     values are the Logger objects.
 */
goog.debug.Logger.prototype.getChildren = function() {
  if (!this.children_) {
    this.children_ = {};
  }
  return this.children_;
};


/**
 * Set the log level specifying which message levels will be logged by this
 * logger. Message levels lower than this value will be discarded.
 * The level value Level.OFF can be used to turn off logging. If the new level
 * is null, it means that this node should inherit its level from its nearest
 * ancestor with a specific (non-null) level value.
 *
 * @param {goog.debug.Logger.Level} level The new level.
 */
goog.debug.Logger.prototype.setLevel = function(level) {
  if (goog.debug.Logger.ENABLE_HIERARCHY) {
    this.level_ = level;
  } else {
    goog.asserts.assert(!this.name_,
        'Cannot call setLevel() on a non-root logger when ' +
        'goog.debug.Logger.ENABLE_HIERARCHY is false.');
    goog.debug.Logger.rootLevel_ = level;
  }
};


/**
 * Gets the log level specifying which message levels will be logged by this
 * logger. Message levels lower than this value will be discarded.
 * The level value Level.OFF can be used to turn off logging. If the level
 * is null, it means that this node should inherit its level from its nearest
 * ancestor with a specific (non-null) level value.
 *
 * @return {goog.debug.Logger.Level} The level.
 */
goog.debug.Logger.prototype.getLevel = function() {
  return this.level_;
};


/**
 * Returns the effective level of the logger based on its ancestors' levels.
 * @return {goog.debug.Logger.Level} The level.
 */
goog.debug.Logger.prototype.getEffectiveLevel = function() {
  if (!goog.debug.Logger.ENABLE_HIERARCHY) {
    return goog.debug.Logger.rootLevel_;
  }
  if (this.level_) {
    return this.level_;
  }
  if (this.parent_) {
    return this.parent_.getEffectiveLevel();
  }
  goog.asserts.fail('Root logger has no level set.');
  return null;
};


/**
 * Check if a message of the given level would actually be logged by this
 * logger. This check is based on the Loggers effective level, which may be
 * inherited from its parent.
 * @param {goog.debug.Logger.Level} level The level to check.
 * @return {boolean} Whether the message would be logged.
 */
goog.debug.Logger.prototype.isLoggable = function(level) {
  return level.value >= this.getEffectiveLevel().value;
};


/**
 * Log a message. If the logger is currently enabled for the
 * given message level then the given message is forwarded to all the
 * registered output Handler objects.
 * @param {goog.debug.Logger.Level} level One of the level identifiers.
 * @param {string} msg The string message.
 * @param {Error|Object=} opt_exception An exception associated with the
 *     message.
 */
goog.debug.Logger.prototype.log = function(level, msg, opt_exception) {
  // java caches the effective level, not sure it's necessary here
  if (this.isLoggable(level)) {
    this.doLogRecord_(this.getLogRecord(level, msg, opt_exception));
  }
};


/**
 * Creates a new log record and adds the exception (if present) to it.
 * @param {goog.debug.Logger.Level} level One of the level identifiers.
 * @param {string} msg The string message.
 * @param {Error|Object=} opt_exception An exception associated with the
 *     message.
 * @return {!goog.debug.LogRecord} A log record.
 */
goog.debug.Logger.prototype.getLogRecord = function(level, msg, opt_exception) {
  if (goog.debug.LogBuffer.isBufferingEnabled()) {
    var logRecord =
        goog.debug.LogBuffer.getInstance().addRecord(level, msg, this.name_);
  } else {
    logRecord = new goog.debug.LogRecord(level, String(msg), this.name_);
  }
  if (opt_exception) {
    logRecord.setException(opt_exception);
    logRecord.setExceptionText(
        goog.debug.exposeException(opt_exception, arguments.callee.caller));
  }
  return logRecord;
};


/**
 * Log a message at the Logger.Level.SHOUT level.
 * If the logger is currently enabled for the given message level then the
 * given message is forwarded to all the registered output Handler objects.
 * @param {string} msg The string message.
 * @param {Error=} opt_exception An exception associated with the message.
 */
goog.debug.Logger.prototype.shout = function(msg, opt_exception) {
  this.log(goog.debug.Logger.Level.SHOUT, msg, opt_exception);
};


/**
 * Log a message at the Logger.Level.SEVERE level.
 * If the logger is currently enabled for the given message level then the
 * given message is forwarded to all the registered output Handler objects.
 * @param {string} msg The string message.
 * @param {Error=} opt_exception An exception associated with the message.
 */
goog.debug.Logger.prototype.severe = function(msg, opt_exception) {
  this.log(goog.debug.Logger.Level.SEVERE, msg, opt_exception);
};


/**
 * Log a message at the Logger.Level.WARNING level.
 * If the logger is currently enabled for the given message level then the
 * given message is forwarded to all the registered output Handler objects.
 * @param {string} msg The string message.
 * @param {Error=} opt_exception An exception associated with the message.
 */
goog.debug.Logger.prototype.warning = function(msg, opt_exception) {
  this.log(goog.debug.Logger.Level.WARNING, msg, opt_exception);
};


/**
 * Log a message at the Logger.Level.INFO level.
 * If the logger is currently enabled for the given message level then the
 * given message is forwarded to all the registered output Handler objects.
 * @param {string} msg The string message.
 * @param {Error=} opt_exception An exception associated with the message.
 */
goog.debug.Logger.prototype.info = function(msg, opt_exception) {
  this.log(goog.debug.Logger.Level.INFO, msg, opt_exception);
};


/**
 * Log a message at the Logger.Level.CONFIG level.
 * If the logger is currently enabled for the given message level then the
 * given message is forwarded to all the registered output Handler objects.
 * @param {string} msg The string message.
 * @param {Error=} opt_exception An exception associated with the message.
 */
goog.debug.Logger.prototype.config = function(msg, opt_exception) {
  this.log(goog.debug.Logger.Level.CONFIG, msg, opt_exception);
};


/**
 * Log a message at the Logger.Level.FINE level.
 * If the logger is currently enabled for the given message level then the
 * given message is forwarded to all the registered output Handler objects.
 * @param {string} msg The string message.
 * @param {Error=} opt_exception An exception associated with the message.
 */
goog.debug.Logger.prototype.fine = function(msg, opt_exception) {
  this.log(goog.debug.Logger.Level.FINE, msg, opt_exception);
};


/**
 * Log a message at the Logger.Level.FINER level.
 * If the logger is currently enabled for the given message level then the
 * given message is forwarded to all the registered output Handler objects.
 * @param {string} msg The string message.
 * @param {Error=} opt_exception An exception associated with the message.
 */
goog.debug.Logger.prototype.finer = function(msg, opt_exception) {
  this.log(goog.debug.Logger.Level.FINER, msg, opt_exception);
};


/**
 * Log a message at the Logger.Level.FINEST level.
 * If the logger is currently enabled for the given message level then the
 * given message is forwarded to all the registered output Handler objects.
 * @param {string} msg The string message.
 * @param {Error=} opt_exception An exception associated with the message.
 */
goog.debug.Logger.prototype.finest = function(msg, opt_exception) {
  this.log(goog.debug.Logger.Level.FINEST, msg, opt_exception);
};


/**
 * Log a LogRecord. If the logger is currently enabled for the
 * given message level then the given message is forwarded to all the
 * registered output Handler objects.
 * @param {goog.debug.LogRecord} logRecord A log record to log.
 */
goog.debug.Logger.prototype.logRecord = function(logRecord) {
  if (this.isLoggable(logRecord.getLevel())) {
    this.doLogRecord_(logRecord);
  }
};


/**
 * Log a LogRecord.
 * @param {goog.debug.LogRecord} logRecord A log record to log.
 * @private
 */
goog.debug.Logger.prototype.doLogRecord_ = function(logRecord) {
  goog.debug.Logger.logToProfilers('log:' + logRecord.getMessage());
  if (goog.debug.Logger.ENABLE_HIERARCHY) {
    var target = this;
    while (target) {
      target.callPublish_(logRecord);
      target = target.getParent();
    }
  } else {
    for (var i = 0, handler; handler = goog.debug.Logger.rootHandlers_[i++]; ) {
      handler(logRecord);
    }
  }
};


/**
 * Calls the handlers for publish.
 * @param {goog.debug.LogRecord} logRecord The log record to publish.
 * @private
 */
goog.debug.Logger.prototype.callPublish_ = function(logRecord) {
  if (this.handlers_) {
    for (var i = 0, handler; handler = this.handlers_[i]; i++) {
      handler(logRecord);
    }
  }
};


/**
 * Sets the parent of this logger. This is used for setting up the logger tree.
 * @param {goog.debug.Logger} parent The parent logger.
 * @private
 */
goog.debug.Logger.prototype.setParent_ = function(parent) {
  this.parent_ = parent;
};


/**
 * Adds a child to this logger. This is used for setting up the logger tree.
 * @param {string} name The leaf name of the child.
 * @param {goog.debug.Logger} logger The child logger.
 * @private
 */
goog.debug.Logger.prototype.addChild_ = function(name, logger) {
  this.getChildren()[name] = logger;
};


/**
 * There is a single global LogManager object that is used to maintain a set of
 * shared state about Loggers and log services. This is loosely based on the
 * java class java.util.logging.LogManager.
 */
goog.debug.LogManager = {};


/**
 * Map of logger names to logger objects
 *
 * @type {!Object}
 * @private
 */
goog.debug.LogManager.loggers_ = {};


/**
 * The root logger which is the root of the logger tree.
 * @type {goog.debug.Logger}
 * @private
 */
goog.debug.LogManager.rootLogger_ = null;


/**
 * Initialize the LogManager if not already initialized
 */
goog.debug.LogManager.initialize = function() {
  if (!goog.debug.LogManager.rootLogger_) {
    goog.debug.LogManager.rootLogger_ = new goog.debug.Logger('');
    goog.debug.LogManager.loggers_[''] = goog.debug.LogManager.rootLogger_;
    goog.debug.LogManager.rootLogger_.setLevel(goog.debug.Logger.Level.CONFIG);
  }
};


/**
 * Returns all the loggers
 * @return {!Object} Map of logger names to logger objects.
 */
goog.debug.LogManager.getLoggers = function() {
  return goog.debug.LogManager.loggers_;
};


/**
 * Returns the root of the logger tree namespace, the logger with the empty
 * string as its name
 *
 * @return {!goog.debug.Logger} The root logger.
 */
goog.debug.LogManager.getRoot = function() {
  goog.debug.LogManager.initialize();
  return /** @type {!goog.debug.Logger} */ (goog.debug.LogManager.rootLogger_);
};


/**
 * Method to find a named logger.
 *
 * @param {string} name A name for the logger. This should be a dot-separated
 * name and should normally be based on the package name or class name of the
 * subsystem, such as goog.net.BrowserChannel.
 * @return {!goog.debug.Logger} The named logger.
 */
goog.debug.LogManager.getLogger = function(name) {
  goog.debug.LogManager.initialize();
  var ret = goog.debug.LogManager.loggers_[name];
  return ret || goog.debug.LogManager.createLogger_(name);
};


/**
 * Creates a function that can be passed to goog.debug.catchErrors. The function
 * will log all reported errors using the given logger.
 * @param {goog.debug.Logger=} opt_logger The logger to log the errors to.
 *     Defaults to the root logger.
 * @return {function(Object)} The created function.
 */
goog.debug.LogManager.createFunctionForCatchErrors = function(opt_logger) {
  return function(info) {
    var logger = opt_logger || goog.debug.LogManager.getRoot();
    logger.severe('Error: ' + info.message + ' (' + info.fileName +
                  ' @ Line: ' + info.line + ')');
  };
};


/**
 * Creates the named logger. Will also create the parents of the named logger
 * if they don't yet exist.
 * @param {string} name The name of the logger.
 * @return {!goog.debug.Logger} The named logger.
 * @private
 */
goog.debug.LogManager.createLogger_ = function(name) {
  // find parent logger
  var logger = new goog.debug.Logger(name);
  if (goog.debug.Logger.ENABLE_HIERARCHY) {
    var lastDotIndex = name.lastIndexOf('.');
    var parentName = name.substr(0, lastDotIndex);
    var leafName = name.substr(lastDotIndex + 1);
    var parentLogger = goog.debug.LogManager.getLogger(parentName);

    // tell the parent about the child and the child about the parent
    parentLogger.addChild_(leafName, logger);
    logger.setParent_(parentLogger);
  }

  goog.debug.LogManager.loggers_[name] = logger;
  return logger;
};
/**
 * Copyright 2000-2011 Athanasios Polychronakis. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * 
 * @author Athanasios Polychronakis <thanpolas@gmail.com>
 * createdate 25/May/2011
 *
 *********
 *  File:: system/valid.js
 *  Core validation functions file
 *********
 */


goog.provide('core.valid');


/**
 * Here we will store an array of bad password strings.
 * We ban certain very weak passwords from use
 */
core.valid.badPasswords = false;

/**
 * Checks a nickname against proper characters
 * and string length
 * we allow a-zA-Z0-9 _-.^[]|
 *
 * @param {string} string the nickname
 * @param {boolean} what [optional] if set to true we will return the illegal character
 */
core.valid.checkNick = function (string) {

    var err = core.err;

    if (!goog.isString(string)) {
        err('No nickname was entered');
        return false;
    }

    //prepare reg ex
    var lim = core.conf.userLengthLimits;
    var reg = '^[\\\w\\\d\\\_\\\-]{';
    reg += lim.nick_lo + "," + lim.nick_hi;
    reg += "}$";
    var r = new RegExp(reg, 'gi');


    //make the comparison
    if (-1 == string.search(r)) {
        err('Nickname not valid, please only use latin characters and numbers');
        return false;
    }

    return true;
}; // method checkNick




/**
 * Validates a Full Name string
 * We allow A-Za-z space and -
 *
 * @param {string} string
 * @return boolean
 */
core.valid.checkFullName = function (string)
{
    if (-1 == string.search(/^[a-zA-Z -]+$/)) {
        core.err(core.lang.user.register.valid_fname);
        return false;
    }
    return true;
}; // method core.valid.checkFullName


/**
 * Validates a password
 * We check if password is 6 chars or more
 * and we check against weak passwords
 *
 * @param {string} string The password
 * @return boolean
 */
core.valid.checkPass = function (string)
{
    //check for small password length
    if (string.length < core.conf.userLengthLimits.pass_lo) {
        core.err(core.lang.user.register.password_min);
        return false;
    }

    //check for max password length
    if (string.length > core.conf.userLengthLimits.pass_hi) {
        core.err(core.lang.user.register.password_max);
        return false;
    }

    //check if we have badPasswords loaded and check against them
    if (goog.isArray(core.valid.badPasswords)) {
        if(-1 < jQuery.inArray(string, core.valid.badPasswords)) {
            //password is weak
            core.err(core.lang.user.register.pass_weak);
            return false;
        }
    }
    return true;
}; // method core.valid.checkPass


/**
 * E-mail Validation
 * We expect an array that contains the element 'email'.
 *
 * regexp from:
 * http://regexlib.com/Search.aspx?k=&c=1&m=5&ps=20
 *
 * We will check:
 * - if string is string type
 * - String evaluates as an email
 * - Email already exists in our DB
 *
 * @param {string} string The email
 * @return boolean
 */
core.valid.checkEmail = function (string)
{
    var err = core.err;
    var lang = core.lang.user;

    if (!goog.isString(string)) {
        err('No email has been entered. Please retry');
        return false;
    }

    //check if string within character length limits
    var len = string.length;
    var lim = core.conf.userLengthLimits;
    if (lim.email_lo >  len || lim.email_hi < len) {
        err('The e-mail you entered is not valid');
        return false;
    }

    //perform string check
    if (-1 == string.search(/^[A-Za-z0-9](([_\.\-]?[a-zA-Z0-9]+)*)@([A-Za-z0-9]+)(([\.\-]?[a-zA-Z0-9]+)*)\.([A-Za-z]{2,})$/gi)) {
        err('The e-mail you entered is not valid');
        return false;
    }


    return true;

}; // method CheckEmail


/**
 * Copyright 2000-2011 Athanasios Polychronakis. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * 
 * @author Athanasios Polychronakis <thanpolas@gmail.com>
 * createdate 05/Jul/2010
 *
 *********
 *  File:: system/err.js  
 *  Error handling functions
 *********
 */


goog.provide('core.err');
goog.provide('core.error');

core.err = {};


/**
 * Hook or try{}catch(e) statements
 *
 * @param {object} e error object
 * @return {void}
 */
core.error = function (e)
{
    var g = goog;
    var log = g.debug.Logger.getLogger('core.error');

    //log.info(g.debug.expose(e));
    if (core.MOBILE) {
        var filename = e.name;
        var line = e.line;
        var msg = e.message;
        var source = e.sourceURL;
    } else {
      if (e.fileName) {
        var filename = e.fileName;
        var line = e.lineNumber;
        var msg = e.message;
        var source = '';
      } else {
        var filename = '';
        var line = '';
        var msg = e.message;
        var source = '';
      }
    }
    log.severe('Error! name:' + filename + ' line:' + line + ' msg:' + msg + ' source:' + source);
    if (core.WEB && console) { 
      console.debug('Error! name:' + filename + ' line:' + line + ' msg:' + msg + ' source:' + source);
    }
    
}; // method core.error



/**
 * Container for the error message
 */
core.err.msg = '';

/**
 * Simple setter for error message
 */
core.err = function(msg) {
    core.err.msg = msg;
};

/**
 * Simple getter for error message
 */
core.err.get = function () {
    return core.err.msg;
};
// Copyright 2011 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Date/time formatting symbols for all locales.
 *
 * This file is autogenerated by script.  See
 * http://go/generate_datetime_constants.py using the --for_closure flag.
 *
 * To reduce the file size (which may cause issues in some JS
 * developing environments), this file will only contain locales
 * that are usually supported by google products. It is a super
 * set of 40 languages. Rest of the data can be found in another file
 * named "datetimesymbolsext.js", which will be generated at the same
 * time as this file.
 * Before checkin, this file could have been manually edited. This is
 * to incorporate changes before we could correct CLDR. All manual
 * modification must be documented in this section, and should be
 * removed after those changes land to CLDR.
 */

goog.provide('goog.i18n.DateTimeSymbols');
goog.provide('goog.i18n.DateTimeSymbols_af');
goog.provide('goog.i18n.DateTimeSymbols_am');
goog.provide('goog.i18n.DateTimeSymbols_ar');
goog.provide('goog.i18n.DateTimeSymbols_bg');
goog.provide('goog.i18n.DateTimeSymbols_bn');
goog.provide('goog.i18n.DateTimeSymbols_ca');
goog.provide('goog.i18n.DateTimeSymbols_cs');
goog.provide('goog.i18n.DateTimeSymbols_da');
goog.provide('goog.i18n.DateTimeSymbols_de');
goog.provide('goog.i18n.DateTimeSymbols_de_AT');
goog.provide('goog.i18n.DateTimeSymbols_de_CH');
goog.provide('goog.i18n.DateTimeSymbols_el');
goog.provide('goog.i18n.DateTimeSymbols_en');
goog.provide('goog.i18n.DateTimeSymbols_en_AU');
goog.provide('goog.i18n.DateTimeSymbols_en_GB');
goog.provide('goog.i18n.DateTimeSymbols_en_IE');
goog.provide('goog.i18n.DateTimeSymbols_en_IN');
goog.provide('goog.i18n.DateTimeSymbols_en_ISO');
goog.provide('goog.i18n.DateTimeSymbols_en_SG');
goog.provide('goog.i18n.DateTimeSymbols_en_US');
goog.provide('goog.i18n.DateTimeSymbols_en_ZA');
goog.provide('goog.i18n.DateTimeSymbols_es');
goog.provide('goog.i18n.DateTimeSymbols_es_419');
goog.provide('goog.i18n.DateTimeSymbols_et');
goog.provide('goog.i18n.DateTimeSymbols_eu');
goog.provide('goog.i18n.DateTimeSymbols_fa');
goog.provide('goog.i18n.DateTimeSymbols_fi');
goog.provide('goog.i18n.DateTimeSymbols_fil');
goog.provide('goog.i18n.DateTimeSymbols_fr');
goog.provide('goog.i18n.DateTimeSymbols_fr_CA');
goog.provide('goog.i18n.DateTimeSymbols_gl');
goog.provide('goog.i18n.DateTimeSymbols_gsw');
goog.provide('goog.i18n.DateTimeSymbols_gu');
goog.provide('goog.i18n.DateTimeSymbols_he');
goog.provide('goog.i18n.DateTimeSymbols_hi');
goog.provide('goog.i18n.DateTimeSymbols_hr');
goog.provide('goog.i18n.DateTimeSymbols_hu');
goog.provide('goog.i18n.DateTimeSymbols_id');
goog.provide('goog.i18n.DateTimeSymbols_in');
goog.provide('goog.i18n.DateTimeSymbols_is');
goog.provide('goog.i18n.DateTimeSymbols_it');
goog.provide('goog.i18n.DateTimeSymbols_iw');
goog.provide('goog.i18n.DateTimeSymbols_ja');
goog.provide('goog.i18n.DateTimeSymbols_kn');
goog.provide('goog.i18n.DateTimeSymbols_ko');
goog.provide('goog.i18n.DateTimeSymbols_ln');
goog.provide('goog.i18n.DateTimeSymbols_lt');
goog.provide('goog.i18n.DateTimeSymbols_lv');
goog.provide('goog.i18n.DateTimeSymbols_ml');
goog.provide('goog.i18n.DateTimeSymbols_mr');
goog.provide('goog.i18n.DateTimeSymbols_ms');
goog.provide('goog.i18n.DateTimeSymbols_mt');
goog.provide('goog.i18n.DateTimeSymbols_nl');
goog.provide('goog.i18n.DateTimeSymbols_no');
goog.provide('goog.i18n.DateTimeSymbols_or');
goog.provide('goog.i18n.DateTimeSymbols_pl');
goog.provide('goog.i18n.DateTimeSymbols_pt');
goog.provide('goog.i18n.DateTimeSymbols_pt_BR');
goog.provide('goog.i18n.DateTimeSymbols_pt_PT');
goog.provide('goog.i18n.DateTimeSymbols_ro');
goog.provide('goog.i18n.DateTimeSymbols_ru');
goog.provide('goog.i18n.DateTimeSymbols_sk');
goog.provide('goog.i18n.DateTimeSymbols_sl');
goog.provide('goog.i18n.DateTimeSymbols_sq');
goog.provide('goog.i18n.DateTimeSymbols_sr');
goog.provide('goog.i18n.DateTimeSymbols_sv');
goog.provide('goog.i18n.DateTimeSymbols_sw');
goog.provide('goog.i18n.DateTimeSymbols_ta');
goog.provide('goog.i18n.DateTimeSymbols_te');
goog.provide('goog.i18n.DateTimeSymbols_th');
goog.provide('goog.i18n.DateTimeSymbols_tl');
goog.provide('goog.i18n.DateTimeSymbols_tr');
goog.provide('goog.i18n.DateTimeSymbols_uk');
goog.provide('goog.i18n.DateTimeSymbols_ur');
goog.provide('goog.i18n.DateTimeSymbols_vi');
goog.provide('goog.i18n.DateTimeSymbols_zh');
goog.provide('goog.i18n.DateTimeSymbols_zh_CN');
goog.provide('goog.i18n.DateTimeSymbols_zh_HK');
goog.provide('goog.i18n.DateTimeSymbols_zh_TW');
goog.provide('goog.i18n.DateTimeSymbols_zu');


/**
 * Date/time formatting symbols for locale en_ISO.
 */
goog.i18n.DateTimeSymbols_en_ISO = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O',
      'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July',
      'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
      'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul',
      'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday',
      'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday',
      'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE, y MMMM dd', 'y MMMM d', 'y MMM d', 'yyyy-MM-dd'],
  TIMEFORMATS: ['HH:mm:ss v', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  AVAILABLEFORMATS: {'Md': 'M/d', 'MMMMd': 'MMMM d', 'MMMd': 'MMM d'},
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale af.
 */
goog.i18n.DateTimeSymbols_af = {
  ERAS: ['v.C.', 'n.C.'],
  ERANAMES: ['voor Christus', 'na Christus'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O',
      'N', 'D'],
  MONTHS: ['Januarie', 'Februarie', 'Maart', 'April', 'Mei', 'Junie', 'Julie',
      'Augustus', 'September', 'Oktober', 'November', 'Desember'],
  STANDALONEMONTHS: ['Januarie', 'Februarie', 'Maart', 'April', 'Mei', 'Junie',
      'Julie', 'Augustus', 'September', 'Oktober', 'November', 'Desember'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep',
      'Okt', 'Nov', 'Des'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul',
      'Aug', 'Sep', 'Okt', 'Nov', 'Des'],
  WEEKDAYS: ['Sondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrydag',
      'Saterdag'],
  STANDALONEWEEKDAYS: ['Sondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag',
      'Vrydag', 'Saterdag'],
  SHORTWEEKDAYS: ['So', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Sa'],
  STANDALONESHORTWEEKDAYS: ['So', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Sa'],
  NARROWWEEKDAYS: ['S', 'M', 'D', 'W', 'D', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'D', 'W', 'D', 'V', 'S'],
  SHORTQUARTERS: ['K1', 'K2', 'K3', 'K4'],
  QUARTERS: ['1ste kwartaal', '2de kwartaal', '3de kwartaal', '4de kwartaal'],
  AMPMS: ['vm.', 'nm.'],
  DATEFORMATS: ['EEEE dd MMMM y', 'dd MMMM y', 'dd MMM y', 'yyyy-MM-dd'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale am.
 */
goog.i18n.DateTimeSymbols_am = {
  ERAS: ['ዓ/ዓ', 'ዓ/ም'],
  ERANAMES: ['ዓመተ ዓለም', 'ዓመተ ምሕረት'],
  NARROWMONTHS: ['ጃ', 'ፌ', 'ማ', 'ኤ', 'ሜ', 'ጁ', 'ጁ', 'ኦ', 'ሴ',
      'ኦ', 'ኖ', 'ዲ'],
  STANDALONENARROWMONTHS: ['ጃ', 'ፌ', 'ማ', 'ኤ', 'ሜ', 'ጁ', 'ጁ',
      'ኦ', 'ሴ', 'ኦ', 'ኖ', 'ዲ'],
  MONTHS: ['ጃንዩወሪ', 'ፌብሩወሪ', 'ማርች', 'ኤፕረል',
      'ሜይ', 'ጁን', 'ጁላይ', 'ኦገስት', 'ሴፕቴምበር',
      'ኦክተውበር', 'ኖቬምበር', 'ዲሴምበር'],
  STANDALONEMONTHS: ['ጃንዩወሪ', 'ፌብሩወሪ', 'ማርች',
      'ኤፕረል', 'ሜይ', 'ጁን', 'ጁላይ', 'ኦገስት',
      'ሴፕቴምበር', 'ኦክተውበር', 'ኖቬምበር',
      'ዲሴምበር'],
  SHORTMONTHS: ['ጃንዩ', 'ፌብሩ', 'ማርች', 'ኤፕረ', 'ሜይ',
      'ጁን', 'ጁላይ', 'ኦገስ', 'ሴፕቴ', 'ኦክተ', 'ኖቬም',
      'ዲሴም'],
  STANDALONESHORTMONTHS: ['ጃንዩ', 'ፌብሩ', 'ማርች', 'ኤፕረ',
      'ሜይ', 'ጁን', 'ጁላይ', 'ኦገስ', 'ሴፕቴ', 'ኦክተ',
      'ኖቬም', 'ዲሴም'],
  WEEKDAYS: ['እሑድ', 'ሰኞ', 'ማክሰኞ', 'ረቡዕ', 'ሐሙስ',
      'ዓርብ', 'ቅዳሜ'],
  STANDALONEWEEKDAYS: ['እሑድ', 'ሰኞ', 'ማክሰኞ', 'ረቡዕ',
      'ሐሙስ', 'ዓርብ', 'ቅዳሜ'],
  SHORTWEEKDAYS: ['እሑድ', 'ሰኞ', 'ማክሰ', 'ረቡዕ', 'ሐሙስ',
      'ዓርብ', 'ቅዳሜ'],
  STANDALONESHORTWEEKDAYS: ['እሑድ', 'ሰኞ', 'ማክሰ', 'ረቡዕ',
      'ሐሙስ', 'ዓርብ', 'ቅዳሜ'],
  NARROWWEEKDAYS: ['እ', 'ሰ', 'ማ', 'ረ', 'ሐ', 'ዓ', 'ቅ'],
  STANDALONENARROWWEEKDAYS: ['እ', 'ሰ', 'ማ', 'ረ', 'ሐ', 'ዓ', 'ቅ'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1ኛው ሩብ', 'ሁለተኛው ሩብ', '3ኛው ሩብ',
      '4ኛው ሩብ'],
  AMPMS: ['ጡዋት', 'ከሳዓት'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/yyyy'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale ar.
 */
goog.i18n.DateTimeSymbols_ar = {
  ERAS: ['ق.م', 'م'],
  ERANAMES: ['قبل الميلاد', 'ميلادي'],
  NARROWMONTHS: ['ي', 'ف', 'م', 'أ', 'و', 'ن', 'ل', 'غ', 'س', 'ك',
      'ب', 'د'],
  STANDALONENARROWMONTHS: ['ي', 'ف', 'م', 'أ', 'و', 'ن', 'ل', 'غ', 'س',
      'ك', 'ب', 'د'],
  MONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو',
      'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر',
      'نوفمبر', 'ديسمبر'],
  STANDALONEMONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل',
      'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر',
      'أكتوبر', 'نوفمبر', 'ديسمبر'],
  SHORTMONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل',
      'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر',
      'أكتوبر', 'نوفمبر', 'ديسمبر'],
  STANDALONESHORTMONTHS: ['يناير', 'فبراير', 'مارس',
      'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس',
      'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  WEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء',
      'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  STANDALONEWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء',
      'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  SHORTWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء',
      'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  STANDALONESHORTWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء',
      'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  NARROWWEEKDAYS: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
  STANDALONENARROWWEEKDAYS: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
  SHORTQUARTERS: ['الربع الأول', 'الربع الثاني',
      'الربع الثالث', 'الربع الرابع'],
  QUARTERS: ['الربع الأول', 'الربع الثاني',
      'الربع الثالث', 'الربع الرابع'],
  AMPMS: ['ص', 'م'],
  DATEFORMATS: ['EEEE، d MMMM، y', 'd MMMM، y', 'dd‏/MM‏/yyyy',
      'd‏/M‏/yyyy'],
  TIMEFORMATS: ['zzzz h:mm:ss a', 'z h:mm:ss a', 'h:mm:ss a', 'h:mm a'],
  FIRSTDAYOFWEEK: 5,
  WEEKENDRANGE: [4, 5],
  FIRSTWEEKCUTOFFDAY: 4
};


/**
 * Date/time formatting symbols for locale bg.
 */
goog.i18n.DateTimeSymbols_bg = {
  ERAS: ['пр. н. е.', 'от н. е.'],
  ERANAMES: ['пр.Хр.', 'сл.Хр.'],
  NARROWMONTHS: ['я', 'ф', 'м', 'а', 'м', 'ю', 'ю', 'а', 'с', 'о',
      'н', 'д'],
  STANDALONENARROWMONTHS: ['я', 'ф', 'м', 'а', 'м', 'ю', 'ю', 'а', 'с',
      'о', 'н', 'д'],
  MONTHS: ['януари', 'февруари', 'март', 'април',
      'май', 'юни', 'юли', 'август', 'септември',
      'октомври', 'ноември', 'декември'],
  STANDALONEMONTHS: ['януари', 'февруари', 'март',
      'април', 'май', 'юни', 'юли', 'август',
      'септември', 'октомври', 'ноември',
      'декември'],
  SHORTMONTHS: ['ян.', 'февр.', 'март', 'апр.', 'май', 'юни',
      'юли', 'авг.', 'септ.', 'окт.', 'ноем.', 'дек.'],
  STANDALONESHORTMONTHS: ['ян.', 'февр.', 'март', 'апр.', 'май',
      'юни', 'юли', 'авг.', 'септ.', 'окт.', 'ноем.',
      'дек.'],
  WEEKDAYS: ['неделя', 'понеделник', 'вторник',
      'сряда', 'четвъртък', 'петък', 'събота'],
  STANDALONEWEEKDAYS: ['неделя', 'понеделник', 'вторник',
      'сряда', 'четвъртък', 'петък', 'събота'],
  SHORTWEEKDAYS: ['нд', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'],
  STANDALONESHORTWEEKDAYS: ['нд', 'пн', 'вт', 'ср', 'чт', 'пт',
      'сб'],
  NARROWWEEKDAYS: ['н', 'п', 'в', 'с', 'ч', 'п', 'с'],
  STANDALONENARROWWEEKDAYS: ['н', 'п', 'в', 'с', 'ч', 'п', 'с'],
  SHORTQUARTERS: ['I трим.', 'II трим.', 'III трим.',
      'IV трим.'],
  QUARTERS: ['1-во тримесечие', '2-ро тримесечие',
      '3-то тримесечие', '4-то тримесечие'],
  AMPMS: ['пр. об.', 'сл. об.'],
  DATEFORMATS: ['dd MMMM y, EEEE', 'dd MMMM y', 'dd.MM.yyyy', 'dd.MM.yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale bn.
 */
goog.i18n.DateTimeSymbols_bn = {
  ERAS: ['খৃষ্টপূর্ব', 'খৃষ্টাব্দ'],
  ERANAMES: ['খৃষ্টপূর্ব', 'খৃষ্টাব্দ'],
  NARROWMONTHS: ['জা', 'ফে', 'মা', 'এ', 'মে', 'জুন',
      'জু', 'আ', 'সে', 'অ', 'ন', 'ডি'],
  STANDALONENARROWMONTHS: ['জা', 'ফে', 'মা', 'এ', 'মে',
      'জুন', 'জু', 'আ', 'সে', 'অ', 'ন', 'ডি'],
  MONTHS: ['জানুয়ারী', 'ফেব্রুয়ারী',
      'মার্চ', 'এপ্রিল', 'মে', 'জুন',
      'জুলাই', 'আগস্ট', 'সেপ্টেম্বর',
      'অক্টোবর', 'নভেম্বর',
      'ডিসেম্বর'],
  STANDALONEMONTHS: ['জানুয়ারী',
      'ফেব্রুয়ারী', 'মার্চ',
      'এপ্রিল', 'মে', 'জুন', 'জুলাই',
      'আগস্ট', 'সেপ্টেম্বর',
      'অক্টোবর', 'নভেম্বর',
      'ডিসেম্বর'],
  SHORTMONTHS: ['জানুয়ারী',
      'ফেব্রুয়ারী', 'মার্চ',
      'এপ্রিল', 'মে', 'জুন', 'জুলাই',
      'আগস্ট', 'সেপ্টেম্বর',
      'অক্টোবর', 'নভেম্বর',
      'ডিসেম্বর'],
  STANDALONESHORTMONTHS: ['জানুয়ারী',
      'ফেব্রুয়ারী', 'মার্চ',
      'এপ্রিল', 'মে', 'জুন', 'জুলাই',
      'আগস্ট', 'সেপ্টেম্বর',
      'অক্টোবর', 'নভেম্বর',
      'ডিসেম্বর'],
  WEEKDAYS: ['রবিবার', 'সোমবার',
      'মঙ্গলবার', 'বুধবার',
      'বৃহষ্পতিবার', 'শুক্রবার',
      'শনিবার'],
  STANDALONEWEEKDAYS: ['রবিবার', 'সোমবার',
      'মঙ্গলবার', 'বুধবার',
      'বৃহষ্পতিবার', 'শুক্রবার',
      'শনিবার'],
  SHORTWEEKDAYS: ['রবি', 'সোম', 'মঙ্গল', 'বুধ',
      'বৃহস্পতি', 'শুক্র', 'শনি'],
  STANDALONESHORTWEEKDAYS: ['রবি', 'সোম', 'মঙ্গল',
      'বুধ', 'বৃহস্পতি', 'শুক্র', 'শনি'],
  NARROWWEEKDAYS: ['র', 'সো', 'ম', 'বু', 'বৃ', 'শু', 'শ'],
  STANDALONENARROWWEEKDAYS: ['র', 'সো', 'ম', 'বু', 'বৃ',
      'শু', 'শ'],
  SHORTQUARTERS: ['চতুর্থাংশ ১',
      'চতুর্থাংশ ২', 'চতুর্থাংশ ৩',
      'চতুর্থাংশ ৪'],
  QUARTERS: ['প্রথম চতুর্থাংশ',
      'দ্বিতীয় চতুর্থাংশ',
      'তৃতীয় চতুর্থাংশ',
      'চতুর্থ চতুর্থাংশ'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM, y', 'd MMMM, y', 'd MMM, y', 'd/M/yy'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  FIRSTDAYOFWEEK: 4,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale ca.
 */
goog.i18n.DateTimeSymbols_ca = {
  ERAS: ['aC', 'dC'],
  ERANAMES: ['abans de Crist', 'després de Crist'],
  NARROWMONTHS: ['G', 'F', 'M', 'A', 'M', 'J', 'G', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['g', 'f', 'm', 'a', 'm', 'j', 'j', 'a', 's', 'o',
      'n', 'd'],
  MONTHS: ['de gener', 'de febrer', 'de març', 'd’abril', 'de maig',
      'de juny', 'de juliol', 'd’agost', 'de setembre', 'd’octubre',
      'de novembre', 'de desembre'],
  STANDALONEMONTHS: ['gener', 'febrer', 'març', 'abril', 'maig', 'juny',
      'juliol', 'agost', 'setembre', 'octubre', 'novembre', 'desembre'],
  SHORTMONTHS: ['de gen.', 'de febr.', 'de març', 'd’abr.', 'de maig',
      'de juny', 'de jul.', 'd’ag.', 'de set.', 'd’oct.', 'de nov.',
      'de des.'],
  STANDALONESHORTMONTHS: ['gen.', 'febr.', 'març', 'abr.', 'maig', 'juny',
      'jul.', 'ag.', 'set.', 'oct.', 'nov.', 'des.'],
  WEEKDAYS: ['diumenge', 'dilluns', 'dimarts', 'dimecres', 'dijous',
      'divendres', 'dissabte'],
  STANDALONEWEEKDAYS: ['Diumenge', 'Dilluns', 'Dimarts', 'Dimecres', 'Dijous',
      'Divendres', 'Dissabte'],
  SHORTWEEKDAYS: ['dg.', 'dl.', 'dt.', 'dc.', 'dj.', 'dv.', 'ds.'],
  STANDALONESHORTWEEKDAYS: ['dg', 'dl', 'dt', 'dc', 'dj', 'dv', 'ds'],
  NARROWWEEKDAYS: ['G', 'l', 'T', 'C', 'J', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['g', 'l', 't', 'c', 'j', 'v', 's'],
  SHORTQUARTERS: ['1T', '2T', '3T', '4T'],
  QUARTERS: ['1r trimestre', '2n trimestre', '3r trimestre', '4t trimestre'],
  AMPMS: ['a.m.', 'p.m.'],
  DATEFORMATS: ['EEEE d MMMM \'de\' y', 'd MMMM \'de\' y', 'dd/MM/yyyy',
      'dd/MM/yy'],
  TIMEFORMATS: ['H:mm:ss zzzz', 'H:mm:ss z', 'H:mm:ss', 'H:mm'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale cs.
 */
goog.i18n.DateTimeSymbols_cs = {
  ERAS: ['př. n. l.', 'n. l.'],
  ERANAMES: ['př. n. l.', 'n. l.'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['l', 'ú', 'b', 'd', 'k', 'č', 'č', 's', 'z', 'ř',
      'l', 'p'],
  MONTHS: ['ledna', 'února', 'března', 'dubna', 'května', 'června',
      'července', 'srpna', 'září', 'října', 'listopadu', 'prosince'],
  STANDALONEMONTHS: ['leden', 'únor', 'březen', 'duben', 'květen', 'červen',
      'červenec', 'srpen', 'září', 'říjen', 'listopad', 'prosinec'],
  SHORTMONTHS: ['Led', 'Úno', 'Bře', 'Dub', 'Kvě', 'Čer', 'Čvc', 'Srp',
      'Zář', 'Říj', 'Lis', 'Pro'],
  STANDALONESHORTMONTHS: ['1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.', '9.',
      '10.', '11.', '12.'],
  WEEKDAYS: ['neděle', 'pondělí', 'úterý', 'středa', 'čtvrtek', 'pátek',
      'sobota'],
  STANDALONEWEEKDAYS: ['neděle', 'pondělí', 'úterý', 'středa', 'čtvrtek',
      'pátek', 'sobota'],
  SHORTWEEKDAYS: ['ne', 'po', 'út', 'st', 'čt', 'pá', 'so'],
  STANDALONESHORTWEEKDAYS: ['ne', 'po', 'út', 'st', 'čt', 'pá', 'so'],
  NARROWWEEKDAYS: ['N', 'P', 'Ú', 'S', 'Č', 'P', 'S'],
  STANDALONENARROWWEEKDAYS: ['N', 'P', 'Ú', 'S', 'Č', 'P', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1. čtvrtletí', '2. čtvrtletí', '3. čtvrtletí',
      '4. čtvrtletí'],
  AMPMS: ['dop.', 'odp.'],
  DATEFORMATS: ['EEEE, d. MMMM y', 'd. MMMM y', 'd.M.yyyy', 'dd.MM.yy'],
  TIMEFORMATS: ['H:mm:ss zzzz', 'H:mm:ss z', 'H:mm:ss', 'H:mm'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale da.
 */
goog.i18n.DateTimeSymbols_da = {
  ERAS: ['f.Kr.', 'e.Kr.'],
  ERANAMES: ['f.Kr.', 'e.Kr.'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O',
      'N', 'D'],
  MONTHS: ['januar', 'februar', 'marts', 'april', 'maj', 'juni', 'juli',
      'august', 'september', 'oktober', 'november', 'december'],
  STANDALONEMONTHS: ['januar', 'februar', 'marts', 'april', 'maj', 'juni',
      'juli', 'august', 'september', 'oktober', 'november', 'december'],
  SHORTMONTHS: ['jan.', 'feb.', 'mar.', 'apr.', 'maj', 'jun.', 'jul.', 'aug.',
      'sep.', 'okt.', 'nov.', 'dec.'],
  STANDALONESHORTMONTHS: ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul',
      'aug', 'sep', 'okt', 'nov', 'dec'],
  WEEKDAYS: ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag',
      'lørdag'],
  STANDALONEWEEKDAYS: ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag',
      'fredag', 'lørdag'],
  SHORTWEEKDAYS: ['søn', 'man', 'tir', 'ons', 'tor', 'fre', 'lør'],
  STANDALONESHORTWEEKDAYS: ['søn', 'man', 'tir', 'ons', 'tor', 'fre', 'lør'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'O', 'T', 'F', 'L'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'O', 'T', 'F', 'L'],
  SHORTQUARTERS: ['K1', 'K2', 'K3', 'K4'],
  QUARTERS: ['1. kvartal', '2. kvartal', '3. kvartal', '4. kvartal'],
  AMPMS: ['f.m.', 'e.m.'],
  DATEFORMATS: ['EEEE \'den\' d. MMMM y', 'd. MMM y', 'dd/MM/yyyy', 'dd/MM/yy'],
  TIMEFORMATS: ['HH.mm.ss zzzz', 'HH.mm.ss z', 'HH.mm.ss', 'HH.mm'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale de.
 */
goog.i18n.DateTimeSymbols_de = {
  ERAS: ['v. Chr.', 'n. Chr.'],
  ERANAMES: ['v. Chr.', 'n. Chr.'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O',
      'N', 'D'],
  MONTHS: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli',
      'August', 'September', 'Oktober', 'November', 'Dezember'],
  STANDALONEMONTHS: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
      'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep',
      'Okt', 'Nov', 'Dez'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul',
      'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
  WEEKDAYS: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag',
      'Freitag', 'Samstag'],
  STANDALONEWEEKDAYS: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch',
      'Donnerstag', 'Freitag', 'Samstag'],
  SHORTWEEKDAYS: ['So.', 'Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.'],
  STANDALONESHORTWEEKDAYS: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
  NARROWWEEKDAYS: ['S', 'M', 'D', 'M', 'D', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'D', 'M', 'D', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1. Quartal', '2. Quartal', '3. Quartal', '4. Quartal'],
  AMPMS: ['vorm.', 'nachm.'],
  DATEFORMATS: ['EEEE, d. MMMM y', 'd. MMMM y', 'dd.MM.yyyy', 'dd.MM.yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale de_AT.
 */
goog.i18n.DateTimeSymbols_de_AT = {
  ERAS: ['v. Chr.', 'n. Chr.'],
  ERANAMES: ['v. Chr.', 'n. Chr.'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O',
      'N', 'D'],
  MONTHS: ['Jänner', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli',
      'August', 'September', 'Oktober', 'November', 'Dezember'],
  STANDALONEMONTHS: ['Jänner', 'Februar', 'März', 'April', 'Mai', 'Juni',
      'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
  SHORTMONTHS: ['Jän', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep',
      'Okt', 'Nov', 'Dez'],
  STANDALONESHORTMONTHS: ['Jän', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul',
      'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
  WEEKDAYS: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag',
      'Freitag', 'Samstag'],
  STANDALONEWEEKDAYS: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch',
      'Donnerstag', 'Freitag', 'Samstag'],
  SHORTWEEKDAYS: ['So.', 'Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.'],
  STANDALONESHORTWEEKDAYS: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
  NARROWWEEKDAYS: ['S', 'M', 'D', 'M', 'D', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'D', 'M', 'D', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1. Quartal', '2. Quartal', '3. Quartal', '4. Quartal'],
  AMPMS: ['vorm.', 'nachm.'],
  DATEFORMATS: ['EEEE, dd. MMMM y', 'dd. MMMM y', 'dd.MM.yyyy', 'dd.MM.yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale de_CH.
 */
goog.i18n.DateTimeSymbols_de_CH = goog.i18n.DateTimeSymbols_de;


/**
 * Date/time formatting symbols for locale el.
 */
goog.i18n.DateTimeSymbols_el = {
  ERAS: ['π.Χ.', 'μ.Χ.'],
  ERANAMES: ['π.Χ.', 'μ.Χ.'],
  NARROWMONTHS: ['Ι', 'Φ', 'Μ', 'Α', 'Μ', 'Ι', 'Ι', 'Α', 'Σ', 'Ο',
      'Ν', 'Δ'],
  STANDALONENARROWMONTHS: ['Ι', 'Φ', 'Μ', 'Α', 'Μ', 'Ι', 'Ι', 'Α', 'Σ',
      'Ο', 'Ν', 'Δ'],
  MONTHS: ['Ιανουαρίου', 'Φεβρουαρίου', 'Μαρτίου',
      'Απριλίου', 'Μαΐου', 'Ιουνίου', 'Ιουλίου',
      'Αυγούστου', 'Σεπτεμβρίου', 'Οκτωβρίου',
      'Νοεμβρίου', 'Δεκεμβρίου'],
  STANDALONEMONTHS: ['Ιανουάριος', 'Φεβρουάριος',
      'Μάρτιος', 'Απρίλιος', 'Μάιος', 'Ιούνιος',
      'Ιούλιος', 'Αύγουστος', 'Σεπτέμβριος',
      'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος'],
  SHORTMONTHS: ['Ιαν', 'Φεβ', 'Μαρ', 'Απρ', 'Μαϊ', 'Ιουν',
      'Ιουλ', 'Αυγ', 'Σεπ', 'Οκτ', 'Νοε', 'Δεκ'],
  STANDALONESHORTMONTHS: ['Ιαν', 'Φεβ', 'Μάρ', 'Απρ', 'Μάι',
      'Ιούν', 'Ιούλ', 'Αυγ', 'Σεπ', 'Οκτ', 'Νοέ', 'Δεκ'],
  WEEKDAYS: ['Κυριακή', 'Δευτέρα', 'Τρίτη', 'Τετάρτη',
      'Πέμπτη', 'Παρασκευή', 'Σάββατο'],
  STANDALONEWEEKDAYS: ['Κυριακή', 'Δευτέρα', 'Τρίτη',
      'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο'],
  SHORTWEEKDAYS: ['Κυρ', 'Δευ', 'Τρι', 'Τετ', 'Πεμ', 'Παρ',
      'Σαβ'],
  STANDALONESHORTWEEKDAYS: ['Κυρ', 'Δευ', 'Τρί', 'Τετ', 'Πέμ',
      'Παρ', 'Σάβ'],
  NARROWWEEKDAYS: ['Κ', 'Δ', 'Τ', 'Τ', 'Π', 'Π', 'Σ'],
  STANDALONENARROWWEEKDAYS: ['Κ', 'Δ', 'Τ', 'Τ', 'Π', 'Π', 'Σ'],
  SHORTQUARTERS: ['Τ1', 'Τ2', 'Τ3', 'Τ4'],
  QUARTERS: ['1ο τρίμηνο', '2ο τρίμηνο', '3ο τρίμηνο',
      '4ο τρίμηνο'],
  AMPMS: ['π.μ.', 'μ.μ.'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'd/M/yy'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale en.
 */
goog.i18n.DateTimeSymbols_en = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O',
      'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July',
      'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
      'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul',
      'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday',
      'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday',
      'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE, MMMM d, y', 'MMMM d, y', 'MMM d, y', 'M/d/yy'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale en_AU.
 */
goog.i18n.DateTimeSymbols_en_AU = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O',
      'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July',
      'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
      'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul',
      'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday',
      'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday',
      'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'dd/MM/yyyy', 'd/MM/yy'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale en_GB.
 */
goog.i18n.DateTimeSymbols_en_GB = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O',
      'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July',
      'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
      'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul',
      'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday',
      'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday',
      'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/yyyy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale en_IE.
 */
goog.i18n.DateTimeSymbols_en_IE = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O',
      'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July',
      'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
      'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul',
      'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday',
      'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday',
      'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['a.m.', 'p.m.'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/yyyy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale en_IN.
 */
goog.i18n.DateTimeSymbols_en_IN = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O',
      'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July',
      'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
      'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul',
      'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday',
      'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday',
      'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'dd-MMM-y', 'dd/MM/yy'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [6, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale en_SG.
 */
goog.i18n.DateTimeSymbols_en_SG = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O',
      'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July',
      'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
      'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul',
      'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday',
      'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday',
      'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE, d MMMM, y', 'd MMMM, y', 'd MMM, y', 'd/M/yy'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale en_US.
 */
goog.i18n.DateTimeSymbols_en_US = goog.i18n.DateTimeSymbols_en;


/**
 * Date/time formatting symbols for locale en_ZA.
 */
goog.i18n.DateTimeSymbols_en_ZA = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O',
      'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July',
      'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
      'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul',
      'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday',
      'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday',
      'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE dd MMMM y', 'dd MMMM y', 'dd MMM y', 'yyyy/MM/dd'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale es.
 */
goog.i18n.DateTimeSymbols_es = {
  ERAS: ['a.C.', 'd.C.'],
  ERANAMES: ['antes de Cristo', 'anno Dómini'],
  NARROWMONTHS: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O',
      'N', 'D'],
  MONTHS: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
      'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  STANDALONEMONTHS: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  SHORTMONTHS: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep',
      'oct', 'nov', 'dic'],
  STANDALONESHORTMONTHS: ['ene', 'feb', 'mar', 'abr', 'mayo', 'jun', 'jul',
      'ago', 'sep', 'oct', 'nov', 'dic'],
  WEEKDAYS: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes',
      'sábado'],
  STANDALONEWEEKDAYS: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves',
      'viernes', 'sábado'],
  SHORTWEEKDAYS: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
  STANDALONESHORTWEEKDAYS: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1er trimestre', '2º trimestre', '3er trimestre',
      '4º trimestre'],
  AMPMS: ['a.m.', 'p.m.'],
  DATEFORMATS: ['EEEE d \'de\' MMMM \'de\' y', 'd \'de\' MMMM \'de\' y',
      'dd/MM/yyyy', 'dd/MM/yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale es_419.
 */
goog.i18n.DateTimeSymbols_es_419 = {
  ERAS: ['a.C.', 'd.C.'],
  ERANAMES: ['antes de Cristo', 'anno Dómini'],
  NARROWMONTHS: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O',
      'N', 'D'],
  MONTHS: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
      'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  STANDALONEMONTHS: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  SHORTMONTHS: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep',
      'oct', 'nov', 'dic'],
  STANDALONESHORTMONTHS: ['ene', 'feb', 'mar', 'abr', 'mayo', 'jun', 'jul',
      'ago', 'sep', 'oct', 'nov', 'dic'],
  WEEKDAYS: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes',
      'sábado'],
  STANDALONEWEEKDAYS: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves',
      'viernes', 'sábado'],
  SHORTWEEKDAYS: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
  STANDALONESHORTWEEKDAYS: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1er trimestre', '2º trimestre', '3er trimestre',
      '4º trimestre'],
  AMPMS: ['a.m.', 'p.m.'],
  DATEFORMATS: ['EEEE d \'de\' MMMM \'de\' y', 'd \'de\' MMMM \'de\' y',
      'dd/MM/yyyy', 'dd/MM/yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale et.
 */
goog.i18n.DateTimeSymbols_et = {
  ERAS: ['e.m.a.', 'm.a.j.'],
  ERANAMES: ['enne meie aega', 'meie aja järgi'],
  NARROWMONTHS: ['J', 'V', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'V', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O',
      'N', 'D'],
  MONTHS: ['jaanuar', 'veebruar', 'märts', 'aprill', 'mai', 'juuni', 'juuli',
      'august', 'september', 'oktoober', 'november', 'detsember'],
  STANDALONEMONTHS: ['jaanuar', 'veebruar', 'märts', 'aprill', 'mai', 'juuni',
      'juuli', 'august', 'september', 'oktoober', 'november', 'detsember'],
  SHORTMONTHS: ['jaan', 'veebr', 'märts', 'apr', 'mai', 'juuni', 'juuli',
      'aug', 'sept', 'okt', 'nov', 'dets'],
  STANDALONESHORTMONTHS: ['jaan', 'veebr', 'märts', 'apr', 'mai', 'juuni',
      'juuli', 'aug', 'sept', 'okt', 'nov', 'dets'],
  WEEKDAYS: ['pühapäev', 'esmaspäev', 'teisipäev', 'kolmapäev',
      'neljapäev', 'reede', 'laupäev'],
  STANDALONEWEEKDAYS: ['pühapäev', 'esmaspäev', 'teisipäev', 'kolmapäev',
      'neljapäev', 'reede', 'laupäev'],
  SHORTWEEKDAYS: ['P', 'E', 'T', 'K', 'N', 'R', 'L'],
  STANDALONESHORTWEEKDAYS: ['P', 'E', 'T', 'K', 'N', 'R', 'L'],
  NARROWWEEKDAYS: ['P', 'E', 'T', 'K', 'N', 'R', 'L'],
  STANDALONENARROWWEEKDAYS: ['P', 'E', 'T', 'K', 'N', 'R', 'L'],
  SHORTQUARTERS: ['K1', 'K2', 'K3', 'K4'],
  QUARTERS: ['1. kvartal', '2. kvartal', '3. kvartal', '4. kvartal'],
  AMPMS: ['enne keskpäeva', 'pärast keskpäeva'],
  DATEFORMATS: ['EEEE, d. MMMM y', 'd. MMMM y', 'dd.MM.yyyy', 'dd.MM.yy'],
  TIMEFORMATS: ['H:mm.ss zzzz', 'H:mm.ss z', 'H:mm.ss', 'H:mm'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale eu.
 */
goog.i18n.DateTimeSymbols_eu = {
  ERAS: ['K.a.', 'K.o.'],
  ERANAMES: ['K.a.', 'K.o.'],
  NARROWMONTHS: ['U', 'O', 'M', 'A', 'M', 'E', 'U', 'A', 'I', 'U', 'A', 'A'],
  STANDALONENARROWMONTHS: ['U', 'O', 'M', 'A', 'M', 'E', 'U', 'A', 'I', 'U',
      'A', 'A'],
  MONTHS: ['urtarrila', 'otsaila', 'martxoa', 'apirila', 'maiatza', 'ekaina',
      'uztaila', 'abuztua', 'iraila', 'urria', 'azaroa', 'abendua'],
  STANDALONEMONTHS: ['urtarrila', 'otsaila', 'martxoa', 'apirila', 'maiatza',
      'ekaina', 'uztaila', 'abuztua', 'iraila', 'urria', 'azaroa', 'abendua'],
  SHORTMONTHS: ['urt', 'ots', 'mar', 'api', 'mai', 'eka', 'uzt', 'abu', 'ira',
      'urr', 'aza', 'abe'],
  STANDALONESHORTMONTHS: ['urt', 'ots', 'mar', 'api', 'mai', 'eka', 'uzt',
      'abu', 'ira', 'urr', 'aza', 'abe'],
  WEEKDAYS: ['igandea', 'astelehena', 'asteartea', 'asteazkena', 'osteguna',
      'ostirala', 'larunbata'],
  STANDALONEWEEKDAYS: ['igandea', 'astelehena', 'asteartea', 'asteazkena',
      'osteguna', 'ostirala', 'larunbata'],
  SHORTWEEKDAYS: ['ig', 'al', 'as', 'az', 'og', 'or', 'lr'],
  STANDALONESHORTWEEKDAYS: ['ig', 'al', 'as', 'az', 'og', 'or', 'lr'],
  NARROWWEEKDAYS: ['I', 'M', 'A', 'A', 'A', 'O', 'I'],
  STANDALONENARROWWEEKDAYS: ['I', 'M', 'A', 'L', 'A', 'O', 'I'],
  SHORTQUARTERS: ['1Hh', '2Hh', '3Hh', '4Hh'],
  QUARTERS: ['1. hiruhilekoa', '2. hiruhilekoa', '3. hiruhilekoa',
      '4. hiruhilekoa'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE, y\'eko\' MMMM\'ren\' dd\'a\'',
      'y\'eko\' MMM\'ren\' dd\'a\'', 'y MMM d', 'yyyy-MM-dd'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale fa.
 */
goog.i18n.DateTimeSymbols_fa = {
  ERAS: ['ق.م.', 'م.'],
  ERANAMES: ['قبل از میلاد', 'میلادی'],
  NARROWMONTHS: ['ژ', 'ف', 'م', 'آ', 'م', 'ژ', 'ژ', 'ا', 'س', 'ا',
      'ن', 'د'],
  STANDALONENARROWMONTHS: ['ژ', 'ف', 'م', 'آ', 'م', 'ژ', 'ژ', 'ا', 'س',
      'ا', 'ن', 'د'],
  MONTHS: ['ژانویهٔ', 'فوریهٔ', 'مارس', 'آوریل', 'مهٔ',
      'ژوئن', 'ژوئیهٔ', 'اوت', 'سپتامبر', 'اکتبر',
      'نوامبر', 'دسامبر'],
  STANDALONEMONTHS: ['ژانویه', 'فوریه', 'مارس', 'آوریل',
      'مه', 'ژوئن', 'ژوئیه', 'اوت', 'سپتامبر',
      'اکتبر', 'نوامبر', 'دسامبر'],
  SHORTMONTHS: ['ژانویهٔ', 'فوریهٔ', 'مارس', 'آوریل',
      'مهٔ', 'ژوئن', 'ژوئیهٔ', 'اوت', 'سپتامبر',
      'اکتبر', 'نوامبر', 'دسامبر'],
  STANDALONESHORTMONTHS: ['ژانویه', 'فوریه', 'مارس',
      'آوریل', 'مه', 'ژوئن', 'ژوئیه', 'اوت',
      'سپتامبر', 'اکتبر', 'نوامبر', 'دسامبر'],
  WEEKDAYS: ['یکشنبه', 'دوشنبه', 'سه‌شنبه',
      'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'],
  STANDALONEWEEKDAYS: ['یکشنبه', 'دوشنبه', 'سه‌شنبه',
      'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'],
  SHORTWEEKDAYS: ['یکشنبه', 'دوشنبه', 'سه‌شنبه',
      'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'],
  STANDALONESHORTWEEKDAYS: ['یکشنبه', 'دوشنبه', 'سه‌شنبه',
      'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'],
  NARROWWEEKDAYS: ['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش'],
  STANDALONENARROWWEEKDAYS: ['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش'],
  SHORTQUARTERS: ['س‌م۱', 'س‌م۲', 'س‌م۳', 'س‌م۴'],
  QUARTERS: ['سه‌ماههٔ اول', 'سه‌ماههٔ دوم',
      'سه‌ماههٔ سوم', 'سه‌ماههٔ چهارم'],
  AMPMS: ['قبل‌ازظهر', 'بعدازظهر'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'yyyy/M/d'],
  TIMEFORMATS: ['H:mm:ss (zzzz)', 'H:mm:ss (z)', 'H:mm:ss', 'H:mm'],
  FIRSTDAYOFWEEK: 5,
  WEEKENDRANGE: [3, 4],
  FIRSTWEEKCUTOFFDAY: 4
};


/**
 * Date/time formatting symbols for locale fi.
 */
goog.i18n.DateTimeSymbols_fi = {
  ERAS: ['eKr.', 'jKr.'],
  ERANAMES: ['ennen Kristuksen syntymää', 'jälkeen Kristuksen syntymän'],
  NARROWMONTHS: ['T', 'H', 'M', 'H', 'T', 'K', 'H', 'E', 'S', 'L', 'M', 'J'],
  STANDALONENARROWMONTHS: ['T', 'H', 'M', 'H', 'T', 'K', 'H', 'E', 'S', 'L',
      'M', 'J'],
  MONTHS: ['tammikuuta', 'helmikuuta', 'maaliskuuta', 'huhtikuuta',
      'toukokuuta', 'kesäkuuta', 'heinäkuuta', 'elokuuta', 'syyskuuta',
      'lokakuuta', 'marraskuuta', 'joulukuuta'],
  STANDALONEMONTHS: ['tammikuu', 'helmikuu', 'maaliskuu', 'huhtikuu',
      'toukokuu', 'kesäkuu', 'heinäkuu', 'elokuu', 'syyskuu', 'lokakuu',
      'marraskuu', 'joulukuu'],
  SHORTMONTHS: ['tammikuuta', 'helmikuuta', 'maaliskuuta', 'huhtikuuta',
      'toukokuuta', 'kesäkuuta', 'heinäkuuta', 'elokuuta', 'syyskuuta',
      'lokakuuta', 'marraskuuta', 'joulukuuta'],
  STANDALONESHORTMONTHS: ['tammi', 'helmi', 'maalis', 'huhti', 'touko', 'kesä',
      'heinä', 'elo', 'syys', 'loka', 'marras', 'joulu'],
  WEEKDAYS: ['sunnuntaina', 'maanantaina', 'tiistaina', 'keskiviikkona',
      'torstaina', 'perjantaina', 'lauantaina'],
  STANDALONEWEEKDAYS: ['sunnuntai', 'maanantai', 'tiistai', 'keskiviikko',
      'torstai', 'perjantai', 'lauantai'],
  SHORTWEEKDAYS: ['su', 'ma', 'ti', 'ke', 'to', 'pe', 'la'],
  STANDALONESHORTWEEKDAYS: ['su', 'ma', 'ti', 'ke', 'to', 'pe', 'la'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'K', 'T', 'P', 'L'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'K', 'T', 'P', 'L'],
  SHORTQUARTERS: ['1. nelj.', '2. nelj.', '3. nelj.', '4. nelj.'],
  QUARTERS: ['1. neljännes', '2. neljännes', '3. neljännes',
      '4. neljännes'],
  AMPMS: ['ap.', 'ip.'],
  DATEFORMATS: ['cccc, d. MMMM y', 'd. MMMM y', 'd.M.yyyy', 'd.M.yyyy'],
  TIMEFORMATS: ['H.mm.ss zzzz', 'H.mm.ss z', 'H.mm.ss', 'H.mm'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale fil.
 */
goog.i18n.DateTimeSymbols_fil = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['BC', 'AD'],
  NARROWMONTHS: ['E', 'P', 'M', 'A', 'M', 'H', 'H', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['E', 'P', 'M', 'A', 'M', 'H', 'H', 'A', 'S', 'O',
      'N', 'D'],
  MONTHS: ['Enero', 'Pebrero', 'Marso', 'Abril', 'Mayo', 'Hunyo', 'Hulyo',
      'Agosto', 'Setyembre', 'Oktubre', 'Nobyembre', 'Disyembre'],
  STANDALONEMONTHS: ['Enero', 'Pebrero', 'Marso', 'Abril', 'Mayo', 'Hunyo',
      'Hulyo', 'Agosto', 'Setyembre', 'Oktubre', 'Nobyembre', 'Disyembre'],
  SHORTMONTHS: ['Ene', 'Peb', 'Mar', 'Abr', 'May', 'Hun', 'Hul', 'Ago', 'Set',
      'Okt', 'Nob', 'Dis'],
  STANDALONESHORTMONTHS: ['Ene', 'Peb', 'Mar', 'Abr', 'May', 'Hun', 'Hul',
      'Ago', 'Set', 'Okt', 'Nob', 'Dis'],
  WEEKDAYS: ['Linggo', 'Lunes', 'Martes', 'Miyerkules', 'Huwebes', 'Biyernes',
      'Sabado'],
  STANDALONEWEEKDAYS: ['Linggo', 'Lunes', 'Martes', 'Miyerkules', 'Huwebes',
      'Biyernes', 'Sabado'],
  SHORTWEEKDAYS: ['Lin', 'Lun', 'Mar', 'Mye', 'Huw', 'Bye', 'Sab'],
  STANDALONESHORTWEEKDAYS: ['Lin', 'Lun', 'Mar', 'Miy', 'Huw', 'Biy', 'Sab'],
  NARROWWEEKDAYS: ['L', 'L', 'M', 'M', 'H', 'B', 'S'],
  STANDALONENARROWWEEKDAYS: ['L', 'L', 'M', 'M', 'H', 'B', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['ika-1 sangkapat', 'ika-2 sangkapat', 'ika-3 quarter',
      'ika-4 na quarter'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE, MMMM dd y', 'MMMM d, y', 'MMM d, y', 'M/d/yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale fr.
 */
goog.i18n.DateTimeSymbols_fr = {
  ERAS: ['av. J.-C.', 'ap. J.-C.'],
  ERANAMES: ['avant Jésus-Christ', 'après Jésus-Christ'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O',
      'N', 'D'],
  MONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet',
      'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  STANDALONEMONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
      'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  SHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.',
      'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  STANDALONESHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
      'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  WEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi',
      'samedi'],
  STANDALONEWEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi',
      'vendredi', 'samedi'],
  SHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  STANDALONESHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.',
      'sam.'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1er trimestre', '2e trimestre', '3e trimestre', '4e trimestre'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale fr_CA.
 */
goog.i18n.DateTimeSymbols_fr_CA = {
  ERAS: ['av. J.-C.', 'ap. J.-C.'],
  ERANAMES: ['avant Jésus-Christ', 'après Jésus-Christ'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O',
      'N', 'D'],
  MONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet',
      'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  STANDALONEMONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
      'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  SHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.',
      'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  STANDALONESHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
      'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  WEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi',
      'samedi'],
  STANDALONEWEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi',
      'vendredi', 'samedi'],
  SHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  STANDALONESHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.',
      'sam.'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1er trimestre', '2e trimestre', '3e trimestre', '4e trimestre'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'yyyy-MM-dd', 'yy-MM-dd'],
  TIMEFORMATS: ['HH \'h\' mm \'min\' ss \'s\' zzzz', 'HH:mm:ss z', 'HH:mm:ss',
      'HH:mm'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale gl.
 */
goog.i18n.DateTimeSymbols_gl = {
  ERAS: ['a.C.', 'd.C.'],
  ERANAMES: ['antes de Cristo', 'despois de Cristo'],
  NARROWMONTHS: ['X', 'F', 'M', 'A', 'M', 'X', 'X', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['X', 'F', 'M', 'A', 'M', 'X', 'X', 'A', 'S', 'O',
      'N', 'D'],
  MONTHS: ['Xaneiro', 'Febreiro', 'Marzo', 'Abril', 'Maio', 'Xuño', 'Xullo',
      'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Decembro'],
  STANDALONEMONTHS: ['Xaneiro', 'Febreiro', 'Marzo', 'Abril', 'Maio', 'Xuño',
      'Xullo', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Decembro'],
  SHORTMONTHS: ['Xan', 'Feb', 'Mar', 'Abr', 'Mai', 'Xuñ', 'Xul', 'Ago', 'Set',
      'Out', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Xan', 'Feb', 'Mar', 'Abr', 'Mai', 'Xuñ', 'Xul',
      'Ago', 'Set', 'Out', 'Nov', 'Dec'],
  WEEKDAYS: ['Domingo', 'Luns', 'Martes', 'Mércores', 'Xoves', 'Venres',
      'Sábado'],
  STANDALONEWEEKDAYS: ['Domingo', 'Luns', 'Martes', 'Mércores', 'Xoves',
      'Venres', 'Sábado'],
  SHORTWEEKDAYS: ['Dom', 'Lun', 'Mar', 'Mér', 'Xov', 'Ven', 'Sáb'],
  STANDALONESHORTWEEKDAYS: ['Dom', 'Lun', 'Mar', 'Mér', 'Xov', 'Ven', 'Sáb'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'X', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'X', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1o trimestre', '2o trimestre', '3o trimestre', '4o trimestre'],
  AMPMS: ['a.m.', 'p.m.'],
  DATEFORMATS: ['EEEE dd MMMM y', 'dd MMMM y', 'd MMM, y', 'dd/MM/yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale gsw.
 */
goog.i18n.DateTimeSymbols_gsw = {
  ERAS: ['v. Chr.', 'n. Chr.'],
  ERANAMES: ['v. Chr.', 'n. Chr.'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O',
      'N', 'D'],
  MONTHS: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli',
      'Auguscht', 'Septämber', 'Oktoober', 'Novämber', 'Dezämber'],
  STANDALONEMONTHS: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
      'Juli', 'Auguscht', 'Septämber', 'Oktoober', 'Novämber', 'Dezämber'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep',
      'Okt', 'Nov', 'Dez'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul',
      'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
  WEEKDAYS: ['Sunntig', 'Määntig', 'Ziischtig', 'Mittwuch', 'Dunschtig',
      'Friitig', 'Samschtig'],
  STANDALONEWEEKDAYS: ['Sunntig', 'Määntig', 'Ziischtig', 'Mittwuch',
      'Dunschtig', 'Friitig', 'Samschtig'],
  SHORTWEEKDAYS: ['Su.', 'Mä.', 'Zi.', 'Mi.', 'Du.', 'Fr.', 'Sa.'],
  STANDALONESHORTWEEKDAYS: ['Su.', 'Mä.', 'Zi.', 'Mi.', 'Du.', 'Fr.', 'Sa.'],
  NARROWWEEKDAYS: ['S', 'M', 'D', 'M', 'D', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'D', 'M', 'D', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1. Quartal', '2. Quartal', '3. Quartal', '4. Quartal'],
  AMPMS: ['vorm.', 'nam.'],
  DATEFORMATS: ['EEEE, d. MMMM y', 'd. MMMM y', 'dd.MM.yyyy', 'dd.MM.yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale gu.
 */
goog.i18n.DateTimeSymbols_gu = {
  ERAS: ['ઈલુના જન્મ પહેસાં',
      'ઇસવીસન'],
  ERANAMES: ['ઈસવીસન પૂર્વે', 'ઇસવીસન'],
  NARROWMONTHS: ['જા', 'ફે', 'મા', 'એ', 'મે', 'જૂ',
      'જુ', 'ઑ', 'સ', 'ઑ', 'ન', 'ડિ'],
  STANDALONENARROWMONTHS: ['જા', 'ફે', 'મા', 'એ', 'મે',
      'જૂ', 'જુ', 'ઑ', 'સ', 'ઑ', 'ન', 'ડિ'],
  MONTHS: ['જાન્યુઆરી', 'ફેબ્રુઆરી',
      'માર્ચ', 'એપ્રિલ', 'મે', 'જૂન',
      'જુલાઈ', 'ઑગસ્ટ', 'સપ્ટેમ્બર',
      'ઑક્ટોબર', 'નવેમ્બર',
      'ડિસેમ્બર'],
  STANDALONEMONTHS: ['જાન્યુઆરી',
      'ફેબ્રુઆરી', 'માર્ચ', 'એપ્રિલ',
      'મે', 'જૂન', 'જુલાઈ', 'ઑગસ્ટ',
      'સપ્ટેમ્બર', 'ઑક્ટોબર',
      'નવેમ્બર', 'ડિસેમ્બર'],
  SHORTMONTHS: ['જાન્યુ', 'ફેબ્રુ', 'માર્ચ',
      'એપ્રિલ', 'મે', 'જૂન', 'જુલાઈ',
      'ઑગસ્ટ', 'સપ્ટે', 'ઑક્ટો', 'નવે',
      'ડિસે'],
  STANDALONESHORTMONTHS: ['જાન્યુ', 'ફેબ્રુ',
      'માર્ચ', 'એપ્રિલ', 'મે', 'જૂન',
      'જુલાઈ', 'ઑગસ્ટ', 'સપ્ટે',
      'ઑક્ટો', 'નવે', 'ડિસે'],
  WEEKDAYS: ['રવિવાર', 'સોમવાર',
      'મંગળવાર', 'બુધવાર', 'ગુરુવાર',
      'શુક્રવાર', 'શનિવાર'],
  STANDALONEWEEKDAYS: ['રવિવાર', 'સોમવાર',
      'મંગળવાર', 'બુધવાર', 'ગુરુવાર',
      'શુક્રવાર', 'શનિવાર'],
  SHORTWEEKDAYS: ['રવિ', 'સોમ', 'મંગળ', 'બુધ',
      'ગુરુ', 'શુક્ર', 'શનિ'],
  STANDALONESHORTWEEKDAYS: ['રવિ', 'સોમ', 'મંગળ',
      'બુધ', 'ગુરુ', 'શુક્ર', 'શનિ'],
  NARROWWEEKDAYS: ['ર', 'સો', 'મં', 'બુ', 'ગુ', 'શુ',
      'શ'],
  STANDALONENARROWWEEKDAYS: ['ર', 'સો', 'મં', 'બુ', 'ગુ',
      'શુ', 'શ'],
  SHORTQUARTERS: ['પેહલા હંત 1', 'Q2', 'Q3',
      'ચૌતા હંત 4'],
  QUARTERS: ['પેહલા હંત 1', 'ડૂસઋા હંત 2',
      'તીસઋા હંત 3', 'ચૌતા હંત 4'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM, y', 'd MMMM, y', 'd MMM, y', 'd-MM-yy'],
  TIMEFORMATS: ['hh:mm:ss a zzzz', 'hh:mm:ss a z', 'hh:mm:ss a', 'hh:mm a'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [6, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale he.
 */
goog.i18n.DateTimeSymbols_he = {
  ERAS: ['לפנה״ס', 'לסה״נ'],
  ERANAMES: ['לפני הספירה', 'לספירה'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
      '11', '12'],
  MONTHS: ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי',
      'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר',
      'נובמבר', 'דצמבר'],
  STANDALONEMONTHS: ['ינואר', 'פברואר', 'מרץ', 'אפריל',
      'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר',
      'אוקטובר', 'נובמבר', 'דצמבר'],
  SHORTMONTHS: ['ינו', 'פבר', 'מרץ', 'אפר', 'מאי', 'יונ',
      'יול', 'אוג', 'ספט', 'אוק', 'נוב', 'דצמ'],
  STANDALONESHORTMONTHS: ['ינו׳', 'פבר׳', 'מרץ', 'אפר׳',
      'מאי', 'יונ׳', 'יול׳', 'אוג׳', 'ספט׳', 'אוק׳',
      'נוב׳', 'דצמ׳'],
  WEEKDAYS: ['יום ראשון', 'יום שני', 'יום שלישי',
      'יום רביעי', 'יום חמישי', 'יום שישי',
      'יום שבת'],
  STANDALONEWEEKDAYS: ['יום ראשון', 'יום שני',
      'יום שלישי', 'יום רביעי', 'יום חמישי',
      'יום שישי', 'יום שבת'],
  SHORTWEEKDAYS: ['יום א׳', 'יום ב׳', 'יום ג׳', 'יום ד׳',
      'יום ה׳', 'יום ו׳', 'שבת'],
  STANDALONESHORTWEEKDAYS: ['יום א׳', 'יום ב׳', 'יום ג׳',
      'יום ד׳', 'יום ה׳', 'יום ו׳', 'שבת'],
  NARROWWEEKDAYS: ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'],
  STANDALONENARROWWEEKDAYS: ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'],
  SHORTQUARTERS: ['רבעון 1', 'רבעון 2', 'רבעון 3',
      'רבעון 4'],
  QUARTERS: ['רבעון 1', 'רבעון 2', 'רבעון 3', 'רבעון 4'],
  AMPMS: ['לפנה״צ', 'אחה״צ'],
  DATEFORMATS: ['EEEE, d בMMMM y', 'd בMMMM y', 'd בMMM yyyy', 'dd/MM/yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [4, 5],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale hi.
 */
goog.i18n.DateTimeSymbols_hi = {
  ERAS: ['ईसापूर्व', 'सन'],
  ERANAMES: ['ईसापूर्व', 'सन'],
  NARROWMONTHS: ['ज', 'फ़', 'मा', 'अ', 'म', 'जू', 'जु',
      'अ', 'सि', 'अ', 'न', 'दि'],
  STANDALONENARROWMONTHS: ['ज', 'फ़', 'मा', 'अ', 'म', 'जू',
      'जु', 'अ', 'सि', 'अ', 'न', 'दि'],
  MONTHS: ['जनवरी', 'फरवरी', 'मार्च',
      'अप्रैल', 'मई', 'जून', 'जुलाई',
      'अगस्त', 'सितम्बर', 'अक्तूबर',
      'नवम्बर', 'दिसम्बर'],
  STANDALONEMONTHS: ['जनवरी', 'फरवरी', 'मार्च',
      'अप्रैल', 'मई', 'जून', 'जुलाई',
      'अगस्त', 'सितम्बर', 'अक्तूबर',
      'नवम्बर', 'दिसम्बर'],
  SHORTMONTHS: ['जनवरी', 'फरवरी', 'मार्च',
      'अप्रैल', 'मई', 'जून', 'जुलाई',
      'अगस्त', 'सितम्बर', 'अक्तूबर',
      'नवम्बर', 'दिसम्बर'],
  STANDALONESHORTMONTHS: ['जनवरी', 'फरवरी',
      'मार्च', 'अप्रैल', 'मई', 'जून',
      'जुलाई', 'अगस्त', 'सितम्बर',
      'अक्तूबर', 'नवम्बर', 'दिसम्बर'],
  WEEKDAYS: ['रविवार', 'सोमवार',
      'मंगलवार', 'बुधवार',
      'बृहस्पतिवार', 'शुक्रवार',
      'शनिवार'],
  STANDALONEWEEKDAYS: ['रविवार', 'सोमवार',
      'मंगलवार', 'बुधवार',
      'बृहस्पतिवार', 'शुक्रवार',
      'शनिवार'],
  SHORTWEEKDAYS: ['रवि.', 'सोम.', 'मंगल.', 'बुध.',
      'बृह.', 'शुक्र.', 'शनि.'],
  STANDALONESHORTWEEKDAYS: ['रवि.', 'सोम.', 'मंगल.',
      'बुध.', 'बृह.', 'शुक्र.', 'शनि.'],
  NARROWWEEKDAYS: ['र', 'सो', 'मं', 'बु', 'गु', 'शु',
      'श'],
  STANDALONENARROWWEEKDAYS: ['र', 'सो', 'मं', 'बु', 'गु',
      'शु', 'श'],
  SHORTQUARTERS: ['तिमाही', 'दूसरी तिमाही',
      'तीसरी तिमाही', 'चौथी तिमाही'],
  QUARTERS: ['तिमाही', 'दूसरी तिमाही',
      'तीसरी तिमाही', 'चौथी तिमाही'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'dd-MM-yyyy', 'd-M-yy'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [6, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale hr.
 */
goog.i18n.DateTimeSymbols_hr = {
  ERAS: ['p. n. e.', 'A. D.'],
  ERANAMES: ['Prije Krista', 'Poslije Krista'],
  NARROWMONTHS: ['1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.', '9.', '10.',
      '11.', '12.'],
  STANDALONENARROWMONTHS: ['1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.', '9.',
      '10.', '11.', '12.'],
  MONTHS: ['siječnja', 'veljače', 'ožujka', 'travnja', 'svibnja', 'lipnja',
      'srpnja', 'kolovoza', 'rujna', 'listopada', 'studenoga', 'prosinca'],
  STANDALONEMONTHS: ['siječanj', 'veljača', 'ožujak', 'travanj', 'svibanj',
      'lipanj', 'srpanj', 'kolovoz', 'rujan', 'listopad', 'studeni',
      'prosinac'],
  SHORTMONTHS: ['sij', 'velj', 'ožu', 'tra', 'svi', 'lip', 'srp', 'kol', 'ruj',
      'lis', 'stu', 'pro'],
  STANDALONESHORTMONTHS: ['sij', 'velj', 'ožu', 'tra', 'svi', 'lip', 'srp',
      'kol', 'ruj', 'lis', 'stu', 'pro'],
  WEEKDAYS: ['nedjelja', 'ponedjeljak', 'utorak', 'srijeda', 'četvrtak',
      'petak', 'subota'],
  STANDALONEWEEKDAYS: ['nedjelja', 'ponedjeljak', 'utorak', 'srijeda',
      'četvrtak', 'petak', 'subota'],
  SHORTWEEKDAYS: ['ned', 'pon', 'uto', 'sri', 'čet', 'pet', 'sub'],
  STANDALONESHORTWEEKDAYS: ['ned', 'pon', 'uto', 'sri', 'čet', 'pet', 'sub'],
  NARROWWEEKDAYS: ['N', 'P', 'U', 'S', 'Č', 'P', 'S'],
  STANDALONENARROWWEEKDAYS: ['n', 'p', 'u', 's', 'č', 'p', 's'],
  SHORTQUARTERS: ['1kv', '2kv', '3kv', '4kv'],
  QUARTERS: ['1. kvartal', '2. kvartal', '3. kvartal', '4. kvartal'],
  AMPMS: ['prije podne', 'PM'],
  DATEFORMATS: ['EEEE, d. MMMM y.', 'd. MMMM y.', 'd. M. y.', 'd.M.y.'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale hu.
 */
goog.i18n.DateTimeSymbols_hu = {
  ERAS: ['i. e.', 'i. sz.'],
  ERANAMES: ['időszámításunk előtt', 'időszámításunk szerint'],
  NARROWMONTHS: ['J', 'F', 'M', 'Á', 'M', 'J', 'J', 'Á', 'Sz', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'Á', 'M', 'J', 'J', 'A', 'Sz', 'O',
      'N', 'D'],
  MONTHS: ['január', 'február', 'március', 'április', 'május', 'június',
      'július', 'augusztus', 'szeptember', 'október', 'november', 'december'],
  STANDALONEMONTHS: ['január', 'február', 'március', 'április', 'május',
      'június', 'július', 'augusztus', 'szeptember', 'október', 'november',
      'december'],
  SHORTMONTHS: ['jan.', 'febr.', 'márc.', 'ápr.', 'máj.', 'jún.', 'júl.',
      'aug.', 'szept.', 'okt.', 'nov.', 'dec.'],
  STANDALONESHORTMONTHS: ['jan.', 'febr.', 'márc.', 'ápr.', 'máj.', 'jún.',
      'júl.', 'aug.', 'szept.', 'okt.', 'nov.', 'dec.'],
  WEEKDAYS: ['vasárnap', 'hétfő', 'kedd', 'szerda', 'csütörtök',
      'péntek', 'szombat'],
  STANDALONEWEEKDAYS: ['vasárnap', 'hétfő', 'kedd', 'szerda', 'csütörtök',
      'péntek', 'szombat'],
  SHORTWEEKDAYS: ['V', 'H', 'K', 'Sze', 'Cs', 'P', 'Szo'],
  STANDALONESHORTWEEKDAYS: ['V', 'H', 'K', 'Sze', 'Cs', 'P', 'Szo'],
  NARROWWEEKDAYS: ['V', 'H', 'K', 'Sz', 'Cs', 'P', 'Sz'],
  STANDALONENARROWWEEKDAYS: ['V', 'H', 'K', 'Sz', 'Cs', 'P', 'Sz'],
  SHORTQUARTERS: ['N1', 'N2', 'N3', 'N4'],
  QUARTERS: ['I. negyedév', 'II. negyedév', 'III. negyedév',
      'IV. negyedév'],
  AMPMS: ['de.', 'du.'],
  DATEFORMATS: ['y. MMMM d., EEEE', 'y. MMMM d.', 'yyyy.MM.dd.', 'yyyy.MM.dd.'],
  TIMEFORMATS: ['H:mm:ss zzzz', 'H:mm:ss z', 'H:mm:ss', 'H:mm'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale id.
 */
goog.i18n.DateTimeSymbols_id = {
  ERAS: ['SM', 'M'],
  ERANAMES: ['SM', 'M'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O',
      'N', 'D'],
  MONTHS: ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli',
      'Agustus', 'September', 'Oktober', 'November', 'Desember'],
  STANDALONEMONTHS: ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep',
      'Okt', 'Nov', 'Des'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul',
      'Agt', 'Sep', 'Okt', 'Nov', 'Des'],
  WEEKDAYS: ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
  STANDALONEWEEKDAYS: ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat',
      'Sabtu'],
  SHORTWEEKDAYS: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'],
  STANDALONESHORTWEEKDAYS: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'],
  NARROWWEEKDAYS: ['M', 'S', 'S', 'R', 'K', 'J', 'S'],
  STANDALONENARROWWEEKDAYS: ['M', 'S', 'S', 'R', 'K', 'J', 'S'],
  SHORTQUARTERS: ['K1', 'K2', 'K3', 'K4'],
  QUARTERS: ['kuartal pertama', 'kuartal kedua', 'kuartal ketiga',
      'kuartal keempat'],
  AMPMS: ['pagi', 'malam'],
  DATEFORMATS: ['EEEE, dd MMMM yyyy', 'd MMMM yyyy', 'd MMM yyyy', 'dd/MM/yy'],
  TIMEFORMATS: ['H:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale in.
 */
goog.i18n.DateTimeSymbols_in = {
  ERAS: ['SM', 'M'],
  ERANAMES: ['SM', 'M'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O',
      'N', 'D'],
  MONTHS: ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli',
      'Agustus', 'September', 'Oktober', 'November', 'Desember'],
  STANDALONEMONTHS: ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep',
      'Okt', 'Nov', 'Des'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul',
      'Agt', 'Sep', 'Okt', 'Nov', 'Des'],
  WEEKDAYS: ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
  STANDALONEWEEKDAYS: ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat',
      'Sabtu'],
  SHORTWEEKDAYS: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'],
  STANDALONESHORTWEEKDAYS: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'],
  NARROWWEEKDAYS: ['M', 'S', 'S', 'R', 'K', 'J', 'S'],
  STANDALONENARROWWEEKDAYS: ['M', 'S', 'S', 'R', 'K', 'J', 'S'],
  SHORTQUARTERS: ['K1', 'K2', 'K3', 'K4'],
  QUARTERS: ['kuartal pertama', 'kuartal kedua', 'kuartal ketiga',
      'kuartal keempat'],
  AMPMS: ['pagi', 'malam'],
  DATEFORMATS: ['EEEE, dd MMMM yyyy', 'd MMMM yyyy', 'd MMM yyyy', 'dd/MM/yy'],
  TIMEFORMATS: ['H:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale is.
 */
goog.i18n.DateTimeSymbols_is = {
  ERAS: ['fyrir Krist', 'eftir Krist'],
  ERANAMES: ['fyrir Krist', 'eftir Krist'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'Á', 'L', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['j', 'f', 'm', 'a', 'm', 'j', 'j', 'á', 's', 'o',
      'n', 'd'],
  MONTHS: ['janúar', 'febrúar', 'mars', 'apríl', 'maí', 'júní', 'júlí',
      'ágúst', 'september', 'október', 'nóvember', 'desember'],
  STANDALONEMONTHS: ['janúar', 'febrúar', 'mars', 'apríl', 'maí', 'júní',
      'júlí', 'ágúst', 'september', 'október', 'nóvember', 'desember'],
  SHORTMONTHS: ['jan', 'feb', 'mar', 'apr', 'maí', 'jún', 'júl', 'ágú',
      'sep', 'okt', 'nóv', 'des'],
  STANDALONESHORTMONTHS: ['jan', 'feb', 'mar', 'apr', 'maí', 'jún', 'júl',
      'ágú', 'sep', 'okt', 'nóv', 'des'],
  WEEKDAYS: ['sunnudagur', 'mánudagur', 'þriðjudagur', 'miðvikudagur',
      'fimmtudagur', 'föstudagur', 'laugardagur'],
  STANDALONEWEEKDAYS: ['sunnudagur', 'mánudagur', 'þriðjudagur',
      'miðvikudagur', 'fimmtudagur', 'föstudagur', 'laugardagur'],
  SHORTWEEKDAYS: ['sun', 'mán', 'þri', 'mið', 'fim', 'fös', 'lau'],
  STANDALONESHORTWEEKDAYS: ['sun', 'mán', 'þri', 'mið', 'fim', 'fös',
      'lau'],
  NARROWWEEKDAYS: ['S', 'M', 'Þ', 'M', 'F', 'F', 'L'],
  STANDALONENARROWWEEKDAYS: ['s', 'm', 'þ', 'm', 'f', 'f', 'l'],
  SHORTQUARTERS: ['F1', 'F2', 'F3', 'F4'],
  QUARTERS: ['1st fjórðungur', '2nd fjórðungur', '3rd fjórðungur',
      '4th fjórðungur'],
  AMPMS: ['f.h.', 'e.h.'],
  DATEFORMATS: ['EEEE, d. MMMM y', 'd. MMMM y', 'd.M.yyyy', 'd.M.yyyy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale it.
 */
goog.i18n.DateTimeSymbols_it = {
  ERAS: ['aC', 'dC'],
  ERANAMES: ['a.C.', 'd.C'],
  NARROWMONTHS: ['G', 'F', 'M', 'A', 'M', 'G', 'L', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['G', 'F', 'M', 'A', 'M', 'G', 'L', 'A', 'S', 'O',
      'N', 'D'],
  MONTHS: ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno',
      'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'],
  STANDALONEMONTHS: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio',
      'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre',
      'Dicembre'],
  SHORTMONTHS: ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set',
      'ott', 'nov', 'dic'],
  STANDALONESHORTMONTHS: ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug',
      'ago', 'set', 'ott', 'nov', 'dic'],
  WEEKDAYS: ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì',
      'venerdì', 'sabato'],
  STANDALONEWEEKDAYS: ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì',
      'Giovedì', 'Venerdì', 'Sabato'],
  SHORTWEEKDAYS: ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'],
  STANDALONESHORTWEEKDAYS: ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'G', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'G', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1o trimestre', '2o trimestre', '3o trimestre', '4o trimestre'],
  AMPMS: ['m.', 'p.'],
  DATEFORMATS: ['EEEE d MMMM y', 'dd MMMM y', 'dd/MMM/y', 'dd/MM/yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale iw.
 */
goog.i18n.DateTimeSymbols_iw = {
  ERAS: ['לפנה״ס', 'לסה״נ'],
  ERANAMES: ['לפני הספירה', 'לספירה'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
      '11', '12'],
  MONTHS: ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי',
      'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר',
      'נובמבר', 'דצמבר'],
  STANDALONEMONTHS: ['ינואר', 'פברואר', 'מרץ', 'אפריל',
      'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר',
      'אוקטובר', 'נובמבר', 'דצמבר'],
  SHORTMONTHS: ['ינו', 'פבר', 'מרץ', 'אפר', 'מאי', 'יונ',
      'יול', 'אוג', 'ספט', 'אוק', 'נוב', 'דצמ'],
  STANDALONESHORTMONTHS: ['ינו׳', 'פבר׳', 'מרץ', 'אפר׳',
      'מאי', 'יונ׳', 'יול׳', 'אוג׳', 'ספט׳', 'אוק׳',
      'נוב׳', 'דצמ׳'],
  WEEKDAYS: ['יום ראשון', 'יום שני', 'יום שלישי',
      'יום רביעי', 'יום חמישי', 'יום שישי',
      'יום שבת'],
  STANDALONEWEEKDAYS: ['יום ראשון', 'יום שני',
      'יום שלישי', 'יום רביעי', 'יום חמישי',
      'יום שישי', 'יום שבת'],
  SHORTWEEKDAYS: ['יום א׳', 'יום ב׳', 'יום ג׳', 'יום ד׳',
      'יום ה׳', 'יום ו׳', 'שבת'],
  STANDALONESHORTWEEKDAYS: ['יום א׳', 'יום ב׳', 'יום ג׳',
      'יום ד׳', 'יום ה׳', 'יום ו׳', 'שבת'],
  NARROWWEEKDAYS: ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'],
  STANDALONENARROWWEEKDAYS: ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'],
  SHORTQUARTERS: ['רבעון 1', 'רבעון 2', 'רבעון 3',
      'רבעון 4'],
  QUARTERS: ['רבעון 1', 'רבעון 2', 'רבעון 3', 'רבעון 4'],
  AMPMS: ['לפנה״צ', 'אחה״צ'],
  DATEFORMATS: ['EEEE, d בMMMM y', 'd בMMMM y', 'd בMMM yyyy', 'dd/MM/yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [4, 5],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale ja.
 */
goog.i18n.DateTimeSymbols_ja = {
  ERAS: ['紀元前', '西暦'],
  ERANAMES: ['紀元前', '西暦'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
      '11', '12'],
  MONTHS: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月',
      '9月', '10月', '11月', '12月'],
  STANDALONEMONTHS: ['1月', '2月', '3月', '4月', '5月', '6月', '7月',
      '8月', '9月', '10月', '11月', '12月'],
  SHORTMONTHS: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月',
      '9月', '10月', '11月', '12月'],
  STANDALONESHORTMONTHS: ['1月', '2月', '3月', '4月', '5月', '6月',
      '7月', '8月', '9月', '10月', '11月', '12月'],
  WEEKDAYS: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日',
      '金曜日', '土曜日'],
  STANDALONEWEEKDAYS: ['日曜日', '月曜日', '火曜日', '水曜日',
      '木曜日', '金曜日', '土曜日'],
  SHORTWEEKDAYS: ['日', '月', '火', '水', '木', '金', '土'],
  STANDALONESHORTWEEKDAYS: ['日', '月', '火', '水', '木', '金', '土'],
  NARROWWEEKDAYS: ['日', '月', '火', '水', '木', '金', '土'],
  STANDALONENARROWWEEKDAYS: ['日', '月', '火', '水', '木', '金', '土'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['第1四半期', '第2四半期', '第3四半期',
      '第4四半期'],
  AMPMS: ['午前', '午後'],
  DATEFORMATS: ['y年M月d日EEEE', 'y年M月d日', 'yyyy/MM/dd', 'yy/MM/dd'],
  TIMEFORMATS: ['H時mm分ss秒 zzzz', 'H:mm:ss z', 'H:mm:ss', 'H:mm'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale kn.
 */
goog.i18n.DateTimeSymbols_kn = {
  ERAS: ['ಕ್ರಿ.ಪೂ', 'ಜಾಹೀ'],
  ERANAMES: ['ಈಸಪೂವ೯.', 'ಕ್ರಿಸ್ತ ಶಕ'],
  NARROWMONTHS: ['ಜ', 'ಫೆ', 'ಮಾ', 'ಎ', 'ಮೇ', 'ಜೂ', 'ಜು',
      'ಆ', 'ಸೆ', 'ಅ', 'ನ', 'ಡಿ'],
  STANDALONENARROWMONTHS: ['ಜ', 'ಫೆ', 'ಮಾ', 'ಎ', 'ಮೇ', 'ಜೂ',
      'ಜು', 'ಆ', 'ಸೆ', 'ಅ', 'ನ', 'ಡಿ'],
  MONTHS: ['ಜನವರೀ', 'ಫೆಬ್ರವರೀ', 'ಮಾರ್ಚ್',
      'ಎಪ್ರಿಲ್', 'ಮೆ', 'ಜೂನ್', 'ಜುಲೈ',
      'ಆಗಸ್ಟ್', 'ಸಪ್ಟೆಂಬರ್',
      'ಅಕ್ಟೋಬರ್', 'ನವೆಂಬರ್',
      'ಡಿಸೆಂಬರ್'],
  STANDALONEMONTHS: ['ಜನವರೀ', 'ಫೆಬ್ರವರೀ',
      'ಮಾರ್ಚ್', 'ಎಪ್ರಿಲ್', 'ಮೆ', 'ಜೂನ್',
      'ಜುಲೈ', 'ಆಗಸ್ಟ್', 'ಸಪ್ಟೆಂಬರ್',
      'ಅಕ್ಟೋಬರ್', 'ನವೆಂಬರ್',
      'ಡಿಸೆಂಬರ್'],
  SHORTMONTHS: ['ಜನವರೀ', 'ಫೆಬ್ರವರೀ',
      'ಮಾರ್ಚ್', 'ಎಪ್ರಿಲ್', 'ಮೆ', 'ಜೂನ್',
      'ಜುಲೈ', 'ಆಗಸ್ಟ್', 'ಸಪ್ಟೆಂಬರ್',
      'ಅಕ್ಟೋಬರ್', 'ನವೆಂಬರ್',
      'ಡಿಸೆಂಬರ್'],
  STANDALONESHORTMONTHS: ['ಜನವರೀ', 'ಫೆಬ್ರವರೀ',
      'ಮಾರ್ಚ್', 'ಎಪ್ರಿಲ್', 'ಮೆ', 'ಜೂನ್',
      'ಜುಲೈ', 'ಆಗಸ್ಟ್', 'ಸಪ್ಟೆಂಬರ್',
      'ಅಕ್ಟೋಬರ್', 'ನವೆಂಬರ್',
      'ಡಿಸೆಂಬರ್'],
  WEEKDAYS: ['ರವಿವಾರ', 'ಸೋಮವಾರ',
      'ಮಂಗಳವಾರ', 'ಬುಧವಾರ', 'ಗುರುವಾರ',
      'ಶುಕ್ರವಾರ', 'ಶನಿವಾರ'],
  STANDALONEWEEKDAYS: ['ರವಿವಾರ', 'ಸೋಮವಾರ',
      'ಮಂಗಳವಾರ', 'ಬುಧವಾರ', 'ಗುರುವಾರ',
      'ಶುಕ್ರವಾರ', 'ಶನಿವಾರ'],
  SHORTWEEKDAYS: ['ರ.', 'ಸೋ.', 'ಮಂ.', 'ಬು.', 'ಗು.', 'ಶು.',
      'ಶನಿ.'],
  STANDALONESHORTWEEKDAYS: ['ರ.', 'ಸೋ.', 'ಮಂ.', 'ಬು.', 'ಗು.',
      'ಶು.', 'ಶನಿ.'],
  NARROWWEEKDAYS: ['ರ', 'ಸೋ', 'ಮಂ', 'ಬು', 'ಗು', 'ಶು',
      'ಶ'],
  STANDALONENARROWWEEKDAYS: ['ರ', 'ಸೋ', 'ಮಂ', 'ಬು', 'ಗು',
      'ಶು', 'ಶ'],
  SHORTQUARTERS: ['ಒಂದು 1', 'ಎರಡು 2', 'ಮೂರು 3',
      'ನಾಲೃಕ 4'],
  QUARTERS: ['ಒಂದು 1', 'ಎರಡು 2', 'ಮೂರು 3',
      'ನಾಲೃಕ 4'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'd-M-yy'],
  TIMEFORMATS: ['hh:mm:ss a zzzz', 'hh:mm:ss a z', 'hh:mm:ss a', 'hh:mm a'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [6, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale ko.
 */
goog.i18n.DateTimeSymbols_ko = {
  ERAS: ['기원전', '서기'],
  ERANAMES: ['서력기원전', '서력기원'],
  NARROWMONTHS: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월',
      '9월', '10월', '11월', '12월'],
  STANDALONENARROWMONTHS: ['1월', '2월', '3월', '4월', '5월', '6월',
      '7월', '8월', '9월', '10월', '11월', '12월'],
  MONTHS: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월',
      '9월', '10월', '11월', '12월'],
  STANDALONEMONTHS: ['1월', '2월', '3월', '4월', '5월', '6월', '7월',
      '8월', '9월', '10월', '11월', '12월'],
  SHORTMONTHS: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월',
      '9월', '10월', '11월', '12월'],
  STANDALONESHORTMONTHS: ['1월', '2월', '3월', '4월', '5월', '6월',
      '7월', '8월', '9월', '10월', '11월', '12월'],
  WEEKDAYS: ['일요일', '월요일', '화요일', '수요일', '목요일',
      '금요일', '토요일'],
  STANDALONEWEEKDAYS: ['일요일', '월요일', '화요일', '수요일',
      '목요일', '금요일', '토요일'],
  SHORTWEEKDAYS: ['일', '월', '화', '수', '목', '금', '토'],
  STANDALONESHORTWEEKDAYS: ['일', '월', '화', '수', '목', '금', '토'],
  NARROWWEEKDAYS: ['일', '월', '화', '수', '목', '금', '토'],
  STANDALONENARROWWEEKDAYS: ['일', '월', '화', '수', '목', '금', '토'],
  SHORTQUARTERS: ['1분기', '2분기', '3분기', '4분기'],
  QUARTERS: ['제 1/4분기', '제 2/4분기', '제 3/4분기',
      '제 4/4분기'],
  AMPMS: ['오전', '오후'],
  DATEFORMATS: ['y년 M월 d일 EEEE', 'y년 M월 d일', 'yyyy. M. d.',
      'yy. M. d.'],
  TIMEFORMATS: ['a h시 m분 s초 zzzz', 'a h시 m분 s초 z', 'a h:mm:ss',
      'a h:mm'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale ln.
 */
goog.i18n.DateTimeSymbols_ln = {
  ERAS: ['libóso ya', 'nsima ya Y'],
  ERANAMES: ['Yambo ya Yézu Krís', 'Nsima ya Yézu Krís'],
  NARROWMONTHS: ['y', 'f', 'm', 'a', 'm', 'y', 'y', 'a', 's', 'ɔ', 'n', 'd'],
  STANDALONENARROWMONTHS: ['y', 'f', 'm', 'a', 'm', 'y', 'y', 'a', 's', 'ɔ',
      'n', 'd'],
  MONTHS: ['sánzá ya yambo', 'sánzá ya míbalé', 'sánzá ya mísáto',
      'sánzá ya mínei', 'sánzá ya mítáno', 'sánzá ya motóbá',
      'sánzá ya nsambo', 'sánzá ya mwambe', 'sánzá ya libwa',
      'sánzá ya zómi', 'sánzá ya zómi na mɔ̌kɔ́',
      'sánzá ya zómi na míbalé'],
  STANDALONEMONTHS: ['sánzá ya yambo', 'sánzá ya míbalé',
      'sánzá ya mísáto', 'sánzá ya mínei', 'sánzá ya mítáno',
      'sánzá ya motóbá', 'sánzá ya nsambo', 'sánzá ya mwambe',
      'sánzá ya libwa', 'sánzá ya zómi', 'sánzá ya zómi na mɔ̌kɔ́',
      'sánzá ya zómi na míbalé'],
  SHORTMONTHS: ['yan', 'fbl', 'msi', 'apl', 'mai', 'yun', 'yul', 'agt', 'stb',
      'ɔtb', 'nvb', 'dsb'],
  STANDALONESHORTMONTHS: ['yan', 'fbl', 'msi', 'apl', 'mai', 'yun', 'yul',
      'agt', 'stb', 'ɔtb', 'nvb', 'dsb'],
  WEEKDAYS: ['eyenga', 'mokɔlɔ mwa yambo', 'mokɔlɔ mwa míbalé',
      'mokɔlɔ mwa mísáto', 'mokɔlɔ ya mínéi', 'mokɔlɔ ya mítáno',
      'mpɔ́sɔ'],
  STANDALONEWEEKDAYS: ['eyenga', 'mokɔlɔ mwa yambo', 'mokɔlɔ mwa míbalé',
      'mokɔlɔ mwa mísáto', 'mokɔlɔ ya mínéi', 'mokɔlɔ ya mítáno',
      'mpɔ́sɔ'],
  SHORTWEEKDAYS: ['eye', 'ybo', 'mbl', 'mst', 'min', 'mtn', 'mps'],
  STANDALONESHORTWEEKDAYS: ['eye', 'ybo', 'mbl', 'mst', 'min', 'mtn', 'mps'],
  NARROWWEEKDAYS: ['e', 'y', 'm', 'm', 'm', 'm', 'p'],
  STANDALONENARROWWEEKDAYS: ['e', 'y', 'm', 'm', 'm', 'm', 'p'],
  SHORTQUARTERS: ['SM1', 'SM2', 'SM3', 'SM4'],
  QUARTERS: ['sánzá mísáto ya yambo', 'sánzá mísáto ya míbalé',
      'sánzá mísáto ya mísáto', 'sánzá mísáto ya mínei'],
  AMPMS: ['ntɔ́ngɔ́', 'mpókwa'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'd/M/yyyy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale lt.
 */
goog.i18n.DateTimeSymbols_lt = {
  ERAS: ['pr. Kr.', 'po Kr.'],
  ERANAMES: ['prieš Kristų', 'po Kristaus'],
  NARROWMONTHS: ['S', 'V', 'K', 'B', 'G', 'B', 'L', 'R', 'R', 'S', 'L', 'G'],
  STANDALONENARROWMONTHS: ['S', 'V', 'K', 'B', 'G', 'B', 'L', 'R', 'R', 'S',
      'L', 'G'],
  MONTHS: ['sausio', 'vasaris', 'kovas', 'balandis', 'gegužė', 'birželis',
      'liepa', 'rugpjūtis', 'rugsėjis', 'spalis', 'lapkritis', 'gruodis'],
  STANDALONEMONTHS: ['Sausis', 'Vasaris', 'Kovas', 'Balandis', 'Gegužė',
      'Birželis', 'Liepa', 'Rugpjūtis', 'Rugsėjis', 'Spalis', 'Lapkritis',
      'Gruodis'],
  SHORTMONTHS: ['Saus.', 'Vas', 'Kov.', 'Bal.', 'Geg.', 'Bir.', 'Liep.',
      'Rugp.', 'Rugs.', 'Spal.', 'Lapkr.', 'Gruod.'],
  STANDALONESHORTMONTHS: ['Saus.', 'Vas.', 'Kov.', 'Bal.', 'Geg.', 'Bir.',
      'Liep.', 'Rugp.', 'Rugs.', 'Spal.', 'Lapkr.', 'Gruod.'],
  WEEKDAYS: ['sekmadienis', 'pirmadienis', 'antradienis', 'trečiadienis',
      'ketvirtadienis', 'penktadienis', 'šeštadienis'],
  STANDALONEWEEKDAYS: ['sekmadienis', 'pirmadienis', 'antradienis',
      'trečiadienis', 'ketvirtadienis', 'penktadienis', 'šeštadienis'],
  SHORTWEEKDAYS: ['Sk', 'Pr', 'An', 'Tr', 'Kt', 'Pn', 'Št'],
  STANDALONESHORTWEEKDAYS: ['Sk', 'Pr', 'An', 'Tr', 'Kt', 'Pn', 'Št'],
  NARROWWEEKDAYS: ['S', 'P', 'A', 'T', 'K', 'P', 'Š'],
  STANDALONENARROWWEEKDAYS: ['S', 'P', 'A', 'T', 'K', 'P', 'Š'],
  SHORTQUARTERS: ['I k.', 'II k.', 'III k.', 'IV ketv.'],
  QUARTERS: ['I ketvirtis', 'II ketvirtis', 'III ketvirtis', 'IV ketvirtis'],
  AMPMS: ['priešpiet', 'popiet'],
  DATEFORMATS: ['y \'m\'. MMMM d \'d\'., EEEE', 'y \'m\'. MMMM d \'d\'.',
      'y MMM d', 'yyyy-MM-dd'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale lv.
 */
goog.i18n.DateTimeSymbols_lv = {
  ERAS: ['p.m.ē.', 'm.ē.'],
  ERANAMES: ['pirms mūsu ēras', 'mūsu ērā'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O',
      'N', 'D'],
  MONTHS: ['janvāris', 'februāris', 'marts', 'aprīlis', 'maijs', 'jūnijs',
      'jūlijs', 'augusts', 'septembris', 'oktobris', 'novembris', 'decembris'],
  STANDALONEMONTHS: ['janvāris', 'februāris', 'marts', 'aprīlis', 'maijs',
      'jūnijs', 'jūlijs', 'augusts', 'septembris', 'oktobris', 'novembris',
      'decembris'],
  SHORTMONTHS: ['janv.', 'febr.', 'marts', 'apr.', 'maijs', 'jūn.', 'jūl.',
      'aug.', 'sept.', 'okt.', 'nov.', 'dec.'],
  STANDALONESHORTMONTHS: ['janv.', 'febr.', 'marts', 'apr.', 'maijs', 'jūn.',
      'jūl.', 'aug.', 'sept.', 'okt.', 'nov.', 'dec.'],
  WEEKDAYS: ['svētdiena', 'pirmdiena', 'otrdiena', 'trešdiena', 'ceturtdiena',
      'piektdiena', 'sestdiena'],
  STANDALONEWEEKDAYS: ['svētdiena', 'pirmdiena', 'otrdiena', 'trešdiena',
      'ceturtdiena', 'piektdiena', 'sestdiena'],
  SHORTWEEKDAYS: ['Sv', 'Pr', 'Ot', 'Tr', 'Ce', 'Pk', 'Se'],
  STANDALONESHORTWEEKDAYS: ['Sv', 'Pr', 'Ot', 'Tr', 'Ce', 'Pk', 'Se'],
  NARROWWEEKDAYS: ['S', 'P', 'O', 'T', 'C', 'P', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'P', 'O', 'T', 'C', 'P', 'S'],
  SHORTQUARTERS: ['C1', 'C2', 'C3', 'C4'],
  QUARTERS: ['1. ceturksnis', '2. ceturksnis', '3. ceturksnis',
      '4. ceturksnis'],
  AMPMS: ['priekšpusdienā', 'pēcpusdienā'],
  DATEFORMATS: ['EEEE, y. \'gada\' d. MMMM', 'y. \'gada\' d. MMMM',
      'y. \'gada\' d. MMM', 'dd.MM.yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale ml.
 */
goog.i18n.DateTimeSymbols_ml = {
  ERAS: ['ക്രി.മൂ', 'ക്രി.പി.'],
  ERANAMES: ['ക്രിസ്തുവിനു് മുമ്പ്‌',
      'ക്രിസ്തുവിന് പിന്‍പ്'],
  NARROWMONTHS: ['ജ', 'ഫെ', 'മാ', 'ഏ', 'മേ', 'ജൂ', 'ജൂ',
      'ഓ', 'സെ', 'ഒ', 'ന', 'ഡി'],
  STANDALONENARROWMONTHS: ['ജ', 'ഫെ', 'മാ', 'ഏ', 'മേ', 'ജൂ',
      'ജൂ', 'ഓ', 'സെ', 'ഒ', 'ന', 'ഡി'],
  MONTHS: ['ജനുവരി', 'ഫെബ്രുവരി',
      'മാര്‍ച്ച്', 'ഏപ്രില്‍', 'മേയ്',
      'ജൂണ്‍', 'ജൂലൈ', 'ആഗസ്റ്റ്',
      'സെപ്റ്റംബര്‍', 'ഒക്ടോബര്‍',
      'നവംബര്‍', 'ഡിസംബര്‍'],
  STANDALONEMONTHS: ['ജനുവരി', 'ഫെബ്രുവരി',
      'മാര്‍ച്ച്', 'ഏപ്രില്‍', 'മേയ്',
      'ജൂണ്‍', 'ജൂലൈ', 'ആഗസ്റ്റ്',
      'സെപ്റ്റംബര്‍', 'ഒക്ടോബര്‍',
      'നവംബര്‍', 'ഡിസംബര്‍'],
  SHORTMONTHS: ['ജനു', 'ഫെബ്രു', 'മാര്‍',
      'ഏപ്രി', 'മേയ്', 'ജൂണ്‍', 'ജൂലൈ',
      'ഓഗ', 'സെപ്റ്റം', 'ഒക്ടോ', 'നവം',
      'ഡിസം'],
  STANDALONESHORTMONTHS: ['ജനു', 'ഫെബ്രു', 'മാര്‍',
      'ഏപ്രി', 'മേയ്', 'ജൂണ്‍', 'ജൂലൈ',
      'ഓഗ', 'സെപ്റ്റം', 'ഒക്ടോ', 'നവം',
      'ഡിസം'],
  WEEKDAYS: ['ഞായറാഴ്ച', 'തിങ്കളാഴ്ച',
      'ചൊവ്വാഴ്ച', 'ബുധനാഴ്ച',
      'വ്യാഴാഴ്ച', 'വെള്ളിയാഴ്ച',
      'ശനിയാഴ്ച'],
  STANDALONEWEEKDAYS: ['ഞായറാഴ്ച',
      'തിങ്കളാഴ്ച', 'ചൊവ്വാഴ്ച',
      'ബുധനാഴ്ച', 'വ്യാഴാഴ്ച',
      'വെള്ളിയാഴ്ച', 'ശനിയാഴ്ച'],
  SHORTWEEKDAYS: ['ഞായര്‍', 'തിങ്കള്‍',
      'ചൊവ്വ', 'ബുധന്‍', 'വ്യാഴം',
      'വെള്ളി', 'ശനി'],
  STANDALONESHORTWEEKDAYS: ['ഞായര്‍', 'തിങ്കള്‍',
      'ചൊവ്വ', 'ബുധന്‍', 'വ്യാഴം',
      'വെള്ളി', 'ശനി'],
  NARROWWEEKDAYS: ['ഞാ', 'തി', 'ചൊ', 'ബു', 'വ്യാ',
      'വെ', 'ശ'],
  STANDALONENARROWWEEKDAYS: ['ഞാ', 'തി', 'ചൊ', 'ബു',
      'വ്യാ', 'വെ', 'ശ'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['ഒന്നാം പാദം',
      'രണ്ടാം പാദം', 'മൂന്നാം പാദം',
      'നാലാം പാദം'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['y, MMMM d, EEEE', 'y, MMMM d', 'y, MMM d', 'dd/MM/yy'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [6, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale mr.
 */
goog.i18n.DateTimeSymbols_mr = {
  ERAS: ['ईसापूर्व', 'सन'],
  ERANAMES: ['ईसवीसनपूर्व', 'ईसवीसन'],
  NARROWMONTHS: ['जा', 'फे', 'मा', 'ए', 'मे', 'जू',
      'जु', 'ऑ', 'स', 'ऑ', 'नो', 'डि'],
  STANDALONENARROWMONTHS: ['जा', 'फे', 'मा', 'ए', 'मे',
      'जू', 'जु', 'ऑ', 'स', 'ऑ', 'नो', 'डि'],
  MONTHS: ['जानेवारी', 'फेब्रुवारी',
      'मार्च', 'एप्रिल', 'मे', 'जून',
      'जुलै', 'ऑगस्ट', 'सप्टेंबर',
      'ऑक्टोबर', 'नोव्हेंबर',
      'डिसेंबर'],
  STANDALONEMONTHS: ['जानेवारी',
      'फेब्रुवारी', 'मार्च', 'एप्रिल',
      'मे', 'जून', 'जुलै', 'ऑगस्ट',
      'सप्टेंबर', 'ऑक्टोबर',
      'नोव्हेंबर', 'डिसेंबर'],
  SHORTMONTHS: ['जाने', 'फेब्रु', 'मार्च',
      'एप्रि', 'मे', 'जून', 'जुलै', 'ऑग',
      'सेप्टें', 'ऑक्टोबर', 'नोव्हें',
      'डिसें'],
  STANDALONESHORTMONTHS: ['जाने', 'फेब्रु',
      'मार्च', 'एप्रि', 'मे', 'जून',
      'जुलै', 'ऑग', 'सेप्टें',
      'ऑक्टोबर', 'नोव्हें', 'डिसें'],
  WEEKDAYS: ['रविवार', 'सोमवार',
      'मंगळवार', 'बुधवार', 'गुरुवार',
      'शुक्रवार', 'शनिवार'],
  STANDALONEWEEKDAYS: ['रविवार', 'सोमवार',
      'मंगळवार', 'बुधवार', 'गुरुवार',
      'शुक्रवार', 'शनिवार'],
  SHORTWEEKDAYS: ['रवि', 'सोम', 'मंगळ', 'बुध',
      'गुरु', 'शुक्र', 'शनि'],
  STANDALONESHORTWEEKDAYS: ['रवि', 'सोम', 'मंगळ',
      'बुध', 'गुरु', 'शुक्र', 'शनि'],
  NARROWWEEKDAYS: ['र', 'सो', 'मं', 'बु', 'गु', 'शु',
      'श'],
  STANDALONENARROWWEEKDAYS: ['र', 'सो', 'मं', 'बु', 'गु',
      'शु', 'श'],
  SHORTQUARTERS: ['ति 1', '2 री तिमाही', 'ति 3',
      'ति 4'],
  QUARTERS: ['प्रथम तिमाही',
      'द्वितीय तिमाही',
      'तृतीय तिमाही',
      'चतुर्थ तिमाही'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'd-M-yy'],
  TIMEFORMATS: ['h-mm-ss a zzzz', 'h-mm-ss a z', 'h-mm-ss a', 'h-mm a'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [6, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale ms.
 */
goog.i18n.DateTimeSymbols_ms = {
  ERAS: ['S.M.', 'TM'],
  ERANAMES: ['S.M.', 'TM'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'O', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'O', 'S', 'O',
      'N', 'D'],
  MONTHS: ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos',
      'September', 'Oktober', 'November', 'Disember'],
  STANDALONEMONTHS: ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
      'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogos', 'Sep',
      'Okt', 'Nov', 'Dis'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul',
      'Ogos', 'Sep', 'Okt', 'Nov', 'Dis'],
  WEEKDAYS: ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'],
  STANDALONEWEEKDAYS: ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat',
      'Sabtu'],
  SHORTWEEKDAYS: ['Ahd', 'Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab'],
  STANDALONESHORTWEEKDAYS: ['Ahd', 'Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab'],
  NARROWWEEKDAYS: ['A', 'I', 'S', 'R', 'K', 'J', 'S'],
  STANDALONENARROWWEEKDAYS: ['A', 'I', 'S', 'R', 'K', 'J', 'S'],
  SHORTQUARTERS: ['Suku 1', 'Suku Ke-2', 'Suku Ke-3', 'Suku Ke-4'],
  QUARTERS: ['Suku pertama', 'Suku Ke-2', 'Suku Ke-3', 'Suku Ke-4'],
  AMPMS: ['PG', 'PTG'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'dd/MM/yyyy', 'd/MM/yy'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale mt.
 */
goog.i18n.DateTimeSymbols_mt = {
  ERAS: ['QK', 'WK'],
  ERANAMES: ['Qabel Kristu', 'Wara Kristu'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'Ġ', 'L', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'Ġ', 'L', 'A', 'S', 'O',
      'N', 'D'],
  MONTHS: ['Jannar', 'Frar', 'Marzu', 'April', 'Mejju', 'Ġunju', 'Lulju',
      'Awwissu', 'Settembru', 'Ottubru', 'Novembru', 'Diċembru'],
  STANDALONEMONTHS: ['Jannar', 'Frar', 'Marzu', 'April', 'Mejju', 'Ġunju',
      'Lulju', 'Awwissu', 'Settembru', 'Ottubru', 'Novembru', 'Diċembru'],
  SHORTMONTHS: ['Jan', 'Fra', 'Mar', 'Apr', 'Mej', 'Ġun', 'Lul', 'Aww', 'Set',
      'Ott', 'Nov', 'Diċ'],
  STANDALONESHORTMONTHS: ['Jan', 'Fra', 'Mar', 'Apr', 'Mej', 'Ġun', 'Lul',
      'Aww', 'Set', 'Ott', 'Nov', 'Diċ'],
  WEEKDAYS: ['Il-Ħadd', 'It-Tnejn', 'It-Tlieta', 'L-Erbgħa', 'Il-Ħamis',
      'Il-Ġimgħa', 'Is-Sibt'],
  STANDALONEWEEKDAYS: ['Il-Ħadd', 'It-Tnejn', 'It-Tlieta', 'L-Erbgħa',
      'Il-Ħamis', 'Il-Ġimgħa', 'Is-Sibt'],
  SHORTWEEKDAYS: ['Ħad', 'Tne', 'Tli', 'Erb', 'Ħam', 'Ġim', 'Sib'],
  STANDALONESHORTWEEKDAYS: ['Ħad', 'Tne', 'Tli', 'Erb', 'Ħam', 'Ġim', 'Sib'],
  NARROWWEEKDAYS: ['Ħ', 'T', 'T', 'E', 'Ħ', 'Ġ', 'S'],
  STANDALONENARROWWEEKDAYS: ['Ħ', 'T', 'T', 'E', 'Ħ', 'Ġ', 'S'],
  SHORTQUARTERS: ['K1', 'K2', 'K3', 'K4'],
  QUARTERS: ['K1', 'K2', 'K3', 'K4'],
  AMPMS: ['QN', 'WN'],
  DATEFORMATS: ['EEEE, d \'ta\'’ MMMM y', 'd \'ta\'’ MMMM y', 'dd MMM y',
      'dd/MM/yyyy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale nl.
 */
goog.i18n.DateTimeSymbols_nl = {
  ERAS: ['v. Chr.', 'n. Chr.'],
  ERANAMES: ['Voor Christus', 'na Christus'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O',
      'N', 'D'],
  MONTHS: ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli',
      'augustus', 'september', 'oktober', 'november', 'december'],
  STANDALONEMONTHS: ['januari', 'februari', 'maart', 'april', 'mei', 'juni',
      'juli', 'augustus', 'september', 'oktober', 'november', 'december'],
  SHORTMONTHS: ['jan.', 'feb.', 'mrt.', 'apr.', 'mei', 'jun.', 'jul.', 'aug.',
      'sep.', 'okt.', 'nov.', 'dec.'],
  STANDALONESHORTMONTHS: ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul',
      'aug', 'sep', 'okt', 'nov', 'dec'],
  WEEKDAYS: ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag',
      'zaterdag'],
  STANDALONEWEEKDAYS: ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag',
      'vrijdag', 'zaterdag'],
  SHORTWEEKDAYS: ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'],
  STANDALONESHORTWEEKDAYS: ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'],
  NARROWWEEKDAYS: ['Z', 'M', 'D', 'W', 'D', 'V', 'Z'],
  STANDALONENARROWWEEKDAYS: ['Z', 'M', 'D', 'W', 'D', 'V', 'Z'],
  SHORTQUARTERS: ['K1', 'K2', 'K3', 'K4'],
  QUARTERS: ['1e kwartaal', '2e kwartaal', '3e kwartaal', '4e kwartaal'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'dd-MM-yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale no.
 */
goog.i18n.DateTimeSymbols_no = {
  ERAS: ['f.Kr.', 'e.Kr.'],
  ERANAMES: ['f.Kr.', 'e.Kr.'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O',
      'N', 'D'],
  MONTHS: ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli',
      'august', 'september', 'oktober', 'november', 'desember'],
  STANDALONEMONTHS: ['januar', 'februar', 'mars', 'april', 'mai', 'juni',
      'juli', 'august', 'september', 'oktober', 'november', 'desember'],
  SHORTMONTHS: ['jan.', 'feb.', 'mars', 'apr.', 'mai', 'juni', 'juli', 'aug.',
      'sep.', 'okt.', 'nov.', 'des.'],
  STANDALONESHORTMONTHS: ['jan', 'feb', 'mar', 'apr', 'mai', 'jun', 'jul',
      'aug', 'sep', 'okt', 'nov', 'des'],
  WEEKDAYS: ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag',
      'lørdag'],
  STANDALONEWEEKDAYS: ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag',
      'fredag', 'lørdag'],
  SHORTWEEKDAYS: ['søn.', 'man.', 'tir.', 'ons.', 'tor.', 'fre.', 'lør.'],
  STANDALONESHORTWEEKDAYS: ['sø.', 'ma.', 'ti.', 'on.', 'to.', 'fr.', 'lø.'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'O', 'T', 'F', 'L'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'O', 'T', 'F', 'L'],
  SHORTQUARTERS: ['K1', 'K2', 'K3', 'K4'],
  QUARTERS: ['1. kvartal', '2. kvartal', '3. kvartal', '4. kvartal'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE d. MMMM y', 'd. MMMM y', 'd. MMM y', 'dd.MM.yy'],
  TIMEFORMATS: ['\'kl\'. HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale or.
 */
goog.i18n.DateTimeSymbols_or = {
  ERAS: ['BCE', 'CE'],
  ERANAMES: ['BCE', 'CE'],
  NARROWMONTHS: ['ଜା', 'ଫେ', 'ମା', 'ଅ', 'ମେ', 'ଜୁ',
      'ଜୁ', 'ଅ', 'ସେ', 'ଅ', 'ନ', 'ଡି'],
  STANDALONENARROWMONTHS: ['ଜା', 'ଫେ', 'ମା', 'ଅ', 'ମେ',
      'ଜୁ', 'ଜୁ', 'ଅ', 'ସେ', 'ଅ', 'ନ', 'ଡି'],
  MONTHS: ['ଜାନୁଆରୀ', 'ଫେବ୍ରୁୟାରୀ',
      'ମାର୍ଚ୍ଚ', 'ଅପ୍ରେଲ', 'ମେ', 'ଜୁନ',
      'ଜୁଲାଇ', 'ଅଗଷ୍ଟ', 'ସେପ୍ଟେମ୍ବର',
      'ଅକ୍ଟୋବର', 'ନଭେମ୍ବର',
      'ଡିସେମ୍ବର'],
  STANDALONEMONTHS: ['ଜାନୁଆରୀ', 'ଫେବ୍ରୁୟାରୀ',
      'ମାର୍ଚ୍ଚ', 'ଅପ୍ରେଲ', 'ମେ', 'ଜୁନ',
      'ଜୁଲାଇ', 'ଅଗଷ୍ଟ', 'ସେପ୍ଟେମ୍ବର',
      'ଅକ୍ଟୋବର', 'ନଭେମ୍ବର',
      'ଡିସେମ୍ବର'],
  SHORTMONTHS: ['ଜାନୁଆରୀ', 'ଫେବ୍ରୁୟାରୀ',
      'ମାର୍ଚ୍ଚ', 'ଅପ୍ରେଲ', 'ମେ', 'ଜୁନ',
      'ଜୁଲାଇ', 'ଅଗଷ୍ଟ', 'ସେପ୍ଟେମ୍ବର',
      'ଅକ୍ଟୋବର', 'ନଭେମ୍ବର',
      'ଡିସେମ୍ବର'],
  STANDALONESHORTMONTHS: ['ଜାନୁଆରୀ',
      'ଫେବ୍ରୁୟାରୀ', 'ମାର୍ଚ୍ଚ',
      'ଅପ୍ରେଲ', 'ମେ', 'ଜୁନ', 'ଜୁଲାଇ',
      'ଅଗଷ୍ଟ', 'ସେପ୍ଟେମ୍ବର',
      'ଅକ୍ଟୋବର', 'ନଭେମ୍ବର',
      'ଡିସେମ୍ବର'],
  WEEKDAYS: ['ରବିବାର', 'ସୋମବାର',
      'ମଙ୍ଗଳବାର', 'ବୁଧବାର', 'ଗୁରୁବାର',
      'ଶୁକ୍ରବାର', 'ଶନିବାର'],
  STANDALONEWEEKDAYS: ['ରବିବାର', 'ସୋମବାର',
      'ମଙ୍ଗଳବାର', 'ବୁଧବାର', 'ଗୁରୁବାର',
      'ଶୁକ୍ରବାର', 'ଶନିବାର'],
  SHORTWEEKDAYS: ['ରବି', 'ସୋମ', 'ମଙ୍ଗଳ', 'ବୁଧ',
      'ଗୁରୁ', 'ଶୁକ୍ର', 'ଶନି'],
  STANDALONESHORTWEEKDAYS: ['ରବି', 'ସୋମ', 'ମଙ୍ଗଳ',
      'ବୁଧ', 'ଗୁରୁ', 'ଶୁକ୍ର', 'ଶନି'],
  NARROWWEEKDAYS: ['ର', 'ସୋ', 'ମ', 'ବୁ', 'ଗୁ', 'ଶୁ', 'ଶ'],
  STANDALONENARROWWEEKDAYS: ['ର', 'ସୋ', 'ମ', 'ବୁ', 'ଗୁ',
      'ଶୁ', 'ଶ'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'd-M-yy'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [6, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale pl.
 */
goog.i18n.DateTimeSymbols_pl = {
  ERAS: ['p.n.e.', 'n.e.'],
  ERANAMES: ['p.n.e.', 'n.e.'],
  NARROWMONTHS: ['s', 'l', 'm', 'k', 'm', 'c', 'l', 's', 'w', 'p', 'l', 'g'],
  STANDALONENARROWMONTHS: ['s', 'l', 'm', 'k', 'm', 'c', 'l', 's', 'w', 'p',
      'l', 'g'],
  MONTHS: ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
      'lipca', 'sierpnia', 'września', 'października', 'listopada',
      'grudnia'],
  STANDALONEMONTHS: ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj',
      'czerwiec', 'lipiec', 'sierpień', 'wrzesień', 'październik',
      'listopad', 'grudzień'],
  SHORTMONTHS: ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz',
      'paź', 'lis', 'gru'],
  STANDALONESHORTMONTHS: ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip',
      'sie', 'wrz', 'paź', 'lis', 'gru'],
  WEEKDAYS: ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek',
      'piątek', 'sobota'],
  STANDALONEWEEKDAYS: ['niedziela', 'poniedziałek', 'wtorek', 'środa',
      'czwartek', 'piątek', 'sobota'],
  SHORTWEEKDAYS: ['niedz.', 'pon.', 'wt.', 'śr.', 'czw.', 'pt.', 'sob.'],
  STANDALONESHORTWEEKDAYS: ['niedz.', 'pon.', 'wt.', 'śr.', 'czw.', 'pt.',
      'sob.'],
  NARROWWEEKDAYS: ['N', 'P', 'W', 'Ś', 'C', 'P', 'S'],
  STANDALONENARROWWEEKDAYS: ['N', 'P', 'W', 'Ś', 'C', 'P', 'S'],
  SHORTQUARTERS: ['K1', 'K2', 'K3', 'K4'],
  QUARTERS: ['I kwartał', 'II kwartał', 'III kwartał', 'IV kwartał'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd.MM.yyyy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale pt.
 */
goog.i18n.DateTimeSymbols_pt = {
  ERAS: ['a.C.', 'd.C.'],
  ERANAMES: ['Antes de Cristo', 'Ano do Senhor'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O',
      'N', 'D'],
  MONTHS: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho',
      'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
  STANDALONEMONTHS: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
  SHORTMONTHS: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set',
      'out', 'nov', 'dez'],
  STANDALONESHORTMONTHS: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul',
      'ago', 'set', 'out', 'nov', 'dez'],
  WEEKDAYS: ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira',
      'quinta-feira', 'sexta-feira', 'sábado'],
  STANDALONEWEEKDAYS: ['domingo', 'segunda-feira', 'terça-feira',
      'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'],
  SHORTWEEKDAYS: ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'],
  STANDALONESHORTWEEKDAYS: ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'],
  NARROWWEEKDAYS: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1º trimestre', '2º trimestre', '3º trimestre',
      '4º trimestre'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE, d \'de\' MMMM \'de\' y', 'd \'de\' MMMM \'de\' y',
      'dd/MM/yyyy', 'dd/MM/yy'],
  TIMEFORMATS: ['HH\'h\'mm\'min\'ss\'s\' zzzz', 'HH\'h\'mm\'min\'ss\'s\' z',
      'HH:mm:ss', 'HH:mm'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale pt_BR.
 */
goog.i18n.DateTimeSymbols_pt_BR = goog.i18n.DateTimeSymbols_pt;


/**
 * Date/time formatting symbols for locale pt_PT.
 */
goog.i18n.DateTimeSymbols_pt_PT = {
  ERAS: ['a.C.', 'd.C.'],
  ERANAMES: ['Antes de Cristo', 'Ano do Senhor'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O',
      'N', 'D'],
  MONTHS: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho',
      'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
  STANDALONEMONTHS: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
  SHORTMONTHS: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set',
      'Out', 'Nov', 'Dez'],
  STANDALONESHORTMONTHS: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul',
      'Ago', 'Set', 'Out', 'Nov', 'Dez'],
  WEEKDAYS: ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
      'Quinta-feira', 'Sexta-feira', 'Sábado'],
  STANDALONEWEEKDAYS: ['Domingo', 'Segunda-feira', 'Terça-feira',
      'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'],
  SHORTWEEKDAYS: ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'],
  STANDALONESHORTWEEKDAYS: ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'],
  NARROWWEEKDAYS: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1.º trimestre', '2.º trimestre', '3.º trimestre',
      '4.º trimestre'],
  AMPMS: ['a.m.', 'p.m.'],
  DATEFORMATS: ['EEEE, d \'de\' MMMM \'de\' y', 'd \'de\' MMMM \'de\' y',
      'dd/MM/yyyy', 'dd/MM/yy'],
  TIMEFORMATS: ['H:mm:ss zzzz', 'H:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale ro.
 */
goog.i18n.DateTimeSymbols_ro = {
  ERAS: ['î.Hr.', 'd.Hr.'],
  ERANAMES: ['înainte de Hristos', 'după Hristos'],
  NARROWMONTHS: ['I', 'F', 'M', 'A', 'M', 'I', 'I', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['I', 'F', 'M', 'A', 'M', 'I', 'I', 'A', 'S', 'O',
      'N', 'D'],
  MONTHS: ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie',
      'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie'],
  STANDALONEMONTHS: ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai',
      'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie',
      'decembrie'],
  SHORTMONTHS: ['ian.', 'feb.', 'mar.', 'apr.', 'mai', 'iun.', 'iul.', 'aug.',
      'sept.', 'oct.', 'nov.', 'dec.'],
  STANDALONESHORTMONTHS: ['ian.', 'feb.', 'mar.', 'apr.', 'mai', 'iun.', 'iul.',
      'aug.', 'sept.', 'oct.', 'nov.', 'dec.'],
  WEEKDAYS: ['duminică', 'luni', 'marți', 'miercuri', 'joi', 'vineri',
      'sâmbătă'],
  STANDALONEWEEKDAYS: ['duminică', 'luni', 'marți', 'miercuri', 'joi',
      'vineri', 'sâmbătă'],
  SHORTWEEKDAYS: ['Du', 'Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sâ'],
  STANDALONESHORTWEEKDAYS: ['Du', 'Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sâ'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['trim. I', 'trim. II', 'trim. III', 'trim. IV'],
  QUARTERS: ['trimestrul I', 'trimestrul al II-lea', 'trimestrul al III-lea',
      'trimestrul al IV-lea'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'dd.MM.yyyy', 'dd.MM.yyyy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale ru.
 */
goog.i18n.DateTimeSymbols_ru = {
  ERAS: ['до н.э.', 'н.э.'],
  ERANAMES: ['до н.э.', 'н.э.'],
  NARROWMONTHS: ['Я', 'Ф', 'М', 'А', 'М', 'И', 'И', 'А', 'С', 'О',
      'Н', 'Д'],
  STANDALONENARROWMONTHS: ['Я', 'Ф', 'М', 'А', 'М', 'И', 'И', 'А', 'С',
      'О', 'Н', 'Д'],
  MONTHS: ['января', 'февраля', 'марта', 'апреля',
      'мая', 'июня', 'июля', 'августа', 'сентября',
      'октября', 'ноября', 'декабря'],
  STANDALONEMONTHS: ['Январь', 'Февраль', 'Март',
      'Апрель', 'Май', 'Июнь', 'Июль', 'Август',
      'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
  SHORTMONTHS: ['янв', 'фев', 'мар', 'апр', 'мая', 'июн',
      'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
  STANDALONESHORTMONTHS: ['Янв.', 'Февр.', 'Март', 'Апр.',
      'Май', 'Июнь', 'Июль', 'Авг.', 'Сент.', 'Окт.',
      'Нояб.', 'Дек.'],
  WEEKDAYS: ['воскресенье', 'понедельник',
      'вторник', 'среда', 'четверг', 'пятница',
      'суббота'],
  STANDALONEWEEKDAYS: ['Воскресенье', 'Понедельник',
      'Вторник', 'Среда', 'Четверг', 'Пятница',
      'Суббота'],
  SHORTWEEKDAYS: ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'],
  STANDALONESHORTWEEKDAYS: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт',
      'Сб'],
  NARROWWEEKDAYS: ['В', 'Пн', 'Вт', 'С', 'Ч', 'П', 'С'],
  STANDALONENARROWWEEKDAYS: ['В', 'П', 'В', 'С', 'Ч', 'П', 'С'],
  SHORTQUARTERS: ['1-й кв.', '2-й кв.', '3-й кв.', '4-й кв.'],
  QUARTERS: ['1-й квартал', '2-й квартал',
      '3-й квартал', '4-й квартал'],
  AMPMS: ['до полудня', 'после полудня'],
  DATEFORMATS: ['EEEE, d MMMM y \'г\'.', 'd MMMM y \'г\'.', 'dd.MM.yyyy',
      'dd.MM.yy'],
  TIMEFORMATS: ['H:mm:ss zzzz', 'H:mm:ss z', 'H:mm:ss', 'H:mm'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale sk.
 */
goog.i18n.DateTimeSymbols_sk = {
  ERAS: ['pred n.l.', 'n.l.'],
  ERANAMES: ['pred n.l.', 'n.l.'],
  NARROWMONTHS: ['j', 'f', 'm', 'a', 'm', 'j', 'j', 'a', 's', 'o', 'n', 'd'],
  STANDALONENARROWMONTHS: ['j', 'f', 'm', 'a', 'm', 'j', 'j', 'a', 's', 'o',
      'n', 'd'],
  MONTHS: ['januára', 'februára', 'marca', 'apríla', 'mája', 'júna',
      'júla', 'augusta', 'septembra', 'októbra', 'novembra', 'decembra'],
  STANDALONEMONTHS: ['január', 'február', 'marec', 'apríl', 'máj', 'jún',
      'júl', 'august', 'september', 'október', 'november', 'december'],
  SHORTMONTHS: ['jan', 'feb', 'mar', 'apr', 'máj', 'jún', 'júl', 'aug',
      'sep', 'okt', 'nov', 'dec'],
  STANDALONESHORTMONTHS: ['jan', 'feb', 'mar', 'apr', 'máj', 'jún', 'júl',
      'aug', 'sep', 'okt', 'nov', 'dec'],
  WEEKDAYS: ['nedeľa', 'pondelok', 'utorok', 'streda', 'štvrtok', 'piatok',
      'sobota'],
  STANDALONEWEEKDAYS: ['nedeľa', 'pondelok', 'utorok', 'streda', 'štvrtok',
      'piatok', 'sobota'],
  SHORTWEEKDAYS: ['ne', 'po', 'ut', 'st', 'št', 'pi', 'so'],
  STANDALONESHORTWEEKDAYS: ['ne', 'po', 'ut', 'st', 'št', 'pi', 'so'],
  NARROWWEEKDAYS: ['N', 'P', 'U', 'S', 'Š', 'P', 'S'],
  STANDALONENARROWWEEKDAYS: ['N', 'P', 'U', 'S', 'Š', 'P', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1. štvrťrok', '2. štvrťrok', '3. štvrťrok',
      '4. štvrťrok'],
  AMPMS: ['dopoludnia', 'popoludní'],
  DATEFORMATS: ['EEEE, d. MMMM y', 'd. MMMM y', 'd.M.yyyy', 'd.M.yyyy'],
  TIMEFORMATS: ['H:mm:ss zzzz', 'H:mm:ss z', 'H:mm:ss', 'H:mm'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale sl.
 */
goog.i18n.DateTimeSymbols_sl = {
  ERAS: ['pr. n. št.', 'po Kr.'],
  ERANAMES: ['pred našim štetjem', 'naše štetje'],
  NARROWMONTHS: ['j', 'f', 'm', 'a', 'm', 'j', 'j', 'a', 's', 'o', 'n', 'd'],
  STANDALONENARROWMONTHS: ['j', 'f', 'm', 'a', 'm', 'j', 'j', 'a', 's', 'o',
      'n', 'd'],
  MONTHS: ['januar', 'februar', 'marec', 'april', 'maj', 'junij', 'julij',
      'avgust', 'september', 'oktober', 'november', 'december'],
  STANDALONEMONTHS: ['januar', 'februar', 'marec', 'april', 'maj', 'junij',
      'julij', 'avgust', 'september', 'oktober', 'november', 'december'],
  SHORTMONTHS: ['jan.', 'feb.', 'mar.', 'apr.', 'maj', 'jun.', 'jul.', 'avg.',
      'sep.', 'okt.', 'nov.', 'dec.'],
  STANDALONESHORTMONTHS: ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul',
      'avg', 'sep', 'okt', 'nov', 'dec'],
  WEEKDAYS: ['nedelja', 'ponedeljek', 'torek', 'sreda', 'četrtek', 'petek',
      'sobota'],
  STANDALONEWEEKDAYS: ['nedelja', 'ponedeljek', 'torek', 'sreda', 'četrtek',
      'petek', 'sobota'],
  SHORTWEEKDAYS: ['ned.', 'pon.', 'tor.', 'sre.', 'čet.', 'pet.', 'sob.'],
  STANDALONESHORTWEEKDAYS: ['ned', 'pon', 'tor', 'sre', 'čet', 'pet', 'sob'],
  NARROWWEEKDAYS: ['n', 'p', 't', 's', 'č', 'p', 's'],
  STANDALONENARROWWEEKDAYS: ['n', 'p', 't', 's', 'č', 'p', 's'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1. četrtletje', '2. četrtletje', '3. četrtletje',
      '4. četrtletje'],
  AMPMS: ['dop.', 'pop.'],
  DATEFORMATS: ['EEEE, dd. MMMM y', 'dd. MMMM y', 'd. MMM yyyy', 'd. MM. yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale sq.
 */
goog.i18n.DateTimeSymbols_sq = {
  ERAS: ['p.e.r.', 'n.e.r.'],
  ERANAMES: ['p.e.r.', 'n.e.r.'],
  NARROWMONTHS: ['J', 'S', 'M', 'P', 'M', 'Q', 'K', 'G', 'S', 'T', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'S', 'M', 'P', 'M', 'Q', 'K', 'G', 'S', 'T',
      'N', 'D'],
  MONTHS: ['janar', 'shkurt', 'mars', 'prill', 'maj', 'qershor', 'korrik',
      'gusht', 'shtator', 'tetor', 'nëntor', 'dhjetor'],
  STANDALONEMONTHS: ['janar', 'shkurt', 'mars', 'prill', 'maj', 'qershor',
      'korrik', 'gusht', 'shtator', 'tetor', 'nëntor', 'dhjetor'],
  SHORTMONTHS: ['Jan', 'Shk', 'Mar', 'Pri', 'Maj', 'Qer', 'Kor', 'Gsh', 'Sht',
      'Tet', 'Nën', 'Dhj'],
  STANDALONESHORTMONTHS: ['Jan', 'Shk', 'Mar', 'Pri', 'Maj', 'Qer', 'Kor',
      'Gsh', 'Sht', 'Tet', 'Nën', 'Dhj'],
  WEEKDAYS: ['e diel', 'e hënë', 'e martë', 'e mërkurë', 'e enjte',
      'e premte', 'e shtunë'],
  STANDALONEWEEKDAYS: ['e diel', 'e hënë', 'e martë', 'e mërkurë',
      'e enjte', 'e premte', 'e shtunë'],
  SHORTWEEKDAYS: ['Die', 'Hën', 'Mar', 'Mër', 'Enj', 'Pre', 'Sht'],
  STANDALONESHORTWEEKDAYS: ['Die', 'Hën', 'Mar', 'Mër', 'Enj', 'Pre', 'Sht'],
  NARROWWEEKDAYS: ['D', 'H', 'M', 'M', 'E', 'P', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'H', 'M', 'M', 'E', 'P', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  AMPMS: ['PD', 'MD'],
  DATEFORMATS: ['EEEE, dd MMMM y', 'dd MMMM y', 'yyyy-MM-dd', 'yy-MM-dd'],
  TIMEFORMATS: ['h.mm.ss.a zzzz', 'h.mm.ss.a z', 'h.mm.ss.a', 'h.mm.a'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale sr.
 */
goog.i18n.DateTimeSymbols_sr = {
  ERAS: ['п. н. е.', 'н. е.'],
  ERANAMES: ['Пре нове ере', 'Нове ере'],
  NARROWMONTHS: ['ј', 'ф', 'м', 'а', 'м', 'ј', 'ј', 'а', 'с', 'о',
      'н', 'д'],
  STANDALONENARROWMONTHS: ['ј', 'ф', 'м', 'а', 'м', 'ј', 'ј', 'а', 'с',
      'о', 'н', 'д'],
  MONTHS: ['јануар', 'фебруар', 'март', 'април', 'мај',
      'јун', 'јул', 'август', 'септембар',
      'октобар', 'новембар', 'децембар'],
  STANDALONEMONTHS: ['јануар', 'фебруар', 'март', 'април',
      'мај', 'јун', 'јул', 'август', 'септембар',
      'октобар', 'новембар', 'децембар'],
  SHORTMONTHS: ['јан', 'феб', 'мар', 'апр', 'мај', 'јун',
      'јул', 'авг', 'сеп', 'окт', 'нов', 'дец'],
  STANDALONESHORTMONTHS: ['јан', 'феб', 'мар', 'апр', 'мај',
      'јун', 'јул', 'авг', 'сеп', 'окт', 'нов', 'дец'],
  WEEKDAYS: ['недеља', 'понедељак', 'уторак', 'среда',
      'четвртак', 'петак', 'субота'],
  STANDALONEWEEKDAYS: ['недеља', 'понедељак', 'уторак',
      'среда', 'четвртак', 'петак', 'субота'],
  SHORTWEEKDAYS: ['нед', 'пон', 'уто', 'сре', 'чет', 'пет',
      'суб'],
  STANDALONESHORTWEEKDAYS: ['нед', 'пон', 'уто', 'сре', 'чет',
      'пет', 'суб'],
  NARROWWEEKDAYS: ['н', 'п', 'у', 'с', 'ч', 'п', 'с'],
  STANDALONENARROWWEEKDAYS: ['н', 'п', 'у', 'с', 'ч', 'п', 'с'],
  SHORTQUARTERS: ['К1', 'К2', 'К3', 'К4'],
  QUARTERS: ['Прво тромесечје', 'Друго тромесечје',
      'Треће тромесечје', 'Четврто тромесечје'],
  AMPMS: ['пре подне', 'поподне'],
  DATEFORMATS: ['EEEE, dd. MMMM y.', 'dd. MMMM y.', 'dd.MM.y.', 'd.M.yy.'],
  TIMEFORMATS: ['HH.mm.ss zzzz', 'HH.mm.ss z', 'HH.mm.ss', 'HH.mm'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale sv.
 */
goog.i18n.DateTimeSymbols_sv = {
  ERAS: ['f.Kr.', 'e.Kr.'],
  ERANAMES: ['före Kristus', 'efter Kristus'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O',
      'N', 'D'],
  MONTHS: ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli',
      'augusti', 'september', 'oktober', 'november', 'december'],
  STANDALONEMONTHS: ['januari', 'februari', 'mars', 'april', 'maj', 'juni',
      'juli', 'augusti', 'september', 'oktober', 'november', 'december'],
  SHORTMONTHS: ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep',
      'okt', 'nov', 'dec'],
  STANDALONESHORTMONTHS: ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul',
      'aug', 'sep', 'okt', 'nov', 'dec'],
  WEEKDAYS: ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag',
      'lördag'],
  STANDALONEWEEKDAYS: ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag',
      'fredag', 'lördag'],
  SHORTWEEKDAYS: ['sön', 'mån', 'tis', 'ons', 'tors', 'fre', 'lör'],
  STANDALONESHORTWEEKDAYS: ['sön', 'mån', 'tis', 'ons', 'tor', 'fre', 'lör'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'O', 'T', 'F', 'L'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'O', 'T', 'F', 'L'],
  SHORTQUARTERS: ['K1', 'K2', 'K3', 'K4'],
  QUARTERS: ['1:a kvartalet', '2:a kvartalet', '3:e kvartalet',
      '4:e kvartalet'],
  AMPMS: ['fm', 'em'],
  DATEFORMATS: ['EEEE\'en\' \'den\' d:\'e\' MMMM y', 'd MMMM y', 'd MMM y',
      'yyyy-MM-dd'],
  TIMEFORMATS: ['\'kl\'. HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale sw.
 */
goog.i18n.DateTimeSymbols_sw = {
  ERAS: ['KK', 'BK'],
  ERANAMES: ['Kabla ya Kristo', 'Baada ya Kristo'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O',
      'N', 'D'],
  MONTHS: ['Januari', 'Februari', 'Machi', 'Aprili', 'Mei', 'Juni', 'Julai',
      'Agosti', 'Septemba', 'Oktoba', 'Novemba', 'Desemba'],
  STANDALONEMONTHS: ['Januari', 'Februari', 'Machi', 'Aprili', 'Mei', 'Juni',
      'Julai', 'Agosti', 'Septemba', 'Oktoba', 'Novemba', 'Desemba'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ago', 'Sep',
      'Okt', 'Nov', 'Des'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul',
      'Ago', 'Sep', 'Okt', 'Nov', 'Des'],
  WEEKDAYS: ['Jumapili', 'Jumatatu', 'Jumanne', 'Jumatano', 'Alhamisi',
      'Ijumaa', 'Jumamosi'],
  STANDALONEWEEKDAYS: ['Jumapili', 'Jumatatu', 'Jumanne', 'Jumatano',
      'Alhamisi', 'Ijumaa', 'Jumamosi'],
  SHORTWEEKDAYS: ['J2', 'J3', 'J4', 'J5', 'Alh', 'Ij', 'J1'],
  STANDALONESHORTWEEKDAYS: ['J2', 'J3', 'J4', 'J5', 'Alh', 'Ij', 'J1'],
  NARROWWEEKDAYS: ['2', '3', '4', '5', 'A', 'I', '1'],
  STANDALONENARROWWEEKDAYS: ['2', '3', '4', '5', 'A', 'I', '1'],
  SHORTQUARTERS: ['R1', 'R2', 'R3', 'R4'],
  QUARTERS: ['Robo 1', 'Robo 2', 'Robo 3', 'Robo 4'],
  AMPMS: ['asubuhi', 'alasiri'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/yyyy'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale ta.
 */
goog.i18n.DateTimeSymbols_ta = {
  ERAS: ['கி.மு.', 'கி.பி.'],
  ERANAMES: ['கிறிஸ்துவுக்கு முன்',
      'அனோ டோமினி'],
  NARROWMONTHS: ['ஜ', 'பி', 'மா', 'ஏ', 'மே', 'ஜூ', 'ஜூ',
      'ஆ', 'செ', 'அ', 'ந', 'டி'],
  STANDALONENARROWMONTHS: ['ஜ', 'பி', 'மா', 'ஏ', 'மே', 'ஜூ',
      'ஜூ', 'ஆ', 'செ', 'அ', 'ந', 'டி'],
  MONTHS: ['ஜனவரி', 'பிப்ரவரி', 'மார்ச்',
      'ஏப்ரல்', 'மே', 'ஜூன்', 'ஜூலை',
      'ஆகஸ்ட்', 'செப்டம்பர்',
      'அக்டோபர்', 'நவம்பர்',
      'டிசம்பர்'],
  STANDALONEMONTHS: ['ஜனவரி', 'பிப்ரவரி',
      'மார்ச்', 'ஏப்ரல்', 'மே', 'ஜூன்',
      'ஜூலை', 'ஆகஸ்டு', 'செப்டம்பர்',
      'அக்டோபர்', 'நவம்பர்',
      'டிசம்பர்'],
  SHORTMONTHS: ['ஜன.', 'பிப்.', 'மார்.', 'ஏப்.',
      'மே', 'ஜூன்', 'ஜூலை', 'ஆக.', 'செப்.',
      'அக்.', 'நவ.', 'டிச.'],
  STANDALONESHORTMONTHS: ['ஜன.', 'பிப்.', 'மார்.',
      'ஏப்.', 'மே', 'ஜூன்', 'ஜூலை', 'ஆக.',
      'செப்.', 'அக்.', 'நவ.', 'டிச.'],
  WEEKDAYS: ['ஞாயிறு', 'திங்கள்',
      'செவ்வாய்', 'புதன்', 'வியாழன்',
      'வெள்ளி', 'சனி'],
  STANDALONEWEEKDAYS: ['ஞாயிறு', 'திங்கள்',
      'செவ்வாய்', 'புதன்', 'வியாழன்',
      'வெள்ளி', 'சனி'],
  SHORTWEEKDAYS: ['ஞா', 'தி', 'செ', 'பு', 'வி', 'வெ',
      'ச'],
  STANDALONESHORTWEEKDAYS: ['ஞா', 'தி', 'செ', 'பு', 'வி',
      'வெ', 'ச'],
  NARROWWEEKDAYS: ['ஞா', 'தி', 'செ', 'பு', 'வி', 'வெ',
      'ச'],
  STANDALONENARROWWEEKDAYS: ['ஞா', 'தி', 'செ', 'பு', 'வி',
      'வெ', 'ச'],
  SHORTQUARTERS: ['காலாண்டு1', 'காலாண்டு2',
      'காலாண்டு3', 'காலாண்டு4'],
  QUARTERS: ['முதல் காலாண்டு',
      'இரண்டாம் காலாண்டு',
      'மூன்றாம் காலாண்டு',
      'நான்காம் காலாண்டு'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM, y', 'd MMMM, y', 'd MMM, y', 'd-M-yy'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [6, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale te.
 */
goog.i18n.DateTimeSymbols_te = {
  ERAS: ['ఈసాపూర్వ.', 'సన్.'],
  ERANAMES: ['ఈసాపూర్వ.', 'సన్.'],
  NARROWMONTHS: ['జ', 'ఫి', 'మా', 'ఏ', 'మె', 'జు', 'జు',
      'ఆ', 'సె', 'అ', 'న', 'డి'],
  STANDALONENARROWMONTHS: ['జ', 'ఫి', 'మ', 'ఎ', 'మె', 'జు',
      'జు', 'ఆ', 'సె', 'అ', 'న', 'డి'],
  MONTHS: ['జనవరి', 'ఫిబ్రవరి', 'మార్చి',
      'ఎప్రిల్', 'మే', 'జూన్', 'జూలై',
      'ఆగస్టు', 'సెప్టెంబర్',
      'అక్టోబర్', 'నవంబర్',
      'డిసెంబర్'],
  STANDALONEMONTHS: ['జనవరి', 'ఫిబ్రవరి',
      'మార్చి', 'ఎప్రిల్', 'మే', 'జూన్',
      'జూలై', 'ఆగస్టు', 'సెప్టెంబర్',
      'అక్టోబర్', 'నవంబర్',
      'డిసెంబర్'],
  SHORTMONTHS: ['జన', 'ఫిబ్ర', 'మార్చి',
      'ఏప్రి', 'మే', 'జూన్', 'జూలై',
      'ఆగస్టు', 'సెప్టెంబర్',
      'అక్టోబర్', 'నవంబర్',
      'డిసెంబర్'],
  STANDALONESHORTMONTHS: ['జన', 'ఫిబ్ర', 'మార్చి',
      'ఏప్రి', 'మే', 'జూన్', 'జూలై',
      'ఆగస్టు', 'సెప్టెంబర్',
      'అక్టోబర్', 'నవంబర్',
      'డిసెంబర్'],
  WEEKDAYS: ['ఆదివారం', 'సోమవారం',
      'మంగళవారం', 'బుధవారం',
      'గురువారం', 'శుక్రవారం',
      'శనివారం'],
  STANDALONEWEEKDAYS: ['ఆదివారం', 'సోమవారం',
      'మంగళవారం', 'బుధవారం',
      'గురువారం', 'శుక్రవారం',
      'శనివారం'],
  SHORTWEEKDAYS: ['ఆది', 'సోమ', 'మంగళ', 'బుధ',
      'గురు', 'శుక్ర', 'శని'],
  STANDALONESHORTWEEKDAYS: ['ఆది', 'సోమ', 'మంగళ',
      'బుధ', 'గురు', 'శుక్ర', 'శని'],
  NARROWWEEKDAYS: ['ఆ', 'సో', 'మ', 'బు', 'గు', 'శు', 'శ'],
  STANDALONENARROWWEEKDAYS: ['ఆ', 'సో', 'మ', 'బు', 'గు',
      'శు', 'శ'],
  SHORTQUARTERS: ['ఒకటి 1', 'రెండు 2', 'మూడు 3',
      'నాలుగు 4'],
  QUARTERS: ['ఒకటి 1', 'రెండు 2', 'మూడు 3',
      'నాలుగు 4'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'dd-MM-yy'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [6, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale th.
 */
goog.i18n.DateTimeSymbols_th = {
  ERAS: ['ปีก่อน ค.ศ.', 'ค.ศ.'],
  ERANAMES: ['ปีก่อนคริสต์ศักราช',
      'คริสต์ศักราช'],
  NARROWMONTHS: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.',
      'พ.ค.', 'มิ.ย', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.',
      'พ.ย.', 'ธ.ค.'],
  STANDALONENARROWMONTHS: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.',
      'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.',
      'พ.ย.', 'ธ.ค.'],
  MONTHS: ['มกราคม', 'กุมภาพันธ์',
      'มีนาคม', 'เมษายน', 'พฤษภาคม',
      'มิถุนายน', 'กรกฎาคม',
      'สิงหาคม', 'กันยายน', 'ตุลาคม',
      'พฤศจิกายน', 'ธันวาคม'],
  STANDALONEMONTHS: ['มกราคม', 'กุมภาพันธ์',
      'มีนาคม', 'เมษายน', 'พฤษภาคม',
      'มิถุนายน', 'กรกฎาคม',
      'สิงหาคม', 'กันยายน', 'ตุลาคม',
      'พฤศจิกายน', 'ธันวาคม'],
  SHORTMONTHS: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.',
      'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.',
      'พ.ย.', 'ธ.ค.'],
  STANDALONESHORTMONTHS: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.',
      'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.',
      'พ.ย.', 'ธ.ค.'],
  WEEKDAYS: ['วันอาทิตย์', 'วันจันทร์',
      'วันอังคาร', 'วันพุธ',
      'วันพฤหัสบดี', 'วันศุกร์',
      'วันเสาร์'],
  STANDALONEWEEKDAYS: ['วันอาทิตย์',
      'วันจันทร์', 'วันอังคาร',
      'วันพุธ', 'วันพฤหัสบดี',
      'วันศุกร์', 'วันเสาร์'],
  SHORTWEEKDAYS: ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'],
  STANDALONESHORTWEEKDAYS: ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.',
      'ศ.', 'ส.'],
  NARROWWEEKDAYS: ['อ', 'จ', 'อ', 'พ', 'พ', 'ศ', 'ส'],
  STANDALONENARROWWEEKDAYS: ['อ', 'จ', 'อ', 'พ', 'พ', 'ศ', 'ส'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['ไตรมาส 1', 'ไตรมาส 2',
      'ไตรมาส 3', 'ไตรมาส 4'],
  AMPMS: ['ก่อนเที่ยง', 'หลังเที่ยง'],
  DATEFORMATS: ['EEEEที่ d MMMM G y', 'd MMMM y', 'd MMM y', 'd/M/yyyy'],
  TIMEFORMATS: [
      'H นาฬิกา m นาที ss วินาที zzzz',
      'H นาฬิกา m นาที ss วินาที z', 'H:mm:ss',
      'H:mm'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale tl.
 */
goog.i18n.DateTimeSymbols_tl = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['BC', 'AD'],
  NARROWMONTHS: ['E', 'P', 'M', 'A', 'M', 'H', 'H', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['E', 'P', 'M', 'A', 'M', 'H', 'H', 'A', 'S', 'O',
      'N', 'D'],
  MONTHS: ['Enero', 'Pebrero', 'Marso', 'Abril', 'Mayo', 'Hunyo', 'Hulyo',
      'Agosto', 'Setyembre', 'Oktubre', 'Nobyembre', 'Disyembre'],
  STANDALONEMONTHS: ['Enero', 'Pebrero', 'Marso', 'Abril', 'Mayo', 'Hunyo',
      'Hulyo', 'Agosto', 'Setyembre', 'Oktubre', 'Nobyembre', 'Disyembre'],
  SHORTMONTHS: ['Ene', 'Peb', 'Mar', 'Abr', 'May', 'Hun', 'Hul', 'Ago', 'Set',
      'Okt', 'Nob', 'Dis'],
  STANDALONESHORTMONTHS: ['Ene', 'Peb', 'Mar', 'Abr', 'May', 'Hun', 'Hul',
      'Ago', 'Set', 'Okt', 'Nob', 'Dis'],
  WEEKDAYS: ['Linggo', 'Lunes', 'Martes', 'Miyerkules', 'Huwebes', 'Biyernes',
      'Sabado'],
  STANDALONEWEEKDAYS: ['Linggo', 'Lunes', 'Martes', 'Miyerkules', 'Huwebes',
      'Biyernes', 'Sabado'],
  SHORTWEEKDAYS: ['Lin', 'Lun', 'Mar', 'Mye', 'Huw', 'Bye', 'Sab'],
  STANDALONESHORTWEEKDAYS: ['Lin', 'Lun', 'Mar', 'Miy', 'Huw', 'Biy', 'Sab'],
  NARROWWEEKDAYS: ['L', 'L', 'M', 'M', 'H', 'B', 'S'],
  STANDALONENARROWWEEKDAYS: ['L', 'L', 'M', 'M', 'H', 'B', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['ika-1 sangkapat', 'ika-2 sangkapat', 'ika-3 quarter',
      'ika-4 na quarter'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE, MMMM dd y', 'MMMM d, y', 'MMM d, y', 'M/d/yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale tr.
 */
goog.i18n.DateTimeSymbols_tr = {
  ERAS: ['MÖ', 'MS'],
  ERANAMES: ['Milattan Önce', 'Milattan Sonra'],
  NARROWMONTHS: ['O', 'Ş', 'M', 'N', 'M', 'H', 'T', 'A', 'E', 'E', 'K', 'A'],
  STANDALONENARROWMONTHS: ['O', 'Ş', 'M', 'N', 'M', 'H', 'T', 'A', 'E', 'E',
      'K', 'A'],
  MONTHS: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz',
      'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
  STANDALONEMONTHS: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
  SHORTMONTHS: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl',
      'Eki', 'Kas', 'Ara'],
  STANDALONESHORTMONTHS: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem',
      'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
  WEEKDAYS: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma',
      'Cumartesi'],
  STANDALONEWEEKDAYS: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe',
      'Cuma', 'Cumartesi'],
  SHORTWEEKDAYS: ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'],
  STANDALONESHORTWEEKDAYS: ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'],
  NARROWWEEKDAYS: ['P', 'P', 'S', 'Ç', 'P', 'C', 'C'],
  STANDALONENARROWWEEKDAYS: ['P', 'P', 'S', 'Ç', 'P', 'C', 'C'],
  SHORTQUARTERS: ['Ç1', 'Ç2', 'Ç3', 'Ç4'],
  QUARTERS: ['1. çeyrek', '2. çeyrek', '3. çeyrek', '4. çeyrek'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['d MMMM y EEEE', 'd MMMM y', 'd MMM y', 'dd MM yyyy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale uk.
 */
goog.i18n.DateTimeSymbols_uk = {
  ERAS: ['до н.е.', 'н.е.'],
  ERANAMES: ['до нашої ери', 'нашої ери'],
  NARROWMONTHS: ['С', 'Л', 'Б', 'К', 'Т', 'Ч', 'Л', 'С', 'В', 'Ж',
      'Л', 'Г'],
  STANDALONENARROWMONTHS: ['С', 'Л', 'Б', 'К', 'Т', 'Ч', 'Л', 'С', 'В',
      'Ж', 'Л', 'Г'],
  MONTHS: ['січня', 'лютого', 'березня', 'квітня',
      'травня', 'червня', 'липня', 'серпня',
      'вересня', 'жовтня', 'листопада', 'грудня'],
  STANDALONEMONTHS: ['Січень', 'Лютий', 'Березень',
      'Квітень', 'Травень', 'Червень', 'Липень',
      'Серпень', 'Вересень', 'Жовтень',
      'Листопад', 'Грудень'],
  SHORTMONTHS: ['січ.', 'лют.', 'бер.', 'квіт.', 'трав.',
      'черв.', 'лип.', 'серп.', 'вер.', 'жовт.', 'лист.',
      'груд.'],
  STANDALONESHORTMONTHS: ['Січ', 'Лют', 'Бер', 'Кві', 'Тра',
      'Чер', 'Лип', 'Сер', 'Вер', 'Жов', 'Лис', 'Гру'],
  WEEKDAYS: ['Неділя', 'Понеділок', 'Вівторок',
      'Середа', 'Четвер', 'Пʼятниця', 'Субота'],
  STANDALONEWEEKDAYS: ['Неділя', 'Понеділок', 'Вівторок',
      'Середа', 'Четвер', 'Пʼятниця', 'Субота'],
  SHORTWEEKDAYS: ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
  STANDALONESHORTWEEKDAYS: ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт',
      'Сб'],
  NARROWWEEKDAYS: ['Н', 'П', 'В', 'С', 'Ч', 'П', 'С'],
  STANDALONENARROWWEEKDAYS: ['Н', 'П', 'В', 'С', 'Ч', 'П', 'С'],
  SHORTQUARTERS: ['I кв.', 'II кв.', 'III кв.', 'IV кв.'],
  QUARTERS: ['I квартал', 'II квартал', 'III квартал',
      'IV квартал'],
  AMPMS: ['дп', 'пп'],
  DATEFORMATS: ['EEEE, d MMMM y \'р\'.', 'd MMMM y \'р\'.', 'd MMM y',
      'dd.MM.yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale ur.
 */
goog.i18n.DateTimeSymbols_ur = {
  ERAS: ['ق م', 'عيسوی سن'],
  ERANAMES: ['قبل مسيح', 'عيسوی سن'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
      '11', '12'],
  MONTHS: ['جنوری', 'فروری', 'مارچ', 'اپريل', 'مئ',
      'جون', 'جولائ', 'اگست', 'ستمبر', 'اکتوبر',
      'نومبر', 'دسمبر'],
  STANDALONEMONTHS: ['جنوری', 'فروری', 'مارچ', 'اپريل',
      'مئ', 'جون', 'جولائ', 'اگست', 'ستمبر', 'اکتوبر',
      'نومبر', 'دسمبر'],
  SHORTMONTHS: ['جنوری', 'فروری', 'مارچ', 'اپريل', 'مئ',
      'جون', 'جولائ', 'اگست', 'ستمبر', 'اکتوبر',
      'نومبر', 'دسمبر'],
  STANDALONESHORTMONTHS: ['جنوری', 'فروری', 'مارچ', 'اپريل',
      'مئ', 'جون', 'جولائ', 'اگست', 'ستمبر', 'اکتوبر',
      'نومبر', 'دسمبر'],
  WEEKDAYS: ['اتوار', 'پير', 'منگل', 'بده', 'جمعرات',
      'جمعہ', 'ہفتہ'],
  STANDALONEWEEKDAYS: ['اتوار', 'پير', 'منگل', 'بده',
      'جمعرات', 'جمعہ', 'ہفتہ'],
  SHORTWEEKDAYS: ['اتوار', 'پير', 'منگل', 'بده', 'جمعرات',
      'جمعہ', 'ہفتہ'],
  STANDALONESHORTWEEKDAYS: ['اتوار', 'پير', 'منگل', 'بده',
      'جمعرات', 'جمعہ', 'ہفتہ'],
  NARROWWEEKDAYS: ['1', '2', '3', '4', '5', '6', '7'],
  STANDALONENARROWWEEKDAYS: ['1', '2', '3', '4', '5', '6', '7'],
  SHORTQUARTERS: ['پہلی سہ ماہی', 'دوسری سہ ماہی',
      'تيسری سہ ماہی', 'چوتهی سہ ماہی'],
  QUARTERS: ['پہلی سہ ماہی', 'دوسری سہ ماہی',
      'تيسری سہ ماہی', 'چوتهی سہ ماہی'],
  AMPMS: ['دن', 'رات'],
  DATEFORMATS: ['EEEE؍ d؍ MMMM y', 'd؍ MMMM y', 'd؍ MMM y', 'd/M/yy'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale vi.
 */
goog.i18n.DateTimeSymbols_vi = {
  ERAS: ['tr. CN', 'sau CN'],
  ERANAMES: ['tr. CN', 'sau CN'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
      '11', '12'],
  MONTHS: ['tháng một', 'tháng hai', 'tháng ba', 'tháng tư',
      'tháng năm', 'tháng sáu', 'tháng bảy', 'tháng tám',
      'tháng chín', 'tháng mười', 'tháng mười một',
      'tháng mười hai'],
  STANDALONEMONTHS: ['tháng một', 'tháng hai', 'tháng ba', 'tháng tư',
      'tháng năm', 'tháng sáu', 'tháng bảy', 'tháng tám',
      'tháng chín', 'tháng mười', 'tháng mười một',
      'tháng mười hai'],
  SHORTMONTHS: ['thg 1', 'thg 2', 'thg 3', 'thg 4', 'thg 5', 'thg 6', 'thg 7',
      'thg 8', 'thg 9', 'thg 10', 'thg 11', 'thg 12'],
  STANDALONESHORTMONTHS: ['thg 1', 'thg 2', 'thg 3', 'thg 4', 'thg 5', 'thg 6',
      'thg 7', 'thg 8', 'thg 9', 'thg 10', 'thg 11', 'thg 12'],
  WEEKDAYS: ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm',
      'Thứ sáu', 'Thứ bảy'],
  STANDALONEWEEKDAYS: ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư',
      'Thứ năm', 'Thứ sáu', 'Thứ bảy'],
  SHORTWEEKDAYS: ['CN', 'Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7'],
  STANDALONESHORTWEEKDAYS: ['CN', 'Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6',
      'Th 7'],
  NARROWWEEKDAYS: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
  STANDALONENARROWWEEKDAYS: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['Quý 1', 'Quý 2', 'Quý 3', 'Quý 4'],
  AMPMS: ['SA', 'CH'],
  DATEFORMATS: ['EEEE, \'ngày\' dd MMMM \'năm\' y',
      '\'Ngày\' dd \'tháng\' M \'năm\' y', 'dd-MM-yyyy', 'dd/MM/yyyy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale zh.
 */
goog.i18n.DateTimeSymbols_zh = {
  ERAS: ['公元前', '公元'],
  ERANAMES: ['公元前', '公元'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1月', '2月', '3月', '4月', '5月', '6月',
      '7月', '8月', '9月', '10月', '11月', '12月'],
  MONTHS: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月',
      '9月', '10月', '11月', '12月'],
  STANDALONEMONTHS: ['一月', '二月', '三月', '四月', '五月', '六月',
      '七月', '八月', '九月', '十月', '十一月', '十二月'],
  SHORTMONTHS: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月',
      '9月', '10月', '11月', '12月'],
  STANDALONESHORTMONTHS: ['一月', '二月', '三月', '四月', '五月',
      '六月', '七月', '八月', '九月', '十月', '十一月',
      '十二月'],
  WEEKDAYS: ['星期日', '星期一', '星期二', '星期三', '星期四',
      '星期五', '星期六'],
  STANDALONEWEEKDAYS: ['星期日', '星期一', '星期二', '星期三',
      '星期四', '星期五', '星期六'],
  SHORTWEEKDAYS: ['周日', '周一', '周二', '周三', '周四', '周五',
      '周六'],
  STANDALONESHORTWEEKDAYS: ['周日', '周一', '周二', '周三', '周四',
      '周五', '周六'],
  NARROWWEEKDAYS: ['日', '一', '二', '三', '四', '五', '六'],
  STANDALONENARROWWEEKDAYS: ['日', '一', '二', '三', '四', '五', '六'],
  SHORTQUARTERS: ['1季', '2季', '3季', '4季'],
  QUARTERS: ['第1季度', '第2季度', '第3季度', '第4季度'],
  AMPMS: ['上午', '下午'],
  DATEFORMATS: ['y年M月d日EEEE', 'y年M月d日', 'yyyy-M-d', 'yy-M-d'],
  TIMEFORMATS: ['zzzzah时mm分ss秒', 'zah时mm分ss秒', 'ah:mm:ss', 'ah:mm'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale zh_CN.
 */
goog.i18n.DateTimeSymbols_zh_CN = goog.i18n.DateTimeSymbols_zh;


/**
 * Date/time formatting symbols for locale zh_HK.
 */
goog.i18n.DateTimeSymbols_zh_HK = {
  ERAS: ['西元前', '西元'],
  ERANAMES: ['西元前', '西元'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
      '11', '12'],
  MONTHS: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月',
      '9月', '10月', '11月', '12月'],
  STANDALONEMONTHS: ['一月', '二月', '三月', '四月', '五月', '六月',
      '七月', '八月', '九月', '十月', '十一月', '十二月'],
  SHORTMONTHS: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月',
      '9月', '10月', '11月', '12月'],
  STANDALONESHORTMONTHS: ['1月', '2月', '3月', '4月', '5月', '6月',
      '7月', '8月', '9月', '10月', '11月', '12月'],
  WEEKDAYS: ['星期日', '星期一', '星期二', '星期三', '星期四',
      '星期五', '星期六'],
  STANDALONEWEEKDAYS: ['星期日', '星期一', '星期二', '星期三',
      '星期四', '星期五', '星期六'],
  SHORTWEEKDAYS: ['週日', '週一', '週二', '週三', '週四', '週五',
      '週六'],
  STANDALONESHORTWEEKDAYS: ['周日', '周一', '周二', '周三', '周四',
      '周五', '周六'],
  NARROWWEEKDAYS: ['日', '一', '二', '三', '四', '五', '六'],
  STANDALONENARROWWEEKDAYS: ['日', '一', '二', '三', '四', '五', '六'],
  SHORTQUARTERS: ['1季', '2季', '3季', '4季'],
  QUARTERS: ['第1季', '第2季', '第3季', '第4季'],
  AMPMS: ['上午', '下午'],
  DATEFORMATS: ['y年M月d日EEEE', 'y年M月d日', 'y年M月d日',
      'yy年M月d日'],
  TIMEFORMATS: ['ah:mm:ss [zzzz]', 'ah:mm:ss [z]', 'ahh:mm:ss', 'ah:mm'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale zh_TW.
 */
goog.i18n.DateTimeSymbols_zh_TW = {
  ERAS: ['西元前', '西元'],
  ERANAMES: ['西元前', '西元'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
      '11', '12'],
  MONTHS: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月',
      '9月', '10月', '11月', '12月'],
  STANDALONEMONTHS: ['一月', '二月', '三月', '四月', '五月', '六月',
      '七月', '八月', '九月', '十月', '十一月', '十二月'],
  SHORTMONTHS: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月',
      '9月', '10月', '11月', '12月'],
  STANDALONESHORTMONTHS: ['1月', '2月', '3月', '4月', '5月', '6月',
      '7月', '8月', '9月', '10月', '11月', '12月'],
  WEEKDAYS: ['星期日', '星期一', '星期二', '星期三', '星期四',
      '星期五', '星期六'],
  STANDALONEWEEKDAYS: ['星期日', '星期一', '星期二', '星期三',
      '星期四', '星期五', '星期六'],
  SHORTWEEKDAYS: ['週日', '週一', '週二', '週三', '週四', '週五',
      '週六'],
  STANDALONESHORTWEEKDAYS: ['周日', '周一', '周二', '周三', '周四',
      '周五', '周六'],
  NARROWWEEKDAYS: ['日', '一', '二', '三', '四', '五', '六'],
  STANDALONENARROWWEEKDAYS: ['日', '一', '二', '三', '四', '五', '六'],
  SHORTQUARTERS: ['1季', '2季', '3季', '4季'],
  QUARTERS: ['第1季', '第2季', '第3季', '第4季'],
  AMPMS: ['上午', '下午'],
  DATEFORMATS: ['y年M月d日EEEE', 'y年M月d日', 'yyyy/M/d', 'yy/M/d'],
  TIMEFORMATS: ['zzzzah時mm分ss秒', 'zah時mm分ss秒', 'ah:mm:ss', 'ah:mm'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale zu.
 */
goog.i18n.DateTimeSymbols_zu = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['BC', 'AD'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O',
      'N', 'D'],
  MONTHS: ['Januwari', 'Februwari', 'Mashi', 'Apreli', 'Meyi', 'Juni', 'Julayi',
      'Agasti', 'Septhemba', 'Okthoba', 'Novemba', 'Disemba'],
  STANDALONEMONTHS: ['uJanuwari', 'uFebruwari', 'uMashi', 'u-Apreli', 'uMeyi',
      'uJuni', 'uJulayi', 'uAgasti', 'uSepthemba', 'u-Okthoba', 'uNovemba',
      'uDisemba'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mas', 'Apr', 'Mey', 'Jun', 'Jul', 'Aga', 'Sep',
      'Okt', 'Nov', 'Dis'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mas', 'Apr', 'Mey', 'Jun', 'Jul',
      'Aga', 'Sep', 'Okt', 'Nov', 'Dis'],
  WEEKDAYS: ['Sonto', 'Msombuluko', 'Lwesibili', 'Lwesithathu', 'uLwesine',
      'Lwesihlanu', 'Mgqibelo'],
  STANDALONEWEEKDAYS: ['Sonto', 'Msombuluko', 'Lwesibili', 'Lwesithathu',
      'uLwesine', 'Lwesihlanu', 'Mgqibelo'],
  SHORTWEEKDAYS: ['Son', 'Mso', 'Bil', 'Tha', 'Sin', 'Hla', 'Mgq'],
  STANDALONESHORTWEEKDAYS: ['Son', 'Mso', 'Bil', 'Tha', 'Sin', 'Hla', 'Mgq'],
  NARROWWEEKDAYS: ['S', 'M', 'B', 'T', 'S', 'H', 'M'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'B', 'T', 'S', 'H', 'M'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['ikota yoku-1', 'ikota yesi-2', 'ikota yesi-3', 'ikota yesi-4'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE dd MMMM y', 'd MMMM y', 'd MMM y', 'yyyy-MM-dd'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Selected date/time formatting symbols by locale.
 * "switch" statement won't work here. JsCompiler cannot handle it yet.
 */
if (goog.LOCALE == 'af') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_af;
} else if (goog.LOCALE == 'am') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_am;
} else if (goog.LOCALE == 'ar') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ar;
} else if (goog.LOCALE == 'bg') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_bg;
} else if (goog.LOCALE == 'bn') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_bn;
} else if (goog.LOCALE == 'ca') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ca;
} else if (goog.LOCALE == 'cs') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_cs;
} else if (goog.LOCALE == 'da') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_da;
} else if (goog.LOCALE == 'de') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_de;
} else if (goog.LOCALE == 'de_AT' || goog.LOCALE == 'de-AT') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_de_AT;
} else if (goog.LOCALE == 'de_CH' || goog.LOCALE == 'de-CH') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_de;
} else if (goog.LOCALE == 'el') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_el;
} else if (goog.LOCALE == 'en') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en;
} else if (goog.LOCALE == 'en_AU' || goog.LOCALE == 'en-AU') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_AU;
} else if (goog.LOCALE == 'en_GB' || goog.LOCALE == 'en-GB') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_GB;
} else if (goog.LOCALE == 'en_IE' || goog.LOCALE == 'en-IE') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_IE;
} else if (goog.LOCALE == 'en_IN' || goog.LOCALE == 'en-IN') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_IN;
} else if (goog.LOCALE == 'en_SG' || goog.LOCALE == 'en-SG') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_SG;
} else if (goog.LOCALE == 'en_US' || goog.LOCALE == 'en-US') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en;
} else if (goog.LOCALE == 'en_ZA' || goog.LOCALE == 'en-ZA') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_ZA;
} else if (goog.LOCALE == 'es') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_es;
} else if (goog.LOCALE == 'es_419' || goog.LOCALE == 'es-419') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_es_419;
} else if (goog.LOCALE == 'et') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_et;
} else if (goog.LOCALE == 'eu') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_eu;
} else if (goog.LOCALE == 'fa') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fa;
} else if (goog.LOCALE == 'fi') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fi;
} else if (goog.LOCALE == 'fil') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fil;
} else if (goog.LOCALE == 'fr') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fr;
} else if (goog.LOCALE == 'fr_CA' || goog.LOCALE == 'fr-CA') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fr_CA;
} else if (goog.LOCALE == 'gl') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_gl;
} else if (goog.LOCALE == 'gsw') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_gsw;
} else if (goog.LOCALE == 'gu') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_gu;
} else if (goog.LOCALE == 'he') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_he;
} else if (goog.LOCALE == 'hi') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_hi;
} else if (goog.LOCALE == 'hr') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_hr;
} else if (goog.LOCALE == 'hu') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_hu;
} else if (goog.LOCALE == 'id') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_id;
} else if (goog.LOCALE == 'in') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_in;
} else if (goog.LOCALE == 'is') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_is;
} else if (goog.LOCALE == 'it') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_it;
} else if (goog.LOCALE == 'iw') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_iw;
} else if (goog.LOCALE == 'ja') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ja;
} else if (goog.LOCALE == 'kn') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_kn;
} else if (goog.LOCALE == 'ko') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ko;
} else if (goog.LOCALE == 'ln') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ln;
} else if (goog.LOCALE == 'lt') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_lt;
} else if (goog.LOCALE == 'lv') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_lv;
} else if (goog.LOCALE == 'ml') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ml;
} else if (goog.LOCALE == 'mr') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_mr;
} else if (goog.LOCALE == 'ms') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ms;
} else if (goog.LOCALE == 'mt') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_mt;
} else if (goog.LOCALE == 'nl') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_nl;
} else if (goog.LOCALE == 'no') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_no;
} else if (goog.LOCALE == 'or') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_or;
} else if (goog.LOCALE == 'pl') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_pl;
} else if (goog.LOCALE == 'pt') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_pt;
} else if (goog.LOCALE == 'pt_BR' || goog.LOCALE == 'pt-BR') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_pt;
} else if (goog.LOCALE == 'pt_PT' || goog.LOCALE == 'pt-PT') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_pt_PT;
} else if (goog.LOCALE == 'ro') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ro;
} else if (goog.LOCALE == 'ru') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ru;
} else if (goog.LOCALE == 'sk') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_sk;
} else if (goog.LOCALE == 'sl') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_sl;
} else if (goog.LOCALE == 'sq') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_sq;
} else if (goog.LOCALE == 'sr') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_sr;
} else if (goog.LOCALE == 'sv') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_sv;
} else if (goog.LOCALE == 'sw') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_sw;
} else if (goog.LOCALE == 'ta') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ta;
} else if (goog.LOCALE == 'te') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_te;
} else if (goog.LOCALE == 'th') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_th;
} else if (goog.LOCALE == 'tl') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_tl;
} else if (goog.LOCALE == 'tr') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_tr;
} else if (goog.LOCALE == 'uk') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_uk;
} else if (goog.LOCALE == 'ur') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ur;
} else if (goog.LOCALE == 'vi') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_vi;
} else if (goog.LOCALE == 'zh') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_zh;
} else if (goog.LOCALE == 'zh_CN' || goog.LOCALE == 'zh-CN') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_zh;
} else if (goog.LOCALE == 'zh_HK' || goog.LOCALE == 'zh-HK') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_zh_HK;
} else if (goog.LOCALE == 'zh_TW' || goog.LOCALE == 'zh-TW') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_zh_TW;
} else if (goog.LOCALE == 'zu') {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_zu;
} else {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en;
}

// Copyright 2010 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Typedefs for working with dates.
 *
 * @author nicksantos@google.com (Nick Santos)
 */

goog.provide('goog.date.DateLike');


/**
 * @typedef {(Date|goog.date.Date)}
 */
goog.date.DateLike;
// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Functions and objects for date representation and manipulation.
 *
 * @author eae@google.com (Emil A Eklund)
 * @author pallosp@google.com (Peter Pallos)
 */

goog.provide('goog.date');
goog.provide('goog.date.Date');
goog.provide('goog.date.DateTime');
goog.provide('goog.date.Interval');
goog.provide('goog.date.month');
goog.provide('goog.date.weekDay');

goog.require('goog.asserts');
goog.require('goog.date.DateLike');
goog.require('goog.i18n.DateTimeSymbols');
goog.require('goog.string');


/**
 * Constants for weekdays.
 * @enum {number}
 */
goog.date.weekDay = {
  MON: 0,
  TUE: 1,
  WED: 2,
  THU: 3,
  FRI: 4,
  SAT: 5,
  SUN: 6
};


/**
 * Constants for months.
 * @enum {number}
 */
goog.date.month = {
  JAN: 0,
  FEB: 1,
  MAR: 2,
  APR: 3,
  MAY: 4,
  JUN: 5,
  JUL: 6,
  AUG: 7,
  SEP: 8,
  OCT: 9,
  NOV: 10,
  DEC: 11
};


/**
 * Formats a month/year string.
 * Example: "January 2008"
 *
 * @param {string} monthName The month name to use in the result.
 * @param {number} yearNum The numeric year to use in the result.
 * @return {string} A formatted month/year string.
 */
goog.date.formatMonthAndYear = function(monthName, yearNum) {
  /** @desc Month/year format given the month name and the numeric year. */
  var MSG_MONTH_AND_YEAR = goog.getMsg(
      '{$monthName} {$yearNum}',
      { 'monthName' : monthName, 'yearNum' : yearNum });
  return MSG_MONTH_AND_YEAR;
};


/**
 * Regular expression for splitting date parts from ISO 8601 styled string.
 * Examples: '20060210' or '2005-02-22' or '20050222' or '2005-08'
 * or '2005-W22' or '2005W22' or '2005-W22-4', etc.
 * For explanation and more examples, see:
 * {@link http://en.wikipedia.org/wiki/ISO_8601}
 *
 * @type {RegExp}
 * @private
 */
goog.date.splitDateStringRegex_ = new RegExp(
    '^(\\d{4})(?:(?:-?(\\d{2})(?:-?(\\d{2}))?)|' +
    '(?:-?(\\d{3}))|(?:-?W(\\d{2})(?:-?([1-7]))?))?$');


/**
 * Regular expression for splitting time parts from ISO 8601 styled string.
 * Examples: '18:46:39.994' or '184639.994'
 *
 * @type {RegExp}
 * @private
 */
goog.date.splitTimeStringRegex_ =
    /^(\d{2})(?::?(\d{2})(?::?(\d{2})(\.\d+)?)?)?$/;


/**
 * Regular expression for splitting timezone parts from ISO 8601 styled string.
 * Example: The part after the '+' in '18:46:39+07:00'.  Or '09:30Z' (UTC).
 *
 * @type {RegExp}
 * @private
 */
goog.date.splitTimezoneStringRegex_ = /Z|(?:([-+])(\d{2})(?::?(\d{2}))?)$/;


/**
 * Regular expression for splitting duration parts from ISO 8601 styled string.
 * Example: '-P1Y2M3DT4H5M6.7S'
 *
 * @type {RegExp}
 * @private
 */
goog.date.splitDurationRegex_ = new RegExp(
    '^(-)?P(?:(\\d+)Y)?(?:(\\d+)M)?(?:(\\d+)D)?' +
    '(T(?:(\\d+)H)?(?:(\\d+)M)?(?:(\\d+(?:\\.\\d+)?)S)?)?$');


/**
 * Returns whether the given year is a leap year.
 *
 * @param {number} year Year part of date.
 * @return {boolean} Whether the given year is a leap year.
 */
goog.date.isLeapYear = function(year) {
  // Leap year logic; the 4-100-400 rule
  return year % 4 == 0 && (year % 100 != 0 || year % 400 == 0);
};


/**
 * Returns whether the given year is a long ISO year.
 * See {@link http://www.phys.uu.nl/~vgent/calendar/isocalendar_text3.htm}.
 *
 * @param {number} year Full year part of date.
 * @return {boolean} Whether the given year is a long ISO year.
 */
goog.date.isLongIsoYear = function(year) {
  var n = 5 * year + 12 - 4 * (Math.floor(year / 100) - Math.floor(year / 400));
  n += Math.floor((year - 100) / 400) - Math.floor((year - 102) / 400);
  n += Math.floor((year - 200) / 400) - Math.floor((year - 199) / 400);

  return n % 28 < 5;
};


/**
 * Returns the number of days for a given month.
 *
 * @param {number} year Year part of date.
 * @param {number} month Month part of date.
 * @return {number} The number of days for the given month.
 */
goog.date.getNumberOfDaysInMonth = function(year, month) {
  switch (month) {
    case goog.date.month.FEB:
      return goog.date.isLeapYear(year) ? 29 : 28;
    case goog.date.month.JUN:
    case goog.date.month.SEP:
    case goog.date.month.NOV:
    case goog.date.month.APR:
      return 30;
  }
  return 31;
};


/**
 * Returns true if the 2 dates are in the same day.
 * @param {goog.date.DateLike} date The time to check.
 * @param {goog.date.DateLike=} opt_now The current time.
 * @return {boolean} Whether the dates are on the same day.
 */
goog.date.isSameDay = function(date, opt_now) {
  var now = opt_now || new Date(goog.now());
  return date.getDate() == now.getDate() &&
      goog.date.isSameMonth(date, now);
};


/**
 * Returns true if the 2 dates are in the same month.
 * @param {goog.date.DateLike} date The time to check.
 * @param {goog.date.DateLike=} opt_now The current time.
 * @return {boolean} Whether the dates are in the same calendar month.
 */
goog.date.isSameMonth = function(date, opt_now) {
  var now = opt_now || new Date(goog.now());
  return date.getMonth() == now.getMonth() &&
      goog.date.isSameYear(date, now);
};


/**
 * Returns true if the 2 dates are in the same year.
 * @param {goog.date.DateLike} date The time to check.
 * @param {goog.date.DateLike=} opt_now The current time.
 * @return {boolean} Whether the dates are in the same calendar year.
 */
goog.date.isSameYear = function(date, opt_now) {
  var now = opt_now || new Date(goog.now());
  return date.getFullYear() == now.getFullYear();
};


/**
 * Static function for week number calculation. ISO 8601 implementation.
 *
 * @param {number} year Year part of date.
 * @param {number} month Month part of date (0-11).
 * @param {number} date Day part of date (1-31).
 * @param {number=} opt_weekDay Cut off weekday, defaults to Thursday.
 * @param {number=} opt_firstDayOfWeek First day of the week, defaults to
 *     Monday.
 *     Monday=0, Sunday=6.
 * @return {number} The week number (1-53).
 */
goog.date.getWeekNumber = function(year, month, date, opt_weekDay,
    opt_firstDayOfWeek) {
  var d = new Date(year, month, date);

  // Default to Thursday for cut off as per ISO 8601.
  var cutoff = opt_weekDay || goog.date.weekDay.THU;

  // Default to Monday for first day of the week as per ISO 8601.
  var firstday = opt_firstDayOfWeek || goog.date.weekDay.MON;

  // 1 day in milliseconds.
  var ONE_DAY = 24 * 60 * 60 * 1000;

  // The d.getDay() has to be converted first to ISO weekday (Monday=0).
  var isoday = (d.getDay() + 6) % 7;

  // Position of given day in the picker grid w.r.t. first day of week
  var daypos = (isoday - firstday + 7) % 7;

  // Position of cut off day in the picker grid w.r.t. first day of week
  var cutoffpos = (cutoff - firstday + 7) % 7;

  // Unix timestamp of the midnight of the cutoff day in the week of 'd'.
  // There might be +-1 hour shift in the result due to the daylight saving,
  // but it doesn't affect the year.
  var cutoffSameWeek = d.valueOf() + (cutoffpos - daypos) * ONE_DAY;

  // Unix timestamp of January 1 in the year of 'cutoffSameWeek'.
  var jan1 = new Date(new Date(cutoffSameWeek).getFullYear(), 0, 1).valueOf();

  // Number of week. The round() eliminates the effect of daylight saving.
  return Math.floor(Math.round((cutoffSameWeek - jan1) / ONE_DAY) / 7) + 1;
};


/**
 * Creates a DateTime from a datetime string expressed in ISO 8601 format.
 *
 * @param {string} formatted A date or datetime expressed in ISO 8601 format.
 * @return {goog.date.DateTime} Parsed date or null if parse fails.
 */
goog.date.fromIsoString = function(formatted) {
  var ret = new goog.date.DateTime(2000);
  return goog.date.setIso8601DateTime(ret, formatted) ? ret : null;
};


/**
 * Parses a datetime string expressed in ISO 8601 format. Overwrites the date
 * and optionally the time part of the given object with the parsed values.
 *
 * @param {!goog.date.DateTime} dateTime Object whose fields will be set.
 * @param {string} formatted A date or datetime expressed in ISO 8601 format.
 * @return {boolean} Whether the parsing succeeded.
 */
goog.date.setIso8601DateTime = function(dateTime, formatted) {
  formatted = goog.string.trim(formatted);
  var delim = formatted.indexOf('T') == -1 ? ' ' : 'T';
  var parts = formatted.split(delim);
  return goog.date.setIso8601DateOnly_(dateTime, parts[0]) &&
      (parts.length < 2 || goog.date.setIso8601TimeOnly_(dateTime, parts[1]));
};


/**
 * Sets date fields based on an ISO 8601 format string.
 *
 * @param {!goog.date.DateTime} d Object whose fields will be set.
 * @param {string} formatted A date expressed in ISO 8601 format.
 * @return {boolean} Whether the parsing succeeded.
 * @private
 */
goog.date.setIso8601DateOnly_ = function(d, formatted) {
  // split the formatted ISO date string into its date fields
  var parts = formatted.match(goog.date.splitDateStringRegex_);
  if (!parts) {
    return false;
  }

  var year = Number(parts[1]);
  var month = Number(parts[2]);
  var date = Number(parts[3]);
  var dayOfYear = Number(parts[4]);
  var week = Number(parts[5]);
  // ISO weekdays start with 1, native getDay() values start with 0
  var dayOfWeek = Number(parts[6]) || 1;

  d.setFullYear(year);

  if (dayOfYear) {
    d.setDate(1);
    d.setMonth(0);
    var offset = dayOfYear - 1; // offset, so 1-indexed, i.e., skip day 1
    d.add(new goog.date.Interval(goog.date.Interval.DAYS, offset));
  } else if (week) {
    goog.date.setDateFromIso8601Week_(d, week, dayOfWeek);
  } else {
    if (month) {
      d.setDate(1);
      d.setMonth(month - 1);
    }
    if (date) {
      d.setDate(date);
    }
  }

  return true;
};


/**
 * Sets date fields based on an ISO 8601 week string.
 * See {@link http://en.wikipedia.org/wiki/ISO_week_date}, "Relation with the
 * Gregorian Calendar".  The first week of a new ISO year is the week with the
 * majority of its days in the new Gregorian year.  I.e., ISO Week 1's Thursday
 * is in that year.  ISO weeks always start on Monday. So ISO Week 1 can
 * contain a few days from the previous Gregorian year.  And ISO weeks always
 * end on Sunday, so the last ISO week (Week 52 or 53) can have a few days from
 * the following Gregorian year.
 * Example: '1997-W01' lasts from 1996-12-30 to 1997-01-05.  January 1, 1997 is
 * a Wednesday. So W01's Monday is Dec.30, 1996, and Sunday is January 5, 1997.
 *
 * @param {goog.date.DateTime} d Object whose fields will be set.
 * @param {number} week ISO week number.
 * @param {number} dayOfWeek ISO day of week.
 * @private
 */
goog.date.setDateFromIso8601Week_ = function(d, week, dayOfWeek) {
  // calculate offset for first week
  d.setMonth(0);
  d.setDate(1);
  var jsDay = d.getDay();
  // switch Sunday (0) to index 7; ISO days are 1-indexed
  var jan1WeekDay = jsDay || 7;

  var THURSDAY = 4;
  if (jan1WeekDay <= THURSDAY) {
    // was extended back to Monday
    var startDelta = 1 - jan1WeekDay; // e.g., Thu(4) ==> -3
  } else {
    // was extended forward to Monday
    startDelta = 8 - jan1WeekDay; // e.g., Fri(5) ==> +3
  }

  // find the absolute number of days to offset from the start of year
  // to arrive close to the Gregorian equivalent (pending adjustments above)
  // Note: decrement week multiplier by one because 1st week is
  // represented by dayOfWeek value
  var absoluteDays = Number(dayOfWeek) + (7 * (Number(week) - 1));

  // convert from ISO weekday format to Gregorian calendar date
  // note: subtract 1 because 1-indexed; offset should not include 1st of month
  var delta = startDelta + absoluteDays - 1;
  var interval = new goog.date.Interval(goog.date.Interval.DAYS, delta);
  d.add(interval);
};


/**
 * Sets time fields based on an ISO 8601 format string.
 * Note: only time fields, not date fields.
 *
 * @param {!goog.date.DateTime} d Object whose fields will be set.
 * @param {string} formatted A time expressed in ISO 8601 format.
 * @return {boolean} Whether the parsing succeeded.
 * @private
 */
goog.date.setIso8601TimeOnly_ = function(d, formatted) {
  // first strip timezone info from the end
  var parts = formatted.match(goog.date.splitTimezoneStringRegex_);

  var offset = 0; // local time if no timezone info
  if (parts) {
    if (parts[0] != 'Z') {
      offset = parts[2] * 60 + Number(parts[3]);
      offset *= parts[1] == '-' ? 1 : -1;
    }
    offset -= d.getTimezoneOffset();
    formatted = formatted.substr(0, formatted.length - parts[0].length);
  }

  // then work out the time
  parts = formatted.match(goog.date.splitTimeStringRegex_);
  if (!parts) {
    return false;
  }

  d.setHours(Number(parts[1]));
  d.setMinutes(Number(parts[2]) || 0);
  d.setSeconds(Number(parts[3]) || 0);
  d.setMilliseconds(parts[4] ? parts[4] * 1000 : 0);

  if (offset != 0) {
    // adjust the date and time according to the specified timezone
    d.setTime(d.getTime() + offset * 60000);
  }

  return true;
};



/**
 * Class representing a date/time interval. Used for date calculations.
 * <pre>
 * new goog.date.Interval(0, 1) // One month
 * new goog.date.Interval(0, 0, 3, 1) // Three days and one hour
 * new goog.date.Interval(goog.date.Interval.DAYS, 1) // One day
 * </pre>
 *
 * @param {number|string=} opt_years Years or string representing date part.
 * @param {number=} opt_months Months or number of whatever date part specified
 *     by first parameter.
 * @param {number=} opt_days Days.
 * @param {number=} opt_hours Hours.
 * @param {number=} opt_minutes Minutes.
 * @param {number=} opt_seconds Seconds.
 * @constructor
 */
goog.date.Interval = function(opt_years, opt_months, opt_days, opt_hours,
                              opt_minutes, opt_seconds) {
  if (goog.isString(opt_years)) {
    var type = opt_years;
    var interval = /** @type {number} */ (opt_months);
    this.years = type == goog.date.Interval.YEARS ? interval : 0;
    this.months = type == goog.date.Interval.MONTHS ? interval : 0;
    this.days = type == goog.date.Interval.DAYS ? interval : 0;
    this.hours = type == goog.date.Interval.HOURS ? interval : 0;
    this.minutes = type == goog.date.Interval.MINUTES ? interval : 0;
    this.seconds = type == goog.date.Interval.SECONDS ? interval : 0;
  } else {
    this.years = /** @type {number} */ (opt_years) || 0;
    this.months = opt_months || 0;
    this.days = opt_days || 0;
    this.hours = opt_hours || 0;
    this.minutes = opt_minutes || 0;
    this.seconds = opt_seconds || 0;
  }
};


/**
 * Parses an XML Schema duration (ISO 8601 extended).
 * @see http://www.w3.org/TR/xmlschema-2/#duration
 *
 * @param  {string} duration An XML schema duration in textual format.
 *     Recurring durations and weeks are not supported.
 * @return {goog.date.Interval} The duration as a goog.date.Interval or null
 *     if the parse fails.
 */
goog.date.Interval.fromIsoString = function(duration) {
  var parts = duration.match(goog.date.splitDurationRegex_);
  if (!parts) {
    return null;
  }

  var timeEmpty = !(parts[6] || parts[7] || parts[8]);
  var dateTimeEmpty = timeEmpty && !(parts[2] || parts[3] || parts[4]);
  if (dateTimeEmpty || timeEmpty && parts[5]) {
    return null;
  }

  var negative = parts[1];
  var years = parseInt(parts[2], 10) || 0;
  var months = parseInt(parts[3], 10) || 0;
  var days = parseInt(parts[4], 10) || 0;
  var hours = parseInt(parts[6], 10) || 0;
  var minutes = parseInt(parts[7], 10) || 0;
  var seconds = parseFloat(parts[8]) || 0;
  return negative ? new goog.date.Interval(-years, -months, -days,
                                           -hours, -minutes, -seconds) :
                    new goog.date.Interval(years, months, days,
                                           hours, minutes, seconds);
};


/**
 * Serializes goog.date.Interval into XML Schema duration (ISO 8601 extended).
 * @see http://www.w3.org/TR/xmlschema-2/#duration
 *
 * @param {boolean=} opt_verbose Include zero fields in the duration string.
 * @return {?string} An XML schema duration in ISO 8601 extended format,
 *     or null if the interval contains both positive and negative fields.
 */
goog.date.Interval.prototype.toIsoString = function(opt_verbose) {
  var minField = Math.min(this.years, this.months, this.days,
                          this.hours, this.minutes, this.seconds);
  var maxField = Math.max(this.years, this.months, this.days,
                          this.hours, this.minutes, this.seconds);
  if (minField < 0 && maxField > 0) {
    return null;
  }

  // Return 0 seconds if all fields are zero.
  if (!opt_verbose && minField == 0 && maxField == 0) {
    return 'PT0S';
  }

  var res = [];

  // Add sign and 'P' prefix.
  if (minField < 0) {
    res.push('-');
  }
  res.push('P');

  // Add date.
  if (this.years || opt_verbose) {
    res.push(Math.abs(this.years) + 'Y');
  }
  if (this.months || opt_verbose) {
    res.push(Math.abs(this.months) + 'M');
  }
  if (this.days || opt_verbose) {
    res.push(Math.abs(this.days) + 'D');
  }

  // Add time.
  if (this.hours || this.minutes || this.seconds || opt_verbose) {
    res.push('T');
    if (this.hours || opt_verbose) {
      res.push(Math.abs(this.hours) + 'H');
    }
    if (this.minutes || opt_verbose) {
      res.push(Math.abs(this.minutes) + 'M');
    }
    if (this.seconds || opt_verbose) {
      res.push(Math.abs(this.seconds) + 'S');
    }
  }

  return res.join('');
};


/**
 * Tests whether the given interval is equal to this interval.
 * Note, this is a simple field-by-field comparison, it doesn't
 * account for comparisons like "12 months == 1 year".
 *
 * @param {goog.date.Interval} other The interval to test.
 * @return {boolean} Whether the intervals are equal.
 */
goog.date.Interval.prototype.equals = function(other) {
  return other.years == this.years &&
         other.months == this.months &&
         other.days == this.days &&
         other.hours == this.hours &&
         other.minutes == this.minutes &&
         other.seconds == this.seconds;
};


/**
 * @return {!goog.date.Interval} A clone of the interval object.
 */
goog.date.Interval.prototype.clone = function() {
  return new goog.date.Interval(
      this.years, this.months, this.days,
      this.hours, this.minutes, this.seconds);
};


/**
 * Years constant for the date parts.
 * @type {string}
 */
goog.date.Interval.YEARS = 'y';


/**
 * Months constant for the date parts.
 * @type {string}
 */
goog.date.Interval.MONTHS = 'm';


/**
 * Days constant for the date parts.
 * @type {string}
 */
goog.date.Interval.DAYS = 'd';


/**
 * Hours constant for the date parts.
 * @type {string}
 */
goog.date.Interval.HOURS = 'h';


/**
 * Minutes constant for the date parts.
 * @type {string}
 */
goog.date.Interval.MINUTES = 'n';


/**
 * Seconds constant for the date parts.
 * @type {string}
 */
goog.date.Interval.SECONDS = 's';


/**
 * @return {!goog.date.Interval} Negative of this interval.
 */
goog.date.Interval.prototype.getInverse = function() {
  return this.times(-1);
};


/**
 * Calculates n * (this interval) by memberwise multiplication.
 * @param {number} n An integer.
 * @return {!goog.date.Interval} n * this.
 */
goog.date.Interval.prototype.times = function(n) {
  return new goog.date.Interval(this.years * n,
                                this.months * n,
                                this.days * n,
                                this.hours * n,
                                this.minutes * n,
                                this.seconds * n);
};


/**
 * Gets the total number of seconds in the time interval. Assumes that months
 * and years are empty.
 * @return {number} Total number of seconds in the interval.
 */
goog.date.Interval.prototype.getTotalSeconds = function() {
  goog.asserts.assert(this.years == 0 && this.months == 0);
  return ((this.days * 24 + this.hours) * 60 + this.minutes) * 60 +
      this.seconds;
};


/**
 * Adds the Interval in the argument to this Interval field by field.
 *
 * @param {goog.date.Interval} interval The Interval to add.
 */
goog.date.Interval.prototype.add = function(interval) {
  this.years += interval.years;
  this.months += interval.months;
  this.days += interval.days;
  this.hours += interval.hours;
  this.minutes += interval.minutes;
  this.seconds += interval.seconds;
};



/**
 * Class representing a date. Defaults to current date if none is specified.
 *
 * Implements most methods of the native js Date object (except the time related
 * ones, {@see goog.date.DateTime}) and can be used interchangeably with it just
 * as if goog.date.Date was a synonym of Date. To make this more transparent,
 * Closure APIs should accept goog.date.DateLike instead of the real Date
 * object.
 *
 * To allow goog.date.Date objects to be passed as arguments to methods
 * expecting Date objects this class is marked as extending the built in Date
 * object even though that's not strictly true.
 *
 * @param {number|Object=} opt_year Four digit year or a date-like object. If
 *     not set, the created object will contain the date determined by
 *     goog.now().
 * @param {number=} opt_month Month, 0 = Jan, 11 = Dec.
 * @param {number=} opt_date Date of month, 1 - 31.
 * @constructor
 * @see goog.date.DateTime
 */
goog.date.Date = function(opt_year, opt_month, opt_date) {
  // goog.date.DateTime assumes that only this.date_ is added in this ctor.
  if (goog.isNumber(opt_year)) {
    this.date_ = new Date(opt_year, opt_month || 0, opt_date || 1);
    this.maybeFixDst_(opt_date || 1);
  } else if (goog.isObject(opt_year)) {
    this.date_ = new Date(opt_year.getFullYear(), opt_year.getMonth(),
                          opt_year.getDate());
    this.maybeFixDst_(opt_year.getDate());
  } else {
    this.date_ = new Date(goog.now());
    this.date_.setHours(0);
    this.date_.setMinutes(0);
    this.date_.setSeconds(0);
    this.date_.setMilliseconds(0);
  }
};


/**
 * First day of week. 0 = Mon, 6 = Sun.
 * @type {number}
 * @private
 */
goog.date.Date.prototype.firstDayOfWeek_ =
    goog.i18n.DateTimeSymbols.FIRSTDAYOFWEEK;


/**
 * The cut off weekday used for week number calculations. 0 = Mon, 6 = Sun.
 * @type {number}
 * @private
 */
goog.date.Date.prototype.firstWeekCutOffDay_ =
    goog.i18n.DateTimeSymbols.FIRSTWEEKCUTOFFDAY;


/**
 * @return {!goog.date.Date} A clone of the date object.
 */
goog.date.Date.prototype.clone = function() {
  var date = new goog.date.Date(this.date_);
  date.firstDayOfWeek_ = this.firstDayOfWeek_;
  date.firstWeekCutOffDay_ = this.firstWeekCutOffDay_;

  return date;
};


/**
 * @return {number} The four digit year of date.
 */
goog.date.Date.prototype.getFullYear = function() {
  return this.date_.getFullYear();
};


/**
 * Alias for getFullYear.
 *
 * @return {number} The four digit year of date.
 * @see #getFullyear
 */
goog.date.Date.prototype.getYear = function() {
  return this.getFullYear();
};


/**
 * @return {goog.date.month} The month of date, 0 = Jan, 11 = Dec.
 */
goog.date.Date.prototype.getMonth = function() {
  return /** @type {goog.date.month} */ (this.date_.getMonth());
};


/**
 * @return {number} The date of month.
 */
goog.date.Date.prototype.getDate = function() {
  return this.date_.getDate();
};


/**
 * Returns the number of milliseconds since 1 January 1970 00:00:00.
 *
 * @return {number} The number of milliseconds since 1 January 1970 00:00:00.
 */
goog.date.Date.prototype.getTime = function() {
  return this.date_.getTime();
};


/**
 * @return {goog.date.weekDay} The day of week, US style. 0 = Sun, 6 = Sat.
 */
goog.date.Date.prototype.getDay = function() {
  return /** @type {goog.date.weekDay} */ (this.date_.getDay());
};


/**
 * @return {number} The day of week, ISO style. 0 = Mon, 6 = Sun.
 */
goog.date.Date.prototype.getIsoWeekday = function() {
  return (this.getDay() + 6) % 7;
};


/**
 * @return {number} The day of week according to firstDayOfWeek setting.
 */
goog.date.Date.prototype.getWeekday = function() {
  return (this.getIsoWeekday() - this.firstDayOfWeek_ + 7) % 7;
};


/**
 * @return {number} The four digit year of date according to universal time.
 */
goog.date.Date.prototype.getUTCFullYear = function() {
  return this.date_.getUTCFullYear();
};


/**
 * @return {goog.date.month} The month of date according to universal time,
 *     0 = Jan, 11 = Dec.
 */
goog.date.Date.prototype.getUTCMonth = function() {
  return /** @type {goog.date.month} */ (this.date_.getUTCMonth());
};


/**
 * @return {number} The date of month according to universal time.
 */
goog.date.Date.prototype.getUTCDate = function() {
  return this.date_.getUTCDate();
};


/**
 * @return {goog.date.weekDay} The day of week according to universal time,
 *     US style. 0 = Sun, 1 = Mon, 6 = Sat.
 */
goog.date.Date.prototype.getUTCDay = function() {
  return /** @type {goog.date.weekDay} */ (this.date_.getDay());
};


/**
 * @return {number} The hours value according to universal time.
 */
goog.date.Date.prototype.getUTCHours = function() {
  return this.date_.getUTCHours();
};


/**
 * @return {number} The hours value according to universal time.
 */
goog.date.Date.prototype.getUTCMinutes = function() {
  return this.date_.getUTCMinutes();
};


/**
 * @return {number} The day of week according to universal time, ISO style.
 *     0 = Mon, 6 = Sun.
 */
goog.date.Date.prototype.getUTCIsoWeekday = function() {
  return (this.date_.getUTCDay() + 6) % 7;
};


/**
 * @return {number} The day of week according to universal time and
 *     firstDayOfWeek setting.
 */
goog.date.Date.prototype.getUTCWeekday = function() {
  return (this.getUTCIsoWeekday() - this.firstDayOfWeek_ + 7) % 7;
};


/**
 * @return {number} The first day of the week. 0 = Mon, 6 = Sun.
 */
goog.date.Date.prototype.getFirstDayOfWeek = function() {
  return this.firstDayOfWeek_;
};


/**
 * @return {number} The cut off weekday used for week number calculations.
 *     0 = Mon, 6 = Sun.
 */
goog.date.Date.prototype.getFirstWeekCutOffDay = function() {
  return this.firstWeekCutOffDay_;
};


/**
 * @return {number} The number of days for the selected month.
 */
goog.date.Date.prototype.getNumberOfDaysInMonth = function() {
  return goog.date.getNumberOfDaysInMonth(this.getFullYear(), this.getMonth());
};


/**
 * @return {number} The week number.
 */
goog.date.Date.prototype.getWeekNumber = function() {
  return goog.date.getWeekNumber(
      this.getFullYear(), this.getMonth(), this.getDate(),
      this.firstWeekCutOffDay_, this.firstDayOfWeek_);
};


/**
 * @return {number} The day of year.
 */
goog.date.Date.prototype.getDayOfYear = function() {
  var dayOfYear = this.getDate();
  var year = this.getFullYear();
  for (var m = this.getMonth() - 1; m >= 0; m--) {
    dayOfYear += goog.date.getNumberOfDaysInMonth(year, m);
  }

  return dayOfYear;
};


/**
 * Returns timezone offset. The timezone offset is the delta in minutes between
 * UTC and your local time. E.g., UTC+10 returns -600. Daylight savings time
 * prevents this value from being constant.
 *
 * @return {number} The timezone offset.
 */
goog.date.Date.prototype.getTimezoneOffset = function() {
  return this.date_.getTimezoneOffset();
};


/**
 * Returns timezone offset as a string. Returns offset in [+-]HH:mm format or Z
 * for UTC.
 *
 * @return {string} The timezone offset as a string.
 */
goog.date.Date.prototype.getTimezoneOffsetString = function() {
  var tz;
  var offset = this.getTimezoneOffset();

  if (offset == 0) {
    tz = 'Z';
  } else {
    var n = Math.abs(offset) / 60;
    var h = Math.floor(n);
    var m = (n - h) * 60;
    tz = (offset > 0 ? '-' : '+') +
        goog.string.padNumber(h, 2) + ':' +
        goog.string.padNumber(m, 2);
  }

  return tz;
};


/**
 * Sets the date.
 *
 * @param {goog.date.Date} date Date object to set date from.
 */
goog.date.Date.prototype.set = function(date) {
  this.date_ = new Date(date.getFullYear(), date.getMonth(), date.getDate());
};


/**
 * Sets the year part of the date.
 *
 * @param {number} year Four digit year.
 */
goog.date.Date.prototype.setFullYear = function(year) {
  this.date_.setFullYear(year);
};


/**
 * Alias for setFullYear.
 *
 * @param {number} year Four digit year.
 * @see #setFullYear
 */
goog.date.Date.prototype.setYear = function(year) {
  this.setFullYear(year);
};


/**
 * Sets the month part of the date.
 *
 * TODO(nnaze): Update type to goog.date.month.
 *
 * @param {number} month The month, where 0 = Jan, 11 = Dec.
 */
goog.date.Date.prototype.setMonth = function(month) {
  this.date_.setMonth(month);
};


/**
 * Sets the day part of the date.
 *
 * @param {number} date The day part.
 */
goog.date.Date.prototype.setDate = function(date) {
  this.date_.setDate(date);
};


/**
 * Sets the value of the date object as expressed in the number of milliseconds
 * since 1 January 1970 00:00:00.
 *
 * @param {number} ms Number of milliseconds since 1 Jan 1970.
 */
goog.date.Date.prototype.setTime = function(ms) {
  this.date_.setTime(ms);
};


/**
 * Sets the year part of the date according to universal time.
 *
 * @param {number} year Four digit year.
 */
goog.date.Date.prototype.setUTCFullYear = function(year) {
  this.date_.setUTCFullYear(year);
};


/**
 * Sets the month part of the date according to universal time.
 *
 * @param {number} month The month, where 0 = Jan, 11 = Dec.
 */
goog.date.Date.prototype.setUTCMonth = function(month) {
  this.date_.setUTCMonth(month);
};


/**
 * Sets the day part of the date according to universal time.
 *
 * @param {number} date The UTC date.
 */
goog.date.Date.prototype.setUTCDate = function(date) {
  this.date_.setUTCDate(date);
};


/**
 * Sets the first day of week.
 *
 * @param {number} day 0 = Mon, 6 = Sun.
 */
goog.date.Date.prototype.setFirstDayOfWeek = function(day) {
  this.firstDayOfWeek_ = day;
};


/**
 * Sets cut off weekday used for week number calculations. 0 = Mon, 6 = Sun.
 *
 * @param {number} day The cut off weekday.
 */
goog.date.Date.prototype.setFirstWeekCutOffDay = function(day) {
  this.firstWeekCutOffDay_ = day;
};


/**
 * Performs date calculation by adding the supplied interval to the date.
 *
 * @param {goog.date.Interval} interval Date interval to add.
 */
goog.date.Date.prototype.add = function(interval) {
  if (interval.years || interval.months) {
    // As months have different number of days adding a month to Jan 31 by just
    // setting the month would result in a date in early March rather than Feb
    // 28 or 29. Doing it this way overcomes that problem.

    // adjust year and month, accounting for both directions
    var month = this.getMonth() + interval.months + interval.years * 12;
    var year = this.getYear() + Math.floor(month / 12);
    month %= 12;
    if (month < 0) {
      month += 12;
    }

    var daysInTargetMonth = goog.date.getNumberOfDaysInMonth(year, month);
    var date = Math.min(daysInTargetMonth, this.getDate());

    // avoid inadvertently causing rollovers to adjacent months
    this.setDate(1);

    this.setFullYear(year);
    this.setMonth(month);
    this.setDate(date);
  }

  if (interval.days) {
    // Convert the days to milliseconds and add it to the UNIX timestamp.
    // Taking noon helps to avoid 1 day error due to the daylight saving.
    var noon = new Date(this.getYear(), this.getMonth(), this.getDate(), 12);
    var result = new Date(noon.getTime() + interval.days * 86400000);

    // Set date to 1 to prevent rollover caused by setting the year or month.
    this.setDate(1);
    this.setFullYear(result.getFullYear());
    this.setMonth(result.getMonth());
    this.setDate(result.getDate());

    this.maybeFixDst_(result.getDate());
  }
};


/**
 * Returns ISO 8601 string representation of date.
 *
 * @param {boolean=} opt_verbose Whether the verbose format should be used
 *     instead of the default compact one.
 * @param {boolean=} opt_tz Whether the timezone offset should be included
 *     in the string.
 * @return {string} ISO 8601 string representation of date.
 */
goog.date.Date.prototype.toIsoString = function(opt_verbose, opt_tz) {
  var str = [
    this.getFullYear(),
    goog.string.padNumber(this.getMonth() + 1, 2),
    goog.string.padNumber(this.getDate(), 2)
  ];

  return str.join((opt_verbose) ? '-' : '') +
         (opt_tz ? this.getTimezoneOffsetString() : '');
};


/**
 * Returns ISO 8601 string representation of date according to universal time.
 *
 * @param {boolean=} opt_verbose Whether the verbose format should be used
 *     instead of the default compact one.
 * @param {boolean=} opt_tz Whether the timezone offset should be included in
 *     the string.
 * @return {string} ISO 8601 string representation of date according to
 *     universal time.
 */
goog.date.Date.prototype.toUTCIsoString = function(opt_verbose, opt_tz) {
  var str = [
    this.getUTCFullYear(),
    goog.string.padNumber(this.getUTCMonth() + 1, 2),
    goog.string.padNumber(this.getUTCDate(), 2)
  ];

  return str.join((opt_verbose) ? '-' : '') + (opt_tz ? 'Z' : '');
};


/**
 * Tests whether given date is equal to this Date.
 * Note: This ignores units more precise than days (hours and below)
 * and also ignores timezone considerations.
 *
 * @param {goog.date.Date} other The date to compare.
 * @return {boolean} Whether the given date is equal to this one.
 */
goog.date.Date.prototype.equals = function(other) {
  return this.getYear() == other.getYear() &&
         this.getMonth() == other.getMonth() &&
         this.getDate() == other.getDate();
};


/**
 * Overloaded toString method for object.
 * @return {string} ISO 8601 string representation of date.
 */
goog.date.Date.prototype.toString = function() {
  return this.toIsoString();
};


/**
 * Fixes date to account for daylight savings time in browsers that fail to do
 * so automatically.
 * @param {number} expected Expected date.
 * @private
 */
goog.date.Date.prototype.maybeFixDst_ = function(expected) {
  if (this.getDate() != expected) {
    var dir = this.getDate() < expected ? 1 : -1;
    this.date_.setUTCHours(this.date_.getUTCHours() + dir);
  }
};


/**
 * @return {number} Value of wrapped date.
 */
goog.date.Date.prototype.valueOf = function() {
  return this.date_.valueOf();
};


/**
 * Compares two dates.  May be used as a sorting function.
 * @see goog.array.sort
 * @param {!goog.date.DateLike} date1 Date to compare.
 * @param {!goog.date.DateLike} date2 Date to compare.
 * @return {number} Comparison result. 0 if dates are the same, less than 0 if
 *     date1 is earlier than date2, greater than 0 if date1 is later than date2.
 */
goog.date.Date.compare = function(date1, date2) {
  return date1.getTime() - date2.getTime();
};



/**
 * Class representing a date and time. Defaults to current date and time if none
 * is specified.
 *
 * Implements most methods of the native js Date object and can be used
 * interchangeably with it just as if goog.date.DateTime was a subclass of Date.
 *
 * @param {number|Object=} opt_year Four digit year or a date-like object. If
 *     not set, the created object will contain the date determined by
 *     goog.now().
 * @param {number=} opt_month Month, 0 = Jan, 11 = Dec.
 * @param {number=} opt_date Date of month, 1 - 31.
 * @param {number=} opt_hours Hours, 0 - 24.
 * @param {number=} opt_minutes Minutes, 0 - 59.
 * @param {number=} opt_seconds Seconds, 0 - 61.
 * @param {number=} opt_milliseconds Milliseconds, 0 - 999.
 * @constructor
 * @extends {goog.date.Date}
 */
goog.date.DateTime = function(opt_year, opt_month, opt_date, opt_hours,
                              opt_minutes, opt_seconds, opt_milliseconds) {
  if (goog.isNumber(opt_year)) {
    this.date_ = new Date(opt_year, opt_month || 0, opt_date || 1,
                          opt_hours || 0, opt_minutes || 0, opt_seconds || 0,
                          opt_milliseconds || 0);
  } else {
    this.date_ = new Date(opt_year ? opt_year.getTime() : goog.now());
  }
};
goog.inherits(goog.date.DateTime, goog.date.Date);


/**
 * Creates a DateTime from a datetime string expressed in RFC 822 format.
 *
 * @param {string} formatted A date or datetime expressed in RFC 822 format.
 * @return {goog.date.DateTime} Parsed date or null if parse fails.
 */
goog.date.DateTime.fromRfc822String = function(formatted) {
  var date = new Date(formatted);
  return !isNaN(date.getTime()) ? new goog.date.DateTime(date) : null;
};


/**
 * Returns the hours part of the datetime.
 *
 * @return {number} An integer between 0 and 23, representing the hour.
 */
goog.date.DateTime.prototype.getHours = function() {
  return this.date_.getHours();
};


/**
 * Returns the minutes part of the datetime.
 *
 * @return {number} An integer between 0 and 59, representing the minutes.
 */
goog.date.DateTime.prototype.getMinutes = function() {
  return this.date_.getMinutes();
};


/**
 * Returns the seconds part of the datetime.
 *
 * @return {number} An integer between 0 and 59, representing the seconds.
 */
goog.date.DateTime.prototype.getSeconds = function() {
  return this.date_.getSeconds();
};


/**
 * Returns the milliseconds part of the datetime.
 *
 * @return {number} An integer between 0 and 999, representing the milliseconds.
 */
goog.date.DateTime.prototype.getMilliseconds = function() {
  return this.date_.getMilliseconds();
};


/**
 * Returns the day of week according to universal time, US style.
 *
 * @return {goog.date.weekDay} Day of week, 0 = Sun, 1 = Mon, 6 = Sat.
 */
goog.date.DateTime.prototype.getUTCDay = function() {
  return /** @type {goog.date.weekDay} */ (this.date_.getUTCDay());
};


/**
 * Returns the hours part of the datetime according to universal time.
 *
 * @return {number} An integer between 0 and 23, representing the hour.
 */
goog.date.DateTime.prototype.getUTCHours = function() {
  return this.date_.getUTCHours();
};


/**
 * Returns the minutes part of the datetime according to universal time.
 *
 * @return {number} An integer between 0 and 59, representing the minutes.
 */
goog.date.DateTime.prototype.getUTCMinutes = function() {
  return this.date_.getUTCMinutes();
};


/**
 * Returns the seconds part of the datetime according to universal time.
 *
 * @return {number} An integer between 0 and 59, representing the seconds.
 */
goog.date.DateTime.prototype.getUTCSeconds = function() {
  return this.date_.getUTCSeconds();
};


/**
 * Returns the milliseconds part of the datetime according to universal time.
 *
 * @return {number} An integer between 0 and 999, representing the milliseconds.
 */
goog.date.DateTime.prototype.getUTCMilliseconds = function() {
  return this.date_.getUTCMilliseconds();
};


/**
 * Sets the hours part of the datetime.
 *
 * @param {number} hours An integer between 0 and 23, representing the hour.
 */
goog.date.DateTime.prototype.setHours = function(hours) {
  this.date_.setHours(hours);
};


/**
 * Sets the minutes part of the datetime.
 *
 * @param {number} minutes Integer between 0 and 59, representing the minutes.
 */
goog.date.DateTime.prototype.setMinutes = function(minutes) {
  this.date_.setMinutes(minutes);
};


/**
 * Sets the seconds part of the datetime.
 *
 * @param {number} seconds Integer between 0 and 59, representing the seconds.
 */
goog.date.DateTime.prototype.setSeconds = function(seconds) {
  this.date_.setSeconds(seconds);
};


/**
 * Sets the seconds part of the datetime.
 *
 * @param {number} ms Integer between 0 and 999, representing the milliseconds.
 */
goog.date.DateTime.prototype.setMilliseconds = function(ms) {
  this.date_.setMilliseconds(ms);
};


/**
 * Sets the hours part of the datetime according to universal time.
 *
 * @param {number} hours An integer between 0 and 23, representing the hour.
 */
goog.date.DateTime.prototype.setUTCHours = function(hours) {
  this.date_.setUTCHours(hours);
};


/**
 * Sets the minutes part of the datetime according to universal time.
 *
 * @param {number} minutes Integer between 0 and 59, representing the minutes.
 */
goog.date.DateTime.prototype.setUTCMinutes = function(minutes) {
  this.date_.setUTCMinutes(minutes);
};


/**
 * Sets the seconds part of the datetime according to universal time.
 *
 * @param {number} seconds Integer between 0 and 59, representing the seconds.
 */
goog.date.DateTime.prototype.setUTCSeconds = function(seconds) {
  this.date_.setUTCSeconds(seconds);
};


/**
 * Sets the seconds part of the datetime according to universal time.
 *
 * @param {number} ms Integer between 0 and 999, representing the milliseconds.
 */
goog.date.DateTime.prototype.setUTCMilliseconds = function(ms) {
  this.date_.setUTCMilliseconds(ms);
};


/**
 * Performs date calculation by adding the supplied interval to the date.
 *
 * @param {goog.date.Interval} interval Date interval to add.
 */
goog.date.DateTime.prototype.add = function(interval) {
  goog.date.Date.prototype.add.call(this, interval);

  if (interval.hours) {
    this.setHours(this.date_.getHours() + interval.hours);
  }
  if (interval.minutes) {
    this.setMinutes(this.date_.getMinutes() + interval.minutes);
  }
  if (interval.seconds) {
    this.setSeconds(this.date_.getSeconds() + interval.seconds);
  }
};


/**
 * Returns ISO 8601 string representation of date/time.
 *
 * @param {boolean=} opt_verbose Whether the verbose format should be used
 *     instead of the default compact one.
 * @param {boolean=} opt_tz Whether the timezone offset should be included
 *     in the string.
 * @return {string} ISO 8601 string representation of date/time.
 */
goog.date.DateTime.prototype.toIsoString = function(opt_verbose, opt_tz) {
  var dateString = goog.date.Date.prototype.toIsoString.call(this, opt_verbose);

  if (opt_verbose) {
    return dateString + ' ' +
        goog.string.padNumber(this.getHours(), 2) + ':' +
        goog.string.padNumber(this.getMinutes(), 2) + ':' +
        goog.string.padNumber(this.getSeconds(), 2) +
        (opt_tz ? this.getTimezoneOffsetString() : '');
  }

  return dateString + 'T' +
      goog.string.padNumber(this.getHours(), 2) +
      goog.string.padNumber(this.getMinutes(), 2) +
      goog.string.padNumber(this.getSeconds(), 2) +
      (opt_tz ? this.getTimezoneOffsetString() : '');
};


/**
 * Returns XML Schema 2 string representation of date/time.
 * The return value is also ISO 8601 compliant.
 *
 * @param {boolean=} opt_timezone Should the timezone offset be included in the
 *     string?.
 * @return {string} XML Schema 2 string representation of date/time.
 */
goog.date.DateTime.prototype.toXmlDateTime = function(opt_timezone) {
  return goog.date.Date.prototype.toIsoString.call(this, true) + 'T' +
      goog.string.padNumber(this.getHours(), 2) + ':' +
      goog.string.padNumber(this.getMinutes(), 2) + ':' +
      goog.string.padNumber(this.getSeconds(), 2) +
      (opt_timezone ? this.getTimezoneOffsetString() : '');
};


/**
 * Returns ISO 8601 string representation of date/time according to universal
 * time.
 *
 * @param {boolean=} opt_verbose Whether the opt_verbose format should be
 *     returned instead of the default compact one.
 * @param {boolean=} opt_tz Whether the the timezone offset should be included
 *     in the string.
 * @return {string} ISO 8601 string representation of date/time according to
 *     universal time.
 */
goog.date.DateTime.prototype.toUTCIsoString = function(opt_verbose, opt_tz) {
  var dateStr = goog.date.Date.prototype.toUTCIsoString.call(this, opt_verbose);

  if (opt_verbose) {
    return dateStr + ' ' +
        goog.string.padNumber(this.getUTCHours(), 2) + ':' +
        goog.string.padNumber(this.getUTCMinutes(), 2) + ':' +
        goog.string.padNumber(this.getUTCSeconds(), 2) +
        (opt_tz ? 'Z' : '');
  }

  return dateStr + 'T' +
      goog.string.padNumber(this.getUTCHours(), 2) +
      goog.string.padNumber(this.getUTCMinutes(), 2) +
      goog.string.padNumber(this.getUTCSeconds(), 2) +
      (opt_tz ? 'Z' : '');
};


/**
 * Tests whether given datetime is exactly equal to this DateTime.
 *
 * @param {goog.date.DateTime} other The datetime to compare.
 * @return {boolean} Whether the given datetime is exactly equal to this one.
 */
goog.date.DateTime.prototype.equals = function(other) {
  return this.getTime() == other.getTime();
};


/**
 * Overloaded toString method for object.
 * @return {string} ISO 8601 string representation of date/time.
 */
goog.date.DateTime.prototype.toString = function() {
  return this.toIsoString();
};


/**
 * Generates time label for the datetime, e.g., '5:30am'.
 * By default this does not pad hours (e.g., to '05:30') and it does add
 * an am/pm suffix.
 * TODO(user): i18n -- hardcoding time format like this is bad.  E.g., in CJK
 *               locales, need Chinese characters for hour and minute units.
 * @param {boolean=} opt_padHours Whether to pad hours, e.g., '05:30' vs '5:30'.
 * @param {boolean=} opt_showAmPm Whether to show the 'am' and 'pm' suffix.
 * @param {boolean=} opt_omitZeroMinutes E.g., '5:00pm' becomes '5pm',
 *                                      but '5:01pm' remains '5:01pm'.
 * @return {string} The time label.
 */
goog.date.DateTime.prototype.toUsTimeString = function(opt_padHours,
                                                       opt_showAmPm,
                                                       opt_omitZeroMinutes) {
  var hours = this.getHours();

  // show am/pm marker by default
  if (!goog.isDef(opt_showAmPm)) {
    opt_showAmPm = true;
  }

  // 12pm
  var isPM = hours == 12;

  // change from 1-24 to 1-12 basis
  if (hours > 12) {
    hours -= 12;
    isPM = true;
  }

  // midnight is expressed as "12am", but if am/pm marker omitted, keep as '0'
  if (hours == 0 && opt_showAmPm) {
    hours = 12;
  }

  var label = opt_padHours ? goog.string.padNumber(hours, 2) : String(hours);
  var minutes = this.getMinutes();
  if (!opt_omitZeroMinutes || minutes > 0) {
    label += ':' + goog.string.padNumber(minutes, 2);
  }

  // by default, show am/pm suffix
  if (opt_showAmPm) {
    /**
     * @desc Suffix for morning times.
     */
    var MSG_TIME_AM = goog.getMsg('am');

    /**
     * @desc Suffix for afternoon times.
     */
    var MSG_TIME_PM = goog.getMsg('pm');

    label += isPM ? MSG_TIME_PM : MSG_TIME_AM;
  }
  return label;
};


/**
 * Generates time label for the datetime in standard ISO 24-hour time format.
 * E.g., '06:00:00' or '23:30:15'.
 * @param {boolean=} opt_showSeconds Whether to shows seconds. Defaults to TRUE.
 * @return {string} The time label.
 */
goog.date.DateTime.prototype.toIsoTimeString = function(opt_showSeconds) {
  var hours = this.getHours();
  var label = goog.string.padNumber(hours, 2) +
              ':' +
              goog.string.padNumber(this.getMinutes(), 2);
  if (!goog.isDef(opt_showSeconds) || opt_showSeconds) {
    label += ':' + goog.string.padNumber(this.getSeconds(), 2);
  }
  return label;
};


/**
 * @return {!goog.date.DateTime} A clone of the datetime object.
 */
goog.date.DateTime.prototype.clone = function() {
  var date = new goog.date.DateTime(this.date_);
  date.setFirstDayOfWeek(this.getFirstDayOfWeek());
  date.setFirstWeekCutOffDay(this.getFirstWeekCutOffDay());
  return date;
};
/**
 * Copyright 2000-2011 Athanasios Polychronakis. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * 
 * @author Athanasios Polychronakis <thanpolas@gmail.com>
 * createdate 05/Jul/2010
 *
 *********
 *  File:: utilities/date.core.js
 *  Generic date class. Used for formating
 *********
 */


goog.provide('core.date');

goog.require('goog.date');
goog.require('goog.date.DateTime');


/**
 * The date constructor
 *
 * We expect a string of RFC822 type: Wed, 26 May 2010 23:17:17 +0000
 *
 * Or a typical MySQL Data string: 2010-06-09 13:12:01
 *
 * If no parameter is set we use now datetime
 *
 * @param {string=} opt_sdate date RFC822 type: Wed, 26 May 2010 23:17:17 +0000 - or 2010-06-09 13:12:01
 * @return {this}
 * @constructor
 */
core.date = function (opt_sDate)
{
    var c = core;
    var g = goog;
    var log = g.debug.Logger.getLogger('core.date');

    log.fine('Init - sDate:' + opt_sDate);



    this.db = {
        sDate: opt_sDate || null, // the string date as passed from parameters
        gdt: {}, // the google date instance
        // get current date time
        gdtnow: new g.date.DateTime()
    }

    if (g.isString(opt_sDate)) {
        // execute method to fill our date data object (this.db.dt)
        //this._getDatetimedb();
        //log.info('Here:' + opt_sDate);
        //Wed, 02 Oct 2002 15:00:00 +0200
        this.db.gdt = g.date.DateTime.fromRfc822String(opt_sDate);

        // check if the string validated ...
        if (g.isNull(this.db.gdt)) {
          // no it didn't, let's try a normal MySQL string
          // Code from: http://stackoverflow.com/questions/3075577/convert-mysql-datetime-stamp-into-javascripts-date-format
          // Split timestamp into [ Y, M, D, h, m, s ]
          //var t = opt_sDate.split(/[- :]/);

          // Apply each element to the Date function
          //this.db.gdt = new g.date.DateTime(t[0], t[1]-1, t[2], t[3], t[4], t[5]);

          // try another way that'll work as well...
          this.db.gdt = new g.date.fromIsoString(opt_sDate);
        }

    } else {
        this.db.gdt = new g.date.DateTime();
    }

    // check if gdt is set
    if (g.isNull(this.db.gdt)) {
        // not set, use now
        this.db.gdt = new g.date.DateTime();
    }
    /**
     * bring given date to UTC / GMT datetime
     *
     * 22/Oct/2010 No need for this, google's data class
     * does this automaticaly
     *
    // first if there are hours offset make them minutes

    var tzofst = Number(this.db.dt.ofstHours) * 60;
    // now add up any minutes
    tzofst = tzofst + Number(this.db.dt.ofstMinutes);
    // if the sign is + then substract the minutes... else add
    var tzofst = ('+' == this.db.dt.ofstSign ? tzofst * -1 : tzofst);
    var clientOfst = this.db.gdtnow.getTimezoneOffset() * -1;
    // now set the offset
    log.fine('seting offset minutes:' + tzofst + ' our ofst:' + clientOfst);
    //this.db.gdt.setUTCMinutes(tzofst);

    */


    /**
     * Now make given date be at client's timezone
     *
     * Reverse sign of .getTimezoneOffset()
     * for the calculation to work properly
     */
    //this.db.gdt.setUTCMinutes(clientOfst);

    /**
     * There seems to be a bug with setUTCMinutes
     * it gets a little off each time...
     */


    return this;
}

core.date.dbstatic = {
    day: {
        0: 'Sun',
        1: 'Mon',
        2: 'Tue',
        3: 'Wed',
        4: 'Thu',
        5: 'Fri',
        6: 'Sat'
    },
    month: {
        0: 'Jan',
        1: 'Feb',
        2: 'Mar',
        3: 'Apr',
        4: 'May',
        5: 'Jun',
        6: 'Jul',
        7: 'Aug',
        8: 'Sep',
        9: 'Oct',
        10: 'Nov',
        11: 'Dec'
    },
    monthRev: {
        'Jan' : 0,
        'Feb' : 1,
        'Mar' : 2,
        'Apr' : 3,
        'May' : 4,
        'Jun' : 5,
        'Jul' : 6,
        'Aug' : 7,
        'Sep' : 8,
        'Oct' : 9,
        'Nov' : 10,
        'Dec' : 11
    }
}; // property core.date.db


/**
 * Get time difference in a string format in ago type
 * e.g. 1 minute ago, 2 days ago, etc...
 *
 * @param {boolean} opt_short If we need a shorter version define true
 * @return {string}
 */
core.date.prototype.getDiffStringAgo = function (opt_short)
{
    var c = core;
    var g = goog;
    var log = g.debug.Logger.getLogger('core.date.getDiffStringAgo');

    log.fine('Init');

    var dt = this.db.gdt;
    /*new Date(
        this.db.dt.year, this.db.dt.month, this.db.dt.date,
        this.db.dt.hours, this.db.dt.minutes, this.db.dt.seconds
    );*/

    var diff = c.date.getDiffSecs(dt);


    // more than a day ago
    if (86400 < diff ) return this.smallDate();


    if (60 > diff) return diff + (c.MOBILE || opt_short ? 'secs' : ' seconds ago');
    if (120 > diff) return ( c.MOBILE || opt_short ? '1 min' : 'about a minute ago');
    if (3600 > diff) return ( c.MOBILE || opt_short ? Math.floor(diff / 60) + ' min' : 'about ' + Math.floor(diff / 60) + ' minutes ago');
    if (7200 > diff) return ( c.MOBILE || opt_short ? '1 hour' : 'about an hour ago');
    if (86400 >= diff) return ( c.MOBILE || opt_short ? Math.floor(diff / 3600) + ' hours' : 'about ' + Math.floor(diff / 3600) + ' hours ago');

    return '';
}; // method core.date.getDiffStringAgo

/**
 * A static function that calculates
 * the dirrence from the given google date
 * compared to now in seconds
 *
 * @param {goog.date.DateTime} gDate
 * @return {Number} seconds
 */
core.date.getDiffSecs = function (gDate)
{
  try {
    var g = goog;

    if (g.isNull(gDate))
      return 0;
    var dtnow = new g.date.DateTime();

    var epoch = Math.floor(gDate.getTime() / 1000);
    var epochnow = Math.floor(dtnow.getTime() / 1000);

    return Math.abs((epochnow - epoch));
  } catch(e) {core.error(e);}
};


/**
 * Will return the smallest possible data time
 * string. If within this year, we ommit year,
 * if same day we ommit month
 *
 * e.g. 12:32 PM May 25
 * 09:23 AM Dec 23, 2009
 */
core.date.prototype.smallDatetime = function ()
{
    var c = core;
    var g = goog;
    var m = c.date.dbstatic.month;
    var log = g.debug.Logger.getLogger('core.date.smallDatetime');
    var sdate = this.db.sDate;
    log.fine('Init');

    var d = this.db.gdt;

    // get current date time
    var n = this.db.gdtnow;


    // apply formatings, start with date
    var dd = g.string.buildString(d.getDate());
    if (1 == dd.length)
        dd = '0' + dd;
    // month
    var mm = g.string.buildString(d.getMonth());
    if (1 == mm.length)
        mm = '0' + mm;
    var mmm = m[d.getMonth()];
    // hours
    var hh = d.getHours();
    if (12 < hh) {
        hh = g.string.buildString(hh - 12);
        if (1 == hh.length)
            hh = '0' + hh;
        var a_p = 'pm';
    } else {
        hh = g.string.buildString(hh);
        if (1 == hh.length)
            hh = '0' + hh;
        var a_p = 'am';
    }
    // minutes
    var MM = g.string.buildString(d.getMinutes());
    if (1 == MM.length)
        MM = '0' + MM;


    // compare years...
    if (d.getYear() != n.getYear()) {
        // different year, display it as hh:MM mmm dd, yyyy
        var ret =  mmm + '/' + dd + '/' + d.getYear() + ' ' + hh + ':' + MM + '' + a_p;
        log.finer('Year Orig:' + sdate + ' Formated:' + ret);
        return ret;
    }

    // check if not in same month
    if (d.getMonth() != n.getMonth()) {
        // different month, display it as hh:MM mmm dd
        var ret =  mmm + '/' + dd  + ' ' + hh + ':' + MM + '' + a_p;
        log.finer('Month Orig:' + sdate + ' Formated:' + ret);
        return ret;
    }

    // check if in same day
    if (d.getDate() == n.getDate()) {
        // same day, display as hh:mm
        var ret = d.getHours() + ':' + MM + '' + a_p;
        log.finer('Date same Orig:' + sdate + ' Formated:' + ret);
        return ret;

    }

    // different day, display it as dd mmm
    //var ret = d.toLocaleFormat('mmm'); //d.getDate() + ' ' + m[d.getMonth()];
    var ret = dd + '/' + mmm + ' ' + hh + ':' + MM + ' ' + a_p;



    log.finer('Date Not same Orig:' + sdate + ' Formated:' + ret);
    return ret;

}; // method core.data.smallDatetime

/**
 * Returns a formated date in the shortest type.
 * E.g. 01:34 am, 4 Apr, 2009
 *
 *
 * @return {string|null} formated date or null if sdate does not validate
 */
core.date.prototype.smallDate = function ()
{
    var c = core;
    var g = goog;
    var m = c.date.dbstatic.month;
    var log = g.debug.Logger.getLogger('core.date.smallDate');
    var sdate = this.db.sDate;
    log.fine('Init:' + g.typeOf(this.db.gdt));

    var d = this.db.gdt;

    // get current date time
    var n = this.db.gdtnow;


    // apply formatings, start with date
    var dd = g.string.buildString(d.getDate());
    if (1 == dd.length)
        dd = '0' + dd;
    // month
    var mm = g.string.buildString(d.getMonth());
    if (1 == mm.length)
        mm = '0' + mm;
    var mmm = m[d.getMonth()];
    // hours
    var hh = d.getHours();
    if (12 < hh) {
        hh = g.string.buildString(hh - 12);
        if (1 == hh.length)
            hh = '0' + hh;
        var a_p = 'pm';
    } else {
        hh = g.string.buildString(hh);
        if (1 == hh.length)
            hh = '0' + hh;
        var a_p = 'am';
    }
    // minutes
    var MM = g.string.buildString(d.getMinutes());
    if (1 == MM.length)
        MM = '0' + MM;


    // compare years...
    if (d.getYear() != n.getYear()) {
        // different year, display it as mm/dd/yyyy
        var ret = mm + '/' + dd + '/' + d.getYear();
        log.finer('Year Orig:' + sdate + ' Formated:' + ret);
        return ret;
    }

    // check if not in same month
    if (d.getMonth() != n.getMonth()) {
        // different month, display it as dd mmm
        var ret = mmm + ' ' + d.getDate();
        log.finer('Month Orig:' + sdate + ' Formated:' + ret);
        return ret;
    }

    // check if in same day
    if (d.getDate() == n.getDate()) {
        // same day, display as hh:mm
        var ret = d.getHours() + ':' + MM + ' ' + a_p;
        log.finer('Date same Orig:' + sdate + ' Formated:' + ret);
        return ret;

    }

    // different day, display it as dd mmm
    //var ret = d.toLocaleFormat('mmm'); //d.getDate() + ' ' + m[d.getMonth()];
    var ret = mmm + ' ' + d.getDate();
    log.finer('Date Not same Orig:' + sdate + ' Formated:' + ret);
    return ret;


}; // method core.date.smallDate


/**
 * Calculate the date time object
 * from a RFC822 type: Wed, 26 May 2010 23:17:17 +0000
 *
 *
 * @private
 * @return {void}
 */
core.date.prototype._getDatetimedb = function ()
{
    var c = core;
    var g = goog;
    var log = g.debug.Logger.getLogger('core.date._getDatetimedb');

    log.fine('Init');

    var sdate = this.db.sDate;

    // set parameter date
    this.db.dt = {
        year: Number(sdate.substr(11,5)), // year
        month: c.date.dbstatic.monthRev[sdate.substr(8,3)], // month
        date: sdate.substr(5,2), // date
        hours: sdate.substr(17, 2), // hours
        minutes: sdate.substr(20, 2), // minutes
        seconds: sdate.substr(23,2), // seconds
        ofst: sdate.substr(26,5), // offset
        ofstSign: sdate.substr(26,1), // offset sign (+/-)
        ofstHours: sdate.substr(27,2), // offset hours
        ofstMinutes: sdate.substr(29,2) // offset minuts
    };



    log.fine('Chopped date to values::'
        + ' year:' + this.db.dt.year
        + ' month:' + this.db.dt.month
        + ' date:' + this.db.dt.date
        + ' hours:' + this.db.dt.hours
        + ' minutes:' + this.db.dt.minutes
        + ' seconds:' + this.db.dt.seconds
        + ' offset:' + this.db.dt.ofst
        + ' offset Sign:' + this.db.dt.ofstSign
        + ' offset Hours:' + this.db.dt.ofstHours
        + ' offset Minutes:' + this.db.dt.ofstMinutes
        );


}; // method core.date._getDatetimedb

/**
 * Get current date in RFC822 format: Wed, 26 May 2010 23:17:17 +0000
 *
 * @return {string} date RFC822 type: Wed, 26 May 2010 23:17:17 +0000
 * @constructor
 */
core.date.prototype.getRFC822 = function ()
{
    var c = core;
    var g = goog;
    var log = g.debug.Logger.getLogger('core.date.getRFC822');

    // construct the string
    var ret = '';
    // get day
    ret += c.date.dbstatic.day[this.db.gdt.getDay()];
    ret += ', ';
    ret += this.db.gdt.getDate();
    ret += ' ';
    ret += c.date.dbstatic.month[this.db.gdt.getMonth()];
    ret += ' ';
    ret += this.db.gdt.getYear();
    ret += ' ';
    ret += this.db.gdt.getHours();
    ret += ':';
    ret += this.db.gdt.getMinutes();
    ret += ':';
    ret += this.db.gdt.getSeconds();
    ret += ' ';
    ret += this.db.gdt.getTimezoneOffsetString();

    return ret;

}; // method core.date.getRFC822

/**
 * Returns a full date time in the format of:
 * 5/Nov/2010 23:43
 *
 * @return {string}
 */
core.date.prototype.getFullDateTime = function ()
{
    var c = core;
    var g = goog;
    var m = c.date.dbstatic.month;
    var log = g.debug.Logger.getLogger('core.date.smallDatetime');
    var sdate = this.db.sDate;
    log.fine('Init');

    var d = this.db.gdt;

    // get current date time
    var n = this.db.gdtnow;


    // apply formatings, start with date
    var dd = g.string.buildString(d.getDate());
    if (1 == dd.length)
        dd = '0' + dd;
    // month
    var mm = g.string.buildString(d.getMonth());
    if (1 == mm.length)
        mm = '0' + mm;
    var mmm = m[d.getMonth()];
    // hours
    var hh = d.getHours();
    if (12 < hh) {
        hh = g.string.buildString(hh - 12);
        if (1 == hh.length)
            hh = '0' + hh;
        var a_p = 'PM';
    } else {
        hh = g.string.buildString(hh);
        if (1 == hh.length)
            hh = '0' + hh;
        var a_p = 'AM';
    }
    // minutes
    var MM = g.string.buildString(d.getMinutes());
    if (1 == MM.length)
        MM = '0' + MM;


    var ret = dd  + '/' + mmm + '/' + d.getYear() + ' ' + hh + ':' + MM + ' ' + a_p;
    return ret;

}; // core.date.getFullDateTime

/**
 * Copyright 2000-2011 Athanasios Polychronakis. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * 
 * @author Athanasios Polychronakis <thanpolas@gmail.com>
 * createdate 31/May/2010
 *
 *********
 *  File:: network/ajax.js
 *  Platform safe Ajax class
 *********
 */

/**
 * Provide the Ajax namespace
 *
 */
goog.provide('core.ajax');



/**
* Main Ajax Class for desktop (browser) and mobiles
*
* The 2nd param is for object's parameters:
* typeSend :: XML, Text, JSON
* typeGet :: XML, Text, JSON
* postMethod :: POST, GET
* origin :: The origin variable used for navigation submition in the spot's engine
* jqMsg :: The jQuery result of msg_ type  divs (if in web)
* bare :: If set to true we will not pass standar spot parameters like g/s/origin etc
* showMsg :: boolean, display alert message on success [default: true]
* showErrorMsg :: boolean, display alert message on error [default: true]
* oper :: {string} If this is a named operation use object from core.update.oper
* loadertype :: {core.update.LOADERTYPES=} loader type for mobiles
* noLog:: {boolean} if we want silent loging
*
* @constructor
* @param {string} url The URL we will contact for connection
* @param {Object} params the parameters for the AJAX execution
* @param {Function=} opt_callback The call back function for execution when we have a response
*/
core.ajax = function(url, params, opt_callback)
{
    var c = core;
    var db = c.ajax.dbstatic;
    var g = goog;
    var log = g.debug.Logger.getLogger('core.ajax');

    log.fine('Init');

    /**
     * Environment indicator
     *
     * Will let us know on which platform
     * we are running. Values:
     * w : Webkit, mozila, opera browser
     * t : Mobile platform, Titanium
     * ie: Internet Explorer
     *
     * @private
     * @type {string}
     */
    this.env = '';




    /**
     * The ajax object container
     *
     * @type {object|null}
     */
    this.ajax = null;

    /**
     * Instance's callback property
     *
     * @type {Function}
     */
    this.callback = opt_callback || function(){};

    /**
     * Instance's error callback property
     *
     * @type {Function}
     */
    this.errorCallback = function () {};

    /**
     * The data we will send
     */
    this.sendData = null;


    /**
     * Sending / waiting request in progress switch
     *
     * @type {boolean}
     */
    this.sending = false;

    /**
     * Will inform us if we don't need error handling
     * from this class
     *
     * @private
     * @type {boolean}
     */
    this._noErrorHandling = false;

    /**
     * If we need browser caching switch
     *
     * @private
     * @type {boolean}
     */
    this._isstatic = false;

    /**
     * This var we pass as is
     *
     * @private
     * @type string passRaw
     */
    this._passRaw = "";


    /**
     * Our instance's DB object
     *
     * @enum {mixed}
     */
    this.db = {
        url: url,
        p: eval(params),
        /**
         * The data we want to pass through XML or JSON will be stored here
         * @type {Object}
         */
        passData: {},
        /**
         * If we have any data to sent switch
         * @type {boolean}
         */
        hasData: false,
        /**
         * Server's responce to our request will
         * be stored here
         *
         * @type {object|null}
         */
        result: null,
        /**
         * The JSON data object container
         * Each request we make fills this object
         *
         * @type {object|null}
         */
         json: null,
         /**
          * For mobile when we have a file upload
          * we open this switch
          *
          * @type {boolean}
          */
         isUpload: false
    };


    //validate parameters
    if (!g.isString(this.db.p.action)) this.db.p.action = '';
    if (!g.isString(this.db.p.typeSend)) this.db.p.typeSend = 'html';
    if (!g.isString(this.db.p.typeGet)) this.db.p.typeGet = 'json';
    if (!g.isString(this.db.p.postMethod)) this.db.p.postMethod = 'GET';
    //if (!g.isNumber(this.db.p.origin)) {
    //    log.warning('Origin not a number. oper:' + this.db.p['oper']);
    //}
    if (!g.isBoolean(this.db.p.showMsg))
        this.db.p.showMsg = false;

    if (!g.isBoolean(this.db.p.showErrorMsg))
        this.db.p.showErrorMsg = true;



    /**
    * Local error object handler
    *
    * core.ajax.ERRORSTATUS = {
    *       NOAJAX: 10, // Client does not support AJAX
    *       REQFAIL: 20, // Request to Server failed, HTTP Status not 200
    *       XMLNULL: 30, // XML respose from server is null
    *       JSONPARSE: 40, // JSON string from server did not parse
    *       SERVERERROR: 50 // Server error
    *       INJECT: 60 // server requested something serious (logout, reinit for mobs)
    * }
    *
    * @private
    * @enum {number|text}
    */
    this._errorObj = { //new Error(); old way using native Error object... need more expertise to implement it
        /**
         * Erros status
         * @type {core.ajax.ERRORSTATUS}
         */
        status: 0,
        message: '',
        debugmessage: '',
        serverStatus: 0
    };


    /**
     * Now get current environment we run on
     *
     */
    if (c.MOBILE) {
        // mobile environment
        this.env = 't';
    } else {
        // we are on the web
    	// check for jQuery message element or use default
    	if (!c.isjQ(this.db.p.jqMsg))
    		this.db.p.jqMsg = jQuery("#master_alert");




        if (window.XMLHttpRequest) {
            // we have XMLHttpRequest (mozila, webkit, etc)
            this.env = 'w';
        } else if (window.ActiveXObject) {
                // internet explorer
                this.env = 'ie';
        } else {
            // bogus (!)
            log.severe('We have window set but not support XMLHttpRequest or ActiveXObject. Falling back to mobile API');
            this.env = 't';
        }
    }

    // in case of mobile, do not show success messages...
    if ('t' == this.env)
        this.db.p.showMsg = false;
    return this;

}; // core.ajax constructor


/**
 * Define our static DB
 *
 * @enumb {mixed}
 */
core.ajax.dbstatic = {
   /**
    * For web store session token and id here
    */
   session: {
       sessid: null,
       sesstoken: null,
       sessSourceId: null
   }
}; // core.ajax.dbstatic

/**
 * Define error  Statuses
 *
 * @define {object}
 * @enum {number}
 */
core.ajax.ERRORSTATUS = {
    NOAJAX: 10, // Client does not support AJAX
    REQFAIL: 20, // Request to Server failed, HTTP Status not 200
    XMLNULL: 30, // XML respose from server is null
    JSONPARSE: 40, // JSON string from server did not parse
    SERVERERROR: 50, // Server error
    INJECT: 60, // server requested something serious (logout, reinit for mobs)
    TIMEOUT: 70 // timeout (!)
}; //core.ajax.ERRORSTATUS

/**
* adds a parameter to the local data object which
* will be used when sending data
* to the server as XML or JSON
*
* @param {string} key The key of the data to be added
* @param {mixed} valuedata The value we need to store
* @param {boolean=} opt_passBare optionaly set this to true if we need to pass the value as is
* @return {void}
*/
core.ajax.prototype.addData = function (key, valuedata, opt_passBare)
{
    var g = goog;
    var geoc = core;
    // decide on env
    var m = web;

    var passBare = opt_passBare || false;

    //if nothing do nothing
    if (!g.isString(key)) return;

    // check type of key
    if (g.isObject(key)) {
        //key is an object, go through the values
        g.object.forEach(key, function(val, index){
            this.db.passData[index] = geoc.encURI(val);
        });
    } else {
        // key is string
        /**
         * Some notes... 14/10/2010
         * first, we only accept a string key (not object)
         * so above if statement is obsolete...
         *
         * next... we don't encURI at this point anymore
         * instead we endURI in this._compilePassData
         * so that we don't interfere with JSON.stringify
         */

        if (true) { //this.db.isUpload) {
            // pass values as they are
            this.db.passData[key] = valuedata;
            this.db.hasData = true;
            return;
        }
        //check if we have an array or object
        // and URI the contents, not the whole object...
        var clean = '';
        if (g.isObject(valuedata) && !passBare) {
            var clean = {};
            g.object.forEach(valuedata, function(val, index){
                clean[index] = geoc.encURI(val);
            });
        } else if (g.isArray(valuedata) && !passBare) {
            var clean = [];
            g.array.forEach(valuedata, function (val, index){
                clean[index] = geoc.encURI(val);
            });
        } else {
            if (passBare)
                clean = valuedata;
            else
                clean = geoc.encURI(valuedata);
        }

        this.db.passData[key] = clean;
    }

    // open hasData switch
    this.db.hasData = true;
}; //method core.ajax.addData


/**
* We will send data to the server and
* listen for a reply using this method
*
* @return {boolean} true / false
*/
core.ajax.prototype.send = function() {
    // decide on env, set m root
    var m = web;

    var wa = core.ajax;
    var g = goog;

    var log = core.log('core.ajax.send');
    var _this = this;


    log.fine('Init');


    if (this.updating) {
        log.warning('updating is true, exiting');
        return false;
    }
    //log.shout('this:' + g.debug.expose(this));

    //reset local variables
    this.db.result = null;

    // reset the error object
    this._errorObj.status = 0;
    this._errorObj.message = '';
    this._errorObj.debugmessage = '';
    this._errorObj.serverStatus = 0;
    this._noErrorHandling = false;


    // initialise AJAX object
    if (!this._initAjaxObject()) {
        log.severe('Could not init AJAX Class / API');
        return false; // could not init ajax class / API
    }


    // set the responce handlers
    this._setupAjaxHandlers();



    // check if this is a named operation
    if (g.isString(this.db.p.oper)) {
        // it is, release control to update class
        //log.info('calling update. params:' + g.debug.expose(this.db.p));

        return true;
    } else {
        // non named operation, execute as is...
        this._sendActual();
    }

    log.fine('Finish');
    return true;
}; // method core.ajax.send

/**
 * The actual payload of ajax send operation
 *
 * Will get executed directly by ajax.send() or through
 * the update subclass of ajax in case this is a named
 * operation
 *
 * @private
 * @return {void}
 */
core.ajax.prototype._sendActual = function ()
{
    try {


    // decide on env, set m root
    var m = web;
    var c = core;
    var wa = c.ajax;
    var g = goog;

    var log = core.log('core.ajax._sendActual');
    var _this = this;

    log.fine('Init');

    /**
     * Prepare and send the request
     *
     * All platforms have same methods
     *
     */
    this.sending = true;
    var dt = new Date();

    // prepare our data to send
    var sendData = this.sendData = this._compilePassData();

    // check for environment and initialise uri var
    if ('t' == this.env)
        var uri = m.URL; // set http://site.com
    else
        var uri = '';

    // see if we want to POST or we are in mobile mode (POST ALL)
    if (/post/i.test(this.db.p.postMethod) || c.MOBILE) {

        if (this.db.isUpload)
            var async = false;
        else
            var async = true;

        uri += this.db.url + '?' + dt.getTime();
        this.ajax.open("POST", uri, async);
        if (!this.db.isUpload)
            this.ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=UTF-8");
        this.ajax.send(sendData);
    } else {

        uri += this.db.url + '?' + sendData;
        if (!this._isstatic)
            uri +='&t=' + (dt.getTime());
        this.ajax.open("GET", uri, true);
        this.ajax.send(null);

    }


    if (this.db.p.noLog)
      log.fine('Performed Send, uri:' + uri + ' ' + sendData);
    else
      log.info('Performed Send, uri:' + uri + ' ' + sendData);
    if ('object' == g.typeOf(sendData)) {
        //log.fine('sendData was an object:' + g.debug.deepExpose(sendData));

    }

    } catch(e) {core.error(e);}

}; // method core.ajax._sendActual

/**
 * Return a URI string that carries our session
 * information. To be appended on a raw query outside
 * of this class (e.g. FB connect for mobile)
 *
 * @return {string}
 */
core.ajax.prototype.getSessionString = function ()
{
    return this._compilePassData();
}; // core.ajax.getSessionString

/**
 * The ajax callback method
 *
 * @private
 * @param {this} thisobj
 * @return {void}
 */
core.ajax.prototype._sendCallback = function (thisobj)
{
    var g = goog;
    var _this = thisobj;
    var wa = core.ajax;

    try {

    var m = web;

    var log = core.log('core.ajax._sendCallback');

    if (this.db.p.noLog)
      log.fine('Init');
    else
      log.info('Init');

    // set sending to false...
    _this.sending = false;

    // check if this is a named operation
    if (g.isString(_this.db.p.oper)) {
        //wu(false);
    }
    log.fine('update run ok');
    // based on type decide way to get data
    switch(_this.db.p.typeGet) {
        case 'xml':
            _this.db.result = _this.ajax.responseXML;
            if (g.isNull(_this.db.result)) {
                _this._errorObj.status = wa.ERRORSTATUS.XMLNULL;
                _this._errorObj.message = 'Server trouble... Please retry';
                _this._errorObj.debugmessage = 'XML response from server did not parse correctly';
                // we had errors
                _this._sendErrorCallback(_this, true);
                return;
            }
            break;
        case 'html':
            if (g.isNull(_this.db.result)) {
                _this.db.result = _this.ajax.responseText;
            }
            break;
        case 'json':
            if (g.isNull(_this.db.result)) {
                _this.db.result = _this.ajax.responseText;
            }

            // parse incoming JSON
            try {
                _this.db.json = JSON.parse(_this.db.result);
            } catch(e) {
                //error, did json string did not parse correctly
                //alert ('err');
                log.severe('AJAX DIDNT PARSE. e.expose:'  + g.debug.expose(e) + ' result:' + this.db.result);

                _this._errorObj.status = wa.ERRORSTATUS.JSONPARSE;
                _this._errorObj.message = 'Oops, an unexpected error occured... Please retry';
                _this._errorObj.debugmessage = 'JSON response from server does not parse correctly :: ' + e.name;
                // we had errors
                _this._sendErrorCallback(_this, true);
                return;
            } //catch(e)
            break;
    } // switch

    // check if we had any errors...
    if (!_this._checkError()) {
        // we had errors
        _this._sendErrorCallback(_this, true);
        return;
    }

    // we have a valid responce from the server, check for injections
    if (!_this._checkInjections()) {
        log.warning('checkInjections failed. Exiting');
        return;
    }

    log.fine('checked injections');
    // check if we have a msg tag to display
    var msg = _this.getTag('msg');
    if (g.isString(msg) && '' != msg && _this.db.p.showMsg)
        m.ui.alert(msg, 'success', _this.db.p.jqMsg);

    log.fine('Calling callback. typeof callback:' + g.typeOf(_this.callback));
    //log.info('json:' + g.debug.expose(this.db.json));
    //log.info('result:' + g.debug.expose(this.db.result));
    // call callback
    _this.callback(_this.db.json || _this.db.result);

    log.fine('callback call Finished');


    } catch(e) {core.error(e);}

}; // method core.ajax._sendCallback

/**
* Checks if we had errors in execution.
*
* @private
* @return {boolean} True if we did not have any errors, false otherwise
*/
core.ajax.prototype._checkError = function()
{

	//var log = core.log('core.ajax.prototype._checkError');

	//log.info('Init. this._errorObj.status:' + this._errorObj.status);

    if (0 < this._errorObj.status)
        return false;

    // no errors, means we got a responce
    // check for a status if json...
    if ('json' == this.db.p.typeGet ) {
        // check for server status
        var st = this.getTag('status');
        if ('' == st) st = 10;
        st = Number(st);
        //log.info('status:' + st);
        /*
        if (10 != st) {
            // we have an error from the server
            this._errorObj.status = core.ajax.ERRORSTATUS.SERVERERROR;
            this._errorObj.message = this.getTag('errorMsg');
            this._errorObj.debugmessage = this.getTag('errorEngine');
            this._errorObj.serverStatus = st;
            return false; // server returned an error
        }
        */
        // also check for new type of errors for BoothChat
        // (a string with name 'error')
        var er = this.getTag('error');
        if ('' !== er) {
            // we have an error from the server
            this._errorObj.status = core.ajax.ERRORSTATUS.SERVERERROR;
            this._errorObj.message = er;
            this._errorObj.debugmessage = er;
            this._errorObj.serverStatus = -1;
            return false; // server returned an error

        }
   } // if typeget is json

   return true;
}; //method checkError

/**
 * The ajax Error callback method
 *
 * This method may be called for a client side error
 * (e.g. AJAX not initialising, timeout, etc)
 *
 * or a server side error along with a complete
 * server error object.
 *
 * We decide what happened and act accordingly
 *
 * @private
 * @param {this} thisobj
 * @param {boolean=} opt_noupdate if true we will not call core.update(false)
 * @return {void}
 */
core.ajax.prototype._sendErrorCallback = function (thisobj, opt_noupdate)
{
    var c = core;
    var wa = c.ajax;
    var g = goog;

    try {


        var m = web;

    var log = core.log('core.ajax._sendErrorCallback');

    log.warning('Init - ERROR. status:' + thisobj._errorObj.status
    + ' serverStatus:' + thisobj._errorObj.serverStatus
    + ' message:' + thisobj._errorObj.message
    + ' debugmessage:' + thisobj._errorObj.debugmessage );


    // set sending to false...
    thisobj.sending = false;

    // check if this is a named operation
    if (g.isString(thisobj.db.p.oper) && !opt_noupdate) {

    }

    //call possible errorCallback function
    thisobj.errorCallback(thisobj._errorObj);

    // check if we don't want to handle errors
    if (thisobj._noErrorHandling) return;

    // Init our error msg var for the user
    var userErrorMsg = '';

    // check if not server error
    if (wa.ERRORSTATUS.SERVERERROR != thisobj._errorObj.status) {
        // store the default error message...
        userErrorMsg = 'Snap! Something went wrong, sorry! Please retry';
    } else {
        // user stored server message
        userErrorMsg = thisobj._errorObj.message;
    }

    // check if we are in browser mode and set our jq errorbox element
    // and display proper alert
    if (c.WEB) {
        log.info('thisobj.db.p.showErrorMsg:' + thisobj.db.p.showErrorMsg);
        if (thisobj.db.p.showErrorMsg)
            if (!c.isjQ(thisobj.db.p.jqMsg)) {
                log.warning('Message Box Element not set - handleErrors');
                thisobj.db.p.jqMsg = m.pe.msgbox.main;
                m.ui.alert(userErrorMsg, 'error', thisobj.db.p.jqMsg);
            } else {
                m.ui.alert(userErrorMsg, 'error', thisobj.db.p.jqMsg);
            }
    }
    return;


    } catch(e) {core.error(e);}

}; // method core.ajax._sendErrorCallback



/**
* Compiles the passData object to a string
* or JSON object URI compatible
* for sending to the server
*
* In case of upload (mob only) we return an object
*
* @private
* @return {string|object}
*/
core.ajax.prototype._compilePassData = function ()
{
    try {
    // decide on env, set m root
    var m = web;
    var g = goog;
    var log = core.log ('core.ajax._compilePassData');
    var geoc = core;

    log.fine('Init');

    // check for file upload, and divert execution
    if (this.db.isUpload)
        return this._compilePassDataUpload();

    var sReturn = '';

    switch(this.db.p.typeSend)
    {

        case 'json':
            // stringify and encode URI the return string
            if (this.db.hasData)
                sReturn = 'json=' + geoc.encURI(JSON.stringify(this.db.passData));
            else
                sReturn = 'json=' + geoc.encURI(JSON.stringify({dummy:true})) + '&';
            break;
        case 'xml':
            //ToDo implement XML Send
            break;
        default:
            //we will echo all the stored parameters as GET variables (!!)
            if (this.db.hasData) {
                g.object.forEach(this.db.passData, function(item, index) {
                    sReturn += '&' + index + '=' + geoc.encURI(item);  // we already are encURI'ed geoc.encURI(item);
                });
                //remove the first '&'
                sReturn = sReturn.substr(1);
            } //if we have data
            break;

    } //switch

    //add additional engine needed vars. If we are not in bare mode that is
    if (!this.db.p.bare)
    {
        if (this.db.hasData)
        {
            sReturn = sReturn + '&ajax=1'; //set that we come from ajax submition
        }
        else {
            sReturn = sReturn + 'ajax=1'; //set that we come from ajax submition
        }
        sReturn = sReturn + '&s=' + this.db.p.typeSend; //set the send type
        sReturn = sReturn + '&g=' + this.db.p.typeGet; //set the get type

        // pass session token now in case of web
        if (geoc.WEB) {
            sReturn += '&sessid=' + geoc.ajax.dbstatic.session.sessid;
            sReturn += '&sesstoken=' + geoc.ajax.dbstatic.session.sesstoken;
        }

        //check if we have origin in the params
        if (undefined != this.db.p.origin)
        {
            sReturn += "&o=" + this.db.p.origin;
        }

        if (g.isString(this.db.p.action))
        	sReturn += "&action=" + this.db.p.action;

        // check if in mobile mode and add additional needed variables
        if ('t' == this.env) {
            // shortcut assign mc.db.device
            var dbdev = m.db.device;
            // add the application version
            sReturn += '&mob=' + m.db.APPVER;
            // check if we init the session
            if (1000 != this.db.p.origin) {
                // not in init session, everything else
                // append the two needed tokens
                sReturn += '&clientid=' + m.net.db.session.clientid;
                sReturn += '&mobtoken=' + m.net.db.session.secrettoken;
            }
        }
    } //if not in bare mode

    //add the raw data
    if ('' != this._passRaw)
        sReturn += '&' + this._passRaw;



    return sReturn;
    } catch(e) {core.error(e);}
}; //method  core.ajax._compilePassData


/**
 * Initialises the ajax object (API)
 * depending on our current environment
 *
 * @private
 * @return {boolean}
 */
core.ajax.prototype._initAjaxObject = function()
{
    var g = goog;
    // decide on env, set m root
    var m = web;

    var log = core.log('core.ajax._initAjaxObject');

    // check on environment type
    switch(this.env) {
        case 't':
            // mobile Titanium
            // TBD
            break;
        case 'w':
            // webkit, mozilla, etc
            this.ajax = new window.XMLHttpRequest();
            break;
        case 'ie':
            // Internet Explorer
            this.ajax = new ActiveXObject("Microsoft.XMLHTTP");
            break;

    } // switch env type

    // check if we have an object
    if (g.isNull(this.ajax)) {
        this._errorObj.status = core.ajax.ERRORSTATUS.NOAJAX;
        this._errorObj.message = 'AJAX not supported by the client';

        return false;
    } //AJAX is not supported by the client

    return true;

}; // method core.ajax._initAjaxObject


/**
 * After a send has been executed
 * we call this method to setup
 * callback handlers for the ajax request
 * we made
 *
 * @private
 * @return {void}
 */
core.ajax.prototype._setupAjaxHandlers = function ()
{
    // decide on env, set m root
    var m = web;
    var wa = core.ajax;
    var g = goog;
    var log = core.log('core.ajax._setupAjaxHandlers');
    var _this = this;

    switch (this.env) {
        case 't':
            // Titanium API
            // TBD
            break;
        case 'w':
        case 'ie':
            // browser environment...
            this.ajax.onreadystatechange = function() {
                if (4 == _this.ajax.readyState) {
                    if (200 == _this.ajax.status) {
                        _this._sendCallback(_this);
                    } else {
                        // error
                        _this._errorObj.status = wa.ERRORSTATUS.REQFAIL;
                        _this._errorObj.message = 'Server has problems. Please retry';
                        _this._errorObj.debugmessage = 'Status not ok (200)';
                        _this._sendErrorCallback(_this);
                    }
                }
            };
            break;
    } // switch environment type

}; // method core.ajax._setupAjaxHandlers



/**
 * Will check the succesfully collected JSON object
 * for known injected values
 *
 * @private
 * @return {boolean} true if all ok, false if need to halt
 */
core.ajax.prototype._checkInjections = function()
{
    try {
    var g = goog;
    var c = core;
    var _this = this;

    // decide on env, set m root
    var m = web;

    var log = c.log('core.ajax._checkInjections');



    // check for faulty credentials
    // 14/Oct/2010 For now this has been deprecated for web... just for now (maybe)
    var faulty = this.getTag('FAULTYCREDS');
    if (faulty) {
        log.warning('Recieved FAULTYCREDS. Loging out...');
        // we have faulty credentials!
        this._errorObj.status = c.ajax.ERRORSTATUS.INJECT;
        this._errorObj.message = 'Please hang on...';
        this._errorObj.debugmessage = 'Server Injected FAULTYCREDS';
        // we had errors
        this._sendErrorCallback(this, true);

        // perform logout...
        if ('t' == this.env)
            m.user.logout();
        else
            m.user.auth.logout();

        return false;
    }

    // check for reinit:true provided by the server
    // when our session has expired or is not valid
    // will force us to reinit the network
    var reinit = this.getTag('reinit');
    if (reinit) {
        log.warning('Recieved reinit. Requesting new session...');

        /**
         * For web we have a tough cookie, user has to
         * refresh the page in order to get a new session
         * cookie. For now we will remove any session cookie
         * if it exists and prompt the user to refresh the page
         *
         */
        if (c.WEB) {
            log.severe('Server sent session reinit');
            // remove session cookie
            m.user.auth.removeCookie('geowarp_sess');

            this._errorObj.status = c.ajax.ERRORSTATUS.INJECT;
            this._errorObj.message = 'Your session has expired. Please refresh the page';
            this._errorObj.debugmessage = 'Server Injected reinit';

            this._sendErrorCallback(this, true);
        }

        /**
         * For mobiles only, we will attempt to re-init
         * our connection with the server
         * and hold the current request untill we get a reply.
         *
         * If session is restored ok we re-send our request
         */
        if (c.MOBILE) {
            m.net.initNetwork(true, g.bind(function(state){
                if (state) {
                    // ok got a new session, restart the request
                    _this._sendActual();
                } else {
                    // we had errors
                    _this._errorObj.status = core.ajax.ERRORSTATUS.INJECT;
                    _this._errorObj.message = 'Please hang on...';
                    _this._errorObj.debugmessage = 'Server Injected reinit';

                    _this._sendErrorCallback(_this, true);
                }
            }), this);
        }
        return false;
    }


    return true;

    } catch(e) {core.error(e);}
}; // method _checkInjections


/**
 * Returns the value of a given tag no matter
 * in which data type we are in
 *
 * @param {string} whichTag The tag we want to extract
 * @return {mixed} The value of the tag
 */
core.ajax.prototype.getTag = function (whichTag)
{

    switch(this.db.p.typeGet)
    {
        case 'json':
            return this._getJson(whichTag);
            break;
        case 'xml':
            return this._getXml(whichTag);
            break;

    } //switch p.typeGet
}; //method getTag

/**
 * Return the recieved data object
 *
 * @return {mixed}
 */
core.ajax.prototype.getResult = function ()
{
    return this.db.result;
};

/**
* Returns the value of a tag within an xml result
* Assumes we have a single dimention resultset
*
* @private
* @param {string} whichTag The tag we want to extract
* @return {mixed} The value of the tag
*/
core.ajax.prototype._getXml = function (whichTag)
{
    try {
        var _out = this.db.result.getElementsByTagName(whichTag)[0].childNodes[0].nodeValue;
    }
    catch(e) {
        return '';
    }
    if (undefined === _out)
    {
        return '';
    }
    else {
        return _out;
    }

}; // method core.ajax.prototype._getXml

/**
 * Returns the value of a tag within a JSON object.
 * Assumes we have a single dimention resultset
 *
 * @private
 * @param {string} whichTag The tag we want to extract
 * @return {mixed} The value of the tag
 */
 core.ajax.prototype._getJson = function (whichTag)
{

    try {
        var _out = this.db.json[whichTag];
    }
    catch(e) {
        return '';
    }

    if (undefined === _out)
    {
        return '';
    }
    else {
        return _out;
    }

}; // method core.ajax.prototype._getJson

/**
 * Will Stop handling or error messages
 * by this class
 *
 * @return {void}
 */
core.ajax.prototype.stopErrorHandler = function()
{
    this._noErrorHandling = true;
}; // method core.ajax.stopErrorHandler

/**
 * Will append whatever given to the POST string
 *
 * @parm {string} what
 * @return {void}
 */
core.ajax.prototype.addRaw = function (what)
{
    this._passRaw += what;
}; //method addRaw

/**
 * Returns the ajax readyState
 *
 * @return {Number}
 */
core.ajax.prototype.getreadyState = function ()
{
    return this.ajax.readyState;
}; // method core.ajax.getreadyState

/**
 * Returns the ajax status
 *
 * @return {Number}
 */
core.ajax.prototype.getstatus = function ()
{
    return this.ajax.status;
}; // method core.ajax.getstatus

/**
 * Closes any open requests
 *
 * @return {void}
 */
core.ajax.prototype.close = function ()
{
    this.ajax.abort();
}; // method core.ajax.close

/**
 * Get error object
 *
 * @return {void}
 */
core.ajax.prototype.getError = function ()
{
    return this._errorObj;
}; // method core.ajax.getError


/**
 * Set that we have a file upload
 *
 * @param {boolean} what
 * @return {void}
 */
core.ajax.prototype.setFileUpload = function (what)
{
    this.db.isUpload = true;

}; // method core.ajax.setFileUpload



/**
* Compiles the passData object to a string
* or JSON object URI compatible
* for sending to the server
*
* @private
* @return {string}
*/
core.ajax.prototype._compilePassDataUpload = function ()
{
    try {
    var m = web;
    var g = goog;
    var log = core.log ('core.ajax._compilePassDataUpload');
    var geoc = core;

    log.fine('Init');

    // perform a few validations of data...
    if (!geoc.MOBILE) {
        log.severe('Upload methods are only for mobile devices');
        return {};
    }

    if (!this.db.hasData) {
        log.severe('No data have been passed to ajax class using .addData()');
        return {};
    }

    // init our return object
    var oReturn = {};

    var pho = geoc.copy(this.db.passData['spot_photo']);

    // loop through all the data in our class
    g.object.forEach(this.db.passData, function(item, index) {
        oReturn[index] = item;
        //log.shout('key:' + index + ' item type:' + g.typeOf(item));
    });

    oReturn['spot_photo'] = pho;


    //log.shout('file type:' + g.typeOf(oReturn['spot_photo']));
    //log.shout('file expose:' + g.debug.expose(oReturn['spot_photo']));
    //log.shout('file deepExpose:' + g.debug.deepExpose(oReturn['spot_photo']));
    //log.shout('file size:' + oReturn['spot_photo'].length);

    //add additional engine needed vars. If we are not in bare mode that is
    if (!this.db.p.bare)
    {
        oReturn['ajax'] =1; //set that we come from ajax submition

        oReturn['s'] = 'html'; // always html for uploads this.db.p.typeSend; //set the send type
        oReturn['g'] = this.db.p.typeGet; //set the get type

        //check if we have origin in the params
        if (g.isNumber(this.db.p.origin))
            oReturn['o'] = this.db.p.origin;


        // check if in mobile mode and add additional needed variables
        if ('t' == this.env) {
            // shortcut assign mc.db.device
            var dbdev = m.db.device;
            // add the application version
            oReturn['mob'] = m.db.APPVER;
            // append the two needed tokens
            oReturn['clientid'] =  m.net.db.session.clientid;
            oReturn['mobtoken'] = m.net.db.session.secrettoken;

        }
    } //if not in bare mode

    // no raw data supported in this mode

    return oReturn;
    } catch(e) {core.error(e);}
}; //method  core.ajax._compilePassDataUpload
/**
 * Copyright 2000-2011 Athanasios Polychronakis. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * 
 * @author Athanasios Polychronakis <thanpolas@gmail.com>
 * createdate 03/Mar/2010
 *
 *********
 *  File:: system/ready.js
 *  Create ready statuses when having to wait for multiple async 
 *  operations to finish before executing next step
 *********
 */


/**
 * Init the core.ready object
 *
 */
goog.provide('core.ready');

/**
 * The ready method will either init a new ready
 * watch or exit. If we need to force initialisation
 * we need to set the second parameter to true
 *
 * @param {string} nameId Unique identifier
 * @param {boolean=} opt_forceInit If we need to force Init
 * @return void
 */
core.ready = function(nameId, opt_forceInit)
{
    var log = goog.debug.Logger.getLogger('core.ready');
    var w = core;
    var r = w.ready;

    log.info('Init - nameId:' + nameId + ' opt_forceInit:' + opt_forceInit);

    var nameId = nameId || null;



    opt_forceInit = opt_forceInit || false;

    //var newr = new r(nameId);

    var arReady = w.arFindIndex(r.db.allReady, 'nameId', nameId);
    if (0 <= arReady) {
        // already instanciated

        if (opt_forceInit) {
            // we will reset the values
            r.db.allReady[arReady].nameId = nameId;
            r.db.allReady[arReady].done = false;
            r.db.allReady[arReady].execOk = true;
            r.db.allReady[arReady].checks = [];
            r.db.allReady[arReady].fn = [];
        }

        return;
        /*
        this.checks = arReady.checks;
        this.fn = arReady.fn;
        this.done = arReady.done;
        this.boo = arReady.boo;
        return this;
        */
    }
    var readyObj = {
        nameId: nameId,
        execOk: true, // if all executed ok
        done: false,
        execOk: true,
        /**
         * checks watch array
         *
         * Each object in this array has:
         *
         * checkId: {string}
         * done: {boolean}
         *
         */
        checks: [],
        /**
         * Functions to execute when the ready watch
         * finishes.
         *
         * Each element in this array is an object with this structure:
         * {
         *    fn: {Function},
         *    delay: 0, // delay in MS, 0 for none
         * }
         */
        fn: [],
        /**
         * Check only functions
         * Each object in this array must have two keys:
         * checkId: {string}
         * fn: {Function()}
         */
        fnCheck: []
    };


    /**
     * Declare ourselves to static DB
     */

     r.db.allReady.push(readyObj);

}; // core.ready Constructor

core.ready.log = goog.debug.Logger.getLogger('core.ready');

/**
 * Static Data Container
 */
core.ready.db = {
    allReady: []
};

/**
 * Checks if a certain name exists and has finished
 * doing it's stuff...
 *
 * @param {string} nameId The id of the ready event
 * @return {boolean}
 */
core.ready.isDone = function (nameId)
{
    var w = core;
    var r = w.ready;
    var g = goog;
    var nameId = nameId || null;
    var arReady = w.arFind(r.db.allReady, 'nameId', nameId);

    var log = g.debug.Logger.getLogger('core.ready.isDone');
    log.fine('Init - nameId:' + nameId + ' arReady.done:' + arReady.done);

    if (g.isNull(arReady)) return false;

    return arReady.done;
}; // method core.ready.isDone

/**
 * Checks if a certain name and specific check exists and has finished
 * doing it's stuff...
 *
 * @param {string} nameId The id of the ready event
 * @param {string} checkId The id of the check
 * @return {boolean}
 */
core.ready.isDoneCheck = function (nameId, checkId)
{
    var w = core;
    var r = w.ready;
    var g = goog;
    var nameId = nameId || null;

    var arReady = w.arFind(r.db.allReady, 'nameId', nameId);

    var log = g.debug.Logger.getLogger('core.ready.isDoneCheck');
    log.fine('Init - nameId:' + nameId + ' arReady.done:' + arReady.done);

    if (g.isNull(arReady)) return false;

    // find the check now
    var arCheck = w.arFind(arReady.check, 'checkId', checkId);
    if (g.isNull(arCheck)) return false;

    return arCheck.done;
}; // method core.ready.isDoneCheck



/**
 * Pushes a listener function down the ready queue...
 *
 * @param {string} nameId The name ID
 * @param {function} fn callback function
 * @param {Number=} opt_delay optionaly set a delay to execute fn in ms
 * @return {void}
 */
core.ready.addFunc = function(nameId, fn, opt_delay)
{
    var c = core;
    var log = c.log('core.ready.addFunc');

    var nameId = nameId || null;

    log.fine('Init - nameId:' + nameId);

    // find index of nameId or if it exists...
    var ind = c.arFindIndex(c.ready.db.allReady, 'nameId', nameId);
    if (-1 == ind) {
        // not initialised yet, init it...
        log.info('Ready watch not initialised. Doing so now...');
        c.ready(nameId);
        var ind = c.arFindIndex(c.ready.db.allReady, 'nameId', nameId);
        if (-1 == ind) {
            // thats a big oops
            log.shout('Could not find ready index after init of key:' + nameId);
            return;
        }
    }
    log.fine('pushing to index:' + ind);
    // push the function object after we create it
    var fnObj = {
      fn: fn,
      delay: opt_delay || 0
    }
    c.ready.db.allReady[ind].fn.push(fnObj);

    // if watch is finished then we execute the function right away...
    if (c.ready.isDone(nameId))
        fn();
}; // method core.ready.addFunc


/**
 * Pushes a callback function down the ready queue...
 *
 * But listens for a specific check instread of the whole
 * process to complete
 *
 * If the main ready (nameId) is not set yet, we set it
 * same with check. So take care to not create checks
 * that will never get checked, resulting in the ready
 * watch to never fire as well
 *
 * @param {string} nameId The name ID
 * @param {string} checkId The name of the check ID
 * @param {function} fn callback function
 * @return void
 */
core.ready.addFuncCheck = function(nameId, checkId, fn)
{
    var w = core;
    var g = goog;
    var log = g.debug.Logger.getLogger('core.ready.addFuncCheck');

    var nameId = nameId || null;

    log.fine('Init - nameId:' + nameId);

    // find index of nameId or if it existw...
    var ind = w.arFindIndex(w.ready.db.allReady, 'nameId', nameId);
    if (-1 == ind) {
        // not initialised yet, init it...
        w.ready(nameId);
        var ind = w.arFindIndex(w.ready.db.allReady, 'nameId', nameId);
        if (-1 == ind) {
            // thats a big oops
            w.ready.log.shout('Could not find ready index after init of key:' + nameId);
            return;
        }
    }

    // assign the ready data object
    var r = w.ready.db.allReady[ind];

    // now see if we can find this check
    var arCheck = w.arFind(r.check, 'checkId', checkId);
    if (g.isNull(arCheck)) {
        // no, doesn't exist, create it
        r.checks.push({
            checkId: checkId,
            done: false
        });
    } // if we didn't find the check



    // push the function down the checks listeners
    r.fnCheck.push({
        checkId: checkId,
        fn: fn
    });

    // if watch is finished then we execute the function right away...
    if (w.ready.isDoneCheck(nameId, checkId))
        fn();
}; // method core.ready.addFuncCheck


/**
 * Adds a check watch to wait for checking
 * before firing the ready function
 *
 * @param {string} nameId The name ID
 * @param {string} checkId The check string id we will use as a switch
 * @return void
 */
core.ready.addCheck = function(nameId, checkId)
{
  try {
    var w = core;
    var nameId = nameId || null;
    var log = goog.debug.Logger.getLogger('core.ready.addCheck');
    log.fine('Init - nameId:' + nameId + ' checkId:' + checkId);


    // find index of nameId or if it exists...
    var ind = w.arFindIndex(w.ready.db.allReady, 'nameId', nameId);
    if (-1 == ind) {
        // create the main watch first
        w.ready(nameId);
        // now look it up again
        var ind = w.arFindIndex(w.ready.db.allReady, 'nameId', nameId);
    }

    var readyObj = w.ready.db.allReady[ind];

    // check if this checkId is already created
    var indCheck = w.arFindIndex(readyObj.checks, 'checkId', checkId);
    if (-1 == indCheck) {
        // yup, not found...
        readyObj.checks.push({
            checkId: checkId,
            done: false
        });
    }
  } catch (e) {core.error(e);}
}; // method core.ready.addCheck


/**
 * Checks a watch, if it's the last one to check
 * then we execute the ready function
 *
 * @param {string} nameId The name ID
 * @param {string} checkId The check string id we will use as a switch
 * @param {boolean=} opt_state If check method failed, set this to false
 * @return void
 */
core.ready.check = function(nameId, checkId, opt_state)
{
    try {
    var g = goog;
    var w = core;
    var nameId = nameId || null;

    var log = g.debug.Logger.getLogger('core.ready.check');
    log.info('Init - Check DONE nameId:' + nameId + ' checkId:' + checkId);

    var check_state = opt_state || true;

    // find index of nameId or if it exists...
    var ind = w.arFindIndex(w.ready.db.allReady, 'nameId', nameId);
    if (-1 == ind) {
        log.severe('Could not find ready watch with nameId:' + nameId);
        return false;
    }
    // shortcut assign the ready object
    var readyObj = w.ready.db.allReady[ind];

    // check for check's method execution state and if false assign it
    if (!check_state) readyObj.execOk = false;

    // find the check string in our array of checks...
    var indCheck = w.arFindIndex(readyObj.checks, 'checkId', checkId);

    if (-1 == indCheck) {
        log.info('Check not found in watch:' + nameId + ' check:' + checkId);
        // not found in checks, check if we have no checks left
        if (w.ready._isChecksComplete(nameId)) {
            // all is done
            readyObj.done = true; // set Ready Watch's switch
            // run all listeners
            w.ready._runAll(nameId);
        }
        return;
    }

    // mark the check as done
    readyObj.checks[indCheck].done = true;
    // execute check's listeners (if any)
    w.ready._runAllChecks(nameId, checkId);

    // check if all cheks are done
    if (w.ready._isChecksComplete(nameId)) {
        log.shout('Done watch:' + nameId);
        readyObj.done = true;
        // run all listeners
        w.ready._runAll(nameId);
    } else {
        log.info('NOT Done watch:' + nameId);
    }
    } catch(e) {core.error(e);}
}; // method core.ready.check

/**
 * This private function will check if all
 * the checks in a ready watch have completed
 *
 * @param {string} namedId the ready watch name
 * @return {boolean}
 * @private
 */
core.ready._isChecksComplete = function (nameId)
{
    try {
    var g = goog;
    var w = core;
    var log = w.log('core.ready._isChecksComplete');

    // find index of nameId or if it exists...
    var ind = w.arFindIndex(w.ready.db.allReady, 'nameId', nameId);
    if (-1 == ind) {
        log.severe('ready watch not found:' + nameId);
        return false;
    }

    // shortcut assign the ready object
    var readyObj = w.ready.db.allReady[ind];

    // check if we have no checks in this warch
    if (0 == readyObj.checks.length) {
        log.warning('No checks for this watch (length 0)');
        return false
    }

    var allChecksDone = true;
    // now go through all the checks in this ready watch
    g.array.forEach(readyObj.checks, function (checkObj, index){
        if (!checkObj.done) {
            //log.shout('Watch:' + nameId + ' check:' + checkObj.checkId + ' NOT DONE');
            allChecksDone = false
        }
    });

    //log.shout('deep.expose:' + g.debug.deepExpose(readyObj.checks));

    return allChecksDone;

    } catch(e) {core.error(e);}
}; // core.ready._isChecksComplete




/**
 * Run all listeners for a ready watch
 *
 * We will also run (first) all checks listeners
 *
 * All listeners will be deleted after run
 *
 * @param {string} namedId the ready watch name
 * @return {boolean}
 */
core.ready._runAll = function (nameId)
{
    try {
    var g = goog;
    var w = core;
    var log = w.log('core.ready._runAll');

    log.info('Executing all listeners for:' + nameId)

    // find index of nameId or if it exists...
    var ind = w.arFindIndex(w.ready.db.allReady, 'nameId', nameId);
    if (-1 == ind) {
        log.severe('ready watch was not found! name:' + nameId);
        return false;
    }

    var readyObj = w.ready.db.allReady[ind];

    log.info('Total listeners:' + readyObj.fn.length + ' Total check listeners:' + readyObj.fnCheck.length);

    // go for all checks listeners first
    g.array.forEach(readyObj.fnCheck, function (fnObj, index){
      try {
        if (!g.isFunction(fnObj.fn)) {
          log.warning('Listener not a function:' + g.debug.expose(fnObj) + ' index:' + index);
        } else {
          fnObj.fn(readyObj.execOk);
        }
      } catch(e) {core.error(e);}
    });
    // empty the array
    readyObj.fnCheck = new Array();

    // now go for all main ready watch listeners
    g.array.forEach(readyObj.fn, function(fnObj, index) {
      try {
        log.shout('Executing watch ' + nameId + ' fn No:' + index + ' delay:' + fnObj.delay);
        var fn = fnObj.fn;
        if (!g.isFunction(fn)) {
          log.warning('We found a non function to execute for:' + nameId + ' fn:' + fn + ' index:' + index);
          return;
        }
        // exec callback method with state of execution after set delay...
        if (0 == fnObj.delay)
          fn(readyObj.execOk);
        else
          setTimeout(fn, fnObj.delay);
      } catch(e) {core.error(e);}
    });
    // reset function container array of watch...
    readyObj.fn = new Array();
    } catch(e) {core.error(e);}
}; // core.ready._runAll


/**
 * Run all listeners for a specific check
 *
 *
 * All listeners will be deleted after run
 *
 * @param {string} namedId the ready watch name
 * @param {string} checkId The check we want to execute the listeners of
 * @return {void}
 */
core.ready._runAllChecks = function (nameId, checkId)
{
    try {
    var g = goog;
    var w = core;

    // find index of nameId or if it exists...
    var ind = w.arFindIndex(w.ready.db.allReady, 'nameId', nameId);
    if (-1 == ind) {
        return;
    }

    var readyObj = w.ready.db.allReady[ind];


    // init array for all check's listeners' ID
    var removeFuncs = new Array();
    // go for all checks' listeners
    g.array.forEach(readyObj.fnCheck, function (fnObj, index){
        if (fnObj.checkId == checkId) {
            // execute the listener
            fnObj.fn(readyObj.execOk);
            // push the executed listener index
            removeFuncs.push(index);
        }
    });
    // remove all listeners we executed
    g.array.forEachRight(removeFuncs, function (fnIndex, index){
        g.array.removeAt(readyObj.fnCheck, fnIndex);
    });

    // all done


    } catch(e) {core.error(e);}
}; // core.ready._runAllChecks

/**
 * Copyright 2000-2011 Athanasios Polychronakis. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * 
 * @license Apache License, Version 2.0
 * @author Athanasios Polychronakis <thanpolas@gmail.com>
 * createdate 03/Mar/2010
 * @package core JS framework
 *
 *********
 *  File:: main.js
 *  @fileoverview Core main bundler
 *********
 * 
 */

/**
 * Init the geowarp object
 *
 * @public
 */
goog.provide('core');

goog.provide('core.DEBUG');
goog.provide('core.READY'); //DOM ready switch


goog.require('goog.debug');
goog.require('goog.debug.LogManager');
goog.require('goog.debug.Logger');

goog.require('core.analytics');
goog.require('core.date');
goog.require('core.error');

goog.require('core.ajax');
goog.require('core.ready');
goog.require('core.events');
goog.require('core.user');
goog.require('core.conf');
goog.require('core.valid');
goog.require('core.web2');
goog.require('core.STATIC');


/**
 * Debuging option, set to false for production
 * @define {boolean}
 */
core.DEBUG = true;

/**
 * ONSERVER switch.
 * @define {boolean}
 */
core.ONSERVER = false;

/**
 * Pre - production switch
 * @define {boolean}
 */
core.PREPROD = false;

/**
 * Mobile application mode
 *
 * @define {boolean}
 */
core.MOBILE = false;

/**
 * WEB app mode
 *
 * @define {boolean}
 */
core.WEB = false;

/**
 * If we have tracking (on web production)
 *
 *
 */

if (core.ONSERVER)
  core.WEBTRACK = true;
else
  core.WEBTRACK = false;




/**
 * Shortcut assign google's getLogger method to ours
 *
 */
core.log = goog.debug.Logger.getLogger;


core.MOBILE = false;
core.WEB = true;


/**
 * Switch to true when DOM fires the ready() event
 * @define {boolean}
 */
core.READY = false;

/**
 * Global db (hash of values)
 *
 */
core.db = {};

/**
 * The geowarp Init function should be called whenever
 * our environment is loaded and ready.
 *
 *
 * @return {void}
 */
core.Init = function ()
{
    var c = core;

    c.ready('main');
    c.ready.addCheck('main', 'loaded');
    
    // the ready trigger for every other functionality beyond the framework
    c.ready('ready');
    // for now this watch is finished at the end of taglander parse...    
    c.ready.addCheck('ready', 'alldone');

    c.READY = true;
    c.ready.check('main', 'loaded');

}; // function core.Init

/**
 * Wrapper for goog.array.find
 * Will search each element of an array and
 * match the object key 'key' with 'value'
 * On Match we will return the element content
 *
 * e.g. var ind = core.arFind(ar, 'userId', userIdvar);
 *
 * @param {array} ar The array
 * @param {string} key The object key we will query
 * @param {mixed} value The value we are looking for
 * @return {array|null} The first array element that passes the test, or null if no element is found.
 */
core.arFind = function (ar, key, value)
{
    var g = goog;

    // check if we have an array
    if (!g.isArray(ar)) {
        // not an array, force it into one
        ar = g.object.getValues(ar);
    }
    return g.array.find(ar, function(el, i, ar){
        if (el[key] == value) return true;
        return false;
    });
}; // method arFind

/**
 * Wrapper for goog.array.findIndex
 * Will search each element of an array and
 * match the object key 'key' with 'value'
 * On Match we will return the element index
 *
 * e.g. var ind = core.arFindIndex(ar, 'userId', userIdvar);
 *
 * @param {array} ar The array
 * @param {string} key The object key we will query
 * @param {mixed} value The value we are looking for
 * @return {number} -1 for fail. The index of the first array element that passes the test, or -1 if no element is found.
 */
core.arFindIndex = function (ar, key, value)
{
    if (!goog.isArray(ar)) return -1;
    return goog.array.findIndex(ar, function(el, i, ar){
        if (el[key] == value) return true;
        return false;
    });
}; // method arFindIndex



/**
 * Wrapper for goog.array.removeIf
 * Will search each element of an array
 * and if it finds a match for the object key
 * we provided it, it then removes this element
 * from the array
 *
 * @param {array} ar The array
 * @param {string} key The object key we will query
 * @param {mixed} value The value we are looking for
 * @return boolean  True if an element was removed.
 */
core.arRemove = function (ar, key, value)
{
    if (!goog.isArray(ar)) return false;
    return goog.array.removeIf(ar, function(el, i, ar){
        if (el[key] == value) return true;
        return false;
    });
}; // method core.arRemove

/**
 * Checks if a specific itam (value) exists in an array
 *
 * if it does, we return the index, else we return -1
 *
 * We only search in first level
 *
 * @param {array} ar The array we want to search inside
 * @param {*} value The value we are looking for
 * @return {number} -1 if not found or index
 */
core.arInArrayIndex = function (ar, value)
{
    var ret = -1;
    goog.array.forEach(ar, function (val, index){
        if (val == value)
            ret = index;
    });
    // not found
    return ret;

}; // core.arInArrayIndex


/**
 * Determines if the given object is a valid
 * jQuery array
 *
 * @param {mixed} ar The object we want to examine
 * @return boolean
 */
core.isjQ = function (ar)
{
  try {
    // for some reason a selection of a jQuery object now returns object (!)
    // check on that when have time (ahahaha)
    if (!goog.isArray(ar) && !goog.isObject(ar)) return false;

    if (goog.isString(ar.jquery)) return true;

    return false;
  } catch(e) {
    core.error(e);
    return false;
  }
}; // method core.isjQ

/**
 * Will count an objects element
 *
 * @param {Object} obj any object
 * @return {int}
 */
core.objCount = function (obj)
{
    var count = 0;
    goog.object.forEach(obj, function(){count++;});
    return count;

}; // method core.object

/**
 * Will reset all root elements of the passed
 * object. We check for the type of each element and
 * reset it properly as per type.
 *
 * If obj is an array, we examine the array elements
 * for reset (1 level up)
 *
 * @param {object|array} obj Object we want to reset
 * @return {object|array|null} Whatever is passed - reset - or null if not object/array
 */
core.resetAny = function (obj)
{
    var g = goog;

    // check if array
    if (g.isArray(obj)) {
        g.array.forEach(obj, function(el, index) {
            // we only examine objects
            if (g.isObject(el)) {
                obj[index] = _reset(el);
            }
        });
        return obj;
    }

    // check if object
    if (g.isObject(obj)) {
        obj = _reset(obj);
        return obj;
    }

    // default
    return null;

    /**
     * The actual payload of the reset method
     *
     * We do the type checks, reset the object
     * and return it
     *
     * @param {Object} actualObj This needs to be an object
     * @return {Object} The object reset
     */
    function _reset(actualObj) {

        g.object.forEach(actualObj, function(el, i){
            switch(goog.typeOf(el)) {
                case 'array': actualObj[i] = []; break;
                case 'string': actualObj[i] = ''; break;
                case 'boolean': actualObj[i] = false; break;
                case 'function': actualObj[i] = function(){}; break;
                case 'number': actualObj[i] = 0;
                case 'null': actualObj[i] = null;
                default: actualObj[i] = null; break;

           }
        });
        return actualObj;
    }


}; // method core.ui.ctrl.db_con

/**
 * Will calculate w,h dimentions based on
 * resizeTarget. We need an object in the form of:
 * obj_dims = {w:200, h:200)
 *
 * @param {number} resizeTarget The resize target
 * @param {Object} obj_dims object containing w and h keys with number values
 * @return {Object} containing w, h keys and anything else that wass passed
 */
core.resizePixels = function (resizeTarget, obj_dims)
{
    if (obj_dims.w > obj_dims.h)
        var imax = obj_dims.w;
    else
        var imax = obj_dims.h;

    if (0 === obj_dims.w) {
        obj_dims.w = resizeTarget;
    } else {
        obj_dims.w = obj_dims.w / (imax / resizeTarget);
        obj_dims.h = obj_dims.h / (imax / resizeTarget);
    }

    return obj_dims;
};


/**
 * Will make all root elements of a given object
 * have value null
 *
 * @return {void}
 */
core.nullify = function (obj)
{

    goog.object.forEach(obj, function(item, index){
        obj[index] = null;
    });
}; // method nullify

/**
 * Decode a URI string
 *
 * @param {string}
 * @return {string}
 */
core.decURI = function(str){
    var g = goog;
    var log = goog.debug.Logger.getLogger('core.decURI');

    if (g.isNull(str)) return '';

    try {
        var ret = decodeURIComponent(str);
    }
    catch(e){
        log.severe('decodeURIComponent failed for string:' + str + ' message:' + e.message);
        return str;
    }
    return ret;
};

/**
 * Encode a URI string
 *
 * @param {string}
 * @return {string}
 */
core.encURI = function(str){

    var g = goog;
    var log = goog.debug.Logger.getLogger('core.encURI');

    if (g.isNull(str)) return '';

    try {
        var ret = encodeURIComponent(str);
    }
    catch(e){
        log.severe('encodeURIComponent failed for string:' + str + ' message:' + e.message);
        return str;
    }
    return ret;

};

/**
 * Decode html Entities
 *
 * @param {string}
 * @return {string}
 */
core.decEnt = function(str) {
    var g = goog;
    var log = goog.debug.Logger.getLogger('core.decEnt');

    if (g.isNull(str)) {
        return '';
    }

    try {
        var ret = g.string.unescapeEntities(str);
    }
    catch(e){
        log.severe('goog.string.unescapeEntities failed for string:' + str + ' message:' + e.message);
        return str;
    }
    return ret;

};

/**
 * Encode html Entities
 *
 * @param {string}
 * @return {string}
 */
core.encEnt = function(str) {
    var g = goog;
    var log = g.debug.Logger.getLogger('core.encEnt');

    if (g.isNull(str)) return '';

    try {
        var ret = g.string.htmlEscape(str);
    }
    catch(e){
        log.severe('goog.string.htmlEscape failed for string:' + str + ' message:' + e.message);
        return str;
    }
    return ret;

};


/**
 * Will return the current domain name of the site
 * e.g. core.local, core.com ...
 *
 * @return {string}
 */
core.getDomain = function()
{
    var d = document;
    var g = d.goog;
    var uri = new g.Uri(d.location.href);
    return uri.getDomain();
}; // method core.getDomain


/**
 * Read a page's GET URL variables and return them as an associative array.
 * From: http://snipplr.com/view/799/get-url-variables/
 *
 * @return {array}
 */
core.getUrlVars = function()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');

    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        //hash = {hash[0]:hash[1]};
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }

    return vars;
}; // method core.getUrlVars

/**
 * Checks if an object is empty
 * From: http://code.google.com/p/jslibs/wiki/JavascriptTips
 *
 * @param {obj}
 * @return {boolean}
 */
core.isNotEmpty = function (obj) {
    for (var i in obj)
        return true;

    return false;
};

/**
 * Return true/false if user is authenticated
 * @return {boolean}
 */
core.isAuthed = function () {
    //return true;
    return core.user.auth.isAuthed();
};



/**
 * Return a copy of the value provided
 *
 * @param {mixed} val
 * @return {mixed} whatever is passed for copy
 */
core.copy = function (val){return val;};



/**
 * Checks if a value (needle) is within the provided other parameters
 *
 * e.g. if (core.inValue('a', 'b', 'c', 'z')) is false...
 *
 * @param {mixed} needle Value we want to look for
 * @param {...*=} opt_var_args Additional arguments that are used to compare
 *      our needle value against
 * @return {boolean}
 */
core.inValue = function (needle, opt_var_args)
{

    var len = arguments.length;
    var haystack = [];

    for (var start = 1; start < len ; start++)
        haystack.push(arguments[start]);

    if (-1 === haystack.indexOf(needle))
        return false;

    return true;

}; // function core.inValue


/**
 * Poor implementation of PHP explode
 * we split a given string by the seperator
 *
 * we return an array with the values
 *
 * if no seperator is found within the string we return
 * an array with a single value
 *
 * @param {string} seperator The seperator
 * @param {string} stringValue The string we want to split
 * @return {Array}
 */
core.explode = function ( seperator, stringValue)
{
    return stringValue.split(seperator);
}; // function core.explode

/**
 * Will mix (fuse) two objects.
 *
 * Put target object on first parameter
 *
 * @param {object} objTarget The target object we want to mix to
 * @param {object} objData The new object we want to mix
 * @return {void}
 */
core.objMix = function (objTarget, objData)
{
    var g = goog;

    if (!g.isObject(objTarget) || !g.isObject(objData))
        return;

    g.object.forEach(objData, function(obj, index){
        if (!g.isDef(objTarget[index]))
            objTarget[index] = obj;
    });

};

/**
 * An alternative non-regexp idiom for simple global string replace is:
 *
 * snippet from: http://stackoverflow.com/questions/252924/javascript-how-to-replace-a-sub-string
 *
 * @param {string} haystack
 * @param {string} find
 * @param {string} sub
 * @return {string}
 */
core.string_replace = function(haystack, find, sub) {
  try {
    return haystack.split(find).join(sub);
  } catch(e) {core.error(e); return haystack;}
};
/**
 * Copyright 2000-2011 Athanasios Polychronakis. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * 
 * @author Athanasios Polychronakis <thanpolas@gmail.com>
 *
 *
 *
 *********
 * createdate 25/May/2011
 *
 */



goog.provide('web.user.login');

/**
 * Logs out a user
 *
 * @param {object} event jQuery event object
 * @return {void}
 */
web.user.login.logout = function (event)
{
  try {
    event.preventDefault();
        
    var w = web,  c = core, j = jQuery;

    var log = c.log('web.user.login.logout');

    log.info('Init. Authed:' + c.isAuthed());

    if (!c.isAuthed())
      return;
    
    var elId = j(this).attr('id');
    // trigger the logout click event
    w.user.auth.events.runEvent('logout_click', elId);

    // perform logout
    c.user.login.logout(function(status, opt_errmsg){
      // no matter the status, we will logout the user...
      log.info('logout callback received. status:' + status + ' opt_errmsg:' + opt_errmsg);
    });


  } catch (e) {
    core.error(e);
  }

}; // web.user.login.logout



/**
 * Will bind to click event for Twitter and Facebook connect
 * buttons
 *
 * @return {void}
 */
web.user.login.bindLogin = function()
{
  try {

  var w = web, c = core, j = $, win = window;

  var log = c.log('web.user.login.bindLogin');

  // bind click events on FB / TWITTER LOGIN BUTTONS
  j(".-login-tw").click(function(event){
    try {
        event.preventDefault();
        var elId = j(this).attr('id');
        log.info('Twitter login clicked:' + elId);

        c.twit.loginOpen();

        w.user.auth.events.runEvent('tw_click', elId);

      } catch (e) {
        core.error(e);
      }

  });

  j(".-login-fb").click(function(event){
    try {
        event.preventDefault();
        // get id of element that triggered the event
        var elId = j(this).attr('id');
        var jel = j(this);
        log.info('Facebook login clicked:' + elId);

        if (!c.throttle('fb_login_click', 3000, true)) {
          log.info('Execution canceled by throttler');
          return;
        }

        // check if facebook ready
        if (!c.fb.haveAuthStatus()) {
          if (w.db.fbClicked) {
            return;
          }
          log.info('Facebook library not ready yet, created a listener and we now wait...');
          w.db.fbClicked = true;
          // listen for FB auth event...
          c.ready.addFunc('fb-auth', function(){
            w.db.fbClicked = false;
            if (!c.isAuthed()) {
              // call ourselves
              jel.click();
            }
          });

          // facebook not ready yet
          return;
        }


        // launch facebook login dialog
        c.fb.loginOpen(function(state){
          log.info('Login return state:' + state);
          w.user.auth.events.runEvent('fb_click_reply', state);
        });

        // trigger the facebook click event now
        w.user.auth.events.runEvent('fb_click', elId);

      } catch (e) {
        core.error(e);
      }

  });

  } catch (e) {
    core.error(e);
  }


};/**
 * Copyright 2000-2011 Athanasios Polychronakis. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * 
 * @author Athanasios Polychronakis <thanpolas@gmail.com>
 *
 *
 *
 *********
 * createdate 09/Mar/2012
 *
 */
 
goog.provide('web.myapp');
goog.provide('web.myapp.initialise');
goog.require('core');
goog.require('web.user.login');
 

/**
 * Start when our framework is ready
 * and perform initialising operations
 * (page bindings, etc etc)
 *
 * @return {void}
 */
web.myapp.initialise = function()
{
  try {

    var w = web, c = core;

    var log = c.log('web.myapp.initialise');  
    
    log.info('Hello World!');
    

    

    
  } catch (e) {
    core.error(e);
  }  
};

// bind to the framework's ready event
core.ready.addFunc('ready', web.myapp.initialise);



/**
 * Triggers when we have a new user.
 *
 * This is currently called from TagLanderParse...
 *
 * but in the future should include functionality from
 * inline authentication flows (FB) when new user
 *
 * @return {void}
 */
web.myapp.newUser = function()
{
  try {
    var w = web,  c = core;

    var log = c.log('web.myapp.newUser');

    log.info('Init');
    
    //TODO refactor it...
    return;

    // check if new user is from Twitter
    if (c.user.auth.hasExtSource(c.STATIC.SOURCES.TWIT)) {
      // now check that we don't have an e-mail
      var u = c.user.getUserDataObject();
      log.info('Newuser is from twitter. email:' + u.email);
      if ('' == u.email) {
        // show getemail modal
        w.user.ui.openGetEmailModal();
      }
    }
    
    
    // do a pageview after 2"
    setTimeout(function(){
      c.analytics.trackPageview('/mtr/users/new');
    }, 2000);
    // track on MixPanel
    c.analytics.trackMP('newUser', {source:'TW'});    
    
    
  } catch (e) {
    core.error(e);
  }

}; // web.user.ui.newUser

/**
 * Triggers when the master auth event hook changes state
 *
 * @param {boolean} state If we are authed or not
 * @param {core.STATIC.SOURCES=} if authed, which auth source was used
 * @param {object=} opt_userDataObject if authed, the user data object is passed here
 * @return {void}
 */
web.myapp.authState = function(state, opt_sourceId, opt_userDataObject)
{
  try {

    var w = web, c = core, j = jQuery, g = goog;

    var log = c.log('web.myapp.authState');  
    
    log.info('Auth event is ready. State:' + state);
    
    if (state) {
      // user is authed, get his data object...
      var u = opt_userDataObject;
      // now update our page...
      j('#auth_state h3').text('User Authed');
      j('#auth_state_content h4').text('The user data object');
      j('#user_data_object').text(g.debug.deepExpose(u));
      // make #login invisible
      j('#login').dispOff();
      j('#logged_in').dispOn();
    } else {
      j('#auth_state h3').text('Not Authed');
      j('#auth_state_content h4').text('');
      j('#user_data_object').text('');
      j('#login').dispOn();
      j('#logged_in').dispOff();  
    }
    
  } catch (e) {
    core.error(e);
  }  
};

// subscribe to the auth state master event hook
core.user.auth.events.addEventListener('authState', web.myapp.authState);

// listen for newuser event
core.user.auth.events.addEventListener('newUser', web.myapp.newUser);


/*

w.user.auth.events.runEvent('tw_click', elId);

switch (elId) {
  case 'login_twitter':
    c.analytics.trackEvent('Auth', 'twitterLoginClick');
  break;
  case 'main_history_login_twitter':
    c.analytics.trackEvent('Auth', 'twitterLoginClickkHistory');
  break;
  case 'login_twitter_front':
    c.analytics.trackEvent('Auth', 'twitterLoginClickFrontpage');
  break;
}


switch (elId) {
  case 'login_facebook':
    c.analytics.trackEvent('Auth', 'facebookLoginClick');
  break;
  case 'main_history_login_facebook':
    c.analytics.trackEvent('Auth', 'facebookLoginClickHistory');
  break;
  case 'login_facebook_front':
    c.analytics.trackEvent('Auth', 'facebookLoginClickFrontpage');
  break;
}


*//**
 * Copyright 2000-2011 Athanasios Polychronakis. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * 
 * @author Athanasios Polychronakis <thanpolas@gmail.com>
 *
 *
 *
 *********
 * created on Jun 18, 2011
 * ui.user.js Users UI functions
 *
 */


goog.provide('web.user.ui');



web.user.ui.db = {
  menuOpen: false,
  profileTextCounter: null,
  msgCls: null,
  getMailInit: false,
  getMailOpen: false
};

/**
 * Triggers when DOM is ready, we do some binds
 *
 * @return {void}
 */
web.user.ui.Init = function ()
{
  try {
    var w = web, j = $, c = core;

    var log = c.log('web.user.ui.Init');

    log.info('Init - Binding on login / logout elements');

    // listen for new notifications event
    // not implemented yet...
    //c.user.notify.hookNew(w.user.ui.setNotify);

    // catch all logout buttons / links
    j('.-logout').click(w.user.login.logout);
    
    // bind login buttons for FB/TW
    w.user.login.bindLogin();    


  } catch (e) {
    core.error(e);
  }

}; // web.user.ui.Init
// listen for ready event
core.ready.addFunc('main', web.user.ui.Init);



/**
 * Will open the get-email modal and ask user to enter e-mail
 *
 * @param {boolean=}  opt_isOldUser set to true if user is not new
 * @return {void}
 */
web.user.ui.openGetEmailModal = function (opt_isOldUser)
{
  try {
    var w = web, j = $, c = core;

    var log = c.log('web.user.ui.getEmailModal');

    log.info('Init. Modal Open:' + w.user.ui.db.getMailOpen);

    // check if already open
    if (w.user.ui.db.getMailOpen)
      return;
    w.user.ui.db.getMailOpen = true;

    var jOver = j('#getmail');
    jOver.dispOn();

    // get user data, chop nick to 9 chars so it fits ok
    var u = c.user.getUserDataObject();
    j('#getmail_title_nick').text(u.nickname.substr(0,9));

    // now check if not new user
    if (opt_isOldUser) {
      // change welcome to 'hey'
      j('#getmail_title_prefix').text('Hey');
      j('#getmail_content').text("We don't seem to have your e-mail, please type it here");
    }


    // check if we have already binded to events
    if (w.user.ui.db.getMailInit)
      return;

    w.user.ui.db.getMailInit = true;

    // bind events
    j('#getmail_form').submit(w.user.ui.getEmailSubmit);
    j('#getmail_submit').click(w.user.ui.getEmailSubmit);

  } catch (e) {
    core.error(e);
  }
}; // web.user.ui.getEmailModal

/**
 * Handles submition of the get Email modal form
 *
 * @param {type} e description
 * @return {void}
 */
web.user.ui.getEmailSubmit = function (e)
{
  try {
    var w = web, j = $, c = core;

    var log = c.log('web.user.ui.getEmailSubmit');

    log.info('Init');

    // show the loader
    j('#getmail_submit').css('visibility', 'hidden');
    j('#getmail_loader').css('display', 'inline');

    // we'll cheat and use the submit account
    // methods....
    // collect the data...
    var u = c.user.getUserDataObject();
    var datafields = {
      nickname: u.nickname,
      email: j('#getmail_textfield').val()
    };

    c.user.profile.submitAccount(datafields, function(status, opt_errmsg){
      try {
        log.info('Submit Callback. status:' + status + ' opt_errmsg:' + opt_errmsg);
        j('#getmail_submit').css('visibility', 'visible');
        j('#getmail_loader').dispOff();

        if (status) {
          // profile submitted successfuly
          w.ui.alert('Thank you', 'success');
          w.user.ui.db.getMailOpen = false;
          j('#getmail').dispOff();

          // create GA event ???
          //c.analytics.trackEvent('UserMenu', 'account_saved');


        } else {
          // error in submition
          w.ui.alert(opt_errmsg, 'error');
        }


      } catch (e) {
        core.error(e);
      }

    });

    return false;

  } catch (e) {
    core.error(e);
    j('#getmail_submit').css('visibility', 'visible');
    j('#getmail_loader').dispOff();
    return false;
  }

}; // web.user.ui.getEmailSubmit
/**
 * Copyright 2000-2011 Athanasios Polychronakis. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * 
 * @author Athanasios Polychronakis <thanpolas@gmail.com>
 *
 *                                                                                                                              
 *                                                                                           
 *********                                                                                   
 * createdate 25/May/2011
 * 
 */

goog.provide('web.user.auth');
goog.require('core.events');

// create the master auth events instance 
web.user.auth.events = new core.events.listeners();

/**
 * The following events exist and can be listened to with:
 * web.user.auth.events.addEventListener(eventName, [...])
 *
 * tw_click(elId) :: Click on a Twitter login button. elId is the ID of the html element
 *            that was clicked
 * fb_click(elId) :: Click on a Facebook login button. elId is the ID of the html element
 *            that was clicked
 * fb_click_reply(state) :: Facebook auth flow ended. state is boolean for auth state
 * logout_click(elId) :: Logout link clicked. elId is the ID of the html element that was clicked
 * 
 *//**
 * Copyright 2000-2011 Athanasios Polychronakis. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * 
 * @author Athanasios Polychronakis <thanpolas@gmail.com>
 *
 *
*
*
*********
* createdate 25/May/2011
*
*/

goog.provide('web.user');
goog.require('web.user.auth');
goog.require('web.user.login');
goog.require('web.user.ui');
/**
 * Copyright 2000-2011 Athanasios Polychronakis. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * 
 * @author Athanasios Polychronakis <thanpolas@gmail.com>
 *********                                                                                
 * createdate 14/Dec/2009
 * jQuery Extensions 
 */

goog.provide('web.jq.ext');


/**
 *
 *  // usage:
 * $(window).smartresize(function(){
 *   // code that takes it easy...
 * });
 *
 * Code from http://paulirish.com/2009/throttled-smartresize-jquery-event-handler/
 */
(function($,sr){

  // debouncing function from John Hann
  // http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
  var debounce = function (func, threshold, execAsap) {
      var timeout;

      return function debounced () {
          var obj = this, args = arguments;
          function delayed () {
              if (!execAsap)
                  func.apply(obj, args);
              timeout = null;
          };

          if (timeout)
              clearTimeout(timeout);
          else if (execAsap)
              func.apply(obj, args);

          timeout = setTimeout(delayed, threshold || 100);
      };
  }
    // smartresize
    jQuery.fn[sr] = function(fn){  return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr); };

})(jQuery,'smartresize');




/**
 * .dispOn() :: == .css("display", "block")
 *
 * @return {void}
 */
web.jq.ext.dispOn = function()
{
    var j = $;
    return this.each(function()
    {
        j(this).css("display", "block");
        // set state of element
        j(this).data('closed', false);

    });
}; // method web.jq.ext.dispOn

/**
 * .dispOff() :: == .css("display", "none")
 *
 * @return {void}
 */
web.jq.ext.dispOff = function()
{
    var j  = $;
    return this.each(function()
    {
        j(this).css("display", "none");
        // set state of element
        j(this).data('closed', true);
    });
}; // method web.jq.ext.dispOff

/**
 * .on() :: returns boolean if display == block
 *
 * @return {boolean}
 */
web.jq.ext.on = function()
{
    return ('none' == this.css('display') ? false : true);
}; // method web.jq.ext.on

/**
 * .off() ::  returns boolean if display == none
 *
 * @return {boolean}
 */
web.jq.ext.off = function()
{
    return ('none' == this.css('display')? true : false);
}; // method web.jq.ext.off

/**
 * .del(callback) :: Performs a custom remove(), optionaly we can set a callback
 * Will remove an element with our remove effect.
 * [To be desided whitch, for now pulsate]
 *
 * @param {function} callback
 * @return void
 */
web.jq.ext.del = function(callback)
{

    $(this).effect('pulsate', {}, 250, function() {
        //$(this).slide(false, function() {
            $(this).remove();
            if (undefined != callback)
                callback();
        //});

    });
    return $(this);
}; // method web.jq.ext.

/**
 * .slide(refreshHeight) :: Performs a slideUp/Down depending on status.
 *
 * core code from: http://jqueryfordesigners.com/slidedown-animation-jump-revisited/
 *
 * @param {boolean|function=} opt_refreshHeight is optional, if set to true we will force refresh the truHeight
 * @param {function=} opt_callback Call Back function, assign as first parameter as well
 * @return {void}
 */
web.jq.ext.slide = function(opt_refreshHeight, opt_callback)
{
    var g = goog;
    var log = g.debug.Logger.getLogger('web.jq.ext.slide');
    var j = $;

    log.fine('Init for:' + this.selector + ' closed:' + j(this).data('closed') + ' callId:' + j(this).data('callId'));

    //set the duration of the effect
    var time = 200;


    var refreshHeight = false;
    if (g.isBoolean(opt_refreshHeight))
        refreshHeight = opt_refreshHeight;

    // set callback
    var callback = opt_callback || function(){};
    if (g.isFunction(opt_refreshHeight))
        callback = opt_refreshHeight;
    // store callback into DOM element
    // in efect overwriting any previous
    // callbacks for this element
    j(this).data('callback', callback);


    // check if we have a call ID
    var callId = j(this).data('callId');
    if (!g.isNumber(callId)) {
        // first time
        callId = 1;
    } else {
        // been here before, add up the ID
        callId += 1;
    }
    // store back the new callId
    j(this).data('callId', callId);

    // validate closed element var
    if (!g.isBoolean(j(this).data('closed')))
        j(this).data('closed', j(this).off());

    log.fine('callId of element:' + callId);

    // check if animation is already running
    if (j(this).data('animation')) {
        log.fine('animation is on exiting');
        return;
    }

    if (!j(this).data('closed'))
    {
        log.fine('element was on. Closing...');
        // we have to close the control
        //store height again
        j(this).data('truHeight', j(this).height());

        // mark animation start
        j(this).data('animation', true);

        log.finer('performing animation to height 0. time:' + time);

        // perform animation
        j(this).animate({height:0}, time, 'linear', function() {
            // when animation finishes...
            log.fine('animation Finished. callId of element:' + callId + ' jQ callId:' + j(this).data('callId'));
            j(this).dispOff();
            j(this).data('callback')(this); // callback(this);
            // mark animation stop
            j(this).data('animation', false);
        });
    }
    else {
        log.fine('element was off. Opening...');
        // Need to open the control

        //get truHeight var from object
        var truHeight = j(this).data('truHeight');
        log.finer('Height Before Calculations -> truHeight:' + truHeight);
        if (undefined == truHeight || refreshHeight)
        {
            j(this).dispOn();

            truHeight = j(this).height();
            j(this).dispOff();
            j(this).data('truHeight', truHeight);
        } //if truHeight is undefined
        log.finer('Height After Calculations -> truHeight:' + truHeight);
        j(this).css({ height : 0 });

        // mark animation start
        j(this).data('animation', true);
        log.finer('performing animation to height:' + truHeight + ' time:' + time);
        j(this).animate({ height : truHeight }, time, 'linear', function() {
            log.fine('animation finished: callId of element:' + callId + ' jQ callId:' + j(this).data('callId'));
            j(this).dispOn();
            j(this).data('callback')(this);
            // mark animation stop
            j(this).data('animation', false);

        });

    } // else we need to close it
}; // method web.jq.ext.slide

(function($){
/**
 * Use our methods to extend jQuery
 */
    var j = web.jq.ext;
    $.fn.extend(
    {
        //msgBox: j.msgbox,
        dispOn: j.dispOn,
        dispOff: j.dispOff,
        on: j.on,
        off: j.off,
        del: j.del,
        slide: j.slide
    });
})(jQuery);

/**
 * Copyright 2000-2011 Athanasios Polychronakis. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * 
 * @author Athanasios Polychronakis <thanpolas@gmail.com>
 *
 *
 *
 *********
 * created on Aug 23, 2011
 * cookies.js Cookies management and operations
 *
 */


goog.provide('web.cookies');

// Don't utilize goog's cookie class, we only want to test if cookies
// are enabled.
//goog.require('goog.net.Cookies');
//web.cookies.gcls = new goog.net.Cookies(document);

/**
 * Determine if the browser is cookie enabled
 *
 * Code snippet from:
 * http://www.javascriptkit.com/javatutors/cookiedetect.shtml
 * @return {boolean}
 */
web.cookies.isEnabled = function ()
{
  try {
    var cookieEnabled = (navigator.cookieEnabled) ? true : false

    //if not IE4+ nor NS6+
    if (typeof navigator.cookieEnabled == "undefined" && !cookieEnabled ){ 
      document.cookie="testcookie"
      cookieEnabled = (document.cookie.indexOf("testcookie") != -1)? true : false;
    }
    return cookieEnabled;
  } catch (e) {
    core.error(e);
  }

};
// Copyright 2007 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Definition the goog.debug.RelativeTimeProvider class.
 *
 */

goog.provide('goog.debug.RelativeTimeProvider');



/**
 * A simple object to keep track of a timestamp considered the start of
 * something. The main use is for the logger system to maintain a start time
 * that is occasionally reset. For example, in Gmail, we reset this relative
 * time at the start of a user action so that timings are offset from the
 * beginning of the action. This class also provides a singleton as the default
 * behavior for most use cases is to share the same start time.
 *
 * @constructor
 */
goog.debug.RelativeTimeProvider = function() {
  /**
   * The start time.
   * @type {number}
   * @private
   */
  this.relativeTimeStart_ = goog.now();
};


/**
 * Default instance.
 * @type {goog.debug.RelativeTimeProvider}
 * @private
 */
goog.debug.RelativeTimeProvider.defaultInstance_ =
    new goog.debug.RelativeTimeProvider();


/**
 * Sets the start time to the specified time.
 * @param {number} timeStamp The start time.
 */
goog.debug.RelativeTimeProvider.prototype.set = function(timeStamp) {
  this.relativeTimeStart_ = timeStamp;
};


/**
 * Resets the start time to now.
 */
goog.debug.RelativeTimeProvider.prototype.reset = function() {
  this.set(goog.now());
};


/**
 * @return {number} The start time.
 */
goog.debug.RelativeTimeProvider.prototype.get = function() {
  return this.relativeTimeStart_;
};


/**
 * @return {goog.debug.RelativeTimeProvider} The default instance.
 */
goog.debug.RelativeTimeProvider.getDefaultInstance = function() {
  return goog.debug.RelativeTimeProvider.defaultInstance_;
};
// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Definition of various formatters for logging. Please minimize
 * dependencies this file has on other closure classes as any dependency it
 * takes won't be able to use the logging infrastructure.
 *
 */

goog.provide('goog.debug.Formatter');
goog.provide('goog.debug.HtmlFormatter');
goog.provide('goog.debug.TextFormatter');

goog.require('goog.debug.RelativeTimeProvider');
goog.require('goog.string');



/**
 * Base class for Formatters. A Formatter is used to format a LogRecord into
 * something that can be displayed to the user.
 *
 * @param {string=} opt_prefix The prefix to place before text records.
 * @constructor
 */
goog.debug.Formatter = function(opt_prefix) {
  this.prefix_ = opt_prefix || '';

  /**
   * A provider that returns the relative start time.
   * @type {goog.debug.RelativeTimeProvider}
   * @private
   */
  this.startTimeProvider_ =
      goog.debug.RelativeTimeProvider.getDefaultInstance();
};


/**
 * Whether to show absolute time in the DebugWindow
 * @type {boolean}
 */
goog.debug.Formatter.prototype.showAbsoluteTime = true;


/**
 * Whether to show relative time in the DebugWindow
 * @type {boolean}
 */
goog.debug.Formatter.prototype.showRelativeTime = true;


/**
 * Whether to show the logger name in the DebugWindow
 * @type {boolean}
 */
goog.debug.Formatter.prototype.showLoggerName = true;


/**
 * Whether to show the logger exception text
 * @type {boolean}
 */
goog.debug.Formatter.prototype.showExceptionText = false;


/**
 * Whether to show the severity level
 * @type {boolean}
 */
goog.debug.Formatter.prototype.showSeverityLevel = false;


/**
 * Formats a record
 * @param {goog.debug.LogRecord} logRecord the logRecord to format.
 * @return {string} The formatted string.
 */
goog.debug.Formatter.prototype.formatRecord = goog.abstractMethod;


/**
 * Sets the start time provider. By default, this is the default instance
 * but can be changed.
 * @param {goog.debug.RelativeTimeProvider} provider The provider to use.
 */
goog.debug.Formatter.prototype.setStartTimeProvider = function(provider) {
  this.startTimeProvider_ = provider;
};


/**
 * Returns the start time provider. By default, this is the default instance
 * but can be changed.
 * @return {goog.debug.RelativeTimeProvider} The start time provider.
 */
goog.debug.Formatter.prototype.getStartTimeProvider = function() {
  return this.startTimeProvider_;
};


/**
 * Resets the start relative time.
 */
goog.debug.Formatter.prototype.resetRelativeTimeStart = function() {
  this.startTimeProvider_.reset();
};


/**
 * Returns a string for the time/date of the LogRecord.
 * @param {goog.debug.LogRecord} logRecord The record to get a time stamp for.
 * @return {string} A string representation of the time/date of the LogRecord.
 * @private
 */
goog.debug.Formatter.getDateTimeStamp_ = function(logRecord) {
  var time = new Date(logRecord.getMillis());
  return goog.debug.Formatter.getTwoDigitString_((time.getFullYear() - 2000)) +
         goog.debug.Formatter.getTwoDigitString_((time.getMonth() + 1)) +
         goog.debug.Formatter.getTwoDigitString_(time.getDate()) + ' ' +
         goog.debug.Formatter.getTwoDigitString_(time.getHours()) + ':' +
         goog.debug.Formatter.getTwoDigitString_(time.getMinutes()) + ':' +
         goog.debug.Formatter.getTwoDigitString_(time.getSeconds()) + '.' +
         goog.debug.Formatter.getTwoDigitString_(
             Math.floor(time.getMilliseconds() / 10));
};


/**
 * Returns the number as a two-digit string, meaning it prepends a 0 if the
 * number if less than 10.
 * @param {number} n The number to format.
 * @return {string} A two-digit string representation of {@code n}.
 * @private
 */
goog.debug.Formatter.getTwoDigitString_ = function(n) {
  if (n < 10) {
    return '0' + n;
  }
  return String(n);
};


/**
 * Returns a string for the number of seconds relative to the start time.
 * Prepads with spaces so that anything less than 1000 seconds takes up the
 * same number of characters for better formatting.
 * @param {goog.debug.LogRecord} logRecord The log to compare time to.
 * @param {number} relativeTimeStart The start time to compare to.
 * @return {string} The number of seconds of the LogRecord relative to the
 *     start time.
 * @private
 */
goog.debug.Formatter.getRelativeTime_ = function(logRecord,
                                                 relativeTimeStart) {
  var ms = logRecord.getMillis() - relativeTimeStart;
  var sec = ms / 1000;
  var str = sec.toFixed(3);

  var spacesToPrepend = 0;
  if (sec < 1) {
    spacesToPrepend = 2;
  } else {
    while (sec < 100) {
      spacesToPrepend++;
      sec *= 10;
    }
  }
  while (spacesToPrepend-- > 0) {
    str = ' ' + str;
  }
  return str;
};



/**
 * Formatter that returns formatted html. See formatRecord for the classes
 * it uses for various types of formatted output.
 *
 * @param {string=} opt_prefix The prefix to place before text records.
 * @constructor
 * @extends {goog.debug.Formatter}
 */
goog.debug.HtmlFormatter = function(opt_prefix) {
  goog.debug.Formatter.call(this, opt_prefix);
};
goog.inherits(goog.debug.HtmlFormatter, goog.debug.Formatter);


/**
 * Whether to show the logger exception text
 * @type {boolean}
 */
goog.debug.HtmlFormatter.prototype.showExceptionText = true;


/**
 * Formats a record
 * @param {goog.debug.LogRecord} logRecord the logRecord to format.
 * @return {string} The formatted string as html.
 */
goog.debug.HtmlFormatter.prototype.formatRecord = function(logRecord) {
  var className;
  switch (logRecord.getLevel().value) {
    case goog.debug.Logger.Level.SHOUT.value:
      className = 'dbg-sh';
      break;
    case goog.debug.Logger.Level.SEVERE.value:
      className = 'dbg-sev';
      break;
    case goog.debug.Logger.Level.WARNING.value:
      className = 'dbg-w';
      break;
    case goog.debug.Logger.Level.INFO.value:
      className = 'dbg-i';
      break;
    case goog.debug.Logger.Level.FINE.value:
    default:
      className = 'dbg-f';
      break;
  }

  // Build message html
  var sb = [];
  sb.push(this.prefix_, ' ');
  if (this.showAbsoluteTime) {
    sb.push('[', goog.debug.Formatter.getDateTimeStamp_(logRecord), '] ');
  }
  if (this.showRelativeTime) {
    sb.push('[',
        goog.string.whitespaceEscape(
            goog.debug.Formatter.getRelativeTime_(logRecord,
                this.startTimeProvider_.get())),
        's] ');
  }

  if (this.showLoggerName) {
    sb.push('[', goog.string.htmlEscape(logRecord.getLoggerName()), '] ');
  }
  sb.push('<span class="', className, '">',
      goog.string.newLineToBr(goog.string.whitespaceEscape(
          goog.string.htmlEscape(logRecord.getMessage()))));

  if (this.showExceptionText && logRecord.getException()) {
    sb.push('<br>',
        goog.string.newLineToBr(goog.string.whitespaceEscape(
            logRecord.getExceptionText() || '')));
  }
  sb.push('</span><br>');

  // If the logger is enabled, open window and write html message to log
  // otherwise save it
  return sb.join('');
};



/**
 * Formatter that returns formatted plain text
 *
 * @param {string=} opt_prefix The prefix to place before text records.
 * @constructor
 * @extends {goog.debug.Formatter}
 */
goog.debug.TextFormatter = function(opt_prefix) {
  goog.debug.Formatter.call(this, opt_prefix);
};
goog.inherits(goog.debug.TextFormatter, goog.debug.Formatter);


/**
 * Formats a record as text
 * @param {goog.debug.LogRecord} logRecord the logRecord to format.
 * @return {string} The formatted string.
 */
goog.debug.TextFormatter.prototype.formatRecord = function(logRecord) {
  // Build message html
  var sb = [];
  sb.push(this.prefix_, ' ');
  if (this.showAbsoluteTime) {
    sb.push('[', goog.debug.Formatter.getDateTimeStamp_(logRecord), '] ');
  }
  if (this.showRelativeTime) {
    sb.push('[', goog.debug.Formatter.getRelativeTime_(logRecord,
        this.startTimeProvider_.get()), 's] ');
  }

  if (this.showLoggerName) {
    sb.push('[', logRecord.getLoggerName(), '] ');
  }
  if (this.showSeverityLevel) {
    sb.push('[', logRecord.getLevel().name, '] ');
  }
  sb.push(logRecord.getMessage(), '\n');
  if (this.showExceptionText && logRecord.getException()) {
    sb.push(logRecord.getExceptionText(), '\n');
  }
  // If the logger is enabled, open window and write html message to log
  // otherwise save it
  return sb.join('');
};
// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


/**
 * @fileoverview Datastructure: Circular Buffer.
 *
 * Implements a buffer with a maximum size. New entries override the oldest
 * entries when the maximum size has been reached.
 *
 */


goog.provide('goog.structs.CircularBuffer');



/**
 * Class for CircularBuffer.
 * @param {number=} opt_maxSize The maximum size of the buffer.
 * @constructor
 */
goog.structs.CircularBuffer = function(opt_maxSize) {
  /**
   * Maximum size of the the circular array structure.
   * @type {number}
   * @private
   */
  this.maxSize_ = opt_maxSize || 100;

  /**
   * Underlying array for the CircularBuffer.
   * @type {Array}
   * @private
   */
  this.buff_ = [];
};


/**
 * Index of the next element in the circular array structure.
 * @type {number}
 * @private
 */
goog.structs.CircularBuffer.prototype.nextPtr_ = 0;


/**
 * Adds an item to the buffer. May remove the oldest item if the buffer is at
 * max size.
 * @param {*} item The item to add.
 */
goog.structs.CircularBuffer.prototype.add = function(item) {
  this.buff_[this.nextPtr_] = item;
  this.nextPtr_ = (this.nextPtr_ + 1) % this.maxSize_;
};


/**
 * Returns the item at the specified index.
 * @param {number} index The index of the item. The index of an item can change
 *     after calls to {@code add()} if the buffer is at maximum size.
 * @return {*} The item at the specified index.
 */
goog.structs.CircularBuffer.prototype.get = function(index) {
  index = this.normalizeIndex_(index);
  return this.buff_[index];
};


/**
 * Sets the item at the specified index.
 * @param {number} index The index of the item. The index of an item can change
 *     after calls to {@code add()} if the buffer is at maximum size.
 * @param {*} item The item to add.
 */
goog.structs.CircularBuffer.prototype.set = function(index, item) {
  index = this.normalizeIndex_(index);
  this.buff_[index] = item;
};


/**
 * Returns the current number of items in the buffer.
 * @return {number} The current number of items in the buffer.
 */
goog.structs.CircularBuffer.prototype.getCount = function() {
  return this.buff_.length;
};


/**
 * @return {boolean} Whether the buffer is empty.
 */
goog.structs.CircularBuffer.prototype.isEmpty = function() {
  return this.buff_.length == 0;
};


/**
 * Empties the current buffer.
 */
goog.structs.CircularBuffer.prototype.clear = function() {
  this.buff_.length = 0;
  this.nextPtr_ = 0;
};


/**
 * @return {Array} The values in the buffer.
 */
goog.structs.CircularBuffer.prototype.getValues = function() {
  // getNewestValues returns all the values if the maxCount parameter is the
  // count
  return this.getNewestValues(this.getCount());
};


/**
 * Returns the newest values in the buffer up to {@code count}.
 * @param {number} maxCount The maximum number of values to get. Should be a
 *     positive number.
 * @return {Array} The newest values in the buffer up to {@code count}.
 */
goog.structs.CircularBuffer.prototype.getNewestValues = function(maxCount) {
  var l = this.getCount();
  var start = this.getCount() - maxCount;
  var rv = [];
  for (var i = start; i < l; i++) {
    rv[i] = this.get(i);
  }
  return rv;
};


/**
 * @return {Array} The indexes in the buffer.
 */
goog.structs.CircularBuffer.prototype.getKeys = function() {
  var rv = [];
  var l = this.getCount();
  for (var i = 0; i < l; i++) {
    rv[i] = i;
  }
  return rv;
};


/**
 * Whether the buffer contains the key/index.
 * @param {number} key The key/index to check for.
 * @return {boolean} Whether the buffer contains the key/index.
 */
goog.structs.CircularBuffer.prototype.containsKey = function(key) {
  return key < this.getCount();
};


/**
 * Whether the buffer contains the given value.
 * @param {*} value The value to check for.
 * @return {boolean} Whether the buffer contains the given value.
 */
goog.structs.CircularBuffer.prototype.containsValue = function(value) {
  var l = this.getCount();
  for (var i = 0; i < l; i++) {
    if (this.get(i) == value) {
      return true;
    }
  }
  return false;
};


/**
 * Returns the last item inserted into the buffer.
 * @return {*} The last item inserted into the buffer, or null if the buffer is
 *     empty.
 */
goog.structs.CircularBuffer.prototype.getLast = function() {
  if (this.getCount() == 0) {
    return null;
  }
  return this.get(this.getCount() - 1);
};


/**
 * Helper function to convert an index in the number space of oldest to
 * newest items in the array to the position that the element will be at in the
 * underlying array.
 * @param {number} index The index of the item in a list ordered from oldest to
 *     newest.
 * @return {number} The index of the item in the CircularBuffer's underlying
 *     array.
 * @private
 */
goog.structs.CircularBuffer.prototype.normalizeIndex_ = function(index) {
  if (index >= this.buff_.length) {
    throw Error('Out of bounds exception');
  }

  if (this.buff_.length < this.maxSize_) {
    return index;
  }

  return (this.nextPtr_ + Number(index)) % this.maxSize_;
};
// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Definition of the DebugWindow class. Please minimize
 * dependencies this file has on other closure classes as any dependency it
 * takes won't be able to use the logging infrastructure.
 *
 */

goog.provide('goog.debug.DebugWindow');

goog.require('goog.debug.HtmlFormatter');
goog.require('goog.debug.LogManager');
goog.require('goog.structs.CircularBuffer');
goog.require('goog.userAgent');



/**
 * Provides a debug DebugWindow that is bound to the goog.debug.Logger.
 * It handles log messages and writes them to the DebugWindow. This doesn't
 * provide a lot of functionality that the old Gmail logging infrastructure
 * provided like saving debug logs for exporting to the server. Now that we
 * have an event-based logging infrastructure, we can encapsulate that
 * functionality in a separate class.
 *
 * @constructor
 * @param {string=} opt_identifier Identifier for this logging class.
 * @param {string=} opt_prefix Prefix prepended to messages.
 */
goog.debug.DebugWindow = function(opt_identifier, opt_prefix) {
  /**
   * Identifier for this logging class
   * @type {string}
   * @protected
   * @suppress {underscore}
   */
  this.identifier_ = opt_identifier || '';

  /**
   * Optional prefix to be prepended to error strings
   * @type {string}
   * @private
   */
  this.prefix_ = opt_prefix || '';

  /**
   * Array used to buffer log output
   * @type {Array}
   * @protected
   * @suppress {underscore}
   */
  this.outputBuffer_ = [];

  /**
   * Buffer for saving the last 1000 messages
   * @type {goog.structs.CircularBuffer}
   * @private
   */
  this.savedMessages_ =
      new goog.structs.CircularBuffer(goog.debug.DebugWindow.MAX_SAVED);

  /**
   * Save the publish handler so it can be removed
   * @type {Function}
   * @private
   */
  this.publishHandler_ = goog.bind(this.addLogRecord, this);

  /**
   * Formatter for formatted output
   * @type {goog.debug.Formatter}
   * @private
   */
  this.formatter_ = new goog.debug.HtmlFormatter(this.prefix_);

  /**
   * Loggers that we shouldn't output
   * @type {Object}
   * @private
   */
  this.filteredLoggers_ = {};

  // enable by default
  this.setCapturing(true);

  /**
   * Whether we are currently enabled. When the DebugWindow is enabled, it tries
   * to keep its window open. When it's disabled, it can still be capturing log
   * output if, but it won't try to write them to the DebugWindow window until
   * it's enabled.
   * @type {boolean}
   * @private
   */
  this.enabled_ = goog.debug.DebugWindow.isEnabled(this.identifier_);

  // timer to save the DebugWindow's window position in a cookie
  goog.global.setInterval(goog.bind(this.saveWindowPositionSize_, this), 7500);
};


/**
 * Max number of messages to be saved
 * @type {number}
 */
goog.debug.DebugWindow.MAX_SAVED = 500;


/**
 * How long to keep the cookies for in milliseconds
 * @type {number}
 */
goog.debug.DebugWindow.COOKIE_TIME = 30 * 24 * 60 * 60 * 1000; // 30-days


/**
 * HTML string printed when the debug window opens
 * @type {string}
 * @protected
 */
goog.debug.DebugWindow.prototype.welcomeMessage = 'LOGGING';


/**
 * Whether to force enable the window on a severe log.
 * @type {boolean}
 * @private
 */
goog.debug.DebugWindow.prototype.enableOnSevere_ = false;


/**
 * Reference to debug window
 * @type {Window}
 * @protected
 * @suppress {underscore}
 */
goog.debug.DebugWindow.prototype.win_ = null;


/**
 * In the process of opening the window
 * @type {boolean}
 * @private
 */
goog.debug.DebugWindow.prototype.winOpening_ = false;


/**
 * Whether we are currently capturing logger output.
 *
 * @type {boolean}
 * @private
 */
goog.debug.DebugWindow.prototype.isCapturing_ = false;


/**
 * Whether we already showed an alert that the DebugWindow was blocked.
 * @type {boolean}
 * @private
 */
goog.debug.DebugWindow.showedBlockedAlert_ = false;


/**
 * Reference to timeout used to buffer the output stream.
 * @type {?number}
 * @private
 */
goog.debug.DebugWindow.prototype.bufferTimeout_ = null;


/**
 * Timestamp for the last time the log was written to.
 * @type {number}
 * @protected
 * @suppress {underscore}
 */
goog.debug.DebugWindow.prototype.lastCall_ = goog.now();


/**
 * Sets the welcome message shown when the window is first opened or reset.
 *
 * @param {string} msg An HTML string.
 */
goog.debug.DebugWindow.prototype.setWelcomeMessage = function(msg) {
  this.welcomeMessage = msg;
};


/**
 * Initializes the debug window.
 */
goog.debug.DebugWindow.prototype.init = function() {
  if (this.enabled_) {
    this.openWindow_();
  }
};


/**
 * Whether the DebugWindow is enabled. When the DebugWindow is enabled, it
 * tries to keep its window open and logs all messages to the window.  When the
 * DebugWindow is disabled, it stops logging messages to its window.
 *
 * @return {boolean} Whether the DebugWindow is enabled.
 */
goog.debug.DebugWindow.prototype.isEnabled = function() {
  return this.enabled_;
};


/**
 * Sets whether the DebugWindow is enabled. When the DebugWindow is enabled, it
 * tries to keep its window open and log all messages to the window. When the
 * DebugWindow is disabled, it stops logging messages to its window. The
 * DebugWindow also saves this state to a cookie so that it's persisted across
 * application refreshes.
 * @param {boolean} enable Whether the DebugWindow is enabled.
 */
goog.debug.DebugWindow.prototype.setEnabled = function(enable) {
  this.enabled_ = enable;

  if (this.enabled_) {
    this.openWindow_();
  }

  this.setCookie_('enabled', enable ? '1' : '0');
};


/**
 * Sets whether the debug window should be force enabled when a severe log is
 * encountered.
 * @param {boolean} enableOnSevere Whether to enable on severe logs..
 */
goog.debug.DebugWindow.prototype.setForceEnableOnSevere =
    function(enableOnSevere) {
  this.enableOnSevere_ = enableOnSevere;
};


/**
 * Whether we are currently capturing logger output.
 * @return {boolean} whether we are currently capturing logger output.
 */
goog.debug.DebugWindow.prototype.isCapturing = function() {
  return this.isCapturing_;
};


/**
 * Sets whether we are currently capturing logger output.
 * @param {boolean} capturing Whether to capture logger output.
 */
goog.debug.DebugWindow.prototype.setCapturing = function(capturing) {
  if (capturing == this.isCapturing_) {
    return;
  }
  this.isCapturing_ = capturing;

  // attach or detach handler from the root logger
  var rootLogger = goog.debug.LogManager.getRoot();
  if (capturing) {
    rootLogger.addHandler(this.publishHandler_);
  } else {
    rootLogger.removeHandler(this.publishHandler_);
  }
};


/**
 * Gets the formatter for outputting to the debug window. The default formatter
 * is an instance of goog.debug.HtmlFormatter
 * @return {goog.debug.Formatter} The formatter in use.
 */
goog.debug.DebugWindow.prototype.getFormatter = function() {
  return this.formatter_;
};


/**
 * Sets the formatter for outputting to the debug window.
 * @param {goog.debug.Formatter} formatter The formatter to use.
 */
goog.debug.DebugWindow.prototype.setFormatter = function(formatter) {
  this.formatter_ = formatter;
};


/**
 * Adds a separator to the debug window.
 */
goog.debug.DebugWindow.prototype.addSeparator = function() {
  this.write_('<hr>');
};


/**
 * @return {boolean} Whether there is an active window.
 */
goog.debug.DebugWindow.prototype.hasActiveWindow = function() {
  return !!this.win_ && !this.win_.closed;
};


/**
 * Clears the contents of the debug window
 * @protected
 * @suppress {underscore}
 */
goog.debug.DebugWindow.prototype.clear_ = function() {
  this.savedMessages_.clear();
  if (this.hasActiveWindow()) {
    this.writeInitialDocument_();
  }
};


/**
 * Adds a log record.
 * @param {goog.debug.LogRecord} logRecord the LogRecord.
 */
goog.debug.DebugWindow.prototype.addLogRecord = function(logRecord) {
  if (this.filteredLoggers_[logRecord.getLoggerName()]) {
    return;
  }
  var html = this.formatter_.formatRecord(logRecord);
  this.write_(html);
  if (this.enableOnSevere_ &&
      logRecord.getLevel().value >= goog.debug.Logger.Level.SEVERE.value) {
    this.setEnabled(true);
  }
};


/**
 * Writes a message to the log, possibly opening up the window if it's enabled,
 * or saving it if it's disabled.
 * @param {string} html The HTML to write.
 * @private
 */
goog.debug.DebugWindow.prototype.write_ = function(html) {
  // If the logger is enabled, open window and write html message to log
  // otherwise save it
  if (this.enabled_) {
    this.openWindow_();
    this.savedMessages_.add(html);
    this.writeToLog_(html);
  } else {
    this.savedMessages_.add(html);
  }
};


/**
 * Write to the buffer.  If a message hasn't been sent for more than 750ms just
 * write, otherwise delay for a minimum of 250ms.
 * @param {string} html HTML to post to the log.
 * @private
 */
goog.debug.DebugWindow.prototype.writeToLog_ = function(html) {
  this.outputBuffer_.push(html);
  goog.global.clearTimeout(this.bufferTimeout_);

  if (goog.now() - this.lastCall_ > 750) {
    this.writeBufferToLog_();
  } else {
    this.bufferTimeout_ =
        goog.global.setTimeout(goog.bind(this.writeBufferToLog_, this), 250);
  }
};


/**
 * Write to the log and maybe scroll into view
 * @protected
 * @suppress {underscore}
 */
goog.debug.DebugWindow.prototype.writeBufferToLog_ = function() {
  this.lastCall_ = goog.now();
  if (this.hasActiveWindow()) {
    var body = this.win_.document.body;
    var scroll = body &&
        body.scrollHeight - (body.scrollTop + body.clientHeight) <= 100;

    this.win_.document.write(this.outputBuffer_.join(''));
    this.outputBuffer_.length = 0;

    if (scroll) {
      this.win_.scrollTo(0, 1000000);
    }
  }
};


/**
 * Writes all saved messages to the DebugWindow.
 * @protected
 * @suppress {underscore}
 */
goog.debug.DebugWindow.prototype.writeSavedMessages_ = function() {
  var messages = this.savedMessages_.getValues();
  for (var i = 0; i < messages.length; i++) {
    this.writeToLog_(messages[i]);
  }
};


/**
 * Opens the debug window if it is not already referenced
 * @private
 */
goog.debug.DebugWindow.prototype.openWindow_ = function() {
  if (this.hasActiveWindow() || this.winOpening_) {
    return;
  }

  var winpos = this.getCookie_('dbg', '0,0,800,500').split(',');
  var x = Number(winpos[0]);
  var y = Number(winpos[1]);
  var w = Number(winpos[2]);
  var h = Number(winpos[3]);

  this.winOpening_ = true;
  this.win_ = window.open('', this.getWindowName_(), 'width=' + w +
                          ',height=' + h + ',toolbar=no,resizable=yes,' +
                          'scrollbars=yes,left=' + x + ',top=' + y +
                          ',status=no,screenx=' + x + ',screeny=' + y);

  if (!this.win_) {
    if (!this.showedBlockedAlert_) {
      // only show this once
      alert('Logger popup was blocked');
      this.showedBlockedAlert_ = true;
    }
  }

  this.winOpening_ = false;

  if (this.win_) {
    this.writeInitialDocument_();
  }
};


/**
 * Gets a valid window name for the debug window. Replaces invalid characters in
 * IE.
 * @return {string} Valid window name.
 * @private
 */
goog.debug.DebugWindow.prototype.getWindowName_ = function() {
  return goog.userAgent.IE ?
      this.identifier_.replace(/[\s\-\.\,]/g, '_') : this.identifier_;
};


/**
 * @return {string} The style rule text, for inclusion in the initial HTML.
 */
goog.debug.DebugWindow.prototype.getStyleRules = function() {
  return '*{font:normal 14px monospace;}' +
         '.dbg-sev{color:#F00}' +
         '.dbg-w{color:#E92}' +
         '.dbg-sh{background-color:#fd4;font-weight:bold;color:#000}' +
         '.dbg-i{color:#666}' +
         '.dbg-f{color:#999}' +
         '.dbg-ev{color:#0A0}' +
         '.dbg-m{color:#990}';
};


/**
 * Writes the initial HTML of the debug window
 * @protected
 * @suppress {underscore}
 */
goog.debug.DebugWindow.prototype.writeInitialDocument_ = function() {
  if (this.hasActiveWindow()) {
    return;
  }

  this.win_.document.open();

  var html = '<style>' + this.getStyleRules() + '</style>' +
             '<hr><div class="dbg-ev" style="text-align:center">' +
             this.welcomeMessage + '<br><small>Logger: ' +
             this.identifier_ + '</small></div><hr>';

  this.writeToLog_(html);
  this.writeSavedMessages_();
};


/**
 * Save persistent data (using cookies) for 1 month (cookie specific to this
 * logger object)
 * @param {string} key Data name.
 * @param {string} value Data value.
 * @private
 */
goog.debug.DebugWindow.prototype.setCookie_ = function(key, value) {
  key += this.identifier_;
  document.cookie = key + '=' + encodeURIComponent(value) +
      ';path=/;expires=' +
      (new Date(goog.now() + goog.debug.DebugWindow.COOKIE_TIME)).toUTCString();
};


/**
 * Retrieve data (using cookies).
 * @param {string} key Data name.
 * @param {string=} opt_default Optional default value if cookie doesn't exist.
 * @return {string} Cookie value.
 * @private
 */
goog.debug.DebugWindow.prototype.getCookie_ = function(key, opt_default) {
  return goog.debug.DebugWindow.getCookieValue_(
      this.identifier_, key, opt_default);
};


/**
 * Retrieve data (using cookies).
 * @param {string} identifier Identifier for logging class.
 * @param {string} key Data name.
 * @param {string=} opt_default Optional default value if cookie doesn't exist.
 * @return {string} Cookie value.
 * @private
 */
goog.debug.DebugWindow.getCookieValue_ = function(
    identifier, key, opt_default) {
  var fullKey = key + identifier;
  var cookie = String(document.cookie);
  var start = cookie.indexOf(fullKey + '=');
  if (start != -1) {
    var end = cookie.indexOf(';', start);
    return decodeURIComponent(cookie.substring(start + fullKey.length + 1,
        end == -1 ? cookie.length : end));
  } else {
    return opt_default || '';
  }
};


/**
 * @param {string} identifier Identifier for logging class.
 * @return {boolean} Whether the DebugWindow is enabled.
 */
goog.debug.DebugWindow.isEnabled = function(identifier) {
  return goog.debug.DebugWindow.getCookieValue_(identifier, 'enabled') == '1';
};


/**
 * Saves the window position size to a cookie
 * @private
 */
goog.debug.DebugWindow.prototype.saveWindowPositionSize_ = function() {
  if (!this.hasActiveWindow()) {
    return;
  }
  var x = this.win_.screenX || this.win_.screenLeft || 0;
  var y = this.win_.screenY || this.win_.screenTop || 0;
  var w = this.win_.outerWidth || 800;
  var h = this.win_.outerHeight || 500;
  this.setCookie_('dbg', x + ',' + y + ',' + w + ',' + h);
};


/**
 * Adds a logger name to be filtered.
 * @param {string} loggerName the logger name to add.
 */
goog.debug.DebugWindow.prototype.addFilter = function(loggerName) {
  this.filteredLoggers_[loggerName] = 1;
};


/**
 * Removes a logger name to be filtered.
 * @param {string} loggerName the logger name to remove.
 */
goog.debug.DebugWindow.prototype.removeFilter = function(loggerName) {
  delete this.filteredLoggers_[loggerName];
};


/**
 * Modify the size of the circular buffer. Allows the log to retain more
 * information while the window is closed.
 * @param {number} size New size of the circular buffer.
 */
goog.debug.DebugWindow.prototype.resetBufferWithNewSize = function(size) {
  if (size > 0 && size < 50000) {
    this.clear_();
    this.savedMessages_ = new goog.structs.CircularBuffer(size);
  }
};
// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utilities for adding, removing and setting classes.
 *
 */


goog.provide('goog.dom.classes');

goog.require('goog.array');


/**
 * Sets the entire class name of an element.
 * @param {Node} element DOM node to set class of.
 * @param {string} className Class name(s) to apply to element.
 */
goog.dom.classes.set = function(element, className) {
  element.className = className;
};


/**
 * Gets an array of class names on an element
 * @param {Node} element DOM node to get class of.
 * @return {!Array} Class names on {@code element}. Some browsers add extra
 *     properties to the array. Do not depend on any of these!
 */
goog.dom.classes.get = function(element) {
  var className = element.className;
  // Some types of elements don't have a className in IE (e.g. iframes).
  // Furthermore, in Firefox, className is not a string when the element is
  // an SVG element.
  return goog.isString(className) && className.match(/\S+/g) || [];
};


/**
 * Adds a class or classes to an element. Does not add multiples of class names.
 * @param {Node} element DOM node to add class to.
 * @param {...string} var_args Class names to add.
 * @return {boolean} Whether class was added (or all classes were added).
 */
goog.dom.classes.add = function(element, var_args) {
  var classes = goog.dom.classes.get(element);
  var args = goog.array.slice(arguments, 1);
  var expectedCount = classes.length + args.length;
  goog.dom.classes.add_(classes, args);
  element.className = classes.join(' ');
  return classes.length == expectedCount;
};


/**
 * Removes a class or classes from an element.
 * @param {Node} element DOM node to remove class from.
 * @param {...string} var_args Class name(s) to remove.
 * @return {boolean} Whether all classes in {@code var_args} were found and
 *     removed.
 */
goog.dom.classes.remove = function(element, var_args) {
  var classes = goog.dom.classes.get(element);
  var args = goog.array.slice(arguments, 1);
  var newClasses = goog.dom.classes.getDifference_(classes, args);
  element.className = newClasses.join(' ');
  return newClasses.length == classes.length - args.length;
};


/**
 * Helper method for {@link goog.dom.classes.add} and
 * {@link goog.dom.classes.addRemove}. Adds one or more classes to the supplied
 * classes array.
 * @param {Array.<string>} classes All class names for the element, will be
 *     updated to have the classes supplied in {@code args} added.
 * @param {Array.<string>} args Class names to add.
 * @private
 */
goog.dom.classes.add_ = function(classes, args) {
  for (var i = 0; i < args.length; i++) {
    if (!goog.array.contains(classes, args[i])) {
      classes.push(args[i]);
    }
  }
};


/**
 * Helper method for {@link goog.dom.classes.remove} and
 * {@link goog.dom.classes.addRemove}. Calculates the difference of two arrays.
 * @param {!Array.<string>} arr1 First array.
 * @param {!Array.<string>} arr2 Second array.
 * @return {!Array.<string>} The first array without the elements of the second
 *     array.
 * @private
 */
goog.dom.classes.getDifference_ = function(arr1, arr2) {
  return goog.array.filter(arr1, function(item) {
    return !goog.array.contains(arr2, item);
  });
};


/**
 * Switches a class on an element from one to another without disturbing other
 * classes. If the fromClass isn't removed, the toClass won't be added.
 * @param {Node} element DOM node to swap classes on.
 * @param {string} fromClass Class to remove.
 * @param {string} toClass Class to add.
 * @return {boolean} Whether classes were switched.
 */
goog.dom.classes.swap = function(element, fromClass, toClass) {
  var classes = goog.dom.classes.get(element);

  var removed = false;
  for (var i = 0; i < classes.length; i++) {
    if (classes[i] == fromClass) {
      goog.array.splice(classes, i--, 1);
      removed = true;
    }
  }

  if (removed) {
    classes.push(toClass);
    element.className = classes.join(' ');
  }

  return removed;
};


/**
 * Adds zero or more classes to an element and removes zero or more as a single
 * operation. Unlike calling {@link goog.dom.classes.add} and
 * {@link goog.dom.classes.remove} separately, this is more efficient as it only
 * parses the class property once.
 *
 * If a class is in both the remove and add lists, it will be added. Thus,
 * you can use this instead of {@link goog.dom.classes.swap} when you have
 * more than two class names that you want to swap.
 *
 * @param {Node} element DOM node to swap classes on.
 * @param {?(string|Array.<string>)} classesToRemove Class or classes to
 *     remove, if null no classes are removed.
 * @param {?(string|Array.<string>)} classesToAdd Class or classes to add, if
 *     null no classes are added.
 */
goog.dom.classes.addRemove = function(element, classesToRemove, classesToAdd) {
  var classes = goog.dom.classes.get(element);
  if (goog.isString(classesToRemove)) {
    goog.array.remove(classes, classesToRemove);
  } else if (goog.isArray(classesToRemove)) {
    classes = goog.dom.classes.getDifference_(classes, classesToRemove);
  }

  if (goog.isString(classesToAdd) &&
      !goog.array.contains(classes, classesToAdd)) {
    classes.push(classesToAdd);
  } else if (goog.isArray(classesToAdd)) {
    goog.dom.classes.add_(classes, classesToAdd);
  }

  element.className = classes.join(' ');
};


/**
 * Returns true if an element has a class.
 * @param {Node} element DOM node to test.
 * @param {string} className Class name to test for.
 * @return {boolean} Whether element has the class.
 */
goog.dom.classes.has = function(element, className) {
  return goog.array.contains(goog.dom.classes.get(element), className);
};


/**
 * Adds or removes a class depending on the enabled argument.
 * @param {Node} element DOM node to add or remove the class on.
 * @param {string} className Class name to add or remove.
 * @param {boolean} enabled Whether to add or remove the class (true adds,
 *     false removes).
 */
goog.dom.classes.enable = function(element, className, enabled) {
  if (enabled) {
    goog.dom.classes.add(element, className);
  } else {
    goog.dom.classes.remove(element, className);
  }
};


/**
 * Removes a class if an element has it, and adds it the element doesn't have
 * it.  Won't affect other classes on the node.
 * @param {Node} element DOM node to toggle class on.
 * @param {string} className Class to toggle.
 * @return {boolean} True if class was added, false if it was removed
 *     (in other words, whether element has the class after this function has
 *     been called).
 */
goog.dom.classes.toggle = function(element, className) {
  var add = !goog.dom.classes.has(element, className);
  goog.dom.classes.enable(element, className, add);
  return add;
};
// Copyright 2007 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Defines the goog.dom.TagName enum.  This enumerates
 * all html tag names specified by the W3C HTML 4.01 Specification.
 * Reference http://www.w3.org/TR/html401/index/elements.html.
 */
goog.provide('goog.dom.TagName');


/**
 * Enum of all html tag names specified by the W3C HTML 4.01 Specification.
 * Reference http://www.w3.org/TR/html401/index/elements.html
 * @enum {string}
 */
goog.dom.TagName = {
  A: 'A',
  ABBR: 'ABBR',
  ACRONYM: 'ACRONYM',
  ADDRESS: 'ADDRESS',
  APPLET: 'APPLET',
  AREA: 'AREA',
  AUDIO: 'AUDIO',
  B: 'B',
  BASE: 'BASE',
  BASEFONT: 'BASEFONT',
  BDO: 'BDO',
  BIG: 'BIG',
  BLOCKQUOTE: 'BLOCKQUOTE',
  BODY: 'BODY',
  BR: 'BR',
  BUTTON: 'BUTTON',
  CANVAS: 'CANVAS',
  CAPTION: 'CAPTION',
  CENTER: 'CENTER',
  CITE: 'CITE',
  CODE: 'CODE',
  COL: 'COL',
  COLGROUP: 'COLGROUP',
  DD: 'DD',
  DEL: 'DEL',
  DFN: 'DFN',
  DIR: 'DIR',
  DIV: 'DIV',
  DL: 'DL',
  DT: 'DT',
  EM: 'EM',
  FIELDSET: 'FIELDSET',
  FONT: 'FONT',
  FORM: 'FORM',
  FRAME: 'FRAME',
  FRAMESET: 'FRAMESET',
  H1: 'H1',
  H2: 'H2',
  H3: 'H3',
  H4: 'H4',
  H5: 'H5',
  H6: 'H6',
  HEAD: 'HEAD',
  HR: 'HR',
  HTML: 'HTML',
  I: 'I',
  IFRAME: 'IFRAME',
  IMG: 'IMG',
  INPUT: 'INPUT',
  INS: 'INS',
  ISINDEX: 'ISINDEX',
  KBD: 'KBD',
  LABEL: 'LABEL',
  LEGEND: 'LEGEND',
  LI: 'LI',
  LINK: 'LINK',
  MAP: 'MAP',
  MENU: 'MENU',
  META: 'META',
  NOFRAMES: 'NOFRAMES',
  NOSCRIPT: 'NOSCRIPT',
  OBJECT: 'OBJECT',
  OL: 'OL',
  OPTGROUP: 'OPTGROUP',
  OPTION: 'OPTION',
  P: 'P',
  PARAM: 'PARAM',
  PRE: 'PRE',
  Q: 'Q',
  S: 'S',
  SAMP: 'SAMP',
  SCRIPT: 'SCRIPT',
  SELECT: 'SELECT',
  SMALL: 'SMALL',
  SPAN: 'SPAN',
  STRIKE: 'STRIKE',
  STRONG: 'STRONG',
  STYLE: 'STYLE',
  SUB: 'SUB',
  SUP: 'SUP',
  TABLE: 'TABLE',
  TBODY: 'TBODY',
  TD: 'TD',
  TEXTAREA: 'TEXTAREA',
  TFOOT: 'TFOOT',
  TH: 'TH',
  THEAD: 'THEAD',
  TITLE: 'TITLE',
  TR: 'TR',
  TT: 'TT',
  U: 'U',
  UL: 'UL',
  VAR: 'VAR',
  VIDEO: 'VIDEO'
};
// Copyright 2007 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview A utility class for representing two-dimensional sizes.
 */


goog.provide('goog.math.Size');



/**
 * Class for representing sizes consisting of a width and height. Undefined
 * width and height support is deprecated and results in compiler warning.
 * @param {number} width Width.
 * @param {number} height Height.
 * @constructor
 */
goog.math.Size = function(width, height) {
  /**
   * Width
   * @type {number}
   */
  this.width = width;

  /**
   * Height
   * @type {number}
   */
  this.height = height;
};


/**
 * Compares sizes for equality.
 * @param {goog.math.Size} a A Size.
 * @param {goog.math.Size} b A Size.
 * @return {boolean} True iff the sizes have equal widths and equal
 *     heights, or if both are null.
 */
goog.math.Size.equals = function(a, b) {
  if (a == b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  return a.width == b.width && a.height == b.height;
};


/**
 * @return {!goog.math.Size} A new copy of the Size.
 */
goog.math.Size.prototype.clone = function() {
  return new goog.math.Size(this.width, this.height);
};


if (goog.DEBUG) {
  /**
   * Returns a nice string representing size.
   * @return {string} In the form (50 x 73).
   */
  goog.math.Size.prototype.toString = function() {
    return '(' + this.width + ' x ' + this.height + ')';
  };
}


/**
 * @return {number} The longer of the two dimensions in the size.
 */
goog.math.Size.prototype.getLongest = function() {
  return Math.max(this.width, this.height);
};


/**
 * @return {number} The shorter of the two dimensions in the size.
 */
goog.math.Size.prototype.getShortest = function() {
  return Math.min(this.width, this.height);
};


/**
 * @return {number} The area of the size (width * height).
 */
goog.math.Size.prototype.area = function() {
  return this.width * this.height;
};


/**
 * @return {number} The perimeter of the size (width + height) * 2.
 */
goog.math.Size.prototype.perimeter = function() {
  return (this.width + this.height) * 2;
};


/**
 * @return {number} The ratio of the size's width to its height.
 */
goog.math.Size.prototype.aspectRatio = function() {
  return this.width / this.height;
};


/**
 * @return {boolean} True if the size has zero area, false if both dimensions
 *     are non-zero numbers.
 */
goog.math.Size.prototype.isEmpty = function() {
  return !this.area();
};


/**
 * Clamps the width and height parameters upward to integer values.
 * @return {!goog.math.Size} This size with ceil'd components.
 */
goog.math.Size.prototype.ceil = function() {
  this.width = Math.ceil(this.width);
  this.height = Math.ceil(this.height);
  return this;
};


/**
 * @param {!goog.math.Size} target The target size.
 * @return {boolean} True if this Size is the same size or smaller than the
 *     target size in both dimensions.
 */
goog.math.Size.prototype.fitsInside = function(target) {
  return this.width <= target.width && this.height <= target.height;
};


/**
 * Clamps the width and height parameters downward to integer values.
 * @return {!goog.math.Size} This size with floored components.
 */
goog.math.Size.prototype.floor = function() {
  this.width = Math.floor(this.width);
  this.height = Math.floor(this.height);
  return this;
};


/**
 * Rounds the width and height parameters to integer values.
 * @return {!goog.math.Size} This size with rounded components.
 */
goog.math.Size.prototype.round = function() {
  this.width = Math.round(this.width);
  this.height = Math.round(this.height);
  return this;
};


/**
 * Scales the size uniformly by a factor.
 * @param {number} s The scale factor.
 * @return {!goog.math.Size} This Size object after scaling.
 */
goog.math.Size.prototype.scale = function(s) {
  this.width *= s;
  this.height *= s;
  return this;
};


/**
 * Uniformly scales the size to fit inside the dimensions of a given size. The
 * original aspect ratio will be preserved.
 *
 * This function assumes that both Sizes contain strictly positive dimensions.
 * @param {!goog.math.Size} target The target size.
 * @return {!goog.math.Size} This Size object, after optional scaling.
 */
goog.math.Size.prototype.scaleToFit = function(target) {
  var s = this.aspectRatio() > target.aspectRatio() ?
      target.width / this.width :
      target.height / this.height;

  return this.scale(s);
};
// Copyright 2010 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Browser capability checks for the dom package.
 *
 */


goog.provide('goog.dom.BrowserFeature');

goog.require('goog.userAgent');


/**
 * Enum of browser capabilities.
 * @enum {boolean}
 */
goog.dom.BrowserFeature = {
  /**
   * Whether attributes 'name' and 'type' can be added to an element after it's
   * created. False in Internet Explorer prior to version 9.
   */
  CAN_ADD_NAME_OR_TYPE_ATTRIBUTES: !goog.userAgent.IE ||
      goog.userAgent.isDocumentMode(9),

  /**
   * Whether we can use element.children to access an element's Element
   * children. Available since Gecko 1.9.1, IE 9. (IE<9 also includes comment
   * nodes in the collection.)
   */
  CAN_USE_CHILDREN_ATTRIBUTE: !goog.userAgent.GECKO && !goog.userAgent.IE ||
      goog.userAgent.IE && goog.userAgent.isDocumentMode(9) ||
      goog.userAgent.GECKO && goog.userAgent.isVersion('1.9.1'),

  /**
   * Opera, Safari 3, and Internet Explorer 9 all support innerText but they
   * include text nodes in script and style tags. Not document-mode-dependent.
   */
  CAN_USE_INNER_TEXT: goog.userAgent.IE && !goog.userAgent.isVersion('9'),

  /**
   * MSIE, Opera, and Safari>=4 support element.parentElement to access an
   * element's parent if it is an Element.
   */
  CAN_USE_PARENT_ELEMENT_PROPERTY: goog.userAgent.IE || goog.userAgent.OPERA ||
      goog.userAgent.WEBKIT,

  /**
   * Whether NoScope elements need a scoped element written before them in
   * innerHTML.
   * MSDN: http://msdn.microsoft.com/en-us/library/ms533897(VS.85).aspx#1
   */
  INNER_HTML_NEEDS_SCOPED_ELEMENT: goog.userAgent.IE
};
// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview A utility class for representing two-dimensional positions.
 */


goog.provide('goog.math.Coordinate');



/**
 * Class for representing coordinates and positions.
 * @param {number=} opt_x Left, defaults to 0.
 * @param {number=} opt_y Top, defaults to 0.
 * @constructor
 */
goog.math.Coordinate = function(opt_x, opt_y) {
  /**
   * X-value
   * @type {number}
   */
  this.x = goog.isDef(opt_x) ? opt_x : 0;

  /**
   * Y-value
   * @type {number}
   */
  this.y = goog.isDef(opt_y) ? opt_y : 0;
};


/**
 * Returns a new copy of the coordinate.
 * @return {!goog.math.Coordinate} A clone of this coordinate.
 */
goog.math.Coordinate.prototype.clone = function() {
  return new goog.math.Coordinate(this.x, this.y);
};


if (goog.DEBUG) {
  /**
   * Returns a nice string representing the coordinate.
   * @return {string} In the form (50, 73).
   */
  goog.math.Coordinate.prototype.toString = function() {
    return '(' + this.x + ', ' + this.y + ')';
  };
}


/**
 * Compares coordinates for equality.
 * @param {goog.math.Coordinate} a A Coordinate.
 * @param {goog.math.Coordinate} b A Coordinate.
 * @return {boolean} True iff the coordinates are equal, or if both are null.
 */
goog.math.Coordinate.equals = function(a, b) {
  if (a == b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  return a.x == b.x && a.y == b.y;
};


/**
 * Returns the distance between two coordinates.
 * @param {!goog.math.Coordinate} a A Coordinate.
 * @param {!goog.math.Coordinate} b A Coordinate.
 * @return {number} The distance between {@code a} and {@code b}.
 */
goog.math.Coordinate.distance = function(a, b) {
  var dx = a.x - b.x;
  var dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
};


/**
 * Returns the squared distance between two coordinates. Squared distances can
 * be used for comparisons when the actual value is not required.
 *
 * Performance note: eliminating the square root is an optimization often used
 * in lower-level languages, but the speed difference is not nearly as
 * pronounced in JavaScript (only a few percent.)
 *
 * @param {!goog.math.Coordinate} a A Coordinate.
 * @param {!goog.math.Coordinate} b A Coordinate.
 * @return {number} The squared distance between {@code a} and {@code b}.
 */
goog.math.Coordinate.squaredDistance = function(a, b) {
  var dx = a.x - b.x;
  var dy = a.y - b.y;
  return dx * dx + dy * dy;
};


/**
 * Returns the difference between two coordinates as a new
 * goog.math.Coordinate.
 * @param {!goog.math.Coordinate} a A Coordinate.
 * @param {!goog.math.Coordinate} b A Coordinate.
 * @return {!goog.math.Coordinate} A Coordinate representing the difference
 *     between {@code a} and {@code b}.
 */
goog.math.Coordinate.difference = function(a, b) {
  return new goog.math.Coordinate(a.x - b.x, a.y - b.y);
};


/**
 * Returns the sum of two coordinates as a new goog.math.Coordinate.
 * @param {!goog.math.Coordinate} a A Coordinate.
 * @param {!goog.math.Coordinate} b A Coordinate.
 * @return {!goog.math.Coordinate} A Coordinate representing the sum of the two
 *     coordinates.
 */
goog.math.Coordinate.sum = function(a, b) {
  return new goog.math.Coordinate(a.x + b.x, a.y + b.y);
};
// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utilities for manipulating the browser's Document Object Model
 * Inspiration taken *heavily* from mochikit (http://mochikit.com/).
 *
 * You can use {@link goog.dom.DomHelper} to create new dom helpers that refer
 * to a different document object.  This is useful if you are working with
 * frames or multiple windows.
 *
 */


// TODO(arv): Rename/refactor getTextContent and getRawTextContent. The problem
// is that getTextContent should mimic the DOM3 textContent. We should add a
// getInnerText (or getText) which tries to return the visible text, innerText.


goog.provide('goog.dom');
goog.provide('goog.dom.DomHelper');
goog.provide('goog.dom.NodeType');

goog.require('goog.array');
goog.require('goog.dom.BrowserFeature');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classes');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Size');
goog.require('goog.object');
goog.require('goog.string');
goog.require('goog.userAgent');


/**
 * @define {boolean} Whether we know at compile time that the browser is in
 * quirks mode.
 */
goog.dom.ASSUME_QUIRKS_MODE = false;


/**
 * @define {boolean} Whether we know at compile time that the browser is in
 * standards compliance mode.
 */
goog.dom.ASSUME_STANDARDS_MODE = false;


/**
 * Whether we know the compatibility mode at compile time.
 * @type {boolean}
 * @private
 */
goog.dom.COMPAT_MODE_KNOWN_ =
    goog.dom.ASSUME_QUIRKS_MODE || goog.dom.ASSUME_STANDARDS_MODE;


/**
 * Enumeration for DOM node types (for reference)
 * @enum {number}
 */
goog.dom.NodeType = {
  ELEMENT: 1,
  ATTRIBUTE: 2,
  TEXT: 3,
  CDATA_SECTION: 4,
  ENTITY_REFERENCE: 5,
  ENTITY: 6,
  PROCESSING_INSTRUCTION: 7,
  COMMENT: 8,
  DOCUMENT: 9,
  DOCUMENT_TYPE: 10,
  DOCUMENT_FRAGMENT: 11,
  NOTATION: 12
};


/**
 * Gets the DomHelper object for the document where the element resides.
 * @param {(Node|Window)=} opt_element If present, gets the DomHelper for this
 *     element.
 * @return {!goog.dom.DomHelper} The DomHelper.
 */
goog.dom.getDomHelper = function(opt_element) {
  return opt_element ?
      new goog.dom.DomHelper(goog.dom.getOwnerDocument(opt_element)) :
      (goog.dom.defaultDomHelper_ ||
          (goog.dom.defaultDomHelper_ = new goog.dom.DomHelper()));
};


/**
 * Cached default DOM helper.
 * @type {goog.dom.DomHelper}
 * @private
 */
goog.dom.defaultDomHelper_;


/**
 * Gets the document object being used by the dom library.
 * @return {!Document} Document object.
 */
goog.dom.getDocument = function() {
  return document;
};


/**
 * Alias for getElementById. If a DOM node is passed in then we just return
 * that.
 * @param {string|Element} element Element ID or a DOM node.
 * @return {Element} The element with the given ID, or the node passed in.
 */
goog.dom.getElement = function(element) {
  return goog.isString(element) ?
      document.getElementById(element) : element;
};


/**
 * Alias for getElement.
 * @param {string|Element} element Element ID or a DOM node.
 * @return {Element} The element with the given ID, or the node passed in.
 * @deprecated Use {@link goog.dom.getElement} instead.
 */
goog.dom.$ = goog.dom.getElement;


/**
 * Looks up elements by both tag and class name, using browser native functions
 * ({@code querySelectorAll}, {@code getElementsByTagName} or
 * {@code getElementsByClassName}) where possible. This function
 * is a useful, if limited, way of collecting a list of DOM elements
 * with certain characteristics.  {@code goog.dom.query} offers a
 * more powerful and general solution which allows matching on CSS3
 * selector expressions, but at increased cost in code size. If all you
 * need is particular tags belonging to a single class, this function
 * is fast and sleek.
 *
 * @see {goog.dom.query}
 *
 * @param {?string=} opt_tag Element tag name.
 * @param {?string=} opt_class Optional class name.
 * @param {(Document|Element)=} opt_el Optional element to look in.
 * @return { {length: number} } Array-like list of elements (only a length
 *     property and numerical indices are guaranteed to exist).
 */
goog.dom.getElementsByTagNameAndClass = function(opt_tag, opt_class, opt_el) {
  return goog.dom.getElementsByTagNameAndClass_(document, opt_tag, opt_class,
                                                opt_el);
};


/**
 * Returns an array of all the elements with the provided className.
 * @see {goog.dom.query}
 * @param {string} className the name of the class to look for.
 * @param {(Document|Element)=} opt_el Optional element to look in.
 * @return { {length: number} } The items found with the class name provided.
 */
goog.dom.getElementsByClass = function(className, opt_el) {
  var parent = opt_el || document;
  if (goog.dom.canUseQuerySelector_(parent)) {
    return parent.querySelectorAll('.' + className);
  } else if (parent.getElementsByClassName) {
    return parent.getElementsByClassName(className);
  }
  return goog.dom.getElementsByTagNameAndClass_(
      document, '*', className, opt_el);
};


/**
 * Returns the first element with the provided className.
 * @see {goog.dom.query}
 * @param {string} className the name of the class to look for.
 * @param {Element|Document=} opt_el Optional element to look in.
 * @return {Element} The first item with the class name provided.
 */
goog.dom.getElementByClass = function(className, opt_el) {
  var parent = opt_el || document;
  var retVal = null;
  if (goog.dom.canUseQuerySelector_(parent)) {
    retVal = parent.querySelector('.' + className);
  } else {
    retVal = goog.dom.getElementsByClass(className, opt_el)[0];
  }
  return retVal || null;
};


/**
 * Prefer the standardized (http://www.w3.org/TR/selectors-api/), native and
 * fast W3C Selectors API. However, the version of WebKit that shipped with
 * Safari 3.1 and Chrome has a bug where it will not correctly match mixed-
 * case class name selectors in quirks mode.
 * @param {!(Element|Document)} parent The parent document object.
 * @return {boolean} whether or not we can use parent.querySelector* APIs.
 * @private
 */
goog.dom.canUseQuerySelector_ = function(parent) {
  return parent.querySelectorAll &&
         parent.querySelector &&
         (!goog.userAgent.WEBKIT || goog.dom.isCss1CompatMode_(document) ||
          goog.userAgent.isVersion('528'));
};


/**
 * Helper for {@code getElementsByTagNameAndClass}.
 * @param {!Document} doc The document to get the elements in.
 * @param {?string=} opt_tag Element tag name.
 * @param {?string=} opt_class Optional class name.
 * @param {(Document|Element)=} opt_el Optional element to look in.
 * @return { {length: number} } Array-like list of elements (only a length
 *     property and numerical indices are guaranteed to exist).
 * @private
 */
goog.dom.getElementsByTagNameAndClass_ = function(doc, opt_tag, opt_class,
                                                  opt_el) {
  var parent = opt_el || doc;
  var tagName = (opt_tag && opt_tag != '*') ? opt_tag.toUpperCase() : '';

  if (goog.dom.canUseQuerySelector_(parent) &&
      (tagName || opt_class)) {
    var query = tagName + (opt_class ? '.' + opt_class : '');
    return parent.querySelectorAll(query);
  }

  // Use the native getElementsByClassName if available, under the assumption
  // that even when the tag name is specified, there will be fewer elements to
  // filter through when going by class than by tag name
  if (opt_class && parent.getElementsByClassName) {
    var els = parent.getElementsByClassName(opt_class);

    if (tagName) {
      var arrayLike = {};
      var len = 0;

      // Filter for specific tags if requested.
      for (var i = 0, el; el = els[i]; i++) {
        if (tagName == el.nodeName) {
          arrayLike[len++] = el;
        }
      }
      arrayLike.length = len;

      return arrayLike;
    } else {
      return els;
    }
  }

  var els = parent.getElementsByTagName(tagName || '*');

  if (opt_class) {
    var arrayLike = {};
    var len = 0;
    for (var i = 0, el; el = els[i]; i++) {
      var className = el.className;
      // Check if className has a split function since SVG className does not.
      if (typeof className.split == 'function' &&
          goog.array.contains(className.split(/\s+/), opt_class)) {
        arrayLike[len++] = el;
      }
    }
    arrayLike.length = len;
    return arrayLike;
  } else {
    return els;
  }
};


/**
 * Alias for {@code getElementsByTagNameAndClass}.
 * @param {?string=} opt_tag Element tag name.
 * @param {?string=} opt_class Optional class name.
 * @param {Element=} opt_el Optional element to look in.
 * @return { {length: number} } Array-like list of elements (only a length
 *     property and numerical indices are guaranteed to exist).
 * @deprecated Use {@link goog.dom.getElementsByTagNameAndClass} instead.
 */
goog.dom.$$ = goog.dom.getElementsByTagNameAndClass;


/**
 * Sets multiple properties on a node.
 * @param {Element} element DOM node to set properties on.
 * @param {Object} properties Hash of property:value pairs.
 */
goog.dom.setProperties = function(element, properties) {
  goog.object.forEach(properties, function(val, key) {
    if (key == 'style') {
      element.style.cssText = val;
    } else if (key == 'class') {
      element.className = val;
    } else if (key == 'for') {
      element.htmlFor = val;
    } else if (key in goog.dom.DIRECT_ATTRIBUTE_MAP_) {
      element.setAttribute(goog.dom.DIRECT_ATTRIBUTE_MAP_[key], val);
    } else if (goog.string.startsWith(key, 'aria-')) {
      element.setAttribute(key, val);
    } else {
      element[key] = val;
    }
  });
};


/**
 * Map of attributes that should be set using
 * element.setAttribute(key, val) instead of element[key] = val.  Used
 * by goog.dom.setProperties.
 *
 * @type {Object}
 * @private
 */
goog.dom.DIRECT_ATTRIBUTE_MAP_ = {
  'cellpadding': 'cellPadding',
  'cellspacing': 'cellSpacing',
  'colspan': 'colSpan',
  'rowspan': 'rowSpan',
  'valign': 'vAlign',
  'height': 'height',
  'width': 'width',
  'usemap': 'useMap',
  'frameborder': 'frameBorder',
  'maxlength': 'maxLength',
  'type': 'type'
};


/**
 * Gets the dimensions of the viewport.
 *
 * Gecko Standards mode:
 * docEl.clientWidth  Width of viewport excluding scrollbar.
 * win.innerWidth     Width of viewport including scrollbar.
 * body.clientWidth   Width of body element.
 *
 * docEl.clientHeight Height of viewport excluding scrollbar.
 * win.innerHeight    Height of viewport including scrollbar.
 * body.clientHeight  Height of document.
 *
 * Gecko Backwards compatible mode:
 * docEl.clientWidth  Width of viewport excluding scrollbar.
 * win.innerWidth     Width of viewport including scrollbar.
 * body.clientWidth   Width of viewport excluding scrollbar.
 *
 * docEl.clientHeight Height of document.
 * win.innerHeight    Height of viewport including scrollbar.
 * body.clientHeight  Height of viewport excluding scrollbar.
 *
 * IE6/7 Standards mode:
 * docEl.clientWidth  Width of viewport excluding scrollbar.
 * win.innerWidth     Undefined.
 * body.clientWidth   Width of body element.
 *
 * docEl.clientHeight Height of viewport excluding scrollbar.
 * win.innerHeight    Undefined.
 * body.clientHeight  Height of document element.
 *
 * IE5 + IE6/7 Backwards compatible mode:
 * docEl.clientWidth  0.
 * win.innerWidth     Undefined.
 * body.clientWidth   Width of viewport excluding scrollbar.
 *
 * docEl.clientHeight 0.
 * win.innerHeight    Undefined.
 * body.clientHeight  Height of viewport excluding scrollbar.
 *
 * Opera 9 Standards and backwards compatible mode:
 * docEl.clientWidth  Width of viewport excluding scrollbar.
 * win.innerWidth     Width of viewport including scrollbar.
 * body.clientWidth   Width of viewport excluding scrollbar.
 *
 * docEl.clientHeight Height of document.
 * win.innerHeight    Height of viewport including scrollbar.
 * body.clientHeight  Height of viewport excluding scrollbar.
 *
 * WebKit:
 * Safari 2
 * docEl.clientHeight Same as scrollHeight.
 * docEl.clientWidth  Same as innerWidth.
 * win.innerWidth     Width of viewport excluding scrollbar.
 * win.innerHeight    Height of the viewport including scrollbar.
 * frame.innerHeight  Height of the viewport exluding scrollbar.
 *
 * Safari 3 (tested in 522)
 *
 * docEl.clientWidth  Width of viewport excluding scrollbar.
 * docEl.clientHeight Height of viewport excluding scrollbar in strict mode.
 * body.clientHeight  Height of viewport excluding scrollbar in quirks mode.
 *
 * @param {Window=} opt_window Optional window element to test.
 * @return {!goog.math.Size} Object with values 'width' and 'height'.
 */
goog.dom.getViewportSize = function(opt_window) {
  // TODO(arv): This should not take an argument
  return goog.dom.getViewportSize_(opt_window || window);
};


/**
 * Helper for {@code getViewportSize}.
 * @param {Window} win The window to get the view port size for.
 * @return {!goog.math.Size} Object with values 'width' and 'height'.
 * @private
 */
goog.dom.getViewportSize_ = function(win) {
  var doc = win.document;

  if (goog.userAgent.WEBKIT && !goog.userAgent.isVersion('500') &&
      !goog.userAgent.MOBILE) {
    // TODO(doughtie): Sometimes we get something that isn't a valid window
    // object. In this case we just revert to the current window. We need to
    // figure out when this happens and find a real fix for it.
    // See the comments on goog.dom.getWindow.
    if (typeof win.innerHeight == 'undefined') {
      win = window;
    }
    var innerHeight = win.innerHeight;
    var scrollHeight = win.document.documentElement.scrollHeight;

    if (win == win.top) {
      if (scrollHeight < innerHeight) {
        innerHeight -= 15; // Scrollbars are 15px wide on Mac
      }
    }
    return new goog.math.Size(win.innerWidth, innerHeight);
  }

  var el = goog.dom.isCss1CompatMode_(doc) ? doc.documentElement : doc.body;

  return new goog.math.Size(el.clientWidth, el.clientHeight);
};


/**
 * Calculates the height of the document.
 *
 * @return {number} The height of the current document.
 */
goog.dom.getDocumentHeight = function() {
  return goog.dom.getDocumentHeight_(window);
};


/**
 * Calculates the height of the document of the given window.
 *
 * Function code copied from the opensocial gadget api:
 *   gadgets.window.adjustHeight(opt_height)
 *
 * @private
 * @param {Window} win The window whose document height to retrieve.
 * @return {number} The height of the document of the given window.
 */
goog.dom.getDocumentHeight_ = function(win) {
  // NOTE(eae): This method will return the window size rather than the document
  // size in webkit quirks mode.
  var doc = win.document;
  var height = 0;

  if (doc) {
    // Calculating inner content height is hard and different between
    // browsers rendering in Strict vs. Quirks mode.  We use a combination of
    // three properties within document.body and document.documentElement:
    // - scrollHeight
    // - offsetHeight
    // - clientHeight
    // These values differ significantly between browsers and rendering modes.
    // But there are patterns.  It just takes a lot of time and persistence
    // to figure out.

    // Get the height of the viewport
    var vh = goog.dom.getViewportSize_(win).height;
    var body = doc.body;
    var docEl = doc.documentElement;
    if (goog.dom.isCss1CompatMode_(doc) && docEl.scrollHeight) {
      // In Strict mode:
      // The inner content height is contained in either:
      //    document.documentElement.scrollHeight
      //    document.documentElement.offsetHeight
      // Based on studying the values output by different browsers,
      // use the value that's NOT equal to the viewport height found above.
      height = docEl.scrollHeight != vh ?
          docEl.scrollHeight : docEl.offsetHeight;
    } else {
      // In Quirks mode:
      // documentElement.clientHeight is equal to documentElement.offsetHeight
      // except in IE.  In most browsers, document.documentElement can be used
      // to calculate the inner content height.
      // However, in other browsers (e.g. IE), document.body must be used
      // instead.  How do we know which one to use?
      // If document.documentElement.clientHeight does NOT equal
      // document.documentElement.offsetHeight, then use document.body.
      var sh = docEl.scrollHeight;
      var oh = docEl.offsetHeight;
      if (docEl.clientHeight != oh) {
        sh = body.scrollHeight;
        oh = body.offsetHeight;
      }

      // Detect whether the inner content height is bigger or smaller
      // than the bounding box (viewport).  If bigger, take the larger
      // value.  If smaller, take the smaller value.
      if (sh > vh) {
        // Content is larger
        height = sh > oh ? sh : oh;
      } else {
        // Content is smaller
        height = sh < oh ? sh : oh;
      }
    }
  }

  return height;
};


/**
 * Gets the page scroll distance as a coordinate object.
 *
 * @param {Window=} opt_window Optional window element to test.
 * @return {!goog.math.Coordinate} Object with values 'x' and 'y'.
 * @deprecated Use {@link goog.dom.getDocumentScroll} instead.
 */
goog.dom.getPageScroll = function(opt_window) {
  var win = opt_window || goog.global || window;
  return goog.dom.getDomHelper(win.document).getDocumentScroll();
};


/**
 * Gets the document scroll distance as a coordinate object.
 *
 * @return {!goog.math.Coordinate} Object with values 'x' and 'y'.
 */
goog.dom.getDocumentScroll = function() {
  return goog.dom.getDocumentScroll_(document);
};


/**
 * Helper for {@code getDocumentScroll}.
 *
 * @param {!Document} doc The document to get the scroll for.
 * @return {!goog.math.Coordinate} Object with values 'x' and 'y'.
 * @private
 */
goog.dom.getDocumentScroll_ = function(doc) {
  var el = goog.dom.getDocumentScrollElement_(doc);
  var win = goog.dom.getWindow_(doc);
  return new goog.math.Coordinate(win.pageXOffset || el.scrollLeft,
      win.pageYOffset || el.scrollTop);
};


/**
 * Gets the document scroll element.
 * @return {Element} Scrolling element.
 */
goog.dom.getDocumentScrollElement = function() {
  return goog.dom.getDocumentScrollElement_(document);
};


/**
 * Helper for {@code getDocumentScrollElement}.
 * @param {!Document} doc The document to get the scroll element for.
 * @return {Element} Scrolling element.
 * @private
 */
goog.dom.getDocumentScrollElement_ = function(doc) {
  // Safari (2 and 3) needs body.scrollLeft in both quirks mode and strict mode.
  return !goog.userAgent.WEBKIT && goog.dom.isCss1CompatMode_(doc) ?
      doc.documentElement : doc.body;
};


/**
 * Gets the window object associated with the given document.
 *
 * @param {Document=} opt_doc  Document object to get window for.
 * @return {!Window} The window associated with the given document.
 */
goog.dom.getWindow = function(opt_doc) {
  // TODO(arv): This should not take an argument.
  return opt_doc ? goog.dom.getWindow_(opt_doc) : window;
};


/**
 * Helper for {@code getWindow}.
 *
 * @param {!Document} doc  Document object to get window for.
 * @return {!Window} The window associated with the given document.
 * @private
 */
goog.dom.getWindow_ = function(doc) {
  return doc.parentWindow || doc.defaultView;
};


/**
 * Returns a dom node with a set of attributes.  This function accepts varargs
 * for subsequent nodes to be added.  Subsequent nodes will be added to the
 * first node as childNodes.
 *
 * So:
 * <code>createDom('div', null, createDom('p'), createDom('p'));</code>
 * would return a div with two child paragraphs
 *
 * @param {string} tagName Tag to create.
 * @param {(Object|Array.<string>|string)=} opt_attributes If object, then a map
 *     of name-value pairs for attributes. If a string, then this is the
 *     className of the new element. If an array, the elements will be joined
 *     together as the className of the new element.
 * @param {...(Object|string|Array|NodeList)} var_args Further DOM nodes or
 *     strings for text nodes. If one of the var_args is an array or NodeList,i
 *     its elements will be added as childNodes instead.
 * @return {!Element} Reference to a DOM node.
 */
goog.dom.createDom = function(tagName, opt_attributes, var_args) {
  return goog.dom.createDom_(document, arguments);
};


/**
 * Helper for {@code createDom}.
 * @param {!Document} doc The document to create the DOM in.
 * @param {!Arguments} args Argument object passed from the callers. See
 *     {@code goog.dom.createDom} for details.
 * @return {!Element} Reference to a DOM node.
 * @private
 */
goog.dom.createDom_ = function(doc, args) {
  var tagName = args[0];
  var attributes = args[1];

  // Internet Explorer is dumb: http://msdn.microsoft.com/workshop/author/
  //                            dhtml/reference/properties/name_2.asp
  // Also does not allow setting of 'type' attribute on 'input' or 'button'.
  if (!goog.dom.BrowserFeature.CAN_ADD_NAME_OR_TYPE_ATTRIBUTES && attributes &&
      (attributes.name || attributes.type)) {
    var tagNameArr = ['<', tagName];
    if (attributes.name) {
      tagNameArr.push(' name="', goog.string.htmlEscape(attributes.name),
                      '"');
    }
    if (attributes.type) {
      tagNameArr.push(' type="', goog.string.htmlEscape(attributes.type),
                      '"');

      // Clone attributes map to remove 'type' without mutating the input.
      var clone = {};
      goog.object.extend(clone, attributes);
      attributes = clone;
      delete attributes.type;
    }
    tagNameArr.push('>');
    tagName = tagNameArr.join('');
  }

  var element = doc.createElement(tagName);

  if (attributes) {
    if (goog.isString(attributes)) {
      element.className = attributes;
    } else if (goog.isArray(attributes)) {
      goog.dom.classes.add.apply(null, [element].concat(attributes));
    } else {
      goog.dom.setProperties(element, attributes);
    }
  }

  if (args.length > 2) {
    goog.dom.append_(doc, element, args, 2);
  }

  return element;
};


/**
 * Appends a node with text or other nodes.
 * @param {!Document} doc The document to create new nodes in.
 * @param {!Node} parent The node to append nodes to.
 * @param {!Arguments} args The values to add. See {@code goog.dom.append}.
 * @param {number} startIndex The index of the array to start from.
 * @private
 */
goog.dom.append_ = function(doc, parent, args, startIndex) {
  function childHandler(child) {
    // TODO(user): More coercion, ala MochiKit?
    if (child) {
      parent.appendChild(goog.isString(child) ?
          doc.createTextNode(child) : child);
    }
  }

  for (var i = startIndex; i < args.length; i++) {
    var arg = args[i];
    // TODO(attila): Fix isArrayLike to return false for a text node.
    if (goog.isArrayLike(arg) && !goog.dom.isNodeLike(arg)) {
      // If the argument is a node list, not a real array, use a clone,
      // because forEach can't be used to mutate a NodeList.
      goog.array.forEach(goog.dom.isNodeList(arg) ?
          goog.array.clone(arg) : arg,
          childHandler);
    } else {
      childHandler(arg);
    }
  }
};


/**
 * Alias for {@code createDom}.
 * @param {string} tagName Tag to create.
 * @param {(string|Object)=} opt_attributes If object, then a map of name-value
 *     pairs for attributes. If a string, then this is the className of the new
 *     element.
 * @param {...(Object|string|Array|NodeList)} var_args Further DOM nodes or
 *     strings for text nodes. If one of the var_args is an array, its
 *     children will be added as childNodes instead.
 * @return {!Element} Reference to a DOM node.
 * @deprecated Use {@link goog.dom.createDom} instead.
 */
goog.dom.$dom = goog.dom.createDom;


/**
 * Creates a new element.
 * @param {string} name Tag name.
 * @return {!Element} The new element.
 */
goog.dom.createElement = function(name) {
  return document.createElement(name);
};


/**
 * Creates a new text node.
 * @param {string} content Content.
 * @return {!Text} The new text node.
 */
goog.dom.createTextNode = function(content) {
  return document.createTextNode(content);
};


/**
 * Create a table.
 * @param {number} rows The number of rows in the table.  Must be >= 1.
 * @param {number} columns The number of columns in the table.  Must be >= 1.
 * @param {boolean=} opt_fillWithNbsp If true, fills table entries with nsbps.
 * @return {!Element} The created table.
 */
goog.dom.createTable = function(rows, columns, opt_fillWithNbsp) {
  return goog.dom.createTable_(document, rows, columns, !!opt_fillWithNbsp);
};


/**
 * Create a table.
 * @param {!Document} doc Document object to use to create the table.
 * @param {number} rows The number of rows in the table.  Must be >= 1.
 * @param {number} columns The number of columns in the table.  Must be >= 1.
 * @param {boolean} fillWithNbsp If true, fills table entries with nsbps.
 * @return {!Element} The created table.
 * @private
 */
goog.dom.createTable_ = function(doc, rows, columns, fillWithNbsp) {
  var rowHtml = ['<tr>'];
  for (var i = 0; i < columns; i++) {
    rowHtml.push(fillWithNbsp ? '<td>&nbsp;</td>' : '<td></td>');
  }
  rowHtml.push('</tr>');
  rowHtml = rowHtml.join('');
  var totalHtml = ['<table>'];
  for (i = 0; i < rows; i++) {
    totalHtml.push(rowHtml);
  }
  totalHtml.push('</table>');

  var elem = doc.createElement(goog.dom.TagName.DIV);
  elem.innerHTML = totalHtml.join('');
  return /** @type {!Element} */ (elem.removeChild(elem.firstChild));
};


/**
 * Converts an HTML string into a document fragment.
 *
 * @param {string} htmlString The HTML string to convert.
 * @return {!Node} The resulting document fragment.
 */
goog.dom.htmlToDocumentFragment = function(htmlString) {
  return goog.dom.htmlToDocumentFragment_(document, htmlString);
};


/**
 * Helper for {@code htmlToDocumentFragment}.
 *
 * @param {!Document} doc The document.
 * @param {string} htmlString The HTML string to convert.
 * @return {!Node} The resulting document fragment.
 * @private
 */
goog.dom.htmlToDocumentFragment_ = function(doc, htmlString) {
  var tempDiv = doc.createElement('div');
  if (goog.dom.BrowserFeature.INNER_HTML_NEEDS_SCOPED_ELEMENT) {
    tempDiv.innerHTML = '<br>' + htmlString;
    tempDiv.removeChild(tempDiv.firstChild);
  } else {
    tempDiv.innerHTML = htmlString;
  }
  if (tempDiv.childNodes.length == 1) {
    return /** @type {!Node} */ (tempDiv.removeChild(tempDiv.firstChild));
  } else {
    var fragment = doc.createDocumentFragment();
    while (tempDiv.firstChild) {
      fragment.appendChild(tempDiv.firstChild);
    }
    return fragment;
  }
};


/**
 * Returns the compatMode of the document.
 * @return {string} The result is either CSS1Compat or BackCompat.
 * @deprecated use goog.dom.isCss1CompatMode instead.
 */
goog.dom.getCompatMode = function() {
  return goog.dom.isCss1CompatMode() ? 'CSS1Compat' : 'BackCompat';
};


/**
 * Returns true if the browser is in "CSS1-compatible" (standards-compliant)
 * mode, false otherwise.
 * @return {boolean} True if in CSS1-compatible mode.
 */
goog.dom.isCss1CompatMode = function() {
  return goog.dom.isCss1CompatMode_(document);
};


/**
 * Returns true if the browser is in "CSS1-compatible" (standards-compliant)
 * mode, false otherwise.
 * @param {Document} doc The document to check.
 * @return {boolean} True if in CSS1-compatible mode.
 * @private
 */
goog.dom.isCss1CompatMode_ = function(doc) {
  if (goog.dom.COMPAT_MODE_KNOWN_) {
    return goog.dom.ASSUME_STANDARDS_MODE;
  }

  return doc.compatMode == 'CSS1Compat';
};


/**
 * Determines if the given node can contain children, intended to be used for
 * HTML generation.
 *
 * IE natively supports node.canHaveChildren but has inconsistent behavior.
 * Prior to IE8 the base tag allows children and in IE9 all nodes return true
 * for canHaveChildren.
 *
 * In practice all non-IE browsers allow you to add children to any node, but
 * the behavior is inconsistent:
 *
 * <pre>
 *   var a = document.createElement('br');
 *   a.appendChild(document.createTextNode('foo'));
 *   a.appendChild(document.createTextNode('bar'));
 *   console.log(a.childNodes.length);  // 2
 *   console.log(a.innerHTML);  // Chrome: "", IE9: "foobar", FF3.5: "foobar"
 * </pre>
 *
 * TODO(user): Rename shouldAllowChildren() ?
 *
 * @param {Node} node The node to check.
 * @return {boolean} Whether the node can contain children.
 */
goog.dom.canHaveChildren = function(node) {
  if (node.nodeType != goog.dom.NodeType.ELEMENT) {
    return false;
  }
  switch (node.tagName) {
    case goog.dom.TagName.APPLET:
    case goog.dom.TagName.AREA:
    case goog.dom.TagName.BASE:
    case goog.dom.TagName.BR:
    case goog.dom.TagName.COL:
    case goog.dom.TagName.FRAME:
    case goog.dom.TagName.HR:
    case goog.dom.TagName.IMG:
    case goog.dom.TagName.INPUT:
    case goog.dom.TagName.IFRAME:
    case goog.dom.TagName.ISINDEX:
    case goog.dom.TagName.LINK:
    case goog.dom.TagName.NOFRAMES:
    case goog.dom.TagName.NOSCRIPT:
    case goog.dom.TagName.META:
    case goog.dom.TagName.OBJECT:
    case goog.dom.TagName.PARAM:
    case goog.dom.TagName.SCRIPT:
    case goog.dom.TagName.STYLE:
      return false;
  }
  return true;
};


/**
 * Appends a child to a node.
 * @param {Node} parent Parent.
 * @param {Node} child Child.
 */
goog.dom.appendChild = function(parent, child) {
  parent.appendChild(child);
};


/**
 * Appends a node with text or other nodes.
 * @param {!Node} parent The node to append nodes to.
 * @param {...goog.dom.Appendable} var_args The things to append to the node.
 *     If this is a Node it is appended as is.
 *     If this is a string then a text node is appended.
 *     If this is an array like object then fields 0 to length - 1 are appended.
 */
goog.dom.append = function(parent, var_args) {
  goog.dom.append_(goog.dom.getOwnerDocument(parent), parent, arguments, 1);
};


/**
 * Removes all the child nodes on a DOM node.
 * @param {Node} node Node to remove children from.
 */
goog.dom.removeChildren = function(node) {
  // Note: Iterations over live collections can be slow, this is the fastest
  // we could find. The double parenthesis are used to prevent JsCompiler and
  // strict warnings.
  var child;
  while ((child = node.firstChild)) {
    node.removeChild(child);
  }
};


/**
 * Inserts a new node before an existing reference node (i.e. as the previous
 * sibling). If the reference node has no parent, then does nothing.
 * @param {Node} newNode Node to insert.
 * @param {Node} refNode Reference node to insert before.
 */
goog.dom.insertSiblingBefore = function(newNode, refNode) {
  if (refNode.parentNode) {
    refNode.parentNode.insertBefore(newNode, refNode);
  }
};


/**
 * Inserts a new node after an existing reference node (i.e. as the next
 * sibling). If the reference node has no parent, then does nothing.
 * @param {Node} newNode Node to insert.
 * @param {Node} refNode Reference node to insert after.
 */
goog.dom.insertSiblingAfter = function(newNode, refNode) {
  if (refNode.parentNode) {
    refNode.parentNode.insertBefore(newNode, refNode.nextSibling);
  }
};


/**
 * Insert a child at a given index. If index is larger than the number of child
 * nodes that the parent currently has, the node is inserted as the last child
 * node.
 * @param {Element} parent The element into which to insert the child.
 * @param {Node} child The element to insert.
 * @param {number} index The index at which to insert the new child node. Must
 *     not be negative.
 */
goog.dom.insertChildAt = function(parent, child, index) {
  // Note that if the second argument is null, insertBefore
  // will append the child at the end of the list of children.
  parent.insertBefore(child, parent.childNodes[index] || null);
};


/**
 * Removes a node from its parent.
 * @param {Node} node The node to remove.
 * @return {Node} The node removed if removed; else, null.
 */
goog.dom.removeNode = function(node) {
  return node && node.parentNode ? node.parentNode.removeChild(node) : null;
};


/**
 * Replaces a node in the DOM tree. Will do nothing if {@code oldNode} has no
 * parent.
 * @param {Node} newNode Node to insert.
 * @param {Node} oldNode Node to replace.
 */
goog.dom.replaceNode = function(newNode, oldNode) {
  var parent = oldNode.parentNode;
  if (parent) {
    parent.replaceChild(newNode, oldNode);
  }
};


/**
 * Flattens an element. That is, removes it and replace it with its children.
 * Does nothing if the element is not in the document.
 * @param {Element} element The element to flatten.
 * @return {Element|undefined} The original element, detached from the document
 *     tree, sans children; or undefined, if the element was not in the document
 *     to begin with.
 */
goog.dom.flattenElement = function(element) {
  var child, parent = element.parentNode;
  if (parent && parent.nodeType != goog.dom.NodeType.DOCUMENT_FRAGMENT) {
    // Use IE DOM method (supported by Opera too) if available
    if (element.removeNode) {
      return /** @type {Element} */ (element.removeNode(false));
    } else {
      // Move all children of the original node up one level.
      while ((child = element.firstChild)) {
        parent.insertBefore(child, element);
      }

      // Detach the original element.
      return /** @type {Element} */ (goog.dom.removeNode(element));
    }
  }
};


/**
 * Returns an array containing just the element children of the given element.
 * @param {Element} element The element whose element children we want.
 * @return {!(Array|NodeList)} An array or array-like list of just the element
 *     children of the given element.
 */
goog.dom.getChildren = function(element) {
  // We check if the children attribute is supported for child elements
  // since IE8 misuses the attribute by also including comments.
  if (goog.dom.BrowserFeature.CAN_USE_CHILDREN_ATTRIBUTE &&
      element.children != undefined) {
    return element.children;
  }
  // Fall back to manually filtering the element's child nodes.
  return goog.array.filter(element.childNodes, function(node) {
    return node.nodeType == goog.dom.NodeType.ELEMENT;
  });
};


/**
 * Returns the first child node that is an element.
 * @param {Node} node The node to get the first child element of.
 * @return {Element} The first child node of {@code node} that is an element.
 */
goog.dom.getFirstElementChild = function(node) {
  if (node.firstElementChild != undefined) {
    return /** @type {Element} */(node).firstElementChild;
  }
  return goog.dom.getNextElementNode_(node.firstChild, true);
};


/**
 * Returns the last child node that is an element.
 * @param {Node} node The node to get the last child element of.
 * @return {Element} The last child node of {@code node} that is an element.
 */
goog.dom.getLastElementChild = function(node) {
  if (node.lastElementChild != undefined) {
    return /** @type {Element} */(node).lastElementChild;
  }
  return goog.dom.getNextElementNode_(node.lastChild, false);
};


/**
 * Returns the first next sibling that is an element.
 * @param {Node} node The node to get the next sibling element of.
 * @return {Element} The next sibling of {@code node} that is an element.
 */
goog.dom.getNextElementSibling = function(node) {
  if (node.nextElementSibling != undefined) {
    return /** @type {Element} */(node).nextElementSibling;
  }
  return goog.dom.getNextElementNode_(node.nextSibling, true);
};


/**
 * Returns the first previous sibling that is an element.
 * @param {Node} node The node to get the previous sibling element of.
 * @return {Element} The first previous sibling of {@code node} that is
 *     an element.
 */
goog.dom.getPreviousElementSibling = function(node) {
  if (node.previousElementSibling != undefined) {
    return /** @type {Element} */(node).previousElementSibling;
  }
  return goog.dom.getNextElementNode_(node.previousSibling, false);
};


/**
 * Returns the first node that is an element in the specified direction,
 * starting with {@code node}.
 * @param {Node} node The node to get the next element from.
 * @param {boolean} forward Whether to look forwards or backwards.
 * @return {Element} The first element.
 * @private
 */
goog.dom.getNextElementNode_ = function(node, forward) {
  while (node && node.nodeType != goog.dom.NodeType.ELEMENT) {
    node = forward ? node.nextSibling : node.previousSibling;
  }

  return /** @type {Element} */ (node);
};


/**
 * Returns the next node in source order from the given node.
 * @param {Node} node The node.
 * @return {Node} The next node in the DOM tree, or null if this was the last
 *     node.
 */
goog.dom.getNextNode = function(node) {
  if (!node) {
    return null;
  }

  if (node.firstChild) {
    return node.firstChild;
  }

  while (node && !node.nextSibling) {
    node = node.parentNode;
  }

  return node ? node.nextSibling : null;
};


/**
 * Returns the previous node in source order from the given node.
 * @param {Node} node The node.
 * @return {Node} The previous node in the DOM tree, or null if this was the
 *     first node.
 */
goog.dom.getPreviousNode = function(node) {
  if (!node) {
    return null;
  }

  if (!node.previousSibling) {
    return node.parentNode;
  }

  node = node.previousSibling;
  while (node && node.lastChild) {
    node = node.lastChild;
  }

  return node;
};


/**
 * Whether the object looks like a DOM node.
 * @param {*} obj The object being tested for node likeness.
 * @return {boolean} Whether the object looks like a DOM node.
 */
goog.dom.isNodeLike = function(obj) {
  return goog.isObject(obj) && obj.nodeType > 0;
};


/**
 * Whether the object looks like an Element.
 * @param {*} obj The object being tested for Element likeness.
 * @return {boolean} Whether the object looks like an Element.
 */
goog.dom.isElement = function(obj) {
  return goog.isObject(obj) && obj.nodeType == goog.dom.NodeType.ELEMENT;
};


/**
 * Returns true if the specified value is a Window object. This includes the
 * global window for HTML pages, and iframe windows.
 * @param {*} obj Variable to test.
 * @return {boolean} Whether the variable is a window.
 */
goog.dom.isWindow = function(obj) {
  return goog.isObject(obj) && obj['window'] == obj;
};


/**
 * Returns an element's parent, if it's an Element.
 * @param {Element} element The DOM element.
 * @return {Element} The parent, or null if not an Element.
 */
goog.dom.getParentElement = function(element) {
  if (goog.dom.BrowserFeature.CAN_USE_PARENT_ELEMENT_PROPERTY) {
    return element.parentElement;
  }
  var parent = element.parentNode;
  return goog.dom.isElement(parent) ? (/** @type {!Element} */ parent) : null;
};


/**
 * Whether a node contains another node.
 * @param {Node} parent The node that should contain the other node.
 * @param {Node} descendant The node to test presence of.
 * @return {boolean} Whether the parent node contains the descendent node.
 */
goog.dom.contains = function(parent, descendant) {
  // We use browser specific methods for this if available since it is faster
  // that way.

  // IE DOM
  if (parent.contains && descendant.nodeType == goog.dom.NodeType.ELEMENT) {
    return parent == descendant || parent.contains(descendant);
  }

  // W3C DOM Level 3
  if (typeof parent.compareDocumentPosition != 'undefined') {
    return parent == descendant ||
        Boolean(parent.compareDocumentPosition(descendant) & 16);
  }

  // W3C DOM Level 1
  while (descendant && parent != descendant) {
    descendant = descendant.parentNode;
  }
  return descendant == parent;
};


/**
 * Compares the document order of two nodes, returning 0 if they are the same
 * node, a negative number if node1 is before node2, and a positive number if
 * node2 is before node1.  Note that we compare the order the tags appear in the
 * document so in the tree <b><i>text</i></b> the B node is considered to be
 * before the I node.
 *
 * @param {Node} node1 The first node to compare.
 * @param {Node} node2 The second node to compare.
 * @return {number} 0 if the nodes are the same node, a negative number if node1
 *     is before node2, and a positive number if node2 is before node1.
 */
goog.dom.compareNodeOrder = function(node1, node2) {
  // Fall out quickly for equality.
  if (node1 == node2) {
    return 0;
  }

  // Use compareDocumentPosition where available
  if (node1.compareDocumentPosition) {
    // 4 is the bitmask for FOLLOWS.
    return node1.compareDocumentPosition(node2) & 2 ? 1 : -1;
  }

  // Process in IE using sourceIndex - we check to see if the first node has
  // a source index or if its parent has one.
  if ('sourceIndex' in node1 ||
      (node1.parentNode && 'sourceIndex' in node1.parentNode)) {
    var isElement1 = node1.nodeType == goog.dom.NodeType.ELEMENT;
    var isElement2 = node2.nodeType == goog.dom.NodeType.ELEMENT;

    if (isElement1 && isElement2) {
      return node1.sourceIndex - node2.sourceIndex;
    } else {
      var parent1 = node1.parentNode;
      var parent2 = node2.parentNode;

      if (parent1 == parent2) {
        return goog.dom.compareSiblingOrder_(node1, node2);
      }

      if (!isElement1 && goog.dom.contains(parent1, node2)) {
        return -1 * goog.dom.compareParentsDescendantNodeIe_(node1, node2);
      }


      if (!isElement2 && goog.dom.contains(parent2, node1)) {
        return goog.dom.compareParentsDescendantNodeIe_(node2, node1);
      }

      return (isElement1 ? node1.sourceIndex : parent1.sourceIndex) -
             (isElement2 ? node2.sourceIndex : parent2.sourceIndex);
    }
  }

  // For Safari, we compare ranges.
  var doc = goog.dom.getOwnerDocument(node1);

  var range1, range2;
  range1 = doc.createRange();
  range1.selectNode(node1);
  range1.collapse(true);

  range2 = doc.createRange();
  range2.selectNode(node2);
  range2.collapse(true);

  return range1.compareBoundaryPoints(goog.global['Range'].START_TO_END,
      range2);
};


/**
 * Utility function to compare the position of two nodes, when
 * {@code textNode}'s parent is an ancestor of {@code node}.  If this entry
 * condition is not met, this function will attempt to reference a null object.
 * @param {Node} textNode The textNode to compare.
 * @param {Node} node The node to compare.
 * @return {number} -1 if node is before textNode, +1 otherwise.
 * @private
 */
goog.dom.compareParentsDescendantNodeIe_ = function(textNode, node) {
  var parent = textNode.parentNode;
  if (parent == node) {
    // If textNode is a child of node, then node comes first.
    return -1;
  }
  var sibling = node;
  while (sibling.parentNode != parent) {
    sibling = sibling.parentNode;
  }
  return goog.dom.compareSiblingOrder_(sibling, textNode);
};


/**
 * Utility function to compare the position of two nodes known to be non-equal
 * siblings.
 * @param {Node} node1 The first node to compare.
 * @param {Node} node2 The second node to compare.
 * @return {number} -1 if node1 is before node2, +1 otherwise.
 * @private
 */
goog.dom.compareSiblingOrder_ = function(node1, node2) {
  var s = node2;
  while ((s = s.previousSibling)) {
    if (s == node1) {
      // We just found node1 before node2.
      return -1;
    }
  }

  // Since we didn't find it, node1 must be after node2.
  return 1;
};


/**
 * Find the deepest common ancestor of the given nodes.
 * @param {...Node} var_args The nodes to find a common ancestor of.
 * @return {Node} The common ancestor of the nodes, or null if there is none.
 *     null will only be returned if two or more of the nodes are from different
 *     documents.
 */
goog.dom.findCommonAncestor = function(var_args) {
  var i, count = arguments.length;
  if (!count) {
    return null;
  } else if (count == 1) {
    return arguments[0];
  }

  var paths = [];
  var minLength = Infinity;
  for (i = 0; i < count; i++) {
    // Compute the list of ancestors.
    var ancestors = [];
    var node = arguments[i];
    while (node) {
      ancestors.unshift(node);
      node = node.parentNode;
    }

    // Save the list for comparison.
    paths.push(ancestors);
    minLength = Math.min(minLength, ancestors.length);
  }
  var output = null;
  for (i = 0; i < minLength; i++) {
    var first = paths[0][i];
    for (var j = 1; j < count; j++) {
      if (first != paths[j][i]) {
        return output;
      }
    }
    output = first;
  }
  return output;
};


/**
 * Returns the owner document for a node.
 * @param {Node|Window} node The node to get the document for.
 * @return {!Document} The document owning the node.
 */
goog.dom.getOwnerDocument = function(node) {
  // TODO(arv): Remove IE5 code.
  // IE5 uses document instead of ownerDocument
  return /** @type {!Document} */ (
      node.nodeType == goog.dom.NodeType.DOCUMENT ? node :
      node.ownerDocument || node.document);
};


/**
 * Cross-browser function for getting the document element of a frame or iframe.
 * @param {Element} frame Frame element.
 * @return {!Document} The frame content document.
 */
goog.dom.getFrameContentDocument = function(frame) {
  var doc = frame.contentDocument || frame.contentWindow.document;
  return doc;
};


/**
 * Cross-browser function for getting the window of a frame or iframe.
 * @param {HTMLIFrameElement|HTMLFrameElement} frame Frame element.
 * @return {Window} The window associated with the given frame.
 */
goog.dom.getFrameContentWindow = function(frame) {
  return frame.contentWindow ||
      goog.dom.getWindow_(goog.dom.getFrameContentDocument(frame));
};


/**
 * Cross-browser function for setting the text content of an element.
 * @param {Element} element The element to change the text content of.
 * @param {string} text The string that should replace the current element
 *     content.
 */
goog.dom.setTextContent = function(element, text) {
  if ('textContent' in element) {
    element.textContent = text;
  } else if (element.firstChild &&
             element.firstChild.nodeType == goog.dom.NodeType.TEXT) {
    // If the first child is a text node we just change its data and remove the
    // rest of the children.
    while (element.lastChild != element.firstChild) {
      element.removeChild(element.lastChild);
    }
    element.firstChild.data = text;
  } else {
    goog.dom.removeChildren(element);
    var doc = goog.dom.getOwnerDocument(element);
    element.appendChild(doc.createTextNode(text));
  }
};


/**
 * Gets the outerHTML of a node, which islike innerHTML, except that it
 * actually contains the HTML of the node itself.
 * @param {Element} element The element to get the HTML of.
 * @return {string} The outerHTML of the given element.
 */
goog.dom.getOuterHtml = function(element) {
  // IE, Opera and WebKit all have outerHTML.
  if ('outerHTML' in element) {
    return element.outerHTML;
  } else {
    var doc = goog.dom.getOwnerDocument(element);
    var div = doc.createElement('div');
    div.appendChild(element.cloneNode(true));
    return div.innerHTML;
  }
};


/**
 * Finds the first descendant node that matches the filter function, using
 * a depth first search. This function offers the most general purpose way
 * of finding a matching element. You may also wish to consider
 * {@code goog.dom.query} which can express many matching criteria using
 * CSS selector expressions. These expressions often result in a more
 * compact representation of the desired result.
 * @see goog.dom.query
 *
 * @param {Node} root The root of the tree to search.
 * @param {function(Node) : boolean} p The filter function.
 * @return {Node|undefined} The found node or undefined if none is found.
 */
goog.dom.findNode = function(root, p) {
  var rv = [];
  var found = goog.dom.findNodes_(root, p, rv, true);
  return found ? rv[0] : undefined;
};


/**
 * Finds all the descendant nodes that match the filter function, using a
 * a depth first search. This function offers the most general-purpose way
 * of finding a set of matching elements. You may also wish to consider
 * {@code goog.dom.query} which can express many matching criteria using
 * CSS selector expressions. These expressions often result in a more
 * compact representation of the desired result.

 * @param {Node} root The root of the tree to search.
 * @param {function(Node) : boolean} p The filter function.
 * @return {!Array.<!Node>} The found nodes or an empty array if none are found.
 */
goog.dom.findNodes = function(root, p) {
  var rv = [];
  goog.dom.findNodes_(root, p, rv, false);
  return rv;
};


/**
 * Finds the first or all the descendant nodes that match the filter function,
 * using a depth first search.
 * @param {Node} root The root of the tree to search.
 * @param {function(Node) : boolean} p The filter function.
 * @param {!Array.<!Node>} rv The found nodes are added to this array.
 * @param {boolean} findOne If true we exit after the first found node.
 * @return {boolean} Whether the search is complete or not. True in case findOne
 *     is true and the node is found. False otherwise.
 * @private
 */
goog.dom.findNodes_ = function(root, p, rv, findOne) {
  if (root != null) {
    var child = root.firstChild;
    while (child) {
      if (p(child)) {
        rv.push(child);
        if (findOne) {
          return true;
        }
      }
      if (goog.dom.findNodes_(child, p, rv, findOne)) {
        return true;
      }
      child = child.nextSibling;
    }
  }
  return false;
};


/**
 * Map of tags whose content to ignore when calculating text length.
 * @type {Object}
 * @private
 */
goog.dom.TAGS_TO_IGNORE_ = {
  'SCRIPT': 1,
  'STYLE': 1,
  'HEAD': 1,
  'IFRAME': 1,
  'OBJECT': 1
};


/**
 * Map of tags which have predefined values with regard to whitespace.
 * @type {Object}
 * @private
 */
goog.dom.PREDEFINED_TAG_VALUES_ = {'IMG': ' ', 'BR': '\n'};


/**
 * Returns true if the element has a tab index that allows it to receive
 * keyboard focus (tabIndex >= 0), false otherwise.  Note that form elements
 * natively support keyboard focus, even if they have no tab index.
 * @param {Element} element Element to check.
 * @return {boolean} Whether the element has a tab index that allows keyboard
 *     focus.
 * @see http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
 */
goog.dom.isFocusableTabIndex = function(element) {
  // IE returns 0 for an unset tabIndex, so we must use getAttributeNode(),
  // which returns an object with a 'specified' property if tabIndex is
  // specified.  This works on other browsers, too.
  var attrNode = element.getAttributeNode('tabindex'); // Must be lowercase!
  if (attrNode && attrNode.specified) {
    var index = element.tabIndex;
    // NOTE: IE9 puts tabIndex in 16-bit int, e.g. -2 is 65534.
    return goog.isNumber(index) && index >= 0 && index < 32768;
  }
  return false;
};


/**
 * Enables or disables keyboard focus support on the element via its tab index.
 * Only elements for which {@link goog.dom.isFocusableTabIndex} returns true
 * (or elements that natively support keyboard focus, like form elements) can
 * receive keyboard focus.  See http://go/tabindex for more info.
 * @param {Element} element Element whose tab index is to be changed.
 * @param {boolean} enable Whether to set or remove a tab index on the element
 *     that supports keyboard focus.
 */
goog.dom.setFocusableTabIndex = function(element, enable) {
  if (enable) {
    element.tabIndex = 0;
  } else {
    // Set tabIndex to -1 first, then remove it. This is a workaround for
    // Safari (confirmed in version 4 on Windows). When removing the attribute
    // without setting it to -1 first, the element remains keyboard focusable
    // despite not having a tabIndex attribute anymore.
    element.tabIndex = -1;
    element.removeAttribute('tabIndex'); // Must be camelCase!
  }
};


/**
 * Returns the text content of the current node, without markup and invisible
 * symbols. New lines are stripped and whitespace is collapsed,
 * such that each character would be visible.
 *
 * In browsers that support it, innerText is used.  Other browsers attempt to
 * simulate it via node traversal.  Line breaks are canonicalized in IE.
 *
 * @param {Node} node The node from which we are getting content.
 * @return {string} The text content.
 */
goog.dom.getTextContent = function(node) {
  var textContent;
  // Note(arv): IE9, Opera, and Safari 3 support innerText but they include
  // text nodes in script tags. So we revert to use a user agent test here.
  if (goog.dom.BrowserFeature.CAN_USE_INNER_TEXT && ('innerText' in node)) {
    textContent = goog.string.canonicalizeNewlines(node.innerText);
    // Unfortunately .innerText() returns text with &shy; symbols
    // We need to filter it out and then remove duplicate whitespaces
  } else {
    var buf = [];
    goog.dom.getTextContent_(node, buf, true);
    textContent = buf.join('');
  }

  // Strip &shy; entities. goog.format.insertWordBreaks inserts them in Opera.
  textContent = textContent.replace(/ \xAD /g, ' ').replace(/\xAD/g, '');
  // Strip &#8203; entities. goog.format.insertWordBreaks inserts them in IE8.
  textContent = textContent.replace(/\u200B/g, '');

  // Skip this replacement on old browsers with working innerText, which
  // automatically turns &nbsp; into ' ' and / +/ into ' ' when reading
  // innerText.
  if (!goog.dom.BrowserFeature.CAN_USE_INNER_TEXT) {
    textContent = textContent.replace(/ +/g, ' ');
  }
  if (textContent != ' ') {
    textContent = textContent.replace(/^\s*/, '');
  }

  return textContent;
};


/**
 * Returns the text content of the current node, without markup.
 *
 * Unlike {@code getTextContent} this method does not collapse whitespaces
 * or normalize lines breaks.
 *
 * @param {Node} node The node from which we are getting content.
 * @return {string} The raw text content.
 */
goog.dom.getRawTextContent = function(node) {
  var buf = [];
  goog.dom.getTextContent_(node, buf, false);

  return buf.join('');
};


/**
 * Recursive support function for text content retrieval.
 *
 * @param {Node} node The node from which we are getting content.
 * @param {Array} buf string buffer.
 * @param {boolean} normalizeWhitespace Whether to normalize whitespace.
 * @private
 */
goog.dom.getTextContent_ = function(node, buf, normalizeWhitespace) {
  if (node.nodeName in goog.dom.TAGS_TO_IGNORE_) {
    // ignore certain tags
  } else if (node.nodeType == goog.dom.NodeType.TEXT) {
    if (normalizeWhitespace) {
      buf.push(String(node.nodeValue).replace(/(\r\n|\r|\n)/g, ''));
    } else {
      buf.push(node.nodeValue);
    }
  } else if (node.nodeName in goog.dom.PREDEFINED_TAG_VALUES_) {
    buf.push(goog.dom.PREDEFINED_TAG_VALUES_[node.nodeName]);
  } else {
    var child = node.firstChild;
    while (child) {
      goog.dom.getTextContent_(child, buf, normalizeWhitespace);
      child = child.nextSibling;
    }
  }
};


/**
 * Returns the text length of the text contained in a node, without markup. This
 * is equivalent to the selection length if the node was selected, or the number
 * of cursor movements to traverse the node. Images & BRs take one space.  New
 * lines are ignored.
 *
 * @param {Node} node The node whose text content length is being calculated.
 * @return {number} The length of {@code node}'s text content.
 */
goog.dom.getNodeTextLength = function(node) {
  return goog.dom.getTextContent(node).length;
};


/**
 * Returns the text offset of a node relative to one of its ancestors. The text
 * length is the same as the length calculated by goog.dom.getNodeTextLength.
 *
 * @param {Node} node The node whose offset is being calculated.
 * @param {Node=} opt_offsetParent The node relative to which the offset will
 *     be calculated. Defaults to the node's owner document's body.
 * @return {number} The text offset.
 */
goog.dom.getNodeTextOffset = function(node, opt_offsetParent) {
  var root = opt_offsetParent || goog.dom.getOwnerDocument(node).body;
  var buf = [];
  while (node && node != root) {
    var cur = node;
    while ((cur = cur.previousSibling)) {
      buf.unshift(goog.dom.getTextContent(cur));
    }
    node = node.parentNode;
  }
  // Trim left to deal with FF cases when there might be line breaks and empty
  // nodes at the front of the text
  return goog.string.trimLeft(buf.join('')).replace(/ +/g, ' ').length;
};


/**
 * Returns the node at a given offset in a parent node.  If an object is
 * provided for the optional third parameter, the node and the remainder of the
 * offset will stored as properties of this object.
 * @param {Node} parent The parent node.
 * @param {number} offset The offset into the parent node.
 * @param {Object=} opt_result Object to be used to store the return value. The
 *     return value will be stored in the form {node: Node, remainder: number}
 *     if this object is provided.
 * @return {Node} The node at the given offset.
 */
goog.dom.getNodeAtOffset = function(parent, offset, opt_result) {
  var stack = [parent], pos = 0, cur;
  while (stack.length > 0 && pos < offset) {
    cur = stack.pop();
    if (cur.nodeName in goog.dom.TAGS_TO_IGNORE_) {
      // ignore certain tags
    } else if (cur.nodeType == goog.dom.NodeType.TEXT) {
      var text = cur.nodeValue.replace(/(\r\n|\r|\n)/g, '').replace(/ +/g, ' ');
      pos += text.length;
    } else if (cur.nodeName in goog.dom.PREDEFINED_TAG_VALUES_) {
      pos += goog.dom.PREDEFINED_TAG_VALUES_[cur.nodeName].length;
    } else {
      for (var i = cur.childNodes.length - 1; i >= 0; i--) {
        stack.push(cur.childNodes[i]);
      }
    }
  }
  if (goog.isObject(opt_result)) {
    opt_result.remainder = cur ? cur.nodeValue.length + offset - pos - 1 : 0;
    opt_result.node = cur;
  }

  return cur;
};


/**
 * Returns true if the object is a {@code NodeList}.  To qualify as a NodeList,
 * the object must have a numeric length property and an item function (which
 * has type 'string' on IE for some reason).
 * @param {Object} val Object to test.
 * @return {boolean} Whether the object is a NodeList.
 */
goog.dom.isNodeList = function(val) {
  // TODO(attila): Now the isNodeList is part of goog.dom we can use
  // goog.userAgent to make this simpler.
  // A NodeList must have a length property of type 'number' on all platforms.
  if (val && typeof val.length == 'number') {
    // A NodeList is an object everywhere except Safari, where it's a function.
    if (goog.isObject(val)) {
      // A NodeList must have an item function (on non-IE platforms) or an item
      // property of type 'string' (on IE).
      return typeof val.item == 'function' || typeof val.item == 'string';
    } else if (goog.isFunction(val)) {
      // On Safari, a NodeList is a function with an item property that is also
      // a function.
      return typeof val.item == 'function';
    }
  }

  // Not a NodeList.
  return false;
};


/**
 * Walks up the DOM hierarchy returning the first ancestor that has the passed
 * tag name and/or class name. If the passed element matches the specified
 * criteria, the element itself is returned.
 * @param {Node} element The DOM node to start with.
 * @param {?(goog.dom.TagName|string)=} opt_tag The tag name to match (or
 *     null/undefined to match only based on class name).
 * @param {?string=} opt_class The class name to match (or null/undefined to
 *     match only based on tag name).
 * @return {Element} The first ancestor that matches the passed criteria, or
 *     null if no match is found.
 */
goog.dom.getAncestorByTagNameAndClass = function(element, opt_tag, opt_class) {
  if (!opt_tag && !opt_class) {
    return null;
  }
  var tagName = opt_tag ? opt_tag.toUpperCase() : null;
  return /** @type {Element} */ (goog.dom.getAncestor(element,
      function(node) {
        return (!tagName || node.nodeName == tagName) &&
               (!opt_class || goog.dom.classes.has(node, opt_class));
      }, true));
};


/**
 * Walks up the DOM hierarchy returning the first ancestor that has the passed
 * class name. If the passed element matches the specified criteria, the
 * element itself is returned.
 * @param {Node} element The DOM node to start with.
 * @param {string} className The class name to match.
 * @return {Element} The first ancestor that matches the passed criteria, or
 *     null if none match.
 */
goog.dom.getAncestorByClass = function(element, className) {
  return goog.dom.getAncestorByTagNameAndClass(element, null, className);
};


/**
 * Walks up the DOM hierarchy returning the first ancestor that passes the
 * matcher function.
 * @param {Node} element The DOM node to start with.
 * @param {function(Node) : boolean} matcher A function that returns true if the
 *     passed node matches the desired criteria.
 * @param {boolean=} opt_includeNode If true, the node itself is included in
 *     the search (the first call to the matcher will pass startElement as
 *     the node to test).
 * @param {number=} opt_maxSearchSteps Maximum number of levels to search up the
 *     dom.
 * @return {Node} DOM node that matched the matcher, or null if there was
 *     no match.
 */
goog.dom.getAncestor = function(
    element, matcher, opt_includeNode, opt_maxSearchSteps) {
  if (!opt_includeNode) {
    element = element.parentNode;
  }
  var ignoreSearchSteps = opt_maxSearchSteps == null;
  var steps = 0;
  while (element && (ignoreSearchSteps || steps <= opt_maxSearchSteps)) {
    if (matcher(element)) {
      return element;
    }
    element = element.parentNode;
    steps++;
  }
  // Reached the root of the DOM without a match
  return null;
};


/**
 * Determines the active element in the given document.
 * @param {Document} doc The document to look in.
 * @return {Element} The active element.
 */
goog.dom.getActiveElement = function(doc) {
  try {
    return doc && doc.activeElement;
  } catch (e) {
    // NOTE(nicksantos): Sometimes, evaluating document.activeElement in IE
    // throws an exception. I'm not 100% sure why, but I suspect it chokes
    // on document.activeElement if the activeElement has been recently
    // removed from the DOM by a JS operation.
    //
    // We assume that an exception here simply means
    // "there is no active element."
  }

  return null;
};



/**
 * Create an instance of a DOM helper with a new document object.
 * @param {Document=} opt_document Document object to associate with this
 *     DOM helper.
 * @constructor
 */
goog.dom.DomHelper = function(opt_document) {
  /**
   * Reference to the document object to use
   * @type {!Document}
   * @private
   */
  this.document_ = opt_document || goog.global.document || document;
};


/**
 * Gets the dom helper object for the document where the element resides.
 * @param {Node=} opt_node If present, gets the DomHelper for this node.
 * @return {!goog.dom.DomHelper} The DomHelper.
 */
goog.dom.DomHelper.prototype.getDomHelper = goog.dom.getDomHelper;


/**
 * Sets the document object.
 * @param {!Document} document Document object.
 */
goog.dom.DomHelper.prototype.setDocument = function(document) {
  this.document_ = document;
};


/**
 * Gets the document object being used by the dom library.
 * @return {!Document} Document object.
 */
goog.dom.DomHelper.prototype.getDocument = function() {
  return this.document_;
};


/**
 * Alias for {@code getElementById}. If a DOM node is passed in then we just
 * return that.
 * @param {string|Element} element Element ID or a DOM node.
 * @return {Element} The element with the given ID, or the node passed in.
 */
goog.dom.DomHelper.prototype.getElement = function(element) {
  if (goog.isString(element)) {
    return this.document_.getElementById(element);
  } else {
    return element;
  }
};


/**
 * Alias for {@code getElement}.
 * @param {string|Element} element Element ID or a DOM node.
 * @return {Element} The element with the given ID, or the node passed in.
 * @deprecated Use {@link goog.dom.DomHelper.prototype.getElement} instead.
 */
goog.dom.DomHelper.prototype.$ = goog.dom.DomHelper.prototype.getElement;


/**
 * Looks up elements by both tag and class name, using browser native functions
 * ({@code querySelectorAll}, {@code getElementsByTagName} or
 * {@code getElementsByClassName}) where possible. The returned array is a live
 * NodeList or a static list depending on the code path taken.
 *
 * @see goog.dom.query
 *
 * @param {?string=} opt_tag Element tag name or * for all tags.
 * @param {?string=} opt_class Optional class name.
 * @param {(Document|Element)=} opt_el Optional element to look in.
 * @return { {length: number} } Array-like list of elements (only a length
 *     property and numerical indices are guaranteed to exist).
 */
goog.dom.DomHelper.prototype.getElementsByTagNameAndClass = function(opt_tag,
                                                                     opt_class,
                                                                     opt_el) {
  return goog.dom.getElementsByTagNameAndClass_(this.document_, opt_tag,
                                                opt_class, opt_el);
};


/**
 * Returns an array of all the elements with the provided className.
 * @see {goog.dom.query}
 * @param {string} className the name of the class to look for.
 * @param {Element|Document=} opt_el Optional element to look in.
 * @return { {length: number} } The items found with the class name provided.
 */
goog.dom.DomHelper.prototype.getElementsByClass = function(className, opt_el) {
  var doc = opt_el || this.document_;
  return goog.dom.getElementsByClass(className, doc);
};


/**
 * Returns the first element we find matching the provided class name.
 * @see {goog.dom.query}
 * @param {string} className the name of the class to look for.
 * @param {(Element|Document)=} opt_el Optional element to look in.
 * @return {Element} The first item found with the class name provided.
 */
goog.dom.DomHelper.prototype.getElementByClass = function(className, opt_el) {
  var doc = opt_el || this.document_;
  return goog.dom.getElementByClass(className, doc);
};


/**
 * Alias for {@code getElementsByTagNameAndClass}.
 * @deprecated Use DomHelper getElementsByTagNameAndClass.
 * @see goog.dom.query
 *
 * @param {?string=} opt_tag Element tag name.
 * @param {?string=} opt_class Optional class name.
 * @param {Element=} opt_el Optional element to look in.
 * @return { {length: number} } Array-like list of elements (only a length
 *     property and numerical indices are guaranteed to exist).
 */
goog.dom.DomHelper.prototype.$$ =
    goog.dom.DomHelper.prototype.getElementsByTagNameAndClass;


/**
 * Sets a number of properties on a node.
 * @param {Element} element DOM node to set properties on.
 * @param {Object} properties Hash of property:value pairs.
 */
goog.dom.DomHelper.prototype.setProperties = goog.dom.setProperties;


/**
 * Gets the dimensions of the viewport.
 * @param {Window=} opt_window Optional window element to test. Defaults to
 *     the window of the Dom Helper.
 * @return {!goog.math.Size} Object with values 'width' and 'height'.
 */
goog.dom.DomHelper.prototype.getViewportSize = function(opt_window) {
  // TODO(arv): This should not take an argument. That breaks the rule of a
  // a DomHelper representing a single frame/window/document.
  return goog.dom.getViewportSize(opt_window || this.getWindow());
};


/**
 * Calculates the height of the document.
 *
 * @return {number} The height of the document.
 */
goog.dom.DomHelper.prototype.getDocumentHeight = function() {
  return goog.dom.getDocumentHeight_(this.getWindow());
};


/**
 * Typedef for use with goog.dom.createDom and goog.dom.append.
 * @typedef {Object|string|Array|NodeList}
 */
goog.dom.Appendable;


/**
 * Returns a dom node with a set of attributes.  This function accepts varargs
 * for subsequent nodes to be added.  Subsequent nodes will be added to the
 * first node as childNodes.
 *
 * So:
 * <code>createDom('div', null, createDom('p'), createDom('p'));</code>
 * would return a div with two child paragraphs
 *
 * An easy way to move all child nodes of an existing element to a new parent
 * element is:
 * <code>createDom('div', null, oldElement.childNodes);</code>
 * which will remove all child nodes from the old element and add them as
 * child nodes of the new DIV.
 *
 * @param {string} tagName Tag to create.
 * @param {Object|string=} opt_attributes If object, then a map of name-value
 *     pairs for attributes. If a string, then this is the className of the new
 *     element.
 * @param {...goog.dom.Appendable} var_args Further DOM nodes or
 *     strings for text nodes. If one of the var_args is an array or
 *     NodeList, its elements will be added as childNodes instead.
 * @return {!Element} Reference to a DOM node.
 */
goog.dom.DomHelper.prototype.createDom = function(tagName,
                                                  opt_attributes,
                                                  var_args) {
  return goog.dom.createDom_(this.document_, arguments);
};


/**
 * Alias for {@code createDom}.
 * @param {string} tagName Tag to create.
 * @param {(Object|string)=} opt_attributes If object, then a map of name-value
 *     pairs for attributes. If a string, then this is the className of the new
 *     element.
 * @param {...goog.dom.Appendable} var_args Further DOM nodes or strings for
 *     text nodes.  If one of the var_args is an array, its children will be
 *     added as childNodes instead.
 * @return {!Element} Reference to a DOM node.
 * @deprecated Use {@link goog.dom.DomHelper.prototype.createDom} instead.
 */
goog.dom.DomHelper.prototype.$dom = goog.dom.DomHelper.prototype.createDom;


/**
 * Creates a new element.
 * @param {string} name Tag name.
 * @return {!Element} The new element.
 */
goog.dom.DomHelper.prototype.createElement = function(name) {
  return this.document_.createElement(name);
};


/**
 * Creates a new text node.
 * @param {string} content Content.
 * @return {!Text} The new text node.
 */
goog.dom.DomHelper.prototype.createTextNode = function(content) {
  return this.document_.createTextNode(content);
};


/**
 * Create a table.
 * @param {number} rows The number of rows in the table.  Must be >= 1.
 * @param {number} columns The number of columns in the table.  Must be >= 1.
 * @param {boolean=} opt_fillWithNbsp If true, fills table entries with nsbps.
 * @return {!Element} The created table.
 */
goog.dom.DomHelper.prototype.createTable = function(rows, columns,
    opt_fillWithNbsp) {
  return goog.dom.createTable_(this.document_, rows, columns,
      !!opt_fillWithNbsp);
};


/**
 * Converts an HTML string into a node or a document fragment.  A single Node
 * is used if the {@code htmlString} only generates a single node.  If the
 * {@code htmlString} generates multiple nodes then these are put inside a
 * {@code DocumentFragment}.
 *
 * @param {string} htmlString The HTML string to convert.
 * @return {!Node} The resulting node.
 */
goog.dom.DomHelper.prototype.htmlToDocumentFragment = function(htmlString) {
  return goog.dom.htmlToDocumentFragment_(this.document_, htmlString);
};


/**
 * Returns the compatMode of the document.
 * @return {string} The result is either CSS1Compat or BackCompat.
 * @deprecated use goog.dom.DomHelper.prototype.isCss1CompatMode instead.
 */
goog.dom.DomHelper.prototype.getCompatMode = function() {
  return this.isCss1CompatMode() ? 'CSS1Compat' : 'BackCompat';
};


/**
 * Returns true if the browser is in "CSS1-compatible" (standards-compliant)
 * mode, false otherwise.
 * @return {boolean} True if in CSS1-compatible mode.
 */
goog.dom.DomHelper.prototype.isCss1CompatMode = function() {
  return goog.dom.isCss1CompatMode_(this.document_);
};


/**
 * Gets the window object associated with the document.
 * @return {!Window} The window associated with the given document.
 */
goog.dom.DomHelper.prototype.getWindow = function() {
  return goog.dom.getWindow_(this.document_);
};


/**
 * Gets the document scroll element.
 * @return {Element} Scrolling element.
 */
goog.dom.DomHelper.prototype.getDocumentScrollElement = function() {
  return goog.dom.getDocumentScrollElement_(this.document_);
};


/**
 * Gets the document scroll distance as a coordinate object.
 * @return {!goog.math.Coordinate} Object with properties 'x' and 'y'.
 */
goog.dom.DomHelper.prototype.getDocumentScroll = function() {
  return goog.dom.getDocumentScroll_(this.document_);
};


/**
 * Appends a child to a node.
 * @param {Node} parent Parent.
 * @param {Node} child Child.
 */
goog.dom.DomHelper.prototype.appendChild = goog.dom.appendChild;


/**
 * Appends a node with text or other nodes.
 * @param {!Node} parent The node to append nodes to.
 * @param {...goog.dom.Appendable} var_args The things to append to the node.
 *     If this is a Node it is appended as is.
 *     If this is a string then a text node is appended.
 *     If this is an array like object then fields 0 to length - 1 are appended.
 */
goog.dom.DomHelper.prototype.append = goog.dom.append;


/**
 * Removes all the child nodes on a DOM node.
 * @param {Node} node Node to remove children from.
 */
goog.dom.DomHelper.prototype.removeChildren = goog.dom.removeChildren;


/**
 * Inserts a new node before an existing reference node (i.e., as the previous
 * sibling). If the reference node has no parent, then does nothing.
 * @param {Node} newNode Node to insert.
 * @param {Node} refNode Reference node to insert before.
 */
goog.dom.DomHelper.prototype.insertSiblingBefore = goog.dom.insertSiblingBefore;


/**
 * Inserts a new node after an existing reference node (i.e., as the next
 * sibling). If the reference node has no parent, then does nothing.
 * @param {Node} newNode Node to insert.
 * @param {Node} refNode Reference node to insert after.
 */
goog.dom.DomHelper.prototype.insertSiblingAfter = goog.dom.insertSiblingAfter;


/**
 * Removes a node from its parent.
 * @param {Node} node The node to remove.
 * @return {Node} The node removed if removed; else, null.
 */
goog.dom.DomHelper.prototype.removeNode = goog.dom.removeNode;


/**
 * Replaces a node in the DOM tree. Will do nothing if {@code oldNode} has no
 * parent.
 * @param {Node} newNode Node to insert.
 * @param {Node} oldNode Node to replace.
 */
goog.dom.DomHelper.prototype.replaceNode = goog.dom.replaceNode;


/**
 * Flattens an element. That is, removes it and replace it with its children.
 * @param {Element} element The element to flatten.
 * @return {Element|undefined} The original element, detached from the document
 *     tree, sans children, or undefined if the element was already not in the
 *     document.
 */
goog.dom.DomHelper.prototype.flattenElement = goog.dom.flattenElement;


/**
 * Returns the first child node that is an element.
 * @param {Node} node The node to get the first child element of.
 * @return {Element} The first child node of {@code node} that is an element.
 */
goog.dom.DomHelper.prototype.getFirstElementChild =
    goog.dom.getFirstElementChild;


/**
 * Returns the last child node that is an element.
 * @param {Node} node The node to get the last child element of.
 * @return {Element} The last child node of {@code node} that is an element.
 */
goog.dom.DomHelper.prototype.getLastElementChild = goog.dom.getLastElementChild;


/**
 * Returns the first next sibling that is an element.
 * @param {Node} node The node to get the next sibling element of.
 * @return {Element} The next sibling of {@code node} that is an element.
 */
goog.dom.DomHelper.prototype.getNextElementSibling =
    goog.dom.getNextElementSibling;


/**
 * Returns the first previous sibling that is an element.
 * @param {Node} node The node to get the previous sibling element of.
 * @return {Element} The first previous sibling of {@code node} that is
 *     an element.
 */
goog.dom.DomHelper.prototype.getPreviousElementSibling =
    goog.dom.getPreviousElementSibling;


/**
 * Returns the next node in source order from the given node.
 * @param {Node} node The node.
 * @return {Node} The next node in the DOM tree, or null if this was the last
 *     node.
 */
goog.dom.DomHelper.prototype.getNextNode =
    goog.dom.getNextNode;


/**
 * Returns the previous node in source order from the given node.
 * @param {Node} node The node.
 * @return {Node} The previous node in the DOM tree, or null if this was the
 *     first node.
 */
goog.dom.DomHelper.prototype.getPreviousNode =
    goog.dom.getPreviousNode;


/**
 * Whether the object looks like a DOM node.
 * @param {*} obj The object being tested for node likeness.
 * @return {boolean} Whether the object looks like a DOM node.
 */
goog.dom.DomHelper.prototype.isNodeLike = goog.dom.isNodeLike;


/**
 * Whether a node contains another node.
 * @param {Node} parent The node that should contain the other node.
 * @param {Node} descendant The node to test presence of.
 * @return {boolean} Whether the parent node contains the descendent node.
 */
goog.dom.DomHelper.prototype.contains = goog.dom.contains;


/**
 * Returns the owner document for a node.
 * @param {Node} node The node to get the document for.
 * @return {!Document} The document owning the node.
 */
goog.dom.DomHelper.prototype.getOwnerDocument = goog.dom.getOwnerDocument;


/**
 * Cross browser function for getting the document element of an iframe.
 * @param {Element} iframe Iframe element.
 * @return {!Document} The frame content document.
 */
goog.dom.DomHelper.prototype.getFrameContentDocument =
    goog.dom.getFrameContentDocument;


/**
 * Cross browser function for getting the window of a frame or iframe.
 * @param {HTMLIFrameElement|HTMLFrameElement} frame Frame element.
 * @return {Window} The window associated with the given frame.
 */
goog.dom.DomHelper.prototype.getFrameContentWindow =
    goog.dom.getFrameContentWindow;


/**
 * Cross browser function for setting the text content of an element.
 * @param {Element} element The element to change the text content of.
 * @param {string} text The string that should replace the current element
 *     content with.
 */
goog.dom.DomHelper.prototype.setTextContent = goog.dom.setTextContent;


/**
 * Finds the first descendant node that matches the filter function. This does
 * a depth first search.
 * @param {Node} root The root of the tree to search.
 * @param {function(Node) : boolean} p The filter function.
 * @return {Node|undefined} The found node or undefined if none is found.
 */
goog.dom.DomHelper.prototype.findNode = goog.dom.findNode;


/**
 * Finds all the descendant nodes that matches the filter function. This does a
 * depth first search.
 * @param {Node} root The root of the tree to search.
 * @param {function(Node) : boolean} p The filter function.
 * @return {Array.<Node>} The found nodes or an empty array if none are found.
 */
goog.dom.DomHelper.prototype.findNodes = goog.dom.findNodes;


/**
 * Returns the text contents of the current node, without markup. New lines are
 * stripped and whitespace is collapsed, such that each character would be
 * visible.
 *
 * In browsers that support it, innerText is used.  Other browsers attempt to
 * simulate it via node traversal.  Line breaks are canonicalized in IE.
 *
 * @param {Node} node The node from which we are getting content.
 * @return {string} The text content.
 */
goog.dom.DomHelper.prototype.getTextContent = goog.dom.getTextContent;


/**
 * Returns the text length of the text contained in a node, without markup. This
 * is equivalent to the selection length if the node was selected, or the number
 * of cursor movements to traverse the node. Images & BRs take one space.  New
 * lines are ignored.
 *
 * @param {Node} node The node whose text content length is being calculated.
 * @return {number} The length of {@code node}'s text content.
 */
goog.dom.DomHelper.prototype.getNodeTextLength = goog.dom.getNodeTextLength;


/**
 * Returns the text offset of a node relative to one of its ancestors. The text
 * length is the same as the length calculated by
 * {@code goog.dom.getNodeTextLength}.
 *
 * @param {Node} node The node whose offset is being calculated.
 * @param {Node=} opt_offsetParent Defaults to the node's owner document's body.
 * @return {number} The text offset.
 */
goog.dom.DomHelper.prototype.getNodeTextOffset = goog.dom.getNodeTextOffset;


/**
 * Walks up the DOM hierarchy returning the first ancestor that has the passed
 * tag name and/or class name. If the passed element matches the specified
 * criteria, the element itself is returned.
 * @param {Node} element The DOM node to start with.
 * @param {?(goog.dom.TagName|string)=} opt_tag The tag name to match (or
 *     null/undefined to match only based on class name).
 * @param {?string=} opt_class The class name to match (or null/undefined to
 *     match only based on tag name).
 * @return {Element} The first ancestor that matches the passed criteria, or
 *     null if no match is found.
 */
goog.dom.DomHelper.prototype.getAncestorByTagNameAndClass =
    goog.dom.getAncestorByTagNameAndClass;


/**
 * Walks up the DOM hierarchy returning the first ancestor that has the passed
 * class name. If the passed element matches the specified criteria, the
 * element itself is returned.
 * @param {Node} element The DOM node to start with.
 * @param {string} class The class name to match.
 * @return {Element} The first ancestor that matches the passed criteria, or
 *     null if none match.
 */
goog.dom.DomHelper.prototype.getAncestorByClass =
    goog.dom.getAncestorByClass;


/**
 * Walks up the DOM hierarchy returning the first ancestor that passes the
 * matcher function.
 * @param {Node} element The DOM node to start with.
 * @param {function(Node) : boolean} matcher A function that returns true if the
 *     passed node matches the desired criteria.
 * @param {boolean=} opt_includeNode If true, the node itself is included in
 *     the search (the first call to the matcher will pass startElement as
 *     the node to test).
 * @param {number=} opt_maxSearchSteps Maximum number of levels to search up the
 *     dom.
 * @return {Node} DOM node that matched the matcher, or null if there was
 *     no match.
 */
goog.dom.DomHelper.prototype.getAncestor = goog.dom.getAncestor;
// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Definition of the FancyWindow class. Please minimize
 * dependencies this file has on other closure classes as any dependency it
 * takes won't be able to use the logging infrastructure.
 *
 * This is a pretty hacky implementation, aimed at making debugging of large
 * applications more manageable.
 *
 * @see ../demos/debug.html
 */


goog.provide('goog.debug.FancyWindow');

goog.require('goog.debug.DebugWindow');
goog.require('goog.debug.LogManager');
goog.require('goog.debug.Logger');
goog.require('goog.debug.Logger.Level');
goog.require('goog.dom.DomHelper');
goog.require('goog.object');
goog.require('goog.string');
goog.require('goog.userAgent');



/**
 * Provides a Fancy extension to the DebugWindow class.  Allows filtering based
 * on loggers and levels.
 *
 * @param {string=} opt_identifier Idenitifier for this logging class.
 * @param {string=} opt_prefix Prefix pre-pended to messages.
 * @constructor
 * @extends {goog.debug.DebugWindow}
 */
goog.debug.FancyWindow = function(opt_identifier, opt_prefix) {
  this.readOptionsFromLocalStorage_();
  goog.base(this, opt_identifier, opt_prefix);
};
goog.inherits(goog.debug.FancyWindow, goog.debug.DebugWindow);


/**
 * Constant indicating if we are able to use localStorage to persist filters
 * @type {boolean}
 */
goog.debug.FancyWindow.HAS_LOCAL_STORE = (function() {
  /** @preserveTry */
  try {
    return !!window['localStorage'].getItem;
  } catch (e) {}
  return false;
})();


/**
 * Constant defining the prefix to use when storing log levels
 * @type {string}
 */
goog.debug.FancyWindow.LOCAL_STORE_PREFIX = 'fancywindow.sel.';


/**
 * Write to the log and maybe scroll into view
 * @param {string} html HTML to post to the log.
 * @protected
 * @suppress {underscore}
 */
goog.debug.FancyWindow.prototype.writeBufferToLog_ = function(html) {
  this.lastCall_ = goog.now();
  if (this.hasActiveWindow()) {
    var logel = this.dh_.getElement('log');

    // Work out if scrolling is needed before we add the content
    var scroll =
        logel.scrollHeight - (logel.scrollTop + logel.offsetHeight) <= 100;

    for (var i = 0; i < this.outputBuffer_.length; i++) {
      var div = this.dh_.createDom('div', 'logmsg');
      div.innerHTML = this.outputBuffer_[i];
      logel.appendChild(div);
    }
    this.outputBuffer_.length = 0;
    this.resizeStuff_();

    if (scroll) {
      logel.scrollTop = logel.scrollHeight;
    }
  }
};


/**
 * Writes the initial HTML of the debug window
 * @protected
 * @suppress {underscore}
 */
goog.debug.FancyWindow.prototype.writeInitialDocument_ = function() {
  if (!this.hasActiveWindow()) {
    return;
  }

  var doc = this.win_.document;
  doc.open();
  doc.write(this.getHtml_());
  doc.close();

  (goog.userAgent.IE ? doc.body : this.win_).onresize =
      goog.bind(this.resizeStuff_, this);

  // Create a dom helper for the logging window
  this.dh_ = new goog.dom.DomHelper(doc);

  // Don't use events system to reduce dependencies
  this.dh_.getElement('openbutton').onclick =
      goog.bind(this.openOptions_, this);
  this.dh_.getElement('closebutton').onclick =
      goog.bind(this.closeOptions_, this);
  this.dh_.getElement('clearbutton').onclick =
      goog.bind(this.clear_, this);
  this.dh_.getElement('exitbutton').onclick =
      goog.bind(this.exit_, this);

  this.writeSavedMessages_();
};


/**
 * Show the options menu.
 * @return {boolean} false.
 * @private
 */
goog.debug.FancyWindow.prototype.openOptions_ = function() {
  var el = this.dh_.getElement('optionsarea');
  el.innerHTML = '';

  var loggers = goog.debug.FancyWindow.getLoggers_();
  var dh = this.dh_;
  for (var i = 0; i < loggers.length; i++) {
    var logger = goog.debug.Logger.getLogger(loggers[i]);
    var curlevel = logger.getLevel() ? logger.getLevel().name : 'INHERIT';
    var div = dh.createDom('div', {},
        this.getDropDown_('sel' + loggers[i], curlevel),
        dh.createDom('span', {}, loggers[i] || '(root)'));
    el.appendChild(div);
  }

  this.dh_.getElement('options').style.display = 'block';
  return false;
};


/**
 * Make a drop down for the log levels.
 * @param {string} id Logger id.
 * @param {string} selected What log level is currently selected.
 * @return {Element} The newly created 'select' DOM element.
 * @private
 */
goog.debug.FancyWindow.prototype.getDropDown_ = function(id, selected) {
  var dh = this.dh_;
  var sel = dh.createDom('select', {'id': id});
  var levels = goog.debug.Logger.Level.PREDEFINED_LEVELS;
  for (var i = 0; i < levels.length; i++) {
    var level = levels[i];
    var option = dh.createDom('option', {}, level.name);
    if (selected == level.name) {
      option.selected = true;
    }
    sel.appendChild(option);
  }
  sel.appendChild(dh.createDom('option',
      {'selected': selected == 'INHERIT'}, 'INHERIT'));
  return sel;
};


/**
 * Close the options menu.
 * @return {boolean} The value false.
 * @private
 */
goog.debug.FancyWindow.prototype.closeOptions_ = function() {
  this.dh_.getElement('options').style.display = 'none';
  var loggers = goog.debug.FancyWindow.getLoggers_();
  var dh = this.dh_;
  for (var i = 0; i < loggers.length; i++) {
    var logger = goog.debug.Logger.getLogger(loggers[i]);
    var sel = dh.getElement('sel' + loggers[i]);
    var level = sel.options[sel.selectedIndex].text;
    if (level == 'INHERIT') {
      logger.setLevel(null);
    } else {
      logger.setLevel(goog.debug.Logger.Level.getPredefinedLevel(level));
    }
  }
  this.writeOptionsToLocalStorage_();
  return false;
};


/**
 * Resize the lof elements
 * @private
 */
goog.debug.FancyWindow.prototype.resizeStuff_ = function() {
  var dh = this.dh_;
  var logel = dh.getElement('log');
  var headel = dh.getElement('head');
  logel.style.top = headel.offsetHeight + 'px';
  logel.style.height = (dh.getDocument().body.offsetHeight -
      headel.offsetHeight - (goog.userAgent.IE ? 4 : 0)) + 'px';
};


/**
 * Handles the user clicking the exit button, disabled the debug window and
 * closes the popup.
 * @param {Event} e Event object.
 * @private
 */
goog.debug.FancyWindow.prototype.exit_ = function(e) {
  this.setEnabled(false);
  if (this.win_) {
    this.win_.close();
  }
};


/**
 * @return {string} The style rule text, for inclusion in the initial HTML.
 */
goog.debug.FancyWindow.prototype.getStyleRules = function() {
  return goog.base(this, 'getStyleRules') +
      'html,body{height:100%;width:100%;margin:0px;padding:0px;' +
      'background-color:#FFF;overflow:hidden}' +
      '*{}' +
      '.logmsg{border-bottom:1px solid #CCC;padding:2px;font:90% monospace}' +
      '#head{position:absolute;width:100%;font:x-small arial;' +
      'border-bottom:2px solid #999;background-color:#EEE;}' +
      '#head p{margin:0px 5px;}' +
      '#log{position:absolute;width:100%;background-color:#FFF;}' +
      '#options{position:absolute;right:0px;width:50%;height:100%;' +
      'border-left:1px solid #999;background-color:#DDD;display:none;' +
      'padding-left: 5px;font:normal small arial;overflow:auto;}' +
      '#openbutton,#closebutton{text-decoration:underline;color:#00F;cursor:' +
      'pointer;position:absolute;top:0px;right:5px;font:x-small arial;}' +
      '#clearbutton{text-decoration:underline;color:#00F;cursor:' +
      'pointer;position:absolute;top:0px;right:80px;font:x-small arial;}' +
      '#exitbutton{text-decoration:underline;color:#00F;cursor:' +
      'pointer;position:absolute;top:0px;right:50px;font:x-small arial;}' +
      'select{font:x-small arial;margin-right:10px;}' +
      'hr{border:0;height:5px;background-color:#8c8;color:#8c8;}';
};


/**
 * Return the default HTML for the debug window
 * @return {string} Html.
 * @private
 */
goog.debug.FancyWindow.prototype.getHtml_ = function() {
  return '' +
      '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"' +
      '"http://www.w3.org/TR/html4/loose.dtd">' +
      '<html><head><title>Logging: ' + this.identifier_ + '</title>' +
      '<style>' + this.getStyleRules() + '</style>' +
      '</head><body>' +
      '<div id="log" style="overflow:auto"></div>' +
      '<div id="head">' +
      '<p><b>Logging: ' + this.identifier_ + '</b></p><p>' +
      this.welcomeMessage + '</p>' +
      '<span id="clearbutton">clear</span>' +
      '<span id="exitbutton">exit</span>' +
      '<span id="openbutton">options</span>' +
      '</div>' +
      '<div id="options">' +
      '<big><b>Options:</b></big>' +
      '<div id="optionsarea"></div>' +
      '<span id="closebutton">save and close</span>' +
      '</div>' +
      '</body></html>';
};


/**
 * Write logger levels to localStorage if possible.
 * @private
 */
goog.debug.FancyWindow.prototype.writeOptionsToLocalStorage_ = function() {
  if (!goog.debug.FancyWindow.HAS_LOCAL_STORE) {
    return;
  }
  var loggers = goog.debug.FancyWindow.getLoggers_();
  var storedKeys = goog.debug.FancyWindow.getStoredKeys_();
  for (var i = 0; i < loggers.length; i++) {
    var key = goog.debug.FancyWindow.LOCAL_STORE_PREFIX + loggers[i];
    var level = goog.debug.Logger.getLogger(loggers[i]).getLevel();
    if (key in storedKeys) {
      if (!level) {
        window.localStorage.removeItem(key);
      } else if (window.localStorage.getItem(key) != level.name) {
        window.localStorage.setItem(key, level.name);
      }
    } else if (level) {
      window.localStorage.setItem(key, level.name);
    }
  }
};


/**
 * Sync logger levels with any values stored in localStorage.
 * @private
 */
goog.debug.FancyWindow.prototype.readOptionsFromLocalStorage_ = function() {
  if (!goog.debug.FancyWindow.HAS_LOCAL_STORE) {
    return;
  }
  var storedKeys = goog.debug.FancyWindow.getStoredKeys_();
  for (var key in storedKeys) {
    var loggerName = key.replace(goog.debug.FancyWindow.LOCAL_STORE_PREFIX, '');
    var logger = goog.debug.Logger.getLogger(loggerName);
    var curLevel = logger.getLevel();
    var storedLevel = window.localStorage.getItem(key).toString();
    if (!curLevel || curLevel.toString() != storedLevel) {
      logger.setLevel(goog.debug.Logger.Level.getPredefinedLevel(storedLevel));
    }
  }
};


/**
 * Helper function to create a list of locally stored keys. Used to avoid
 * expensive localStorage.getItem() calls.
 * @return {Object} List of keys.
 * @private
 */
goog.debug.FancyWindow.getStoredKeys_ = function() {
  var storedKeys = {};
  for (var i = 0, len = window.localStorage.length; i < len; i++) {
    var key = window.localStorage.key(i);
    if (key != null && goog.string.startsWith(
        key, goog.debug.FancyWindow.LOCAL_STORE_PREFIX)) {
      storedKeys[key] = true;
    }
  }
  return storedKeys;
};


/**
 * Gets a sorted array of all the loggers registered
 * @return {Array} Array of logger idents, e.g. goog.net.XhrIo.
 * @private
 */
goog.debug.FancyWindow.getLoggers_ = function() {
  var loggers = goog.object.getKeys(goog.debug.LogManager.getLoggers());
  loggers.sort();
  return loggers;
};
/**
 * Copyright 2000-2011 Athanasios Polychronakis. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * 
 * @author Athanasios Polychronakis <thanpolas@gmail.com>
 *
 *
 *
 *********
 * Parses the JS injections in the html file as page is loaded
 * createdate 24/May/2011
 *
 */

goog.provide('web.system.tagLander');


goog.require('core.error');
goog.require('core.user');


/**
 * Called within a script tag in html, invoked by the server
 * for passing extra objects in the js engine
 *
 * @param {array} arr the object we want to inject
 * @return {void}
 */
web.system.tagLander = function(arr)
{

  var log = goog.debug.Logger.getLogger('web.system.tagLander');

  log.info('Init');

  web.system.injArr = arr;
}; // method web.system.tagLander

/**
 * Fired when DOM is ready, this method parses injected
 * data objects from server. Check out web.system.tagLander
 *
 * Current tags:
 *
 * 5   :: Core invironment (devel / prod)
 * 55  :: Campaign visitor (FB)
 * 56  :: Perm Cook data object (metadata)
 * 121 :: New User
 * 102 :: User is authed
 * 20  :: Visitor is on mobile
 * 25  :: We see visitor for first time. Check if cookies enabled
 *        and notify server to store perm cookie
 *
 *
 * @return void
 */
web.system.tagLanderParse = function()
{
  try {


    var w = web;
    var c = core;
    var g = goog;
    //go through the array and check for values
    var arr = w.system.injArr;
    var log = g.debug.Logger.getLogger('web.system.tagLanderParse');

    log.info('Init');

    var obj = null;

    // check Core Env
    obj = c.arFind(arr, 'action', 5);
    if (!g.isNull(obj)) {
      // we found core states assign to web
      if (g.isBoolean(obj.obj['DEVEL']))
        c.DEBUG = obj.obj['DEVEL'];
      if (g.isBoolean(obj.obj['PRODUCTION']))
        c.ONSERVER = obj.obj['PRODUCTION'];
      if (g.isBoolean(obj.obj['PREPROD']))
        c.PREPROD = obj.obj['PREPROD'];

      // now inform google
      g.DEBUG = c.DEBUG;
      // open debug win if in debug
      if (c.DEBUG || c.PREPROD)
        w.openFancyWin();
      else
      // check if we have the magic 'debugwindow' var in the url params
      //var uri = g.Uri(window.location.href);
      //if (g.isString(uri.getParameterValue('debugwindow')))
      //    s.debug.openFancyWin();

      // check if we are on server and enable tracking if
      // it is there
      if (c.ONSERVER)
        c.WEBTRACK = true; // enable tracking



      log.info('Core Environment Set. DEBUG:' + c.DEBUG + ' ONSERVER:' + c.ONSERVER + ' PREPROD:' + c.PREPROD);

    }

    // now if the user is logged in
    obj = c.arFind(arr, 'action', 102);
    if (!g.isNull(obj)) {
      log.info('Got action 102 - user is logged in');
      if (!g.isObject(obj.obj)) {
        log.warning('obj.obj is not an object. obj:' + g.debug.expose(obj));
        return;
      }
      // user is logged in...
      c.user.auth.login(obj.obj, function(state, opt_msg){}, c.STATIC.SOURCES.WEB);
    }



    /**
     * The rest of the method's payload will get
     * executed when we are ready
     *
     * @private
     * @return void
     */
    function _parse() {
      try {
      log.info('_parse STARTS TO EXECUTE');

      var l = arr.length;
      if (!l) return; //if empty exit
      while(l--) {
        obj = arr[l];
        if (!g.isNumber(obj.action)) continue; //invalid

        switch(obj.action) {
          // visitor from campaign
          case 55:
            var cdata = obj['obj'];
            log.info('ACTION 55 :: Visitor from campaign. Source' + cdata['source'] + ' Campaign:' + cdata['campaign'] + ' version:' + cdata['version']);
            c.analytics.trackPageview('/campaigns/fb');
            c.analytics.trackEvent('Campaigns', cdata['source'], cdata['campaign'], cdata['version'], 1);

          break;
          // new user
          case 121:
            log.info('ACTION 121 :: New user');
            // trigger new user event
            c.user.auth.events.runEvent('newUser');

          break;

          // visitor is on mobile
          case 20:
            log.info('ACTION 20 :: Mobile visitor');
            // mobile type is on:
            // obj['obj']['mobile']
            w.MOB = true;
            w.ui.mobile.Init();

          break;

          case 25:
            log.info('ACTION 25 :: Check write cookies for permcook');
            if (w.cookies.isEnabled()) {
              // cookies enabled, notify server
              log.info('Cookies enabled, notifying server');
              var aj = new c.ajax('/users/pc', {
                    postMethod: 'POST'
                   , showMsg: false // don't show default success message
                   , showErrorMsg: false // don't show error message if it happens
                  });
              aj.callback = function(res) {
                // check if we got a new metadataObject ...
                if (g.isObject(res['metadataObject'])) {
                  c.analytics.trackMP('newVisitor');
                  c.metadata.newObject(res['metadataObject']);
                }
              }
              // send ajax request
              aj.send();

            }
          break;
 

          /**
           * 56 :: permcook data
           * Keys:
           * permId: Number
           * lastSeenDate: timestamp
           * visitCounter: Number
           * metadata: string (json encoded metadata)
           */
          case 56:
            log.info('ACTION 56 :: Perm Cook metadata');
            c.metadata.newObject(obj['obj']);
          break;
        }
      }
      
      // trigger ready watch for rest of fucntionality
      c.ready.check('ready', 'alldone');
      } catch (e) {
        core.error(e);
      }
    }




    // check if we are ready (we are not) and attach
    // ourselves to the main ready watch
    if (!c.READY) {
      c.ready.addFunc('main', _parse);
    } else {
      _parse();
    }
    
    
    


    return;





  } catch (e) {
    core.error(e);
  }
}; // method web.system.tagLanderParse
goog.provide('web.system');

goog.require('web.system.tagLander');
/**
 * Copyright 2000-2011 Athanasios Polychronakis. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * 
 * @author Athanasios Polychronakis <thanpolas@gmail.com>
 *
 *
 *
 *********
 * createdate 30/Apr/2011
 *
 */

goog.provide('web');

goog.require('core');

goog.require('web.system');
goog.require('web.cookies');

goog.require('web.jq.ext');

goog.require('web.user');



goog.require('goog.debug');
goog.require('goog.debug.FancyWindow');
goog.require('goog.debug.Logger');
goog.require('goog.debug.LogManager');


// Add your required files from here on...
goog.require('web.myapp');




/**
 * Our global variables
 *
 * @type {Object}
 */
web.db = {
  fbClicked: false
}

/**
 * If visitor is accessing our page from a mobile device
 *
 * @type {boolean}
 */
web.MOB = false;

/**
 * Set DOM Ready main hook
 *
 * @param {Function}
 */
$().ready(function(){
  web.INIT();
});

/**
 * The main initialiser for web
 * Triggers when we have a DOCUMENT READY event from DOM
 *
 * @return {void}
 */
web.INIT = function () {


  var w = web, c = core;

  var log = c.log('web.INIT');

  log.info('Init');
  var win = window;
  var j = win.jQuery;
  
  c.db.URL = win.location.protocol + '//' + win.location.hostname;

  // execute the tag lander to parse injected JS instructions from
  // the server
  w.system.tagLanderParse();
  
  // Init the core framework
  c.Init();

  // initialize the web2.0 (FB/Twitter)
  // AUTH BALL IS HERE
  c.fb.InitWeb();

  // start loading twitter's widgets after 500ms
  setTimeout(function(){
    var twString = '<script src="http://platform.twitter.com/widgets.js" type="text/javascript"></script>';
    j('body').append(twString);
    // start init cycle for our twitter lib
    c.twit.Init();
  }, 500);  

}; // web.INIT


/**
 * Will popup a debuging funcy window
 *
 */
web.openFancyWin = function () {
  var debugWindow = new goog.debug.FancyWindow('main');
  debugWindow.setEnabled(true);
  debugWindow.init();
}; // method web.openFancyWin
