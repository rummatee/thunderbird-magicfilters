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

                    myPanel.label = "create Object representing the target message";
                    var target = {};
                    myPanel.label = "created Object";
                    target.recipients = aMsgHdr.recipients;
                    myPanel.label = "set first value";
                    target.prettyName = aMsgHdr.folder.server.prettyName;
                    target.atPosition = target.prettyName.indexOf("@");
                    target.hostName = target.prettyName.substring(target.atPosition+1,target.prettyName.length);
                    target.userName = target.prettyName.substring(0,target.atPosition);
                    myPanel.label = "set names";
                    target.subject = aMsgHdr.subject;
                    target.listRecipients = target.recipients.split(" ");
                    target.parent = aMsgHdr.folder.rootFolder;
                    target.listDestinations = [];
                    target.listLength = 0;
                    myPanel.label = "set all values";
                    if (prefs.getBoolPref("subaddressFilter")) {
                        target.listRecipients.forEach(function(entry){
                        
                            if (entry.startsWith(target.userName+".") && entry.endsWith("@"+target.hostName)) {
                                
                                var dirname = entry.substring(target.userName.length+1,entry.length-target.hostName.length-1);
                                
                                myPanel.label = "call creating folder function";
                                createSubfolderIfnotExists(target,dirname);
                                myPanel.label = "returned from function";
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
                            myPanel.label = "found Mailinglist in subject. "+mailinglistName;
                            createSubfolderIfnotExists(target,mailinglistName);
                            target.listLength++;
                        }
                    }
                    myPanel.label = "list Length: "+target.listLength;
                    setTimeout(function(){
                        myPanel.label = "now actually move message "+ magicFilter_listTargetDirs.length;
                        if (target.listDestinations.length == 1) {
                            myPanel.label = "unambigues folder";
                            var cs = Components.classes["@mozilla.org/messenger/messagecopyservice;1"].getService(Components.interfaces.nsIMsgCopyService);
                            var mutableArray = Components.classes["@mozilla.org/array;1"].createInstance(Components.interfaces.nsIMutableArray);
                                
                            mutableArray.appendElement(aMsgHdr, false /*weak*/);
                            cs.CopyMessages(aMsgHdr.folder,mutableArray,target.listDestinations[0],1,null,msgWindow,true);
                            myPanel.label = "moved message"
                        }
                    }, 2000*target.listLength+2000);
            }

                    
    }
}


function createSubfolderIfnotExists(target,name) {
        document.getElementById("my-panel").label = "function called";
        try {
            target.parent.getChildNamed(name);
        } catch (err) {
            document.getElementById("my-panel").label = "to create folder";
            target.parent.createSubfolder(name,null);
            
        }
        document.getElementById("my-panel").label = "to return folder";
        
        setTimeout(function(){
            document.getElementById("my-panel").label = "find folder to add";
            var dir = target.parent.getChildNamed(name);
            document.getElementById("my-panel").label = "found folder to add";
            target.listDestinations.push(dir);
            document.getElementById("my-panel").label = "added folder to list "+target.listDestinations.length;
        }, 2000);
}


function init() {

    var notificationService =
    Components.classes["@mozilla.org/messenger/msgnotificationservice;1"]
    .getService(Components.interfaces.nsIMsgFolderNotificationService);
    notificationService.addListener(newMailListener, notificationService.msgAdded); 
}

addEventListener("load", init, true);

