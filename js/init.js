var editor;

var initFunction = function() {
    var dropboxPathChooser = document.getElementById("settings-path-to-dropbox-file-dialog");
    dropboxPathChooser.onchange = function(event) {
        console.log("Value: "+this.value);
        settings["path"] = this.value;
        saveSettings();
        initFunction();
    };    
    loadSettings();
    console.log("Settings loaded. Check path...");
    if (!pathToDropboxCheck()) {
        return;
    }
    console.log("Path is correct. Loading posts...");
    loadPosts();
    console.log("Posts loaded.");
    setInterval(function() {
        var oldPath = settings["path"];
        loadSettings();
        if (oldPath.valueOf() != settings["path"].valueOf()) {
            loadPosts();
        }
    }, 1000);
    
    setInterval(function() {
        loadPosts();
    }, 60000); 
    
    navigator.showViewForState(2, new Timeline());
    
    document.getElementsByTagName("body")[0].ondragover = function(event) {
        event.stopPropagation();
        event.preventDefault();
    };
    
    document.getElementsByTagName("body")[0].ondrop = function(event) {
        event.stopPropagation();
        event.preventDefault();
    };
    
    document.getElementById("write-post-button").onclick = function() {
        navigator.showViewForState(1, new PostEditor());
    };
    
    document.getElementById("timeline-button").onclick = function() {
        navigator.showViewForState(2, new Timeline());
    };
    
    document.getElementById("settings-button").onclick = function() {
        navigator.showViewForState(4, new Settings());
    };
    
    var options = {
        "element": document.getElementById("post-editor-text"),
        "status": false
    };
    editor = new Editor(options);
    editor.render();
};

window.onload = function() {
    initFunction();
};