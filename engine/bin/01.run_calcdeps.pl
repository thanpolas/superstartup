#!/usr/bin/perl
use POSIX qw(strftime);
use Time::Local;



######################### CONFIG ###############################
### date stamp
$dateStamp = strftime("%d-%m-%Y", localtime);
### Project Root
$projectRoot = "../..";
$jsroot = $projectRoot . "/html/js";
$closurelib = $jsroot . "/closure-library";
$googPath = $jsroot . "/closure-library/closure/goog";
#3rd party apps...
$asyncPath = $jsroot . "/closure-library/third_party/closure/goog";
$sptPath = $jsroot . "/web";
$geoPath = $jsroot . "/core";

$calcdeps = $closurelib . "/closure/bin/calcdeps.py";

$java = "/usr/bin/java";


#print "PWD: $ENV{PWD}\n";
#print "\$0: $0\n";


$cmdrun = "$calcdeps -d $jsroot" . "/closure-library -p $sptPath -p $geoPath -o deps --output_file=$jsroot" . "/deps.js";

print "Will execute: " . $cmdrun . "\n";

system ($cmdrun);
