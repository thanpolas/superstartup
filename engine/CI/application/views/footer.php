<?php
if (DEVEL): 
	// if in devel mode, load jquery from our files, and load up
	// the JS engine one by one...
	// if in production load the compiled js and jquery from google's CDN
?>
<script src="/jsc/jquery-1.5.1.min.js"></script>
<script type="text/javascript" src="/js/closure-library/closure/goog/base.js" charset="utf-8"></script>
<script type="text/javascript" src="/js/deps.js" charset="utf-8"></script>
<script type="text/javascript" src="/js/web/main.js" charset="utf-8"></script>
<?php else: ?>
<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.5.1/jquery.min.js"></script>
<script type="text/javascript" src="/jsc/v/main_<?php echo PRODCOUNTER; ?>.js" charset="utf-8"></script>
<?php  endif; 

// now echo our interface with our JS engine
$ci = & get_instance();
echo $ci->main->JsPassGet();


?>
<div id="fb-root"></div>
</body>
</html>