// This file was autogenerated by closure-library//closure/bin/build/depswriter.py.
// Please do not edit.
goog.addDependency('../../../../../test/bdd/bootstrap.js', ['ssd.test.bootstrap'], ['ssd.test.fixture.userOne', 'ssd.test.main', 'ssd.test.userAuth.facebook']);
goog.addDependency('../../../../../test/bdd/core/core.test.js', ['ssd.test.core'], ['ssd.test.fixture.event']);
goog.addDependency('../../../../../test/bdd/events/eventsAPI.test.js', ['ssd.test.event.api'], []);
goog.addDependency('../../../../../test/bdd/fixtures/errorCodes.fixture.js', ['ssd.test.fixture.errorCodes'], []);
goog.addDependency('../../../../../test/bdd/fixtures/events.fixture.js', ['ssd.test.fixture.event'], []);
goog.addDependency('../../../../../test/bdd/fixtures/userAuth.facebook.fixture.js', ['ssd.test.fixture.auth.fb'], []);
goog.addDependency('../../../../../test/bdd/fixtures/userAuth.fixture.js', ['ssd.test.fixture.userOne'], []);
goog.addDependency('../../../../../test/bdd/main.js', ['ssd.test.main'], ['ssd.test.mock.net']);
goog.addDependency('../../../../../test/bdd/modules/userAuth/plugins/facebook.auth.test.js', ['ssd.test.userAuth.facebook'], ['ssd.test.fixture.auth.fb', 'ssd.test.fixture.event', 'ssd.test.fixture.userOne', 'ssd.test.userAuth.genIface']);
goog.addDependency('../../../../../test/bdd/modules/userAuth/plugins/pluginInterface.test.js', ['ssd.test.userAuth.genIface'], ['ssd.test.fixture.event', 'ssd.test.fixture.userOne', 'ssd.test.mock.net', 'ssd.test.userAuth.login.events']);
goog.addDependency('../../../../../test/bdd/modules/userAuth/plugins/userAuth.events.test.js', ['ssd.test.userAuth.login.events'], ['ssd.test.fixture.errorCodes', 'ssd.test.fixture.event', 'ssd.test.fixture.userOne', 'ssd.test.mock.net', 'ssd.test.userAuth.login.events']);
goog.addDependency('../../../../../test/bdd/modules/userAuth/userAuthCore.test.js', ['ssd.test.userAuth.core'], ['goog.object', 'ssd.test.fixture.event', 'ssd.test.fixture.userOne']);
goog.addDependency('../../../../../test/bdd/modules/userAuth/userAuthLogin.test.js', ['ssd.test.userAuth.login'], ['goog.dom', 'ssd.test.fixture.errorCodes', 'ssd.test.fixture.event', 'ssd.test.fixture.userOne', 'ssd.test.mock.net', 'ssd.test.userAuth.login.events']);
goog.addDependency('../../../../../test/bdd/modules/userAuth/userAuthLogout.test.js', ['ssd.test.userAuth.logout'], ['ssd.test.fixture.event', 'ssd.test.fixture.userOne']);
goog.addDependency('../../../../../test/bdd/network/ajax.test.js', ['ssd.test.ajax'], []);
goog.addDependency('../../../../../test/bdd/network/sync.test.js', ['ssd.test.sync'], []);
goog.addDependency('../../../../../test/mocks/configClass.mock.js', ['ssd.test.unit.configClass'], ['ssd.Config', 'ssd.Module']);
goog.addDependency('../../../../../test/mocks/network.mock.js', ['ssd.test.mock.net'], []);
goog.addDependency('../../../../../test/unit/bootstrap.js', ['ssd.test.unit.bootstrap'], ['ssd.test.main', 'ssd.test.unit.config']);
goog.addDependency('../../../../../test/unit/fixtures/configClass.mock.js', ['ssd.test.unit.configClass'], ['ssd.Config', 'ssd.Module']);
goog.addDependency('../../../../../test/unit/helpers/helpers.test.js', ['ssd.test.helpers'], []);
goog.addDependency('../../../../../test/unit/modules/userAuth/plugins/facebook.auth.unitTest.js', ['ssd.unitTest.userAuth.facebook'], ['ssd.test.fixture.auth.fb', 'ssd.test.fixture.event', 'ssd.test.fixture.userOne']);
goog.addDependency('../../../../../test/unit/structs/config.test.js', ['ssd.test.unit.config'], ['ssd.Config', 'ssd.test.unit.configClass']);