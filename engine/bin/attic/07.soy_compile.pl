#!/usr/bin/perl
use POSIX qw(strftime);
use Time::Local;



######################### CONFIG ###############################
### date stamp
$dateStamp = strftime("%d-%m-%Y", localtime);
### Project Root
$projectRoot = "/Users/borjo/Devel/websites/geo-beta";
### Path for java
$java = "/usr/bin/java";


### No need to edit further unless ss folders are renamed
$templatesDir = $projectRoot . "/engine/templates/javascript/";
$soyCompiler = $projectRoot . "/sysfiles/bin/soyCompiler/SoyToJsSrcCompiler.jar";
$outputPathFormat = $projectRoot . "/geowarp.com/js/spt/templates/tpl_{INPUT_FILE_NAME_NO_EXT}.js";



$templates = "map/map.soy search/searchTextResults.soy search/searchFilters.soy common/controls.soy system/debug.soy user/register.soy common/timezones.soy user/profileMain.soy ui/controls/tabMenu.soy spot/draft/draftUserNavCtrl.soy spot/cat/catUserNavCtrl.soy spot/userSpotListing.soy spot/sdv/sdvMain.soy spot/sdv/sdvSpotTable.soy spot/sdv/sdvAddressTable.soy spot/sdv/sdvPhotosTable.soy spot/cat/catSelect.soy spot/cat/catManage.soy spot/cat/catManageSidebar.soy spot/save-edit/mainSpotForm.soy map/infowindows/infowinSpot.soy map/infowindows/infowinGeocode.soy map/infowindows/infowinClusterer.soy spot/sdv/spotStream.soy spot/sdv/sdvSidebar.soy search/searchGeocode.soy common/countries.soy mainpage/mainpage.soy cstm/help/helpAddSpot.soy stream/streamMain.soy user/publicProfile.soy web2.0/web2.0_repost.soy user/userUph.soy map/mapControls.soy";

$cmdCompile = "$java -jar $soyCompiler  --shouldProvideRequireSoyNamespaces --inputPrefix $templatesDir --outputPathFormat $outputPathFormat $templates";

system $cmdCompile;
