var navigationController = {
    state: 2,
    controller: undefined,
    showViewForState: function(state, controller) {
        this.controller = controller;
        this.state = state;
        var contentItems = document.getElementsByClassName("content-item");
        for (var i = 0; i < contentItems.length; i++) {
            if (i == state-1) {
                if (contentItems[i].className.indexOf(" visible") == -1) {
                    contentItems[i].className = contentItems[i].className + " visible";
                }
            } else {
                contentItems[i].className = contentItems[i].className.replace(" visible", "");
            }
        }
    }
};