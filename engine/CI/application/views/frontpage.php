<div id="master">
<div id="header">
	<h1>The Core Framework</h1>
</div>
<div id="content">
	<div id="ab_test">
<?php
$ci = get_instance();
$headerVars = array (
  // pass any custom logic here or data required for header and footer
);
$ci->load->view('header', $headerVars);

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
	<div id="js_kitchensink">
	</div>
</div>
</div>
<?php
  $ci->load->view('footer', $headerVars);
?>