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

                    var recipients = aMsgHdr.recipients;
                    var prettyName = aMsgHdr.folder.server.prettyName;
                    var atPosition = prettyName.indexOf("@");
                    var hostName = prettyName.substring(atPosition+1,prettyName.length);
                    var userName = prettyName.substring(0,atPosition);
                    var subject = aMsgHdr.subject;
                    var listRecipients = recipients.split(" ");
                    var parent = aMsgHdr.folder.rootFolder;
                    magicFilter_listTargetDirs = [];
                    var listLength = 0;
                    if (prefs.getBoolPref("subaddressFilter")) {
                        listRecipients.forEach(function(entry){
                        
                            if (entry.startsWith(userName+".") && entry.endsWith("@"+hostName)) {
                                
                                var dirname = entry.substring(userName.length+1,entry.length-hostName.length-1);
                                
                                myPanel.label = "call creating folder function";
                                createSubfolderIfnotExists(parent,dirname);
                                listLength++;
                                
                            }
                        });


                    }
                    if (prefs.getBoolPref("mailinglistFilter")) {
                        var beginningIndex = 0;
                        var endIndex = 0;
                        while (subject.includes("[",endIndex) && subject.includes("]",endIndex+1)) {
                            beginningIndex = subject.indexOf("[",endIndex);
                            endIndex = subject.indexOf("]",beginningIndex);
                            mailinglistName = subject.substring(beginningIndex+1,endIndex);
                            myPanel.label = "found Mailinglist in subject. "+mailinglistName;
                            createSubfolderIfnotExists(parent,mailinglistName);
                            listLength++;
                        }
                    }
                    myPanel.label = "list Length: "+listLength;
                    setTimeout(function(){
                        myPanel.label = "now actually move message "+ magicFilter_listTargetDirs.length;
                        if (magicFilter_listTargetDirs.length == 1) {
                            myPanel.label = "unambigues folder";
                            var cs = Components.classes["@mozilla.org/messenger/messagecopyservice;1"].getService(Components.interfaces.nsIMsgCopyService);
                            var mutableArray = Components.classes["@mozilla.org/array;1"].createInstance(Components.interfaces.nsIMutableArray);
                                
                            mutableArray.appendElement(aMsgHdr, false /*weak*/);
                            cs.CopyMessages(aMsgHdr.folder,mutableArray,magicFilter_listTargetDirs[0],1,null,msgWindow,true);
                            myPanel.label = "moved message"
                        }
                    }, 2000*listLength+2000);
            }

                    
    }
}


function createSubfolderIfnotExists(parent,name) {
        document.getElementById("my-panel").label = "function called";
        try {
            parent.getChildNamed(name);
        } catch (err) {
            document.getElementById("my-panel").label = "to create folder";
            parent.createSubfolder(name,null);
            
        }
        document.getElementById("my-panel").label = "to return folder";
        
        setTimeout(function(){
            document.getElementById("my-panel").label = "find folder to add";
            var dir = parent.getChildNamed(name);
            document.getElementById("my-panel").label = "found folder to add";
            magicFilter_listTargetDirs.push(dir);
            document.getElementById("my-panel").label = "added folder to list "+magicFilter_listTargetDirs.length;
        }, 2000);
}


function init() {

    var notificationService =
    Components.classes["@mozilla.org/messenger/msgnotificationservice;1"]
    .getService(Components.interfaces.nsIMsgFolderNotificationService);
    notificationService.addListener(newMailListener, notificationService.msgAdded); 
}

addEventListener("load", init, true);

