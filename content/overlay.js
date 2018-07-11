//load preferences
var prefs = Components.classes["@mozilla.org/preferences-service;1"]
        .getService(Components.interfaces.nsIPrefService)
        .getBranch("extensions.magicfilters.");

//the main Listener to filter Mails
var newMailListener = {
    msgAdded: function(aMsgHdr) {
        var myPanel = document.getElementById("my-panel");
        //if messages are read, we assume the user already handled them
        if( !aMsgHdr.isRead ) {

                    //read the data from the mail header
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

                    //filter for subaddresses
                    if (prefs.getBoolPref("subaddressFilter")) {
                        target.listRecipients.forEach(function(entry){
                        
                            if (entry.startsWith(target.userName+".") && entry.endsWith("@"+target.hostName)) {
                                
                                var dirname = entry.substring(target.userName.length+1,entry.length-target.hostName.length-1);
                                createSubfolderIfnotExists(target,dirname);
                                target.listLength++;
                                
                            }
                        });
                    }

                    //filter for mailinglists
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
                    }, prefs.getIntPref("serverTimeout")*target.listLength+2000);
            }

                    
    }
}

//helper function that gets the name of the folder and searches for the subfolder.
//if the subfolder doesn't exit, it creates one.
//it appends the folder to target.listDestinations.
function createSubfolderIfnotExists(target,name) {

        //load preferences
        var parserMode = prefs.getComplexValue("parseMode", Components.interfaces.nsISupportsString).data;
        var substitute = prefs.getComplexValue("substitute", Components.interfaces.nsISupportsString).data;
        document.getElementById("my-panel").label = "get Reverse Prefs";
        var parserReverse = prefs.getBoolPref("parseReverse");
        
        //if it is set, reverse the order of the parts of the name (seperated by dots)
        if (parserReverse) {
            document.getElementById("my-panel").label = "reverse Parts";
            var partsList = name.split(".");
            document.getElementById("my-panel").label = "split list";
            partsList.reverse();
            document.getElementById("my-panel").label = "reverse List";
            name = partsList.join(".");
            document.getElementById("my-panel").label = "Join List";
        }

        //if it is set replace dots
        if (parserMode=="replace") {
            name = name.replace(/\./g,substitute);
            document.getElementById("my-panel").label = "replaced dots";
        }

        //check if folder exist and create if not
        try {
            target.parent.getChildNamed(name);
        } catch (err) {
            document.getElementById("my-panel").label = "to create folder";
            target.parent.createSubfolder(name,null);//if there are dots in the name it automaticly creates subfolders
            
        }
        
        //give the server time to create the folder
        setTimeout(function(){
            document.getElementById("my-panel").label = "find folder to add";
            var parent = target.parent;
            //if it is set search through the tree of subdirs to find the right one
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

            //add the folder to the list
            target.listDestinations.push(dir);
        }, prefs.getIntPref("serverTimeout"));
}


function init() {

    var notificationService =
    Components.classes["@mozilla.org/messenger/msgnotificationservice;1"]
    .getService(Components.interfaces.nsIMsgFolderNotificationService);
    notificationService.addListener(newMailListener, notificationService.msgAdded); 
}

addEventListener("load", init, true);

