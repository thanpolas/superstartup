/**
 * Module for VideoCapture
 *
 * implements the http://www.webcamsnapper.com/ API
 * 
 * supported events:
 * videoCaptured :: videoId{string} Triggers when we have a save event
 * videoUrlReady :: videoId{string}, videoUrl{string}, thumb{string=}
 *  Triggers when the 3rd party API reports that the video is ready to be served
 * 
 * 
 */

    // Default module configuration.
    var _c={

    };
    
    // shortcut assignments
    var w = window;
    var j = w.jQuery;


    /**
     * Our webcam dialog
     * @var {jQuery|null}
     */
    var camdialog = null;


   
    //
    // EVENT HANDLERS
    //


    //
    // PUBLIC VARIABLES / METHODS
    //



    /**
     * Attach event handlers
     */
    $().ready(function() {
        // click event to open video capture div
        j("#clickVideo").click(function(){
            camdialog.dialog('open');
        });
        
        // bind on NIMBB events
        //_NBbindEvents();
        
        // start webcam snapper
        _WSinit();
        
        // bind webcam snapper events
        _WSbindEvents();
        
        // initialize webcam dialog 
        _dialogInit();
        
    });


    /**
     * Call this function when user finished capturing video and submited 
     * it for saving. But have not received a url yet (video is ready to
     * serve from 3rd party)
     * 
     * This step may be ommited depending on the third party service
     * 
     * @private
     * @param {string} videoId
     * @return {void}
     */
    function _onVideoCaptured(videoId) {
        _log('videoCaptured, videoId:'+ videoId);
    };
    
    /**
     * Call this function when 3rd party service has finished 
     * proccessing the captured video and has returned a url to fetch it from
     * 
     * @private
     * @param {string} videoId
     * @param {string} videoUrl
     * @param {string=} opt_thumb
     * @return {void}
     */
    function _onVideoUrlReady(videoId, videoUrl, opt_thumb) {
        _log('videoUrlReady, videoId:' + videoId +  'videoUrl:' + videoUrl + 'thumb:' + opt_thumb);
    }

    /**
     * Initializes the webcam dialog
     * 
     * @return {void}
     */
    function _dialogInit() {
        try {
        
        camdialog = j('#webcam_dialog');
        camdialog.dialog({
                title:'Capture a video',
                modal: true,
                width: 575,
                resizable:false,
                draggable:false,
                autoOpen: false,
                closeOnEscape: true
        });
        
        } catch (e) {console.log(e);}
    }

    /**
     * Initialize webcam snapper swf object
     * 
     * @return {void}
     */
    function _WSinit() {
        try {
        var flashvars = {};

        flashvars.onClickSaveVideoJS = "onClickSaved";    // default = ""

        flashvars.customHexColor = "FFFFFF";  // default = FFFFFF,  player border color
        flashvars.padding = "0,0,0,0";        // default = "0,0,0,0", padding of the video area, top,right,bottom,left
        flashvars.backgroundType = "bgRectNoShadow";        // default = "bgRoundNoShadow",  consist of 4 > "bgRectNoShadow";"bgRectWithShadow";"bgRoundNoShadow";"bgRoundNoShadow";
        flashvars.recordServer = 'rtmp://media.codegent.net/records'; 
        flashvars.recordName = "";        // default = "" = use random name
        flashvars.previewServer = 'rtmp://media.codegent.net/records';
        flashvars.maxRecordDuration = 60;     // default 300, in seconds

        flashvars.camFullWidth = 320; // 320+20;         // default
        flashvars.camFullHeight = 240; // 240+20;        // default

        flashvars.cam_max_bandwidth = 200;     // default = 150(kbps)
        flashvars.camFPS = 20;                // default = 15 fps
        flashvars.camQuality = 100;            // default = 90

        // need audio quality settings

        flashvars.micGain = 100;
        flashvars.micSilenceLevel = 0;   // default = 10,  value 0-100 (100 = mute)
        flashvars.micSilenceTimeout = 0;  // default = 2 seconds



        flashvars.hideSoundDetect = 1;   // 0 = auto show/hide, 1 = completly turn of sound detection
        flashvars.hideInfoBtn = 1;        // default = 0, 1 = show, 0 = hide

        flashvars.video_border_size=1;
        flashvars.video_border_color='999999';
        flashvars.show_setting_on_start=0;
        flashvars.camera_security_type=0;
        flashvars.backgroundType='bgRoundWithShadow';
        flashvars.padding="20,20,5,20";

        var params = {};
        params.menu = "false";
        params.bgcolor = "#FFFFFF";
        params.wmode = 'opaque';

        var attributes = {};
        attributes.id = "recorder";
        attributes.name = "recorder";
        attributes.allowScriptAccess = "always";

        var width = 520; 
        var height = 446;

        w.swfobject.embedSWF("http://www.webcamsnapper.com/latest/recorder.swf", 
            "flashcontent", width, height, "9.0.0", "http://www.webcamsnapper.com/latest/expressInstall.swf", 
            flashvars, params, attributes);
            
        } catch(e) {console.log(e);}
    };

    /**
     * Bind events for webcam spapper 3rd party product
     * 
     * @return {void}
     */
    function _WSbindEvents() {
        try {
            
        // User completed capturing and saved the video
        w.onClickSaved = function(recordName){
            var uid = recordName[0];
            var outputs = _WSoutputsForStream(uid);
            _log('Saved file with id:' + uid);
            // close the dialog
            camdialog.dialog('close');
            
            // call our internal trigger
            _onVideoUrlReady(uid, outputs.mp4, outputs.png);
            
        }
        w.backToCapture = function(){};

        // recording completed
        w.onRecordComplete = function(){};

        w.onStartRecord = function(recordName){};

        w.onCancelRecord = function(recordName){};
        } catch(e) {console.log(e);}
    }
    
    /**
     * Create a data object with file URL's based on given name
     * for the webcam snapper service
     * 
     * @private
     * @param {string} name The name (uniqueId) of the captured file
     * @return {Object}
     */
    function _WSoutputsForStream(name){
        var outputs = {};
        outputs['png'] = 'http://media.codegent.net/png.php/records/' + name + '.png';
        outputs['flv'] = 'http://media.codegent.net/flv.php/records/' + name + '.flv';
        outputs['mp4'] = 'http://media.codegent.net/mp4.php/records/' + name + '.mp4';
        outputs['3gp'] = 'http://media.codegent.net/3gp.php/records/' + name + '.3gp';
        return outputs;
    }    
    

    
        
        
    
    // debug function
    function _log (content) {
        if(true)
            //$("#videoconsole").append('<span>' + content + '</span><br />');
            w.console.log(content);
    }
    

  
    

