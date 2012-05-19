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
$outFile = $projectRoot . "/html/cssc/main.css";

$combinedOut = $projectRoot . "/engine/bin/tmp/combined.css";

## We have to compine all css files into one

print "Combining CSS files to one \n";

$allCssFiles = $cssPath . "superstartup.css "
    . $cssPath . "main.css "
    . $cssPath . "icons.css ";    

$cmdCombine = "/bin/cat $allCssFiles > $combinedOut";
system $cmdCombine;

## Files combined, now compress them
$cmd = "$java -jar $cssCompiler --type css -o $outFile $combinedOut";
print "Compressing CSS...\n";
system $cmd;
print "\n";