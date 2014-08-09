var posts = [];
var postsMap = new Object();
var photos = new Object();

var fs = require('fs');

var settings = undefined;
var pathToDropboxFolder = undefined;
var entriesPath = undefined;
var photosPath = undefined;
var pathToDropboxFolder = undefined;

function checkPath(path) {
    console.log("Path to Day One folder: "+path);
    if (!fs.existsSync(path) || !fs.existsSync(path+"/entries") || !fs.existsSync(path+"/photos")) {
        return false;
    }
    return true;
};

function pathToDropboxCheck() {
    return checkPath(pathToDropboxFolder);
};

function loadSettings() {
    var settingsJSON = localStorage["settings"];
    try {
        settings = JSON.parse(settingsJSON);
    } catch(e) {
        settings = {
            "path":".",
            "folders": []
        };
        localStorage["settings"] = JSON.stringify(settings);
    }
    
    if (settings["folders"] == undefined) {
        settings["folders"] = [];
    }
    
    pathToDropboxFolder = settings["path"];
    pathToDropboxFolder += "/Journal.dayone";
    
    entriesPath = pathToDropboxFolder + "/entries";
    photosPath = pathToDropboxFolder+"/photos";
};

function checkFolders() {
    var folders = [];
    for (var f in settings["folders"]) {
        if (checkPath(settings["folders"][f] + "/Journal.dayone")) {
            console.log("Checked :"+settings["folders"][f]);
            folders.push(settings["folders"][f]);
        }
    }
    if (folders.indexOf(settings["path"]) < 0) {
        folders.push(settings["path"]);
    }
    settings["folders"] = folders;
    saveSettings();
};

function usePath(path) {
    if (!fs.existsSync(path)) {
        return false;
    }
    
    pathToDropboxFolder = path + "/Journal.dayone";
    if (!fs.existsSync(pathToDropboxFolder)) {
        fs.mkdirSync(pathToDropboxFolder);
    }
    
    if (!checkPath(pathToDropboxFolder)) {
        entriesPath = pathToDropboxFolder + "/entries";
        if (!fs.existsSync(entriesPath)) {
            fs.mkdirSync(entriesPath);
        }
        
        photosPath = pathToDropboxFolder + "/photos";
        if (!fs.existsSync(photosPath)) {
            fs.mkdirSync(photosPath);
        }
    }
    settings["path"] = path;
    saveSettings();
    initFunction();
    return true;
};

function saveSettings() {
    localStorage.setItem("settings", JSON.stringify(settings));
    console.log('Settings saved');
    loadSettings();
};

function Post() {
	this.uuid = undefined;
	this.plainText = "";
	this.dateTime = new Date();
	this.favorite = false;
	this.tags = [];
    this.raw = undefined;
    
    this.createUUID = function() {
        if (this.uuid != undefined && this.uuid.length == 32) {
            return;
        }
        var uuidSource = this.dateTime.toISOString()+"TinyDayOneWindows"+this.dateTime.toISOString();
        var uuidHash = CryptoJS.MD5(uuidSource);
        var uuidString = uuidHash.toString(CryptoJS.enc.Hex);
        this.uuid = uuidString.toUpperCase();
    };
    
    this.toPlist = function() {
        if (this.raw == undefined) {
            this.raw = new Object();
            this.raw["Creator"] = {
                "Device Agent": "Windows PC",
                "Generation Date": new Date(),
                "Host Name": "Windows PC",
                "OS Agent": "Windows",
                "Software Agent": "TinyDayOne"
            };
        }
        this.raw["Creation Date"] = this.dateTime;
        this.raw["Entry Text"] = this.plainText;
        this.raw["Starred"] = this.favorite;
        var timezone = jstz.determine();
        this.raw["Time Zone"] = timezone.name();
        
        if (!this.raw["UUID"]) {
            if (this.uuid == undefined || this.uuid.length != 32) {
                this.createUUID();
            }
            this.raw["UUID"] = this.uuid;
        }
        
        this.raw["Tags"] = this.tags;
        
        var plistBuilder = require("plist");
        
        return plistBuilder.build(this.raw);
    };
    
    this.delete = function() {
        if (confirm("Are you sure you want to delete this post?")) {
            var path = photos[this.uuid];
            if (path != undefined && fs.existsSync(path)) {
                fs.unlink(path);
                console.log("Photo removed");
            }
            var postPath = entriesPath+"/"+this.uuid+".doentry";
            if (fs.existsSync(postPath)) {
                fs.unlink(postPath);
                console.log("Post removed");
            }
            loadPosts();
        }
    };
    
    this.saveToFile = function() {
        var plist = this.toPlist();
        fs.writeFile(entriesPath+"/"+this.uuid+".doentry", plist, {"encoding":"utf-8"}, function(err) {
            if (err) throw err;
            console.log("Post saved");
            loadPosts();
        });
    };
};

