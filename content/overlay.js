window.addEventListener("load", function(e) { 
    startup(); 
}, false);

function startup() {
    var myPanel = document.getElementById("my-panel");
    myPanel.label = "Du nutzt magicFilters von Florian Schunk";
}

var newMailListener = {
    msgAdded: function(aMsgHdr) {
        var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                .getService(Components.interfaces.nsIPrefService)
                .getBranch("extensions.magicfilters.");
        var myPanel = document.getElementById("my-panel");
        if( !aMsgHdr.isRead ) {

                    var recipients = aMsgHdr.recipients;
                    var prettyName = aMsgHdr.folder.server.prettyName;
                    var atPosition = prettyName.indexOf("@");
                    var hostName = prettyName.substring(atPosition+1,prettyName.length);
                    var userName = prettyName.substring(0,atPosition);
                    var subject = aMsgHdr.subject;
                    var listRecipients = recipients.split(" ");
                    var listTargetDirs = [];
                    var listLength = 0;
                    if (prefs.getBoolPref("subaddressFilter")) {
                    listRecipients.forEach(function(entry){
                        
                            if (entry.startsWith(userName+".") && entry.endsWith("@"+hostName)) {
                                
                                var dirname = entry.substring(userName.length+1,entry.length-hostName.length-1);
                                parent = aMsgHdr.folder.rootFolder;
                                try {
                                    parent.getChildNamed(dirname);
                                } catch (err) {
                                    parent.createSubfolder(dirname,null);
                                }
                                listLength++;
                                setTimeout(function(){
                                    var dir = parent.getChildNamed(dirname);
                                    listTargetDirs.push(dir);
                                }, 2000);
                                
                            }
                        });

                        setTimeout(function(){
                            if (listTargetDirs.length == 1) {
                                var cs = Components.classes["@mozilla.org/messenger/messagecopyservice;1"].getService(Components.interfaces.nsIMsgCopyService);
                                var mutableArray = Components.classes["@mozilla.org/array;1"].createInstance(Components.interfaces.nsIMutableArray);
                                
                                mutableArray.appendElement(aMsgHdr, false /*weak*/);
                                cs.CopyMessages(aMsgHdr.folder,mutableArray,listTargetDirs[0],1,null,msgWindow,true);
                            }
                        }, 2000*listLength);
                    }
            }
                    
    }
}

function createSubfolderIfnotExists(parent,name) {

        try {
            parent.getChildNamed(name);
        } catch (err) {
            document.getElementById("my-panel").label = "to create folder";
            parent.createSubfolder(name,null);
            
        }
        document.getElementById("my-panel").label = "to return folder";
        return parent.getChildNamed(name);
}


function init() {

    var notificationService =
    Components.classes["@mozilla.org/messenger/msgnotificationservice;1"]
    .getService(Components.interfaces.nsIMsgFolderNotificationService);
    notificationService.addListener(newMailListener, notificationService.msgAdded); 
}

addEventListener("load", init, true);
