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
		<h2><?php

$abString = $ci->ab_test->getTest();
$abVersion = $ci->ab_test->getVersion('frontpage_1');

echo 'AB Test name:' . $abString . ' Version #' . $abVersion;

?> </h2>
	</div>
	<div id="login">
	  <span id="login_facebook_front" class="ui-ico-fb-large ui-ico link -login-fb"></span>
	  <span id="login_twitter_front" class="ui-ico-tw-large ui-ico link -login-tw"></span>
		<br />
		<span>Create any type of HTML tag for facebook login. It must contain the css class <a href="#" class="-login-fb">-login-fb</a> so we can bind on it. The class for Twitter is <a href="#" class="-login-tw">-login-tw</a></span>
	</div>
	<div id="logged_in">
		<span class="link linkcolor -logout">Logout</span>
		<br />
		<span>Create any type of tag for logout. It must contain the css class <a href="#" class="-logout">-logout</a> so we can bind on it</span>
	</div>
	<div id="auth_state">
		<h2>Auth State</h2>
		<h3>Not Authed</h3>
		<div id="auth_state_content">
			<h4></h4>
			<br />
			<pre>
				<span id="user_data_object"></span>
			</pre>
		</div>
	</div>
</div>
</div>
<?php
  $ci->load->view('footer', $headerVars);
?>