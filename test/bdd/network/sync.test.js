goog.provide('ssd.test.sync');

/**
 * The generic sync abstraction is a plain copy of the
 * xhr abstraction API. The purpose of adding one more
 * layer is so that we will be able to use a different
 * method of transportation for read / write / update
 * ops (e.g. web sockets, filesystem, whatnot)
 */
describe('The generic data sync abstraction', function(){

  var mirrorUrl = '/test/server/mirror';
  var mockData = {
        one: 1,
        two: 'two',
        three: true,
        four: {
          fourOne: 4.1
        }
      };
  // closure's xhrio send func signature
  //url, opt_callback, opt_method, opt_content, opt_headers, opt_timeoutInterval, opt_withCredentials

  describe('Core functionality', function(){
    it('By default it should perform a POST with JSON encoding', function(done){
      ss.sync(mirrorUrl, function(status, data){
        expect(status).to.be.True;
        expect(data.dataType).to.equal('JSON');
        expect(data.sendMethod).to.equal('POST');
        done();
      });
    });

    it('should send data in JSON - retain data type integridy', function(done){
      function cb (status, data) {
        expect(status).to.be.True;
        // values returned by custom server script
        expect(data.dataType).to.equal('JSON');
        expect(data.sendMethod).to.equal('POST');

        expect(data.one).to.equal(1);
        expect(data.three).to.be.True;
        expect(data.four.fourOne).to.equal(4.1);
        done();
      }
      ss.sync(mirrorUrl, cb, 'POST', mockData);
    });

    it('should return an error when it fails', function(done){
      function cb(status, errorStatus, errorThrown) {
        expect(status).to.be.False;
        expect(errorStatus).to.be.a('string');
        expect(errorThrown).to.be.a('string');
        done();
      }
      ss.sync('/a/bogus/url', cb);
    });

    it('should perform a GET operation', function(done){
      function cb(status, data) {
        expect(status).to.be.True;
        expect(data.sendMethod).to.equal('GET');
        done();
      }

      ss.sync(mirrorUrl, cb, 'GET');
    });

    it('should perform a PUT operation', function(done){
      function cb(status, data) {
        expect(status).to.be.True;
        expect(data.sendMethod).to.equal('PUT');
        done();
      }
      ss.sync(mirrorUrl, cb, 'PUT');
    });
  });
});