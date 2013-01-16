
goog.provide('ssd.test.helpers');


suite('Helpers');

test('isjQ', function(){
  var jq = $('<div></div>');
  var notjQ = new Array('2');

  ok(ssd.isjQ(jq), 'A jQuery array');
  ok(!ssd.isjQ(notjQ), 'Not a jQuery array');
});


test('ssd.arFind', function() {
  var arOne = [{id:1}, {id:2}, {id:3}, {id:4}, {id:5}];
  var arTwo = [{fruit:'apples'}, {fruit:'oranges'}, {fruit:'grapes'}, {fruit:'bananas'}];

  equal(ssd.arFind(arOne, 'id', 3).id, 3, 'Searching with numeric value');
  equal(ssd.arFind(arTwo, 'fruit', 'bananas').fruit, 'bananas', 'Searching with string value');
  equal(ssd.arFind(arOne, 'id', 9), null, 'Search yields no result, we expect null');
  equal(ssd.arFind(arOne, 'idid', 9), null, 'Bogus key, we expect null');

  var obj = ssd.arFind(arTwo, 'fruit', 'oranges');
  obj.fruit = 'mango';
  notEqual(arTwo[2].fruit, obj.fruit, 'Returned objects are not references');
});

test('ssd.arFindIndex', function() {
  var arOne = [{id:1}, {id:2}, {id:3}, {id:4}, {id:5}];
  var arTwo = [{fruit:'apples'}, {fruit:'oranges'}, {fruit:'grapes'}, {fruit:'bananas'}];

  equal(ssd.arFindIndex(arOne, 'id', 3), 2, 'Searching with numeric value');
  equal(ssd.arFindIndex(arTwo, 'fruit', 'bananas'), 3, 'Searching with string value');
  equal(ssd.arFindIndex(arOne, 'id', 9), -1, 'Search yields no result, we expect -1');
  equal(ssd.arFindIndex(arOne, 'idid', 9), -1, 'Bogus key, we expect -1');
});


test('ssd.arRemove', function(){
  var arOne = [{id:1}, {id:2}, {id:3}, {id:4}, {id:5}];
  var arTwo = [{fruit:'apples'}, {fruit:'oranges'}, {fruit:'grapes'}, {fruit:'bananas'}];

  ok(ssd.arRemove(arOne, 'id', 3), 'arRemove run normaly returns true');
  ok(!ssd.arRemove('not an array', 'id', 3), 'arRemove with a string instead of array returns false');
  ok(!ssd.arRemove(arOne, 'wrongKey', 3), 'Using a wrong key returns false');
  ok(!ssd.arRemove(arOne, [1, 2, 3], 3), 'Using an array as a key returns false');

  equal(arOne.length, 4, 'Our array\'s length now should be 4');
});
