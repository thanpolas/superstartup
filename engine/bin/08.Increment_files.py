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
### projectRoot = "/Users/borjo/Devel/websites/boothchat";
### projectRoot = "/home/116255/users/.home/domains/beeeta.boothchat.com";
currentPath = os.getcwd()
# This is very ad-hoc, we chop off the '/engine/bin' part of the string
projectRoot = currentPath[0:-11]


phpfile = projectRoot + "/engine/bin/99.prodcounter_do_not_run.php"

# SHELL commands locations
rm = "/bin/rm";
mv = "/bin/mv";
cp = "/bin/cp";
git = "/usr/bin/git";


# Patch files
core = '/html/start.php'

# CSS / JS / HEAD/FOOT Files
css1 = projectRoot + "/html/cssc/main1.css";
sfv = projectRoot + "/html/cssc/sfv.css";
jsc = projectRoot + "/html/jsc/semicompiled.js";
masterIconUrl = "/img/images/icons-master.png";
masterIcon = projectRoot + "/html" + masterIconUrl;

indexFile = projectRoot + "/engine/CI/application/views/main_boothchat.php"


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

##if 0 : print "true"
##else :
##  print "not true"

## create the string to be written on the PHP file
## that is included in each page load and informs PHP
## on which product counter we are on right now...

phpstring = "<?php define ('PRODCOUNTER', " + strnewcount + "); ?>"

fophp = open (phpfile, "r+")
fophp.write(phpstring)
fophp.close()


## now copy the originals to the incremented ones the files
## css1
fileCss = projectRoot + "/html/cssc/v/main1_" + strnewcount + ".css"
fileJs = projectRoot + "/html/jsc/v/main_" + strnewcount + ".js"
fileCssSFV = projectRoot + "/html/cssc/v/sfv_" + strnewcount + ".css"
fileMasterIconUrl = "/img/vers/master_" + strnewcount + ".png"
fileMasterIcon = projectRoot + "/html" + fileMasterIconUrl

os.system(cp + " " + css1 + " " + projectRoot + "/html/cssc/v/main1_" + strnewcount + ".css")
## And the js
os.system(cp + " " + jsc + " " + fileJs)

## SFV CSS
os.system(cp + " " + sfv + " " + fileCssSFV)
## Master Icon file
os.system(cp + " " + masterIcon + " " + fileMasterIcon)





## if (os.path.isfile())

##sys.exit()





print "\n\n#############################\nOpened counter file found: ", strcount , "\nSaved: ", strnewcount


## Replace in compiled new css file the master icon url
data = open(fileCss).read()
o = open(fileCss, "w")
o.write(re.sub(masterIconUrl, fileMasterIconUrl, data))
o.close()


## Do the same for the SFV css
data = open(fileCssSFV).read()
o = open(fileCssSFV, "w")
o.write(re.sub(masterIconUrl, fileMasterIconUrl, data))
o.close()



## tmp = indexFile + '.tmp'
## o = open(headtmp, "w")
## data = open(indexFile).read()
## o.write( re.sub("main1.css", "v/main1_" + strnewcount + ".css", data))
## o.close()
#### overwrite old with new temp one
## os.system(mv + " " + headtmp + " " + indexFile)



### Add them up to git
os.system(git + " add " + fileCss + " " + fileJs + " " + fileCssSFV + " " + fileMasterIcon)




#### Now the js file
## foottmp = indexFile + '.tmp'
## o = open(foottmp, "w")
## data = open(indexFile).read()
## o.write( re.sub("semicompiled.js", "v/main_" + strnewcount + ".js", data))
## o.close()
#### overwrite old with new temp one
##os.system(mv + " " + foottmp + " " + indexFile)










print "\n All done!"
