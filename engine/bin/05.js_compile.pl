#!/usr/bin/perl
use POSIX qw(strftime);
use Time::Local;



######################### CONFIG ###############################
### date stamp
$dateStamp = strftime("%d-%m-%Y", localtime);
### Project Root
$projectRoot = "../..";


### Rest subfolders
$jsroot = $projectRoot . "/html/js";
$closurelib = $jsroot . "/closure-library";
$googPath = $jsroot . "/closure-library/closure/goog";
#3rd party apps...
$asyncPath = $jsroot . "/closure-library/third_party/closure/goog";
$sptPath = $jsroot . "/web";
$geoPath = $jsroot . "/core";

$calcdeps = $jsroot . "/closure-library/closure/bin/calcdeps.py";

$closurebuilder = $jsroot . "/closure-library/closure/bin/build/closurebuilder.py";
$closurecompiler = $projectRoot . "/engine/bin/Third-Party/closure_compiler/compiler.jar";

$java = "/usr/bin/java";


$cmdBuild = "$closurebuilder ";
#$cmdBuild .= " -i $googPath" . "/base.js -i $googPath" . "/deps.js ";
#$cmdBuild .= "-i $asyncPath" . "/deps.js ";
$cmdBuild .= "-i $sptPath" . "/main.js -i $jsroot" . "/deps.js ";
$cmdBuild .= "-i $geoPath" . "/main.js ";
#$cmdBuild .= "-i $sptPath -i $closurelib ";

$cmdBuild .= "--root $jsroot ";
#$cmdBuild .= "--root $closurelib --root $sptPath ";
$cmdBuild .= " -o script --output_file=$projectRoot" . "/html/jsc/precompiled.js";


print $cmdBuild;

system $cmdBuild;

## Compile with WHITESPACE_ONLY to semicompiled.js
$cmdCompile = "$java -jar $closurecompiler ";
$cmdCompile .= "--js $projectRoot" . "/html/jsc/precompiled.js --jscomp_warning=checkTypes ";
$cmdCompile .= "--js_output_file=$projectRoot" . "/html/jsc/semicompiled.js";
$cmdCompile .= "  --compilation_level=WHITESPACE_ONLY";
#$cmdCompile .= "  --create_name_map_files=true";
#$cmdCompile .= "  --create_source_map $projectRoot" . "/www/sourcemap";
#$cmdCompile .= " --define='core.DEBUG=false'";
$cmdCompile .= "  --define='goog.COMPILED=true'";

#print $cmdCompile;
system $cmdCompile;

## Don't do SIMPLE_OPTIMIZATIONS

## Compile with ADVANCED_OPTIMIZATIONS to compiled.js
## Use -Xmx1024m for giving more memory to java: http://groups.google.com/group/closure-compiler-discuss/browse_thread/thread/522fd9e9a87b9c92?hl=en#
$cmdCompile = "$java -Xmx1024m -jar $closurecompiler ";
$cmdCompile .= "--js $projectRoot" . "/html/jsc/precompiled.js ";
$cmdCompile .= "--js_output_file=$projectRoot" . "/html/jsc/compiled.js";
$cmdCompile .= "  --compilation_level=ADVANCED_OPTIMIZATIONS";
$cmdCompile .= "  --externs=$projectRoot" . "/engine/bin/Third-Party/compiler_externs.js";
# Formatting: Pretty print
#$cmdCompile .= "  --formatting PRETTY_PRINT";
$cmdCompile .= " --warning_level=verbose";
$cmdCompile .= " --jscomp_off=fileoverviewTags";
$cmdCompile .= " --summary_detail_level=3";
$cmdCompile .= " --jscomp_off=checkTypes";
$cmdCompile .= " --jscomp_warning=undefinedVars ";
$cmdCompile .= " ";
$cmdCompile .= " > ./compiler.out 2>&1";

system $cmdCompile;

system "cat compiler.out";
#print $cmdCompile;

