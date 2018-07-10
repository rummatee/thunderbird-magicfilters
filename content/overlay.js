window.addEventListener("load", function(e) { 
    startup(); 
}, false);

function startup() {
    var myPanel = document.getElementById("my-panel");
    myPanel.label = "Du nutzt magicFilters von Florian Schunk";
}

var magicFilter_listTargetDirs = [];
var newMailListener = {
    msgAdded: function(aMsgHdr) {
        var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                .getService(Components.interfaces.nsIPrefService)
                .getBranch("extensions.magicfilters.");
        var myPanel = document.getElementById("my-panel");
        if( !aMsgHdr.isRead ) {

                    var target = {};
                    target.recipients = aMsgHdr.recipients;
                    target.prettyName = aMsgHdr.folder.server.prettyName;
                    target.atPosition = target.prettyName.indexOf("@");
                    target.hostName = target.prettyName.substring(target.atPosition+1,target.prettyName.length);
                    target.userName = target.prettyName.substring(0,target.atPosition);
                    target.subject = aMsgHdr.subject;
                    target.listRecipients = target.recipients.split(" ");
                    target.parent = aMsgHdr.folder.rootFolder;
                    target.listDestinations = [];
                    target.listLength = 0;
                    if (prefs.getBoolPref("subaddressFilter")) {
                        target.listRecipients.forEach(function(entry){
                        
                            if (entry.startsWith(target.userName+".") && entry.endsWith("@"+target.hostName)) {
                                
                                var dirname = entry.substring(target.userName.length+1,entry.length-target.hostName.length-1);
                                
                                createSubfolderIfnotExists(target,dirname);
                                target.listLength++;
                                
                            }
                        });


                    }
                    if (prefs.getBoolPref("mailinglistFilter")) {
                        var beginningIndex = 0;
                        var endIndex = 0;
                        while (target.subject.includes("[",endIndex) && target.subject.includes("]",endIndex+1)) {
                            beginningIndex = target.subject.indexOf("[",endIndex);
                            endIndex = target.subject.indexOf("]",beginningIndex);
                            mailinglistName = target.subject.substring(beginningIndex+1,endIndex);
                            createSubfolderIfnotExists(target,mailinglistName);
                            target.listLength++;
                        }
                    }
                    setTimeout(function(){
                        if (target.listDestinations.length == 1) {
                            var cs = Components.classes["@mozilla.org/messenger/messagecopyservice;1"].getService(Components.interfaces.nsIMsgCopyService);
                            var mutableArray = Components.classes["@mozilla.org/array;1"].createInstance(Components.interfaces.nsIMutableArray);
                                
                            mutableArray.appendElement(aMsgHdr, false /*weak*/);
                            cs.CopyMessages(aMsgHdr.folder,mutableArray,target.listDestinations[0],1,null,msgWindow,true);
                        }
                    }, 2000*target.listLength+2000);
            }

                    
    }
}


function createSubfolderIfnotExists(target,name) {
        var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                .getService(Components.interfaces.nsIPrefService)
                .getBranch("extensions.magicfilters.");
        var parserMode = prefs.getComplexValue("parseMode", Components.interfaces.nsISupportsString).data;
        document.getElementById("my-panel").label = "get Reverse Prefs";
        var parserReverse = prefs.getBoolPref("parseReverse");
        if (parserReverse) {
            document.getElementById("my-panel").label = "reverse Parts";
            var partsList = name.split(".");
            document.getElementById("my-panel").label = "split list";
            partsList.reverse();
            document.getElementById("my-panel").label = "reverse List";
            name = partsList.join(".");
            document.getElementById("my-panel").label = "Join List";
        }
        if (parserMode=="replace") {
            name = name.replace(/\./g,"-");
            document.getElementById("my-panel").label = "replaced dots";
        }
        try {
            target.parent.getChildNamed(name);
        } catch (err) {
            document.getElementById("my-panel").label = "to create folder";
            target.parent.createSubfolder(name,null);
            
        }
        
        setTimeout(function(){
            document.getElementById("my-panel").label = "find folder to add";
            var parent = target.parent;
            if (parserMode=="subfolders") {
                document.getElementById("my-panel").label = "find subfolders";
                while (name.includes(".")) {
                    document.getElementById("my-panel").label = name.indexOf(".");
                    var subdir = name.substring(0, name.indexOf("."));
                    document.getElementById("my-panel").label = subdir;
                    parent = parent.getChildNamed(subdir);
                    document.getElementById("my-panel").label = "oldname: "+name;
                    name = name.substring(name.indexOf(".")+1,name.length);
                    document.getElementById("my-panel").label = "name: "+name;
                }
            }

            var dir = parent.getChildNamed(name);
            target.listDestinations.push(dir);
        }, 2000);
}


function init() {

    var notificationService =
    Components.classes["@mozilla.org/messenger/msgnotificationservice;1"]
    .getService(Components.interfaces.nsIMsgFolderNotificationService);
    notificationService.addListener(newMailListener, notificationService.msgAdded); 
}

addEventListener("load", init, true);

