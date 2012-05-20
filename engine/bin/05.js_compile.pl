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
$projectRoot = "..";
### Rest subfolders
$jsroot = "js";
$binPath = $projectRoot . "/engine/bin";
$closurelib = $jsroot . "/closure-library";
$googPath = $jsroot . "/closure-library/closure/goog";
$externsPath = $binPath . "/externs";
#3rd party apps...
$asyncPath = $jsroot . "/closure-library/third_party/closure/goog";
$calcdeps = $jsroot . "/closure-library/closure/bin/calcdeps.py";
$closurebuilder = $jsroot . "/closure-library/closure/bin/build/closurebuilder.py";
$closurecompiler = $projectRoot . "/engine/bin/Third-Party/closure_compiler/compiler.jar";
######################### CONFIG END ###########################

$cmdBuild = "$closurebuilder ";
$cmdBuild .= "-i $jsroot" . "/init.js";
$cmdBuild .= " --root $jsroot";
$cmdBuild .= " -o compiled --output_file=$projectRoot" . "/html/jsc/compiled.js";
$cmdBuild .= " --compiler_jar=\"" . $closurecompiler . "\"";

$cmdCompile = "  --compiler_flags=\"--compilation_level=ADVANCED_OPTIMIZATIONS\"";

# Define all extern files here
$cmdCompile .= "  --compiler_flags=\"--externs=$externsPath/compiler_externs.js\"";
$cmdCompile .= "  --compiler_flags=\"--externs=$externsPath/jquery-1.7.js\"";

#$cmdCompile .= " --compiler_flags=\"--common_js_entry_module=../../html/js\"";
#$cmdCompile .= " --compiler_flags=\"--common_js_module_path_prefix=../../html/\"";
$cmdCompile .= " --compiler_flags=\"--warning_level=verbose\"";
$cmdCompile .= " --compiler_flags=\"--jscomp_off=fileoverviewTags\"";
$cmdCompile .= " --compiler_flags=\"--summary_detail_level=3\"";
$cmdCompile .= " --compiler_flags=\"--jscomp_off=checkTypes\"";

$cmdCompile .- " --compiler_flags=\"--manage_closure_dependencies\"";
if ($DEBUG) {
  $cmdCompile .= " --compiler_flags=\"--source_map_format=V3\"";
  $cmdCompile .= " --compiler_flags=\"--create_source_map=compiled.js.map\"";
  #$cmdCompile .= " --compiler_flags=\"--debug\"";
  $cmdCompile .= " --compiler_flags=\"--output_wrapper='(function(){%output%}).call(this); \\\n//@ sourceMappingURL=/compiled.js.map'\"";  
} else {
  $cmdCompile .= " --compiler_flags=\"--output_wrapper='(function(){%output%}).call(this);'\"";
}

$cmdBuild .= $cmdCompile;

if ($DEBUG) {
  $cmdBuild .= " > compiler.out";
} else {
  $cmdBuild .= " > compiler.out 2>&1";
}

system $cmdBuild;

## Compile with ADVANCED_OPTIMIZATIONS to compiled.js
## Use -Xmx1024m for giving more memory to java: http://groups.google.com/group/closure-compiler-discuss/browse_thread/thread/522fd9e9a87b9c92?hl=en#
#$cmdCompile = "$java -Xmx1024m -jar $closurecompiler ";

print "JS Compiled. See output in engine/bin/compiler.out\n";

