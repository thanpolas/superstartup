<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:og="http://ogp.me/ns#" xmlns:fb="http://www.facebook.com/2008/fbml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<title>Superstartup Framework</title>
<?php
$this->load->config('facebook');

// the values for the facebook headers are set in config/facebook.php
?>
<meta property="og:title" content="<?= $this->config->item('facebook_title'); ?>"/>
<meta property="og:type" content="article" />
<meta property="og:url" content="<?=current_url(); ?>" />
<meta property="og:image" content="<?= $this->config->item('facebook_ourlogo'); ?>" />
<meta property="og:site_name" content="<?= $this->config->item('facebook_site_name'); ?>" />
<meta property="fb:admins" content="<?= $this->config->item('facebook_admins'); ?>" />
<meta property="fb:app_id" content="<?= $this->config->item('facebook_app_id'); ?>"/>
<meta property="og:locale" content="en_US" />
<meta property="og:description" content="<?= $this->config->item('facebook_description'); ?>" />

<meta name="description" content="Superstartup framework is a web development framework for startups" />
<meta name="keywords" content="web, framework, php, superstartup, development, codeigniter, user registration" />
<?php
      if (DEVEL):
			// if in development mode then put in this block all your css files
			// one by one
?>
<link rel="stylesheet" type="text/css" href="/css/main.css" />
<link rel="stylesheet" type="text/css" href="/css/icons.css" />
<link rel="stylesheet" type="text/css" href="/css/superstartup.css" />
<?php 
			else:
			// if in production mode then we only load the one compiled css file
?>
<link rel="stylesheet" type="text/css" href="/cssc/v/main1_<?php echo PRODCOUNTER;?>.css" />
    <?php endif; 

		if (PRODUCTION):
			// if in production then use our GA script
			$this->load->config('analytics');

			// the values for the analytics are set in config/analytics.php
?>
<script type="text/javascript">
	var _gaq = _gaq || [];
	_gaq.push(['_setAccount', '<?= $this->config->item('GA_property_id'); ?>']);
	_gaq.push(['_trackPageview']);
	
	_gaq.push(['_setCustomVar', 1, 'userAuthed', '<?=($this->user->isAuthed() ? 'true' : 'false');?>',2]);
<?php
	// check if this visitor comes from a campaign and we have to notify GA
	$ci = & get_instance();
	  $ci->load->model('core/campaigns');
	  $notifyAnalytics = false;
	  if ($ci->campaigns->notifyAnalytics())
	    $notifyAnalytics = true;

	  if ($notifyAnalytics):
	$cdata = $ci->campaigns->getData();
?>
	_gaq.push(['_trackPageview', '/campaigns/fb']);					
<?php endif; 
									// now check for AB testing
									$ci->load->model('core/ab_test');
									
									if ($ci->ab_test->inTest()):
										$abString = $ci->ab_test->getTest();
										$abVersion = $ci->ab_test->getVersion('frontpage_1');
?>
				        _gaq.push(['_setCustomVar', 2, 'frontpage_1', '<?=$abVersion;?>' ,2]);
							

								<?php endif; 
								
								?>
        (function() {
          var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
          ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
          var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
        })();
</script>
<?php endif; ?>
</head>
<body>