function getPostsWithTags(tags) {
    var tagsPosts = [];
    for (var i = 0; i < posts.length; i++) {
        var allFound = true;
        for (var j = 0; j < tags.length; j++) {
            var found = false;
            for (var t = 0; t < posts[i].tags.length; t++) {
                if (posts[i].tags[t].valueOf() == tags[j].valueOf()) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                allFound = found;
                break;
            }
        }
        if (allFound) {
            tagsPosts.push(posts[i]);
        }
    }
    console.log(tagsPosts.length, "posts with tags:", tags, "loaded");
    return tagsPosts;
};

function comparePostsByTime(a,b) {
    if (a.dateTime > b.dateTime)
        return -1;
    if (a.dateTime < b.dateTime)
        return 1;
    return 0;
};

function loadPosts() {
    posts = [];
    postsMap = new Object();;
	
	var entries = fs.readdirSync(entriesPath);
	var entryNamePattern = new RegExp("[0-9A-Z]{32}[.]doentry");
    for (var i = 0; i < entries.length; i++) {
        if (entries[i].search(entryNamePattern) != -1 && fs.existsSync(entriesPath+"/"+entries[i])) {
            var post = new Post();
            
            var plistString = fs.readFileSync(entriesPath+"/"+entries[i], {"encoding":"utf-8"});
            var plistParser = require("plist");
            var postRaw = plistParser.parseStringSync(plistString);
            
            post.uuid = postRaw["UUID"];
            post.plainText = postRaw["Entry Text"];
            post.dateTime = new Date(postRaw["Creation Date"]);
            if (postRaw["Starred"] == undefined || postRaw["Starred"] == false) {
                postRaw["Starred"] = false;
            } else {
                postRaw["Starred"] = true;
            }
            post.favorite = postRaw["Starred"];
            post.tags = (postRaw["Tags"] != undefined && postRaw["Tags"].length != 0) ? postRaw["Tags"] : [];   
            
            post.raw = postRaw;
            
            posts.push(post);
            postsMap[post.uuid] = post;
        }
    }
    posts.sort(comparePostsByTime);
    
    var images = fs.readdirSync(photosPath);
    var imageNamePattern = new RegExp("[0-9A-Z]{32}[.].+");
    for (var i = 0; i < images.length; i++) {
        if (images[i].search(imageNamePattern) != -1 && fs.existsSync(photosPath+"/"+images[i])) {
            var uuid = images[i].substr(0, 32);
            var path = photosPath+"/"+images[i];
            photos[uuid] = path;
        }
    }
    
    if (navigator.state == 2) {
        if (navigator.controller) {
            var p = (navigator.controller.firstIndex < posts.length)? posts[navigator.controller.firstIndex] : undefined;
            var t = (navigator.controller.tags != undefined)? navigator.controller.tags : undefined;
            navigator.showViewForState(2, new Timeline(p, t));
        }
    }
};

function textToXML(text) {
    var xml = null;
    var parser = new DOMParser();
    xml = parser.parseFromString( text, "text/xml" );
    var found = xml.getElementsByTagName( "parsererror" );
    if ( !found || !found.length || !found[ 0 ].childNodes.length ) {
        return xml;
    }
    return null;
};