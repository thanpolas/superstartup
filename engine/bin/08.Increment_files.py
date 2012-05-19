#!/usr/bin/python

# Will export the devel tree into pre-production directory
# Then we will remove unwanted directories
# Copy the remaining tree to production directory
# Patch pre and prod configuration files
#
# 14/5/2010


import os
import re #regular exp
import sys

### Project Root
currentPath = os.getcwd()
# This is very ad-hoc, we chop off the '/engine/bin' part of the string
projectRoot = currentPath[0:-11]

phpfile = projectRoot + "/engine/bin/99.prodcounter_do_not_run.php"

# SHELL commands locations
rm = "/bin/rm";
mv = "/bin/mv";
cp = "/bin/cp";
git = "/usr/bin/git";

# CSS / JS / HEAD/FOOT Files
css1 = projectRoot + "/html/cssc/main.css";
jsc = projectRoot + "/html/jsc/compiled.js";
masterIconUrl = "/img/images/icons-master.png";
masterIcon = projectRoot + "/html" + masterIconUrl;

#indexFile = projectRoot + "/engine/CI/application/views/main_boothchat.php"


####################################################
####################################################
### PATCH PRODUCTION
### Rename CSS and JS files using never ending counter
###
####################################################

## Open counter holder file
fo = open("prodcounter" , "r+")
## Read all contents
strcount = fo.read()
## Add up by one the counter
newcount = int(strcount) + 1

## cast the counter back to string
strnewcount = str(newcount)

## reset file seeq
fo.seek(0,0)
## overwrite our new counter
fo.write(strnewcount)
## Close file
fo.close()

## create the string to be written on the PHP file
## that is included in each page load and informs PHP
## on which product counter we are on right now...

phpstring = "<?php define ('PRODCOUNTER', " + strnewcount + "); ?>"

fophp = open (phpfile, "r+")
fophp.write(phpstring)
fophp.close()


## now copy the originals to the incremented ones the files
## css1
fileCss = projectRoot + "/html/cssc/v/main_" + strnewcount + ".css"
fileJs = projectRoot + "/html/jsc/v/main_" + strnewcount + ".js"
fileMasterIconUrl = "/assets/pub/master_" + strnewcount + ".png"
fileMasterIcon = projectRoot + "/html" + fileMasterIconUrl

os.system(cp + " " + css1 + " " + projectRoot + "/html/cssc/v/main_" + strnewcount + ".css")
## And the js
os.system(cp + " " + jsc + " " + fileJs)
## Master Icon file
os.system(cp + " " + masterIcon + " " + fileMasterIcon)

print "\n\n#############################\nOpened counter file found: ", strcount , "\nSaved: ", strnewcount

## Replace in compiled new css file the master icon url
data = open(fileCss).read()
o = open(fileCss, "w")
o.write(re.sub(masterIconUrl, fileMasterIconUrl, data))
o.close()

print "\n All done!"
