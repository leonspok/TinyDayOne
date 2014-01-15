var posts = [];
var postsMap = new Object();
var photos = new Object();

var fs = require('fs');

var settings = undefined;
var pathToDropboxFolder = undefined;
var entriesPath = undefined;
var photosPath = undefined;
var pathForSettings = process.execPath.replace("tinydayone.exe", "")+"settings.json";
//var pathForSettings = "settings.json";

function loadSettings() {
    if (!fs.existsSync(pathForSettings)) {
        return;
    }
    
    var settingsJSON = fs.readFileSync(pathForSettings, { "encoding": "utf-8" });
    settings = JSON.parse(settingsJSON);
    
    if (!fs.existsSync(settings["path"])) {
        var newPath = prompt("Day One folder doesn't exists! Please enter correct path:");
        settings["path"] = newPath;
        saveSettings();
        return;
    }
    
    pathToDropboxFolder = settings["path"];
    
    pathToDropboxFolder += "/Journal.dayone";
    
    entriesPath = pathToDropboxFolder + "/entries";
    photosPath = pathToDropboxFolder+"/photos";
};

function saveSettings() {
    fs.writeFileSync(pathForSettings, JSON.stringify(settings));
    console.log('Settings saved');
    loadSettings();
    loadPosts();
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
        this.raw["Starred"] = new Boolean(this.favorite);
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
            if (!postRaw["Starred"]) {
                postRaw["Starred"] = false;
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
            navigator.showViewForState(2, new Timeline((navigator.controller.firstIndex < posts.length)? posts[navigator.controller.firstIndex] : undefined));
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