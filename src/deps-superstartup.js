// This file was autogenerated by closure-library//closure/bin/build/depswriter.py.
// Please do not edit.
goog.addDependency('../../../src/config/config.lib.js', ['ssd.Config'], ['ssd.debug', 'ssd.invocator', 'ssd.structs.FancyGetSet', 'ssd.structs.StringPath']);
goog.addDependency('../../../src/core/constants.js', ['ssd.types'], []);
goog.addDependency('../../../src/core/core.js', ['ssd.Core', 'ssd.core'], ['ssd.Config', 'ssd.Module', 'ssd.metadata', 'ssd.metrics', 'ssd.register', 'ssd.user.Auth', 'ssd.user.auth.Facebook', 'ssd.user.auth.Twitter', 'ssd.web.cookies']);
goog.addDependency('../../../src/core/error.js', ['ssd.error'], []);
goog.addDependency('../../../src/core/exports.js', ['ssd.exports'], ['ssd.Core', 'ssd.core', 'ssd.metrics', 'ssd.user.Auth', 'ssd.user.auth.Facebook', 'ssd.user.auth.Twitter']);
goog.addDependency('../../../src/core/the-register.js', ['ssd.Register', 'ssd.register'], ['goog.array', 'goog.async.Deferred']);
goog.addDependency('../../../src/helpers/date.core.js', ['ssd.date'], ['goog.date', 'goog.date.DateTime']);
goog.addDependency('../../../src/helpers/debug.js', ['ssd.debug'], ['goog.debug', 'goog.debug.FancyWindow', 'goog.debug.LogManager', 'goog.debug.Logger']);
goog.addDependency('../../../src/helpers/helpers.js', ['ssd.helpers'], ['goog.array', 'goog.object']);
goog.addDependency('../../../src/libs/cookies.js', ['ssd.web.cookies'], []);
goog.addDependency('../../../src/libs/eventTarget.js', ['ssd.events.EventTarget'], ['goog.events', 'goog.events.EventTarget', 'ssd.types']);
goog.addDependency('../../../src/libs/invocator.js', ['ssd.invocator'], []);
goog.addDependency('../../../src/libs/module.js', ['ssd.Module'], ['ssd.events.EventTarget']);
goog.addDependency('../../../src/main.js', ['ssd'], ['ssd.Config', 'ssd.Core', 'ssd.ajax', 'ssd.debug', 'ssd.error', 'ssd.exports', 'ssd.helpers', 'ssd.user.auth.Facebook', 'ssd.user.auth.Twitter']);
goog.addDependency('../../../src/modules/auth/plugins/authPluginInterface.js', ['ssd.user.auth.PluginInterface'], []);
goog.addDependency('../../../src/modules/auth/plugins/authPluginModule.js', ['ssd.user.auth.PluginModule'], ['ssd.Module', 'ssd.user.Auth']);
goog.addDependency('../../../src/modules/auth/plugins/facebook.auth.js', ['ssd.user.auth.Facebook', 'ssd.user.auth.Facebook.EventType'], ['goog.async.Deferred', 'ssd.register', 'ssd.user.Auth', 'ssd.user.Auth.EventType', 'ssd.user.auth.PluginModule']);
goog.addDependency('../../../src/modules/auth/plugins/twitter.auth.js', ['ssd.user.auth.Twitter', 'ssd.user.auth.Twitter.EventType'], ['goog.async.Deferred', 'ssd.register', 'ssd.user.Auth', 'ssd.user.Auth.EventType', 'ssd.user.auth.PluginModule']);
goog.addDependency('../../../src/modules/auth/user.auth.controller.js', ['ssd.user.Auth', 'ssd.user.Auth.Error', 'ssd.user.Auth.EventType'], ['goog.async.Deferred', 'ssd.invocator', 'ssd.register', 'ssd.structs.DynamicMap', 'ssd.structs.Map', 'ssd.user.AuthModel', 'ssd.user.OwnItem', 'ssd.user.types']);
goog.addDependency('../../../src/modules/auth/user.auth.model.js', ['ssd.user.AuthModel'], ['ssd.Module']);
goog.addDependency('../../../src/modules/metrics/googleAnalytics.js', ['ssd.metrics.ga'], []);
goog.addDependency('../../../src/modules/metrics/metrics.js', ['ssd.metrics'], ['ssd.metrics.ga', 'ssd.metrics.mixpanel']);
goog.addDependency('../../../src/modules/metrics/mixpanel.js', ['ssd.metrics.mixpanel'], []);
goog.addDependency('../../../src/modules/user/metadata.js', ['ssd.metadata'], []);
goog.addDependency('../../../src/modules/user/user.item.js', ['ssd.user.Item', 'ssd.user.Item.EventType'], ['ssd.structs.DynamicMap', 'ssd.user.types']);
goog.addDependency('../../../src/modules/user/user.ownItem.js', ['ssd.user.OwnItem'], ['ssd.user.Item']);
goog.addDependency('../../../src/modules/user/user.types.js', ['ssd.user.types'], ['ssd.structs.Map']);
goog.addDependency('../../../src/network/ajax.js', ['ssd.ajax'], []);
goog.addDependency('../../../src/structs/dynamicLinkedMap.js', ['ssd.structs.DynamicLinkedMap', 'ssd.structs.DynamicLinkedMap.EventType'], ['goog.events.EventTarget', 'goog.object', 'ssd.structs.DynamicMap', 'ssd.structs.LinkedMap']);
goog.addDependency('../../../src/structs/dynamicMap.js', ['ssd.structs.DynamicMap', 'ssd.structs.DynamicMap.EventType', 'ssd.structs.DynamicMap.Operation'], ['goog.events.EventTarget', 'goog.object', 'ssd.structs.Map']);
goog.addDependency('../../../src/structs/fancyGetSet.js', ['ssd.structs.FancyGetSet'], ['ssd.invocator']);
goog.addDependency('../../../src/structs/idGenerator.js', ['ssd.structs.IdGenerator'], ['goog.object']);
goog.addDependency('../../../src/structs/ssdLinkedMap.js', ['ssd.structs.LinkedMap'], ['goog.array', 'goog.object', 'goog.structs.LinkedMap', 'ssd.structs.IdGenerator', 'ssd.structs.Map']);
goog.addDependency('../../../src/structs/ssdMap.js', ['ssd.structs.Map'], ['goog.Disposable', 'goog.object', 'goog.structs.Map', 'ssd.structs.IdGenerator']);
goog.addDependency('../../../src/structs/stringPath.js', ['ssd.structs.StringPath', 'ssd.structs.StringPath.Errors'], []);
