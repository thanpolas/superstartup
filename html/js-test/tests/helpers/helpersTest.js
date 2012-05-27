<script>
goog.require('ss.helpers');
goog.require('goog.testing.jsunit');
</script>
<script>
function testisjQ(){
  var jq = $('<div></div>');
  var notjQ = new Array('2');
  
  ok(ss.isjQ(jq), 'A jQuery array');
  ok(!ss.isjQ(notjQ), 'Not a jQuery array');
};
function testIsDef() {
  var defined = 'foo';
  var nullVar = null;
  var notDefined;

  assertTrue('defined should be defined', goog.isDef(defined));
  assertTrue('null should be defined', goog.isDef(defined));
  assertFalse('undefined should not be defined', goog.isDef(notDefined));
}
</script>