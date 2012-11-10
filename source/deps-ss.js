// This file was autogenerated by source/closure-library//closure/bin/build/depswriter.py.
// Please do not edit.
goog.addDependency('../../../ss/core/config/config.Module.js', ['ssd.Config'], ['ssd.StringPath', 'ssd.debug']);
goog.addDependency('../../../ss/core/constants.js', ['ssd.types'], []);
goog.addDependency('../../../ss/core/core.js', ['ssd.Core', 'ssd.core'], ['ssd.Config', 'ssd.Module', 'ssd.metadata', 'ssd.metrics', 'ssd.server2js', 'ssd.user.Auth', 'ssd.user.auth.Facebook', 'ssd.user.auth.Twitter', 'ssd.web.cookies']);
goog.addDependency('../../../ss/core/error.js', ['ssd.error'], []);
goog.addDependency('../../../ss/core/exports.js', ['ssd.exports'], ['ssd.Core', 'ssd.core', 'ssd.metrics', 'ssd.server2js', 'ssd.user.Auth', 'ssd.user.auth.Facebook', 'ssd.user.auth.Twitter']);
goog.addDependency('../../../ss/core/network/ajax.js', ['ssd.ajax'], []);
goog.addDependency('../../../ss/helpers/date.core.js', ['ssd.date'], ['goog.date', 'goog.date.DateTime']);
goog.addDependency('../../../ss/helpers/debug.js', ['ssd.debug'], ['goog.debug', 'goog.debug.FancyWindow', 'goog.debug.LogManager', 'goog.debug.Logger']);
goog.addDependency('../../../ss/helpers/fancyGetSet.js', ['ssd.FancyGetSet'], []);
goog.addDependency('../../../ss/helpers/helpers.js', ['ssd.helpers'], ['goog.array', 'goog.object']);
goog.addDependency('../../../ss/libs/cookies.js', ['ssd.web.cookies'], []);
goog.addDependency('../../../ss/libs/eventTarget.js', ['ssd.events.EventTarget'], ['goog.events', 'goog.events.EventTarget', 'ssd.types']);
goog.addDependency('../../../ss/libs/invocator.js', ['ssd.invocator'], []);
goog.addDependency('../../../ss/libs/module.js', ['ssd.Module'], ['ssd.events.EventTarget']);
goog.addDependency('../../../ss/main.js', ['ssd'], ['ssd.Config', 'ssd.Core', 'ssd.Server2js', 'ssd.ajax', 'ssd.debug', 'ssd.error', 'ssd.exports', 'ssd.helpers', 'ssd.metadata', 'ssd.metrics', 'ssd.server', 'ssd.user.auth.Facebook', 'ssd.user.auth.Twitter', 'ssd.web.cookies']);
goog.addDependency('../../../ss/modules/metrics/googleAnalytics.js', ['ssd.metrics.ga'], []);
goog.addDependency('../../../ss/modules/metrics/metrics.js', ['ssd.metrics'], ['ssd.metrics.ga', 'ssd.metrics.mixpanel']);
goog.addDependency('../../../ss/modules/metrics/mixpanel.js', ['ssd.metrics.mixpanel'], []);
goog.addDependency('../../../ss/modules/user/auth/authPlugins/authPluginInterface.js', ['ssd.user.auth.PluginInterface'], []);
goog.addDependency('../../../ss/modules/user/auth/authPlugins/authPluginModule.js', ['ssd.user.auth.PluginModule'], ['ssd.FancyGetSet', 'ssd.Module', 'ssd.user.Auth']);
goog.addDependency('../../../ss/modules/user/auth/authPlugins/facebook.auth.js', ['ssd.user.auth.Facebook', 'ssd.user.auth.Facebook.EventType'], ['ssd.user.Auth', 'ssd.user.Auth.EventType', 'ssd.user.auth.PluginModule']);
goog.addDependency('../../../ss/modules/user/auth/authPlugins/twitter.auth.js', ['ssd.user.auth.Twitter', 'ssd.user.auth.Twitter.EventType'], ['ssd.user.Auth', 'ssd.user.Auth.EventType', 'ssd.user.auth.PluginModule']);
goog.addDependency('../../../ss/modules/user/auth/user.auth.js', ['ssd.user.Auth', 'ssd.user.Auth.Error', 'ssd.user.Auth.EventType'], ['ssd.Config', 'ssd.DynamicMap', 'ssd.Module', 'ssd.invocator', 'ssd.user.OwnItem', 'ssd.user.types']);
goog.addDependency('../../../ss/modules/user/metadata.js', ['ssd.metadata'], []);
goog.addDependency('../../../ss/modules/user/user.item.js', ['ssd.user.Item', 'ssd.user.Item.EventType'], ['ssd.DynamicMap', 'ssd.user.types']);
goog.addDependency('../../../ss/modules/user/user.ownItem.js', ['ssd.user.OwnItem'], ['ssd.user.Item']);
goog.addDependency('../../../ss/modules/user/user.types.js', ['ssd.user.types'], ['ssd.Map']);
goog.addDependency('../../../ss/structs/dynamicMap.js', ['ssd.DynamicMap', 'ssd.DynamicMap.EventType'], ['goog.events.EventTarget', 'goog.object', 'ssd.Map']);
goog.addDependency('../../../ss/structs/ssdMap.js', ['ssd.Map'], ['goog.structs.Map']);
goog.addDependency('../../../ss/structs/stringPath.js', ['ssd.StringPath', 'ssd.StringPath.Errors'], []);
