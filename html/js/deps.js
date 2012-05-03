// This file was autogenerated by calcdeps.py
goog.addDependency("../../../web/main.js", ['web'], ['core', 'web.system', 'web.cookies', 'web.jq.ext', 'web.user', 'goog.debug', 'goog.debug.FancyWindow', 'goog.debug.Logger', 'goog.debug.LogManager', 'web.myapp']);
goog.addDependency("../../../web/kitchensink/initialise.js", ['web.myapp', 'web.myapp.initialise'], ['core', 'web.user.login']);
goog.addDependency("../../../web/system/cookies.js", ['web.cookies'], []);
goog.addDependency("../../../web/system/system.main.js", ['web.system'], ['web.system.tagLander']);
goog.addDependency("../../../web/system/tagLander.js", ['web.system.tagLander'], ['core.error', 'core.user']);
goog.addDependency("../../../web/ui/alert.ui.js", ['web.ui.alert'], []);
goog.addDependency("../../../web/ui/jqExtends.js", ['web.jq.ext'], []);
goog.addDependency("../../../web/ui/main.ui.js", ['web.ui'], ['web.ui.alert']);
goog.addDependency("../../../web/user/auth.user.js", ['web.user.auth'], ['core.events']);
goog.addDependency("../../../web/user/login.user.js", ['web.user.login'], []);
goog.addDependency("../../../web/user/main.user.js", ['web.user'], ['web.user.auth', 'web.user.login', 'web.user.ui']);
goog.addDependency("../../../web/user/ui.user.js", ['web.user.ui'], []);
goog.addDependency("../../../core/main.js", ['core', 'core.DEBUG', 'core.READY'], ['goog.debug', 'goog.debug.LogManager', 'goog.debug.Logger', 'core.analytics', 'core.date', 'core.error', 'core.ajax', 'core.ready', 'core.events', 'core.user', 'core.conf', 'core.valid', 'core.web2', 'core.STATIC']);
goog.addDependency("../../../core/network/ajax.js", ['core.ajax'], []);
goog.addDependency("../../../core/system/analytics.js", ['core.analytics'], []);
goog.addDependency("../../../core/system/configuration.js", ['core.conf'], []);
goog.addDependency("../../../core/system/const.main.js", ['core.STATIC'], []);
goog.addDependency("../../../core/system/err.js", ['core.err', 'core.error'], []);
goog.addDependency("../../../core/system/listeners.js", ['core.events', 'core.events.listeners'], []);
goog.addDependency("../../../core/system/ready.js", ['core.ready'], []);
goog.addDependency("../../../core/system/valid.js", ['core.valid'], []);
goog.addDependency("../../../core/user/auth.user.js", ['core.user.auth'], ['core.events']);
goog.addDependency("../../../core/user/login.user.js", ['core.user.login'], []);
goog.addDependency("../../../core/user/main.user.js", ['core.user'], ['core.user.auth', 'core.user.login', 'core.user.profile', 'core.user.pub', 'core.user.metadata']);
goog.addDependency("../../../core/user/metadata.user.js", ['core.metadata', 'core.user.metadata'], []);
goog.addDependency("../../../core/user/profile.user.js", ['core.user.profile'], []);
goog.addDependency("../../../core/user/pub.user.js", ['core.user.pub'], []);
goog.addDependency("../../../core/utilities/date.core.js", ['core.date'], ['goog.date', 'goog.date.DateTime']);
goog.addDependency("../../../core/web2.0/web2.0.main.js", ['core.web2'], ['core.user', 'core.events', 'core.fb', 'core.fb.API', 'core.twit']);
goog.addDependency("../../../core/web2.0/facebook/facebook.API.js", ['core.fb.API'], ['core.STATIC']);
goog.addDependency("../../../core/web2.0/facebook/facebook.comments.js", ['core.fb.com'], []);
goog.addDependency("../../../core/web2.0/facebook/facebook.local.js", ['core.fb.local'], ['core.STATIC']);
goog.addDependency("../../../core/web2.0/facebook/facebook.main.js", ['core.fb'], ['core.fb.local', 'core.STATIC', 'core.fb.com', 'goog.Uri']);
goog.addDependency("../../../core/web2.0/twitter/twitter.main.js", ['core.twit'], []);
