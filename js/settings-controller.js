function Settings() {
    var path = document.getElementById("settings-path-to-dayone-file-dialog");
    var select = document.getElementById("settings-path-select");
    select.innerHTML = "";
    
    checkFolders();
    for (var p in settings["folders"]) {
        var option = document.createElement("option");
        option.value = settings["folders"][p];
        option.textContent = settings["folders"][p];
        if (settings["folders"][p].valueOf() == settings["path"].valueOf()) {
            option.setAttribute("selected", "selected");
        }
        select.appendChild(option);
    }
    
    var option = document.createElement("option");
    option.value = "%new folder%";
    option.textContent = "new folder";
    select.appendChild(option);
    
    select.onchange = function(event) {
        console.log("Selected "+select.selectedIndex);
        var newPath = select.options[select.selectedIndex].value;
        if (newPath.valueOf() == "%new folder%") {
            path.click();
        } else {
            usePath(newPath);
        }
    };
}