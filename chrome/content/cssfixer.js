
if ("undefined" == typeof(cssfixer)) {
    var cssfixer = {};
}

cssfixer.BrowserOverlay = {
    toolTab : null,
    cssfixer_close_button : null,
    cssfixer_inner_fixing_button : null,
    isInnerFixingOpened : false,
    execute : function(aEvent) {
        var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");
        var version = prefs.getComplexValue("extensions.lastPlatformVersion", Components.interfaces.nsISupportsString).data;
        var osString = Components.classes["@mozilla.org/xre/app-info;1"]  
                   .getService(Components.interfaces.nsIXULRuntime).OS;
        var UAPrefix = "Mozilla/5.0 (Android;mobile; rv:" + version + ")";
        var geckoVersion = " Gecko/" + version;
        var firefoxVersion = " Firefox/" + version;
        
        dump(UAPrefix + geckoVersion + firefoxVersion);
        UserAgentSwitcherPreferences.setStringPreference("general.useragent.appName", "Mozilla");
        UserAgentSwitcherPreferences.setStringPreference("general.appname.override", "Netscape");
        UserAgentSwitcherPreferences.setStringPreference("general.appversion.override", "5.0 (X11)");
        UserAgentSwitcherPreferences.setStringPreference("general.platform.override", osString);
        UserAgentSwitcherPreferences.setStringPreference("general.useragent.override", UAPrefix + geckoVersion + firefoxVersion);
        UserAgentSwitcherPreferences.setStringPreference("general.useragent.vendor", "");
        UserAgentSwitcherPreferences.setStringPreference("general.useragent.vendorSub", "");
        UserAgentSwitcherPreferences.setStringPreference("devtools.toolbox.host","side");
        

        
        var theTab          = gBrowser.addTab("www.baidu.com");
        this.toolTab = theTab;
        gBrowser.selectedTab = theTab;
        ResponsiveUI.toggle();
        this.init();

        //alert(typeof(DeveloperToolbar));
        
        this.nestScratchPad();
        gDevToolsBrowser.selectToolCommand(gBrowser,"inspector");
        DeveloperToolbar.focusToggle();
        //gDevToolsBrowser.toggleToolboxCommand(gBrowser);
    },
    
    exit : function(aEvent) {

        UserAgentSwitcherPreferences.deletePreference("general.useragent.appName");

        UserAgentSwitcherPreferences.deletePreference("general.appname.override");

        UserAgentSwitcherPreferences.deletePreference("general.appversion.override");

        UserAgentSwitcherPreferences.deletePreference("general.platform.override");

        UserAgentSwitcherPreferences.deletePreference("general.useragent.override");

        UserAgentSwitcherPreferences.deletePreference("general.useragent.vendor");
        
        this.cssfixer_inner_fixing_button.removeEventListener("command", this.toggleInnerFixing.bind(this), true);
        this.cssfixer_close_button.removeEventListener("command", this.exit.bind(this), true);
        
        if (this.toolTab) {
            gBrowser.removeTab(this.toolTab);
            this.toolTab = null;
        }

    },

    toggleInnerFixing : function(aEvent) {
        let stringBundle = document.getElementById("cssfixer-string-bundle");
        let openLabel = stringBundle.getString("cssfixer.open.inner.fixing");
        let closeLabel = stringBundle.getString("cssfixer.close.inner.fixing");
        if (this.isInnerFixingOpened) {
            this.isInnerFixingOpened = false;
            responseObserver.stopInnerFix();
            this.cssfixer_inner_fixing_button.setAttribute("label", "OpenIFix");
        } else {
            this.isInnerFixingOpened = true;
            responseObserver.startInnerFix();
            this.cssfixer_inner_fixing_button.setAttribute("label", "CloseIFix");
        }
        document.getElementById("urlbar-reload-button").click();
    },
    
    nestScratchPad : function() {

        var scratchpad = gDevTools.getToolDefinition("scratchpad");
        scratchpad.isTargetSupported = function (target) {
            return true;
        }
        gDevTools.registerTool(scratchpad);
    },
    
    init : function() {
        /*
        var container = window.gBrowser.getBrowserContainer(this.toolTab.linkedBrowser);
        var stack = container.querySelector(".browserStack");
        var toolbar = document.createElement("toolbar");
        var test = document.createElement("toolbarbutton");
        test.setAttribute("tabindex", "0");
        test.setAttribute("tooltiptext", "test");
        toolbar.appendChild(test);
        //this.rotatebutton.className = "devtools-responsiveui-toolbarbutton devtools-responsiveui-rotate";
        container.insertBefore(toolbar, stack);
        */
        var container = window.gBrowser.getBrowserContainer(this.toolTab.linkedBrowser);
        var toolbar = container.querySelector(".devtools-responsiveui-toolbar");
        this.cssfixer_close_button = document.createElement("toolbarbutton");
        this.cssfixer_close_button.setAttribute("tabindex", "0");
        this.cssfixer_close_button.setAttribute("tooltiptext", "Close");
        this.cssfixer_close_button.setAttribute("label", "Close");
        this.cssfixer_close_button.className = "devtools-responsiveui-toolbarbutton devtools-toolbarbutton shut-down-cssfixer";
        this.cssfixer_close_button.addEventListener("command", this.exit.bind(this), true);

        this.cssfixer_inner_fixing_button = document.createElement("toolbarbutton");
        this.cssfixer_inner_fixing_button.setAttribute("tabindex", "0");
        this.cssfixer_inner_fixing_button.setAttribute("tooltiptext", "Open inner fixing");
        this.cssfixer_inner_fixing_button.setAttribute("label", "OpenIFix");
        this.cssfixer_inner_fixing_button.className = "devtools-responsiveui-toolbarbutton devtools-toolbarbutton open-inner-fixing";
        this.cssfixer_inner_fixing_button.addEventListener("command", this.toggleInnerFixing.bind(this), true);

        var separator = document.createElement("toolbarseparator");
        toolbar.appendChild(separator);
        toolbar.appendChild(this.cssfixer_close_button);
        toolbar.appendChild(this.cssfixer_inner_fixing_button);
    },
};

