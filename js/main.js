var posts = [];
var postsMap = new Object();
var photos = new Object();

var fs = require('fs');
if (!fs.existsSync("settings.json")) {
    return;
}

var settingsJSON = fs.readFileSync("settings.json", { "encoding": "utf-8" });
var settings = JSON.parse(settingsJSON);

var pathToDropboxFolder = settings["path"];

pathToDropboxFolder += "/Journal.dayone";

var entriesPath = pathToDropboxFolder + "/entries";
var photosPath = pathToDropboxFolder+"/photos";

loadPosts();

var entitiesDirWatcher = require("node-watch");
entitiesDirWatcher(entriesPath, function(filename) {
  loadPosts();
});



function saveSettings() {
    fs.writeFile('settings.json', JSON.stringify(settings), function (err) {
        if (err) throw err;
        console.log('Settings saved');
    });
}

function Post() {
	this.uuid = "";
	this.plainText = "";
	this.dateTime = new Date();
	this.favorite = false;
	this.tags = [];
    this.raw = undefined;
    
    this.createUUID = function() {
        var uuidSource = this.dateTime.toISOString()+"TinyDayOneWindows"+this.dateTime.toISOString();
        var uuidHash = CryptoJS.MD5(uuidSource);
        var uuidString = hash.toString(CryptoJS.enc.Hex);
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
        this.raw["Time Zone"] = this.dateTime.getTimezoneOffset();
        
        if (this.uuid.length != 32) {
            this.createUUID();
            this.raw["UUID"] = this.uuid;
        }
        
        this.raw["Tags"] = this.tags;
        
        return PlistParser.toPlist(this.raw);
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
        }
    };
    
    this.saveToFile = function() {
        var plist = this.toPlist();
        var plistString = (new XMLSerializer()).serializeToString(xmlNode);
        fs.writeFile(entriesPath+"/"+this.uuid+".doentry", plistString, {"encoding":"utf-8"}, function(err) {
            if (err) throw err;
            console.log("Post saved");
        }
    };
};

function comparePostsByTime(a,b) {
    if (a.dateTime < b.dateTime)
        return -1;
    if (a.dateTime > b.dateTime)
        return 1;
    return 0;
};

function loadPosts() {
    posts = [];
    postsMap = new Object();;
	
	var entries = fs.readdirSync(entriesPath);
	var entryNamePattern = new RegExp("[0-9A-Z]{32}[.]doentry");
    for (var i = 0; i < entries.length; i++) {
        if (entries[i].search(entryNamePattern) != -1) {
            var post = new Post();
            var plistString = fs.readFileSync(entriesPath+"/"+entries[i], {"encoding":"utf-8"});
            var plistXML = textToXML(plistString)
            var postRaw = PlistParser.parse(plistXML);
            
            post.uuid = postRaw["UUID"];
            post.plainText = postRaw["Entry Text"];
            post.dateTime = new Date(postRaw["Creation Date"]);
            post.favorite = postRaw["Starred"];
            post.tags = postRaw["Tags"] != undefined ? postRaw["Tags"] : [];
            post.raw = postRaw;
            
            posts.push(post);
            postsMap[post.uuid] = post;
        }
    }
    posts.sort(comparePostsByTime);
    
    var images = fs.readdirSync(photosPath);
    var imageNamePattern = new RegExp("[0-9A-Z]{32}[.].+");
    for (var i = 0; i < images.length; i++) {
        if (images[i].search(imageNamePattern) != -1) {
            var uuid = images[i].substr(0, 32);
            var path = photosPath+"/"+images[i];
            photos[uuid] = path;
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