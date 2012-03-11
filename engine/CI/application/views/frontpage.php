<?php
$ci = get_instance();
$headerVars = array (
  // pass any custom logic here or data required for header and footer
);
$ci->load->view('header', $headerVars);
?>
<div id="master">
<div id="header">
	<h1>The Superstartup Framework</h1>
</div>
<div id="content">
	<div id="ab_test">
<?php
	switch ($ab) {
		case 1:
			echo '<h2>AB Test # ' . $ab . '</h2>';
			break;
		case 2:
			echo '<h2>AB Test # ' . $ab . '</h2>';			
			break;
		case 3:
			echo '<h2>AB Test # ' . $ab . '</h2>';
			break;
		case 4:
			echo '<h2>AB Test # ' . $ab . '</h2>';
			break;
	}
?>
	</div>
	<div id="login">
	  <span id="login_facebook_front" class="ui_ico_fb_large ui_ico link _login_fb"></span>
	  <span id="login_twitter_front" class="ui_ico_tw_large ui_ico link _login_tw"></span>		
	</div>
	<div id="js_kitchensink">
	</div>
</div>
</div>
<?php
  $ci->load->view('footer', $headerVars);
?>