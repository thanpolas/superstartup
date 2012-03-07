<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:og="http://ogp.me/ns#" xmlns:fb="http://www.facebook.com/2008/fbml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<title>Core Framework</title>
<meta property="og:title" content="Core framework is a web framework for startups"/>
<meta property="og:type" content="article" />
<meta property="og:url" content="<?=current_url(); ?>" />
<meta property="og:image" content="<?= base_url() . 'img/corefw_logo.png'; ?>" />
<meta property="og:site_name" content="CoreFW" />
<meta property="fb:admins" content="" />
<meta property="fb:app_id" content="<?php
// FACEBOOK production App ID
echo (PRODUCTION ? '' :
        // Facebook beeeta. App ID
        (PREPROD ? '' :
                // Facebook core.local App ID
                ''));
?>"/>
<meta property="og:locale" content="en_US" />
<meta property="og:description" content="Core framework is a web framework for startups" />
<meta name="description" content="Core framework is a web framework for startups" />
<meta name="keywords" content="web, framework, php, codeigniter, user registration" />
<?php
      if (DEVEL):
			// if in development mode then put in this block all your css files
			// one by one
?>
<link rel="stylesheet" type="text/css" href="/css/main.css" />
<link rel="stylesheet" type="text/css" href="/css/corefw.css" />
<?php 
			else:
			// if in production mode then we only load the one compiled css file
?>
<link rel="stylesheet" type="text/css" href="/cssc/v/main1_<?php echo PRODCOUNTER;?>.css" />
    <?php endif; 

		if (PRODUCTION):
			// if in production then use our GA script
?>
<script type="text/javascript">
	var _gaq = _gaq || [];
	_gaq.push(['_setAccount', 'UA-337782-3']);
	_gaq.push(['_trackPageview']);
	var mpq=[];mpq.push(["init","230fa23c45eeefd758adf592e24a0352"]);
	_gaq.push(['_setCustomVar', 1, 'userAuthed', '<?=($this->user->isAuthed() ? 'true' : 'false');?>',2]);
<?php
	// check if this visitor comes from a campaign and we have to notify GA
	$ci = & get_instance();
	  $ci->load->model('campaigns');
	  $notifyAnalytics = false;
	  if ($ci->campaigns->notifyAnalytics())
	    $notifyAnalytics = true;

	  if ($notifyAnalytics):
	$cdata = $ci->campaigns->getData();
?>
	_gaq.push(['_trackPageview', '/campaigns/fb']);
	mpq.push(['track','campaign',{
	c_source: '<?=$cdata['source'];?>',
	c_campaign: '<?=$cdata['campaign'];?>',
	c_version: '<?=$cdata['version'];?>'
	} ]);
	mpq.push(['register_once', {
	campaign: '<?=$cdata['source'];?>',
	campaign_num: '<?=$cdata['campaign'];?>',
	campaign_version: '<?=$cdata['version'];?>'
	}]);						
<?php endif; 
									// now check for AB testing
									$ci->load->model('extras/ab_test');
									
									if ($ci->ab_test->inTest()):
										$abString = $ci->ab_test->getTest();
										$abVersion = $ci->ab_test->getVersion('frontpage_1');
?>
				        _gaq.push(['_setCustomVar', 2, 'frontpage_1', '<?=$abVersion;?>' ,2]);
								mpq.push(['register', {ab_frontpage: '<?=$abVersion;?>'}]);

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