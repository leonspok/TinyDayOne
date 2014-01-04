function Settings() {
    var path = document.getElementById("settings-path-to-dropbox");
    path.value = settings["path"];
    
    var saveButton = document.getElementById("settings-save");
    saveButton.onclick = function() {
        settings["path"] = path.value;
        saveSettings();
        navigator.showViewForState(4, new Settings());
    };
}