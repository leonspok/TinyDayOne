var editor = undefined;

var settingsWatcher = undefined;
var postsWatcher = undefined;

var initFunction = function() {
    clearInterval(settingsWatcher);
    clearInterval(postsWatcher);
    
    var dropboxPathChooser = document.getElementById("settings-path-to-dayone-file-dialog");
    dropboxPathChooser.onchange = function(event) {
        console.log("Value: "+this.value);
        var used = usePath(this.value);
        if (used && settings["folders"].indexOf(this.value) < 0) {
            settings["folders"].push(this.value);
            saveSettings();
        }
    };    
    loadSettings();
    navigationController
.showViewForState(4, new Settings());
    console.log("Settings loaded. Check path...");
    if (!pathToDropboxCheck()) {
        var folders = settings["folders"];
        for (var i = 0; i < folders.length; i++) {
            if (checkPath(folders[i])) {
                usePath(folders[i]);
                break;
            }
        }
        return;
    }
    console.log("Path is correct. Loading posts...");
    loadPosts();
    console.log("Posts loaded.");
    settingsWatcher = setInterval(function() {
        var oldPath = settings["path"];
        loadSettings();
        if (oldPath.valueOf() != settings["path"].valueOf()) {
            initFunction();
        }
    }, 1000);
    
    postsWatcher = setInterval(function() {
        loadPosts();
    }, 60000); 
    
    navigationController
.showViewForState(2, new Timeline());
    
    document.getElementsByTagName("body")[0].ondragover = function(event) {
        event.stopPropagation();
        event.preventDefault();
    };
    
    document.getElementsByTagName("body")[0].ondrop = function(event) {
        event.stopPropagation();
        event.preventDefault();
    };
    
    document.getElementById("write-post-button").onclick = function() {
        navigationController
.showViewForState(1, new PostEditor());
    };
    
    document.getElementById("timeline-button").onclick = function() {
        navigationController
.showViewForState(2, new Timeline());
    };
    
    document.getElementById("settings-button").onclick = function() {
        navigationController
.showViewForState(4, new Settings());
    };
    
    if (editor == undefined) {
        var options = {
            "element": document.getElementById("post-editor-text"),
            "status": false
        };
        editor = new Editor(options);
        editor.render();
    }
};

window.onload = function() {
    initFunction();
};