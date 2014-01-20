function Timeline(post, tags) {
    var nextPages = document.getElementsByClassName("next-button");
    var prevPages = document.getElementsByClassName("prev-button");
    var timelinePosts = [];
    this.tags = tags;
    if (tags && tags.length != 0) {
        timelinePosts = getPostsWithTags(this.tags);
    } else {
        timelinePosts = posts;
    }
    this.firstIndex = timelinePosts.indexOf(post);
    if (this.firstIndex == -1) {
        this.firstIndex = 0;
    }
    this.lastIndex = this.firstIndex+14;
    if (this.lastIndex >= timelinePosts.length) {
        this.lastIndex = timelinePosts.length-1;
    }
    
    var self = this;
    var showNextPage = function() {
        if (self.lastIndex == timelinePosts.length-1) {
            return;
        }
        var post = timelinePosts[self.lastIndex+1];
        navigator.showViewForState(2, new Timeline(post, self.tags));
    };
    
    var showPreviousPage = function() {
        if (self.firstIndex == 0) {
            return;
        }
        var newIndex = self.firstIndex-15;
        if (newIndex < 0) {
            newIndex = 0;
        }
        var post = timelinePosts[newIndex];
        navigator.showViewForState(2, new Timeline(post, self.tags));
    };
    
    if (self.firstIndex == 0) {
        for (var i = 0; i < prevPages.length; i++) {
            if (prevPages[i].className.indexOf(" disabled") == -1) {
                prevPages[i].className += " disabled";
            }
            prevPages[i].onclick = undefined;
        }
    } else {
        for (var i = 0; i < prevPages.length; i++) {
            if (prevPages[i].className.indexOf(" disabled") != -1) {
                prevPages[i].className = prevPages[i].className.replace(" disabled", "");
            }
            prevPages[i].onclick = function() {
                showPreviousPage();
            };
        }
    }
    if (self.lastIndex == timelinePosts.length-1) {
        for (var i = 0; i < nextPages.length; i++) {
            if (nextPages[i].className.indexOf(" disabled") == -1) {
                nextPages[i].className += " disabled";
            }
            nextPages[i].onclick = undefined;
        }
    } else {
        for (var i = 0; i < nextPages.length; i++) {
            if (nextPages[i].className.indexOf(" disabled") != -1) {
                nextPages[i].className = nextPages[i].className.replace(" disabled", "");
            }
            nextPages[i].onclick = function() {
                showNextPage();
            };
        }
    }
    
    var currentPosts = document.getElementsByClassName("current-posts");
    for (var i = 0; i < currentPosts.length; i++) {
        currentPosts[i].textContent = (this.firstIndex+1)+"-"+(this.lastIndex+1);
    }
    
    
    this.timeLinePostsDiv = document.getElementById("timeline-posts");
    this.timeLinePostsDiv.innerHTML = "";
    this.timelinePosts = [];
    for (var i = this.firstIndex; i <= this.lastIndex; i++) {
        this.timelinePosts.push(timelinePosts[i]);
        var p = postToArticle(timelinePosts[i]);
        this.timeLinePostsDiv.appendChild(p);
    }
};
    