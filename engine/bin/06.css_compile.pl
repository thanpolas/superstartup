#!/usr/bin/perl
use POSIX qw(strftime);
use Time::Local;



######################### CONFIG ###############################
### date stamp
$dateStamp = strftime("%d-%m-%Y", localtime);
### Project Root
$java = "/usr/bin/java";
$projectRoot = "../../";


$cssCompiler = $projectRoot . "/engine/bin/Third-Party/yuicompressor/build/yuicompressor-2.4.2.jar";
$cssPath = $projectRoot . "/html/css/";
$outIE = $projectRoot . "/html/cssc/main1.css";
$outFir = $projectRoot . "/html/cssc/main2.css";
$outSFV = $projectRoot . "/html/cssc/sfv.css";

$combinedIE = $projectRoot . "/engine/bin/tmp/combinedIE.css";
$combinedFir = $projectRoot . "/engine/bin/tmp/combinedFir.css";

$combinedSFV = $projectRoot . "/engine/bin/tmp/combinedSFV.css";

## We have to compine all css files into one
## We will create two sets: IE and fir

print "Combining CSS files to one \n";

$cssFilesIE = $cssPath . "page.css "
    . $cssPath . "main.css "
    . $cssPath . "alertbox.css "
    . $cssPath . "icons.css "
    . $cssPath . "mainChatBody.css "
    . $cssPath . "footer.css "
    . $cssPath . "forms.css "
    . $cssPath . "users.css "
    . $cssPath . "goog_roundedtab.css "
    . $cssPath . "goog_tab.css "
    . $cssPath . "goog_tabbar.css "
    . $cssPath . "home.css "
    . $cssPath . "userPublicProfile.css "
    . $cssPath . "menus/notifications.css "
    . $cssPath . "menus/boothBrowse.css ";

$cmdCombine = "/bin/cat $cssFilesIE > $combinedIE";
system $cmdCombine;


## $cssFilesFir = $cssPath . "page.css "
## . $cssPath . "main.css " . $cssPath . "alertbox.css " . $cssPath . "home.css " . $cssPath . "icons.css";
## $cmdCombine = "/bin/cat $cssFilesFir > $combinedFir";
## system $cmdCombine;


 $cssFilesSFV = $cssPath . "single_view.css ";
 $cmdCombine = "/bin/cat $cssFilesSFV > $combinedSFV";
 system $cmdCombine;



## Files combined, now compress them
$cmd = "$java -jar $cssCompiler --type css -o $outIE $combinedIE";
print "Executing IE: \n";
print $cmd;
system $cmd;


## Files combined, now compress them
## print "\n\nExecuting Fir:\n";
## $cmd = "$java -jar $cssCompiler --type css -o $outFir $combinedFir";
## print $cmd;
## system $cmd;
## print "\n";

## Files combined, now compress them
print "\n\nExecuting SFV:\n";
$cmd = "$java -jar $cssCompiler --type css -o $outSFV $combinedSFV";
print $cmd;
system $cmd;
print "\n";