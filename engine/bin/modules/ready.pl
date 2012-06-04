#!/usr/bin/perl
use POSIX qw(strftime);
use Time::Local;

$DEBUG = 0;
if ("--debug" eq $ARGV[0]) {
  $DEBUG = 1;
}

######################### CONFIG ###############################

$java = "/usr/bin/java";


### Project Root
$projectRoot = "../../..";
### Rest subfolders
$jsroot = $projectRoot . "/html/js";
$binPath = $projectRoot . "/engine/bin";
$closurelib = $jsroot . "/closure-library";
$googPath = $jsroot . "/closure-library/closure/goog";
$externsPath = $binPath . "/externs";
# Debug file full path
$debugFile = $jsroot . "/ss/helpers/debug.js";
$debugTmp = $binPath . "/tmp/d.tmp";

#3rd party apps...
$asyncPath = $jsroot . "/closure-library/third_party/closure/goog";
$calcdeps = $jsroot . "/closure-library/closure/bin/calcdeps.py";
$closurebuilder = $jsroot . "/closure-library/closure/bin/build/closurebuilder.py";

if ($DEBUG) {
  $closurecompiler = $projectRoot . "/engine/bin/Third-Party/closure_compiler/compiler.jar";
} else {
  $closurecompiler = $projectRoot . "/engine/bin/Third-Party/closure_compiler/sscompiler.jar";
  #prepare debug file
  $cmdCopy = "cp -f $debugFile $debugTmp";
  system $cmdCopy;
  $cmdEcho = 'echo "goog.provide(\'ss.debug\');" > ' . $debugFile;
  system $cmdEcho;
}

######################### CONFIG END ###########################

$cmdBuild = "$closurebuilder ";
$cmdBuild .= "-i $jsroot" . "/ss/system/ready.js";
$cmdBuild .= " --root $jsroot";
$cmdBuild .= " -o compiled --output_file=$projectRoot" . "/html/jsc/ready.js";
$cmdBuild .= " --compiler_jar=\"" . $closurecompiler . "\"";

$cmdCompile = "  --compiler_flags=\"--compilation_level=ADVANCED_OPTIMIZATIONS\"";

# Define all extern files here
$cmdCompile .= "  --compiler_flags=\"--externs=$externsPath/compiler_externs.js\"";
$cmdCompile .= "  --compiler_flags=\"--externs=$externsPath/jquery-1.7.js\"";
$cmdCompile .= "  --compiler_flags=\"--externs=$externsPath/facebook_javascript_sdk.js\"";
$cmdCompile .= "  --compiler_flags=\"--externs=$externsPath/json.js\"";

$cmdCompile .= " --compiler_flags=\"--define='goog.DEBUG=false'\"";
$cmdCompile .= " --compiler_flags=\"--warning_level=verbose\"";
$cmdCompile .= " --compiler_flags=\"--jscomp_off=fileoverviewTags\"";
$cmdCompile .= " --compiler_flags=\"--summary_detail_level=3\"";
$cmdCompile .= " --compiler_flags=\"--jscomp_off=checkTypes\"";

$cmdCompile .- " --compiler_flags=\"--manage_closure_dependencies\"";
if ($DEBUG) {
  $cmdCompile .= " --compiler_flags=\"--source_map_format=V3\"";
  $cmdCompile .= " --compiler_flags=\"--create_source_map=$projectRoot/html/compiled.js.map\"";
  #$cmdCompile .= " --compiler_flags=\"--debug\"";
  $cmdCompile .= " --compiler_flags=\"--output_wrapper='(function(){%output%}).call(this); \\\n//@ sourceMappingURL=/compiled.js.map'\"";
} else {
  $cmdCompile .= " --compiler_flags=\"--output_wrapper='(function(){%output%}).call(this);'\"";
}

$cmdBuild .= $cmdCompile;

#if ($DEBUG) {
  $cmdBuild .= " > compiler.out";
#} else {
#  $cmdBuild .= " > compiler.out 2>&1";
#}
print $cmdBuild;
system $cmdBuild;


if (!$DEBUG) {
  $cmdCopy = "mv $debugTmp $debugFile";
  system $cmdCopy;
}

print "JS Compiled. See output in engine/bin/compiler.out\n";