if ("undefined" == typeof(responseObserver)) {
    var responseObserver = {};
}

responseObserver.startInnerFix = function(){
    var observerService = Cc["@mozilla.org/observer-service;1"]
    .getService(Ci.nsIObserverService);

    observerService.addObserver(httpRequestObserver,
    "http-on-examine-response", false);
    observerService.addObserver(httpRequestObserver,
    "http-on-examine-cached-response", false);
};

responseObserver.stopInnerFix = function(){
    var observerService = Cc["@mozilla.org/observer-service;1"]
    .getService(Ci.nsIObserverService);

    observerService.removeObserver(httpRequestObserver,
    "http-on-examine-response", false);
    observerService.removeObserver(httpRequestObserver,
    "http-on-examine-cached-response", false);
};

var httpRequestObserver =
{
    observe: function(aSubject, aTopic, aData)
    {
        if (aTopic == "http-on-examine-response")
        {
            var newListener = new TracingListener();
            aSubject.QueryInterface(Ci.nsITraceableChannel);
            newListener.originalListener = aSubject.setNewListener(newListener);
        } else if (aTopic == "http-on-examine-cached-response") {
            var newListener = new TracingListener();
            aSubject.QueryInterface(Ci.nsITraceableChannel);
            newListener.originalListener = aSubject.setNewListener(newListener);
        }
    },

    QueryInterface : function (aIID)
    {
        if (aIID.equals(Ci.nsIObserver) ||
            aIID.equals(Ci.nsISupports))
        {
            return this;
        }

        throw Components.results.NS_NOINTERFACE;

    }
};

