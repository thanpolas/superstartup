#!/usr/bin/perl
use POSIX qw(strftime);
use Time::Local;

######################### CONFIG ###############################

$java = "/usr/bin/java";


### Project Root
$projectRoot = "../..";
### Rest subfolders
$jsroot = $projectRoot . "/html/js";
$closurelib = $jsroot . "/closure-library";
$googPath = $jsroot . "/closure-library/closure/goog";
#3rd party apps...
$asyncPath = $jsroot . "/closure-library/third_party/closure/goog";
$calcdeps = $jsroot . "/closure-library/closure/bin/calcdeps.py";
$closurebuilder = $jsroot . "/closure-library/closure/bin/build/closurebuilder.py";
$closurecompiler = $projectRoot . "/engine/bin/Third-Party/closure_compiler/compiler.jar";
######################### CONFIG END ###########################

$cmdBuild = "$closurebuilder ";
$cmdBuild .= "-i $jsroot" . "/ss/main.js -i $jsroot" . "/deps.js ";
$cmdBuild .= "--root $jsroot ";
$cmdBuild .= " -o script --output_file=$projectRoot" . "/html/jsc/precompiled.js";
$cmdBuild .= " > /dev/null 2>&1";

system $cmdBuild;

## Compile with WHITESPACE_ONLY to semicompiled.js
$cmdCompile = "$java -jar $closurecompiler ";
$cmdCompile .= "--js $projectRoot" . "/html/jsc/precompiled.js --jscomp_warning=checkTypes ";
$cmdCompile .= "--js_output_file=$projectRoot" . "/html/jsc/semicompiled.js";
$cmdCompile .= "  --compilation_level=WHITESPACE_ONLY";
$cmdCompile .= "  --define='goog.COMPILED=true'";
$cmdCompile .= " >> ./compiler.out 2>&1";
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
$cmdCompile .= " >> ./compiler.out 2>&1";

system $cmdCompile;

print "JS Compiled. See output in engine/bin/compiler.out\n";

