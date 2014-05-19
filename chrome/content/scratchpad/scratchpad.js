var scratchpadOverlay = scratchpadOverlay || {};

scratchpadOverlay._initialWindowTitle = document.title;
scratchpadOverlay.dirty = false;

scratchpadOverlay.saveFileAs = function (aCallback)
  {
    let fp = Cc["@mozilla.org/filepicker;1"].createInstance(Ci.nsIFilePicker);
    let fpCallback = aResult => {
      if (aResult != Ci.nsIFilePicker.returnCancel) {
        Scratchpad.setFilename(fp.file.path);
        Scratchpad.exportToFile(fp.file, true, false, aStatus => {
          if (Components.isSuccessCode(aStatus)) {
            Scratchpad.dirty = false;
            Scratchpad.setRecentFile(fp.file);
          }
          if (aCallback) {
            aCallback(aStatus);
          }
        });
      }
    };

    fp.init(window, Scratchpad.strings.GetStringFromName("saveFileAs"),
            Ci.nsIFilePicker.modeSave);
    
    var defaultName = this.getCurURL();
    defaultName = this.replace(defaultName, "\\.", "_");
    defaultName = this.replace(defaultName, "/", "_");
    defaultName += ".js";
    fp.defaultString = defaultName;
    fp.appendFilter("JavaScript Files", "*.js; *.jsm; *.json");
    fp.appendFilter("All Files", "*.*");
    fp.open(fpCallback);
  };
  
  scratchpadOverlay.getCurURL = function() {
    var hostName = Scratchpad.gBrowser.getBrowserForTab(Scratchpad.gBrowser.selectedTab).currentURI.host;
    var path = Scratchpad.gBrowser.getBrowserForTab(Scratchpad.gBrowser.selectedTab).currentURI.path;
    var end = path.length;
    if (path.indexOf("#") >= 0) {
        end = path.indexOf("#");
    } else if (path.indexOf("?") >= 0) {
        end = path.indexOf("?");
    }
    path = path.substring(0, end);

    return this.trim(hostName + path);
  };
  
  scratchpadOverlay.trim = function(srcStr) {
    var start=0, stop = srcStr.length-1;
    while(srcStr[start] == ' ' || srcStr[start] == '\\' || srcStr[start] == '/') start ++;
    while(srcStr[stop] == ' ' || srcStr[stop] == '\\' || srcStr[stop] == '/') stop --;
    if (stop >= start) {
        return srcStr.substring(start, stop+1);
    }
    return "";
  };
  
  scratchpadOverlay.replace = function(src, target, dest) {
    return src.replace(new RegExp(target,'g'),dest);
  };

scratchpadOverlay.saveFile = function (aCallback)
  {
    if (!Scratchpad.filename) {
      return this.saveFileAs(aCallback);
    }

    let file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
    file.initWithPath(Scratchpad.filename);

    Scratchpad.exportToFile(file, true, false, aStatus => {
      if (Components.isSuccessCode(aStatus)) {
        Scratchpad.dirty = false;
        document.getElementById("sp-cmd-revert").setAttribute("disabled", true);
        Scratchpad.setRecentFile(file);
      }
      if (aCallback) {
        aCallback(aStatus);
      }
    });
  };