let Cc = Components.classes;
let Ci = Components.interfaces;
let observerService = Cc["@mozilla.org/observer-service;1"]
    .getService(Ci.nsIObserverService);

let cssMapping = {
    '-webkit-box' : '-moz-box',
    '-webkit-flex' : '-moz-flex',
    '-webkit-box-sizing' : '-moz-box-sizing', 
    '-webkit-user-select' : '-moz-user-select', 
    '-webkit-align-items' : 'align-items', 
    '-webkit-align-self' : 'align-self', 
    '-webkit-animation' : '-moz-animation', 
    '-webkit-animation-delay' : '-moz-animation-delay', 
    '-webkit-animation-direction' : '-moz-animation-direction', 
    '-webkit-animation-duration' : '-moz-animation-duration', 
    '-webkit-animation-fill-mode' : '-moz-animation-fill-mode', 
    '-webkit-animation-iteration-count' : '-moz-animation-iteration-count', 
    '-webkit-animation-name' : '-moz-animation-name', 
    '-webkit-animation-play-state' : '-moz-animation-play-state', 
    '-webkit-animation-timing-function' : '-moz-animation-timing-function', 
    '-webkit-appearance' : '-moz-appearance', 
    '-webkit-backface-visibility' : '-moz-backface-visibility', 
    '-webkit-background-clip' : 'background-clip', 
    '-webkit-background-origin' : 'background-origin', 
    '-webkit-background-size' : 'background-size', 
    '-webkit-border' : 'border', 
    '-webkit-border-end' : '-moz-border-end', 
    '-webkit-border-end-color' : '-moz-border-end-color', 
    '-webkit-border-end-style' : '-moz-border-end-style', 
    '-webkit-border-end-width' : '-moz-border-end-width', 
    '-webkit-border-start' : '-moz-border-start', 
    '-webkit-border-start-color' : '-moz-border-start-color', 
    '-webkit-border-start-style' : '-moz-border-start-style', 
    '-webkit-border-start-width' : '-moz-border-start-width', 
    '-webkit-border-image' : '-moz-border-image', 
    '-webkit-border-radius' : '-moz-border-radius', 
    '-webkit-box-align' : '-moz-box-align', 
    '-webkit-box-direction' : '-moz-box-direction', 
    '-webkit-box-flex' : '-moz-box-flex', 
    '-webkit-box-ordinal-group' : '-moz-box-ordinal-group', 
    '-webkit-box-orient' : '-moz-box-orient', 
    '-webkit-box-pack' : '-moz-box-pack', 
    '-webkit-box-shadow' : 'box-shadow', 
    '-webkit-clip-path' : 'clip-path', 
    '-webkit-column-count' : '-moz-column-count', 
    '-webkit-column-width' : '-moz-column-width', 
    '-webkit-column-gap' : '-moz-column-gap', 
    '-webkit-column-rule' : '-moz-column-rule', 
    '-webkit-column-rule-color' : '-moz-column-rule-color', 
    '-webkit-column-rule-style' : '-moz-column-rule-style', 
    '-webkit-column-rule-width' : '-moz-column-rule-width', 
    '-webkit-columns' : '-moz-columns', 
    '-webkit-filter' : 'filter', 
    '-webkit-flex' : 'flex', 
    '-webkit-flex-basis' : '-moz-flex-basis', 
    '-webkit-flex-direction' : '-moz-flex-direction', 
    '-webkit-flex-grow' : 'flex-grow', 
    '-webkit-flex-shrink' : 'flex-shrink', 
    '-webkit-justify-content' : 'justify-content', 
    '-webkit-order' : 'order', 
    '-webkit-padding-start' : '-moz-padding-start', 
    '-webkit-padding-end' : '-moz-padding-end', 
    '-webkit-perspective' : '-moz-perspective', 
    '-webkit-perspective-origin' : '-moz-perspective-origin', 
    '-webkit-text-size-adjust' : '-moz-text-size-adjust', 
    '-webkit-stroke' : 'stroke', 
    '-webkit-stroke-width' : 'stroke-width', 
    '-webkit-transform' : '-moz-transform', 
    '-webkit-transform-origin' : '-moz-transform-origin', 
    '-webkit-transform-style' : '-moz-transform-style', 
    '-webkit-transition' : '-moz-transition', 
    '-webkit-transition-delay' : '-moz-transition-delay', 
    '-webkit-transition-duration' : '-moz-transition-duration', 
    '-webkit-transition-property' : '-moz-transition-property', 
    '-webkit-transition-timing-function' : '-moz-transition-timing-function', 
    '-webkit-user-modify' : '-moz-user-modify'
};

