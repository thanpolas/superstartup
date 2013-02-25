
goog.provide('ssd.test.ajax');

describe('The generic XHR abstraction', function(){

  var mirrorUrl = '/test/server/mirror';
  var mockData = {
        one: 1,
        two: 'two',
        three: true,
        four: {
          fourOne: 4.1
        }
      };
  // closure's xhrio signature
  //url, opt_callback, opt_method, opt_content, opt_headers, opt_timeoutInterval, opt_withCredentials

  describe('Core functionality', function(){
    it('By default it should perform a POST with JSON encoding', function(done){
      ss.ajax(mirrorUrl, function(status, data){
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
      ss.ajax(mirrorUrl, cb, 'POST', mockData);
    });

    it('should return an error when it fails', function(done){
      function cb(status, errorStatus, errorThrown) {
        expect(status).to.be.False;
        expect(errorStatus).to.be.a('string');
        expect(errorThrown).to.be.a('string');
        done();
      }
      ss.ajax('/a/bogus/url', cb);
    });

    it('should perform a GET operation', function(done){
      function cb(status, data) {
        expect(status).to.be.True;
        expect(data.sendMethod).to.equal('GET');
        done();
      }

      ss.ajax(mirrorUrl, cb, 'GET');
    });

    it('should perform a PUT operation', function(done){
      function cb(status, data) {
        expect(status).to.be.True;
        expect(data.sendMethod).to.equal('PUT');
        done();
      }
      ss.ajax(mirrorUrl, cb, 'PUT');
    });
  });
});