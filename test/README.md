# Superstartup Tests

## Introduction
There are two kind of tests we perform for the superstartup library, behavioral and unit.

### Behavioral Tests
Behavioral tests examine the exposed API of the library and must be run both while developing the library but most importantly **after the library has been packaged and compiled** to ensure all public API calls behave as expected and the library's integrity is intact.

### Unit Tests
Unit tests will examine the innards of the library. Internally used components, helpers and tools are tested down to the most detailed unit.

## How to run

### Run tests using Grunt

There are grunt tasks for running the tests. To better emulate running conditions all tests are run using phantomJS so there is a complete DOM environment.

* `grunt mochaPhantom` run the BDD tests in a minimal format.
* `grunt mochaPhantom` run the BDD tests using the full spec reporter.


### Run tests manually
To perform manual runs of the BDD tests the following command is required:

```shell
node_modules/mocha-phantomjs/bin/mocha-phantomjs [path-to-file].html -R [reporter]
```

Reporter can be `min` or `spec` or any other you prefer.