goog.provide('ssd.user.auth.exports');

goog.require('ssd.user.Auth');
goog.require('ssd.user.auth.Facebook');
goog.require('ssd.user.auth.Twitter');


// user
goog.exportSymbol('ss.user', ss.user);
goog.exportSymbol('ss.isAuthed', ss.isAuthed);
goog.exportSymbol('ss.user.isAuthed', ss.user.isAuthed);
goog.exportSymbol('ss.user.auth', ss.user.auth);
goog.exportSymbol('ss.user.deAuth', ss.user.deAuth);
goog.exportSymbol('ss.user.isExtAuthed', ss.user.isExtAuthed);
goog.exportSymbol('ss.user.login', ss.user.login);
goog.exportSymbol('ss.user.logout', ss.user.logout);
goog.exportSymbol('ss.user.authedSources', ss.user.authedSources);

goog.exportSymbol('ss.user.fb', ss.user.fb);
goog.exportSymbol('ss.user.fb.getSourceId', ss.user.fb.getSourceId);
goog.exportSymbol('ss.user.fb.hasJSAPI', ss.user.fb.hasJSAPI);
goog.exportSymbol('ss.user.fb.isAuthed', ss.user.fb.isAuthed);
goog.exportSymbol('ss.user.fb.getUser', ss.user.fb.getUser);
goog.exportSymbol('ss.user.fb.getAccessToken', ss.user.fb.getAccessToken);



//
// response object
//
// goog.exportSymbol('ss.user.Response', ssd.user.auth.Response);
// goog.exportSymbol('ss.user.Response.prototype.authState',
//   ssd.user.auth.Response.prototype.authState);
// goog.exportSymbol('ss.user.Response.prototype.udo',
//   ssd.user.auth.Response.prototype.udo);
// goog.exportSymbol('ss.user.Response.prototype.serverRaw',
//   ssd.user.auth.Response.prototype.serverRaw);

// // auth plugins
// goog.exportSymbol('ss.user.plugin.Response', ssd.user.auth.plugin.Response);
// goog.exportSymbol('ss.user.plugin.Response.prototype.responsePluginRaw',
//   ssd.user.auth.plugin.Response.prototype.responsePluginRaw);
// goog.exportSymbol('ss.user.plugin.Response.prototype.authStatePlugin',
//   ssd.user.auth.plugin.Response.prototype.authStatePlugin);
// goog.exportSymbol('ss.user.plugin.Response.prototype.source',
//   ssd.user.auth.plugin.Response.prototype.source);

