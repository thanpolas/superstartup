// This file was autogenerated by calcdeps.py
goog.addDependency("../../../web/main.js", ['web'], ['core', 'web.system']);
goog.addDependency("../../../web/system/system.main.js", ['web.system'], ['web.system.tagLander']);
goog.addDependency("../../../web/system/tagLander.js", ['web.system.tagLander'], ['core.error']);
goog.addDependency("../../../web/system/metrics/metric_flash.js", ['web.metrics.flash'], []);
goog.addDependency("../../../web/ui/alert.ui.js", ['web.ui.alert'], []);
goog.addDependency("../../../web/ui/bottomScroll.ui.js", ['web.ui.bottomScroll'], ['core.events.listeners']);
goog.addDependency("../../../web/ui/dialogs.ui.js", ['web.ui.dialogs'], []);
goog.addDependency("../../../web/ui/main.ui.js", ['web.ui'], ['web.ui.alert', 'web.ui.sfv', 'web.ui.bottomScroll', 'web.ui.mobile', 'web.ui.dialogs']);
goog.addDependency("../../../web/ui/sfv.ui.js", ['web.ui.sfv'], []);
goog.addDependency("../../../web/ui/textCounter.ui.js", ['web.ui.textCounter'], []);
goog.addDependency("../../../web/ui/mobile/mobile.ui.js", ['web.ui.mobile'], []);
goog.addDependency("../../../web/user/account.user.js", ['web.user.account', 'web.user.account.ui'], []);
goog.addDependency("../../../web/user/alerts.user.js", ['web.user.alerts'], []);
goog.addDependency("../../../web/user/auth.user.js", ['web.user.auth'], []);
goog.addDependency("../../../web/user/login.user.js", ['web.user.login'], []);
goog.addDependency("../../../web/user/main.user.js", ['web.user'], ['web.user.auth', 'web.user.login', 'web.user.ui', 'web.user.notify']);
goog.addDependency("../../../web/user/menu.ui.user.js", ['web.user.ui.menu'], ['web.user.account', 'web.user.profileForm', 'web.user.account.ui', 'web.user.alerts', 'goog.ui.Component.EventType', 'goog.ui.RoundedTabRenderer', 'goog.ui.Tab', 'goog.ui.TabBar']);
goog.addDependency("../../../web/user/msg.ui.user.js", ['web.user.ui.message'], ['core.user.message', 'web.user.ui.msgCls']);
goog.addDependency("../../../web/user/msgCls.ui.user.js", ['web.user.ui.msgCls'], ['core.events.listeners', 'core.user.message', 'web.ui.dialogs']);
goog.addDependency("../../../web/user/notify.user.js", ['web.user.notify'], ['goog.string']);
goog.addDependency("../../../web/user/profile-form.user.js", ['web.user.profileForm'], []);
goog.addDependency("../../../web/user/ui.user.js", ['web.user.ui'], ['web.ui.textCounter', 'web.user.ui.message', 'web.user.ui.menu', 'core.user.notify']);
goog.addDependency("../../../core/main.js", ['core', 'core.DEBUG', 'core.READY'], ['goog.debug', 'goog.debug.LogManager', 'goog.debug.Logger', 'core.analytics', 'core.date', 'core.error', 'core.ajax', 'core.ready', 'core.user', 'core.conf', 'core.valid', 'core.web2', 'core.STATIC', 'core.throttle']);
goog.addDependency("../../../core/network/ajax.js", ['core.ajax'], ['core.user.notify']);
goog.addDependency("../../../core/system/analytics.js", ['core.analytics'], []);
goog.addDependency("../../../core/system/conf.main.js", ['core.conf', 'core.STATIC'], []);
goog.addDependency("../../../core/system/err.js", ['core.err', 'core.error'], []);
goog.addDependency("../../../core/system/listeners.js", ['core.events', 'core.events.listeners'], []);
goog.addDependency("../../../core/system/ready.js", ['core.ready'], []);
goog.addDependency("../../../core/system/valid.js", ['core.valid'], []);
goog.addDependency("../../../core/user/auth.user.js", ['core.user.auth'], ['core.user.notify']);
goog.addDependency("../../../core/user/login.user.js", ['core.user.login'], []);
goog.addDependency("../../../core/user/main.user.js", ['core.user'], ['core.user.auth', 'core.user.login', 'core.user.profile', 'core.user.pub']);
goog.addDependency("../../../core/user/message.user.js", ['core.user.message'], []);
goog.addDependency("../../../core/user/notify.user.js", ['core.user.notify'], ['core.events.listeners']);
goog.addDependency("../../../core/user/profile.user.js", ['core.user.profile'], []);
goog.addDependency("../../../core/user/pub.user.js", ['core.user.pub'], []);
goog.addDependency("../../../core/utilities/date.core.js", ['core.date'], ['goog.date', 'goog.date.DateTime']);
goog.addDependency("../../../core/utilities/throttle.js", ['core.throttle'], []);
goog.addDependency("../../../core/web2.0/web2.0.main.js", ['core.web2'], ['core.events.listeners', 'core.fb', 'core.fb.API', 'core.twit']);
goog.addDependency("../../../core/web2.0/facebook/facebook.API.js", ['core.fb.API'], ['core.STATIC']);
goog.addDependency("../../../core/web2.0/facebook/facebook.comments.js", ['core.fb.com'], []);
goog.addDependency("../../../core/web2.0/facebook/facebook.local.js", ['core.fb.local'], ['core.STATIC']);
goog.addDependency("../../../core/web2.0/facebook/facebook.main.js", ['core.fb'], ['core.fb.local', 'core.STATIC', 'core.fb.com', 'goog.Uri']);
goog.addDependency("../../../core/web2.0/twitter/twitter.main.js", ['core.twit'], []);
