// This file was autogenerated by calcdeps.py
goog.addDependency("../../../deps.js", [], []);
goog.addDependency("../../../init.js", ['__initFile__'], ['ss', 'showcase']);
goog.addDependency("../../../showcase/main.js", ['showcase'], ['ss', 'showcase.widget.showObject']);
goog.addDependency("../../../showcase/widgets/showObject.js", ['showcase.widget.showObject'], ['goog.debug']);
goog.addDependency("../../../ss/api.js", ['s'], []);
goog.addDependency("../../../ss/main.js", ['ss', 'ss.config', 'ss.Core'], ['ss.debug', 'ss.metrics', 'ss.error', 'ss.metadata', 'ss.ajax', 'ss.ready', 'ss.Events', 'ss.user', 'ss.Config', 'ss.user.auth.Facebook', 'ss.user.auth.Twitter', 'ss.helpers', 'ss.exports', 'ss.server2js', 'ss.web.system', 'ss.web.cookies', 'ss.web.user', 's']);
goog.addDependency("../../../ss/ssAPI.js", [], []);
goog.addDependency("../../../ss/config/config.Module.js", ['ss.Config'], ['ss.StringPath']);
goog.addDependency("../../../ss/config/mappings.user.js", [], []);
goog.addDependency("../../../ss/ext/extAuth.main.js", ['ss.ext.auth.Main', 'ss.ext.auth.Error', 'ss.ext.auth.EventType'], ['ss.Map', 'ss.user', 'ss.Module', 'goog.object']);
goog.addDependency("../../../ss/ext/facebook/facebook.API.js", ['ss.fb.API'], ['ss.CONSTS']);
goog.addDependency("../../../ss/ext/facebook/facebook.comments.js", ['ss.fb.com'], []);
goog.addDependency("../../../ss/ext/facebook/facebook.local.js", ['ss.fb.local'], ['ss.CONSTS']);
goog.addDependency("../../../ss/ext/facebook/facebook.main.js", ['ss.fb'], ['ss.fb.local', 'ss.CONSTS', 'ss.fb.com', 'goog.Uri']);
goog.addDependency("../../../ss/ext/twitter/twitter.main.js", ['ss.twit'], []);
goog.addDependency("../../../ss/helpers/date.core.js", ['ss.date'], ['goog.date', 'goog.date.DateTime']);
goog.addDependency("../../../ss/helpers/debug.js", ['ss.debug'], ['goog.debug', 'goog.debug.LogManager', 'goog.debug.Logger', 'goog.debug.FancyWindow']);
goog.addDependency("../../../ss/helpers/fancyGetSet.js", ['ss.FancyGetSet'], []);
goog.addDependency("../../../ss/helpers/helpers.js", ['ss.helpers'], ['goog.array', 'goog.object']);
goog.addDependency("../../../ss/helpers/helpers_test.js", [], ['ss.helpers', 'goog.testing.jsunit']);
goog.addDependency("../../../ss/metrics/googleAnalytics.js", ['ss.metrics.ga'], []);
goog.addDependency("../../../ss/metrics/metrics.js", ['ss.metrics'], ['ss.metrics.ga', 'ss.metrics.mixpanel']);
goog.addDependency("../../../ss/metrics/mixpanel.js", ['ss.metrics.mixpanel'], []);
goog.addDependency("../../../ss/network/ajax.js", ['ss.ajax'], []);
goog.addDependency("../../../ss/SuperClasses/dynamicMap.js", ['ss.DynamicMap'], ['ss.Map', 'goog.events.EventTarget', 'goog.object']);
goog.addDependency("../../../ss/SuperClasses/map.js", ['ss.Map'], ['goog.structs.Map']);
goog.addDependency("../../../ss/SuperClasses/Module.js", ['ss.Module'], ['goog.events', 'goog.events.EventTarget']);
goog.addDependency("../../../ss/SuperClasses/stringPath.js", ['ss.StringPath', 'ss.StringPath.Errors'], []);
goog.addDependency("../../../ss/system/error.js", ['ss.error'], []);
goog.addDependency("../../../ss/system/events.js", ['ss.Events'], []);
goog.addDependency("../../../ss/system/exports.js", ['ss.exports'], ['ss.metrics', 'ss.server2js']);
goog.addDependency("../../../ss/system/ready.js", ['ss.ready', 'ss.ready.C'], ['goog.structs.Map']);
goog.addDependency("../../../ss/user/metadata.js", ['ss.metadata'], []);
goog.addDependency("../../../ss/user/user.item.js", ['ss.user.Item'], ['ss.DynamicMap', 'ss.user.types']);
goog.addDependency("../../../ss/user/user.login.js", ['ss.user.login'], []);
goog.addDependency("../../../ss/user/user.main.js", ['ss.user'], ['ss.user.types', 'ss.user.Auth', 'ss.user.login', 'ss.user.pub', 'ss.user.Item']);
goog.addDependency("../../../ss/user/user.pub.js", ['ss.user.pub'], []);
goog.addDependency("../../../ss/user/user.types.js", ['ss.user.types'], ['ss.Map']);
goog.addDependency("../../../ss/user/auth/authPluginInterface.js", ['ss.user.auth.PluginInterface'], []);
goog.addDependency("../../../ss/user/auth/authPluginModule.js", ['ss.user.auth.PluginModule'], ['ss.Module', 'ss.FancyGetSet', 'ss.user.Auth']);
goog.addDependency("../../../ss/user/auth/user.auth.js", ['ss.user.Auth', 'ss.user.auth.EventType', 'ss.user.auth.Error'], ['ss.Module', 'ss.DynamicMap', 'ss.user.types']);
goog.addDependency("../../../ss/user/auth/authPlugins/facebook.auth.js", ['ss.user.auth.Facebook', 'ss.user.auth.Facebook.EventType'], ['ss.user.auth.PluginModule', 'ss.user.Auth', 'ss.user.auth.EventType']);
goog.addDependency("../../../ss/user/auth/authPlugins/twitter.auth.js", ['ss.user.auth.Twitter', 'ss.user.auth.Twitter.EventType'], ['ss.user.auth.PluginModule', 'ss.user.Auth', 'ss.user.auth.EventType']);
goog.addDependency("../../../ss/web/system/cookies.js", ['ss.web.cookies'], []);
goog.addDependency("../../../ss/web/system/server2.js", ['ss.server2js'], []);
goog.addDependency("../../../ss/web/system/system.main.js", ['ss.web.system'], ['ss.server2js']);
goog.addDependency("../../../ss/web/user/auth.user.js", ['ss.web.user.auth'], ['ss.Events']);
goog.addDependency("../../../ss/web/user/login.user.js", ['ss.web.user.login'], []);
goog.addDependency("../../../ss/web/user/main.user.js", ['ss.web.user'], ['ss.web.user.auth', 'ss.web.user.login', 'ss.web.user.ui']);
goog.addDependency("../../../ss/web/user/ui.user.js", ['ss.web.user.ui'], ['ss.ready']);
goog.addDependency("../../../tests/qunit/grunt.js", [], []);
goog.addDependency("../../../tests/qunit/addons/canvas/canvas-test.js", [], []);
goog.addDependency("../../../tests/qunit/addons/canvas/qunit-canvas.js", [], []);
goog.addDependency("../../../tests/qunit/addons/close-enough/close-enough-test.js", [], []);
goog.addDependency("../../../tests/qunit/addons/close-enough/qunit-close-enough.js", [], []);
goog.addDependency("../../../tests/qunit/addons/composite/qunit-composite.js", [], []);
goog.addDependency("../../../tests/qunit/addons/junitlogger/junitlogger.js", [], []);
goog.addDependency("../../../tests/qunit/addons/phantomjs/runner.js", [], []);
goog.addDependency("../../../tests/qunit/addons/step/qunit-step.js", [], []);
goog.addDependency("../../../tests/qunit/addons/step/step-test.js", [], []);
goog.addDependency("../../../tests/qunit/qunit/qunit.js", [], []);
goog.addDependency("../../../tests/qunit/test/deepEqual.js", [], []);
goog.addDependency("../../../tests/qunit/test/logs.js", [], []);
goog.addDependency("../../../tests/qunit/test/narwhal-test.js", [], []);
goog.addDependency("../../../tests/qunit/test/node-test.js", [], []);
goog.addDependency("../../../tests/qunit/test/swarminject.js", [], []);
goog.addDependency("../../../tests/qunit/test/test.js", [], []);
goog.addDependency("../../../tests/tests/helpersTest.js", [], []);
goog.addDependency("../../../tests/tests/ss.config.test.js", [], []);
goog.addDependency("../../../third-party/jquery-1.7.1.js", [], []);