function cssInnerFix(inputStr) {
    for (var key in cssMapping) {
        if (inputStr.indexOf(key)>=0) {
            if (cssMapping.hasOwnProperty(key)) {
                inputStr = inputStr.replace(new RegExp(key,'g'),cssMapping[key]);

            }
        }
        
    }
    return inputStr;
}

function CCIN(cName, ifaceName) {
        return Cc[cName].createInstance(Ci[ifaceName]);
    }


function TracingListener() {
    this.originalListener = null;
    this.receivedData = [];   // array for incoming data.
}

TracingListener.prototype =
{
    onDataAvailable: function(request, context, inputStream, offset, count)
    {
        //alert(typeof(request.URI));
            var binaryInputStream = CCIN("@mozilla.org/binaryinputstream;1",
                "nsIBinaryInputStream");
            binaryInputStream.setInputStream(inputStream);
            var data = binaryInputStream.readBytes(count);
            this.receivedData.push(data);
            /*
        } else {
            this.originalListener.onDataAvailable(request, context, inputStream, offset, count);
        }
        */
    },

    onStartRequest: function(request, context) {
        this.originalListener.onStartRequest(request, context);
    },

    onStopRequest: function(request, context, statusCode)
    {
        // Get entire response
        if (this.receivedData.length > 0) {
            var responseSource = this.receivedData.join('');
            this.receivedData = [];
            responseSource = cssInnerFix(responseSource);

            var storageStream = CCIN("@mozilla.org/storagestream;1", "nsIStorageStream");
            var binaryOutputStream = CCIN("@mozilla.org/binaryoutputstream;1",
                    "nsIBinaryOutputStream");
    
            var responseLength = responseSource.length;

            if (responseLength <= 8192) {
                storageStream.init(8192, responseLength, null);
            } else if (responseLength <= 16384) {
                storageStream.init(16384, responseLength, null);
            } else if (responseLength <= 32768) {
                storageStream.init(32768, responseLength, null);
            } else if (responseLength <= 65536) {
                storageStream.init(65536, responseLength, null);
            } else if (responseLength <= 131072) {
                storageStream.init(131072, responseLength, null);
            } else if (responseLength <= 262144) {
                storageStream.init(262144, responseLength, null);
            } else if (responseLength <= 524288) {
                storageStream.init(524288, responseLength, null);
            } else if (responseLength <= 1048576) {
                storageStream.init(1048576, responseLength, null);
            } else if (responseLength <= 2097152) {
                storageStream.init(2097152, responseLength, null);
            }
            binaryOutputStream.setOutputStream(storageStream.getOutputStream(0));
    
            // Copy received data as they come.
            
            binaryOutputStream.writeBytes(responseSource, responseSource.length);
    
            this.originalListener.onDataAvailable(request, context,
                storageStream.newInputStream(0), 0, responseSource.length);

        }
        this.originalListener.onStopRequest(request, context, statusCode);
    },

    QueryInterface: function (aIID) {
        if (aIID.equals(Ci.nsIStreamListener) ||
            aIID.equals(Ci.nsISupports)) {
            return this;
        }
        throw Components.results.NS_NOINTERFACE;
    }
}