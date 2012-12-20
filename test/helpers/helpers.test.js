
goog.provide('ssd.test.helpers');

describe('Helpers', function() {

  describe('ssd.arFind()', function() {
    var arOne = [{id:1}, {id:2}, {id:3}, {id:4}, {id:5}];
    var arTwo = [{fruit:'apples'}, {fruit:'oranges'}, {fruit:'grapes'}, {fruit:'bananas'}];
    it('should work with numeric search value', function(){
      expect(  ssd.arFind(arOne, 'id', 3).id  ).to.equal(3);
    });
    it('should work with string search value', function(){
      expect(  ssd.arFind(arTwo, 'fruit', 'bananas').fruit  ).to.equal('bananas');
    });
    it('should return null when search yields no results', function(){
      expect(  ssd.arFind(arOne, 'id', 9)  ).to.be.null;
    });
    it('should return null when a bogus key is provided', function(){
      expect(  ssd.arFind(arOne, 'idid', 9)  ).to.be.null;
    });

    it('should not return references', function(){
      var obj = ssd.arFind(arTwo, 'fruit', 'oranges');
      obj.fruit = 'mango';
      expect(  arTwo[2].fruit  ).to.not.equal(obj.fruit);
    });
  });

  describe('ssd.arFindIndex()', function() {
    var arOne = [{id:1}, {id:2}, {id:3}, {id:4}, {id:5}];
    var arTwo = [{fruit:'apples'}, {fruit:'oranges'}, {fruit:'grapes'}, {fruit:'bananas'}];

    it('should work with numeric search value', function(){
      expect(  ssd.arFindIndex(arOne, 'id', 3)  ).to.equal(2);
    });
    it('should work with string search value', function(){
      expect(  ssd.arFindIndex(arTwo, 'fruit', 'bananas')  ).to.equal(3);
    });
    it('should return -1 when search yields no result', function(){
      expect(  ssd.arFindIndex(arOne, 'id', 9) ).to.equal(-1);
    });
    it('should return -1 when a bogus key is provided', function(){
      expect(  ssd.arFindIndex(arOne, 'idid', 9)  ).to.equal(-1);
    });
  });


  describe('ssd.arRemove()', function(){
    var arOne = [{id:1}, {id:2}, {id:3}, {id:4}, {id:5}];
    var arTwo = [{fruit:'apples'}, {fruit:'oranges'}, {fruit:'grapes'}, {fruit:'bananas'}];

    it('should return true when item removed', function(){
      expect(  ssd.arRemove(arOne, 'id', 3)  ).to.be.True;
    });
    it('should return false when source is string instead of an array', function(){
      expect(  ssd.arRemove('not an array', 'id', 3)  ).to.not.be.True;
    });
    it('should return false when wrong key is provided', function(){
      expect(  ssd.arRemove(arOne, 'wrongKey', 3)  ).to.not.be.True;
    });
    it('should return false when passing an array to the key param', function(){
      expect(  ssd.arRemove(arOne, [1, 2, 3], 3)  ).to.not.be.True;
    });
    it('resulting object should have a length of 4', function(){
      expect(  arOne.length  ).to.equal(4);
    });
  });

});
