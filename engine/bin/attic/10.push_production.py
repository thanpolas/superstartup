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
domainRoot = "/home/116255/users/.home/domains";
betaRoot = domainRoot + "/beeeta.boothchat.com";
productionRoot = domainRoot + "/boothchat.com";

preCore = productionRoot + "/engine/include/configuration/ss.config.php";

# SHELL commands locations
svn = "/usr/local/bin/svn";
rm = "/bin/rm";
mv = "/bin/mv";
cp = "/bin/cp";

print "Start Copying engine folder\n";
cmd = cp + " -fR " + betaRoot + "/engine/ " + productionRoot + "/";  
#print cmd;
os.system(cmd);

print "Start Copying html folder\n";
cmd = cp + " -fR " + betaRoot + "/html/ " + productionRoot + "/";
os.system(cmd);

# exit for now
sys.exit()

## PATCH PREPRODUCTION CORE :: PREPROD
preCoretmp = preCore + '.tmp'
o = open(preCoretmp, "w")
data = open(preCore).read()
o.write( re.sub("define\(\'PREPROD\', true\)", "define(\'PREPROD\', false)", data) )
o.close()
# overwrite old with new temp one
os.system(mv + " " + preCoretmp + " " + preCore)



## PATCH PREPRODUCTION CORE :: __DEBUG
o = open(preCoretmp, "w")
data = open(preCore).read()
o.write( re.sub("define\(\'ONSERVER\', false\)", "define(\'ONSERVER\', true)", data) )
o.close()
# overwrite old with new temp one
os.system(mv + " " + preCoretmp + " " + preCore)
