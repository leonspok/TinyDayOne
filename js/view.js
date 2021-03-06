function postToArticle(p) {
    var post = p;

    var article = document.createElement("article");
    article.setAttribute("data-post-uuid", post.uuid);
    
    var table = document.createElement("table");
    table.className = "post-header";
    var tr = document.createElement("tr");
    var date = document.createElement("td");
    date.className = "date";
    var monthS = ("0"+(post.dateTime.getMonth()+1)).slice(-2);
    var dayS = ("0"+post.dateTime.getDate()).slice(-2);
    var hourS = ("0"+post.dateTime.getHours()).slice(-2);
    var minutesS = ("0"+post.dateTime.getMinutes()).slice(-2);
    date.textContent = post.dateTime.getFullYear()+"/"+monthS+"/"+dayS+" "+hourS+":"+minutesS;
    tr.appendChild(date);
    var editTD = document.createElement("td");
    editTD.className = "post-edit";
    var edit = document.createElement("a");
    edit.className = "post-edit";
    edit.onclick = function(event) {
        navigationController
.showViewForState(1, new PostEditor(post));
    };
    edit.textContent = "edit";
    editTD.appendChild(edit);
    tr.appendChild(editTD);
    var deleteTD = document.createElement("td");
    deleteTD.className = "post-delete";
    var del = document.createElement("a");
    del.className = "post-delete";
    del.onclick = function(event) {
        post.delete();
    };
    del.textContent = "delete";
    deleteTD.appendChild(del);
    tr.appendChild(deleteTD);
    table.appendChild(tr);
    article.appendChild(table);
    
    if (photos[post.uuid] != undefined) {
        var img = document.createElement("img");
        var path = photos[post.uuid];
        var extension = path.substr(path.lastIndexOf('.')+1);
        var dataURL = "data:image/"+extension+";base64,"+fs.readFileSync(photos[post.uuid], 'base64')
        img.src = dataURL;
        img.className = "post-image";
        article.appendChild(img);
        img.onclick = function(event) {
            var gui = require("nw.gui");
            var image = new Image();
            image.src = this.src;
            image.onload = function() {
                var imgWidth = this.width;
                var imgHeight = this.height;
                
                var width = 0;
                var height = 0;
                
                if (imgWidth > imgHeight) {
                    width = Math.min(window.screen.availWidth, imgWidth);
                    height = imgHeight*(width/imgWidth);
                    height = Math.min(height, window.screen.availHeight);
                    width = height*imgWidth/imgHeight;
                } else {
                    height = Math.min(window.screen.availHeight, imgHeight);
                    width = imgWidth*(height/imgHeight);
                    width = Math.min(width, window.screen.availWidth);
                    height = width*(imgHeight/imgWidth);
                }
                
                var url = "preview.html?src="+encodeURIComponent(photos[post.uuid]);
                var newWindow = gui.Window.open(url, {
                    "position": "center",
                    "width": parseInt(width, 10),
                    "height": parseInt(height, 10),
                    "frame": true,
                    "toolbar": false
                });
                newWindow.on('loaded', function() {
                    newWindow.title = "Preview";
                    newWindow.show();
                    newWindow.focus();
                });
            };
        };
    }
    
    var postContent = document.createElement("div");
    postContent.className = "post-content";
    
    var markdown = require("markdown").markdown;
    postContent.innerHTML = markdown.toHTML(post.plainText);
    article.appendChild(postContent);
    
    var linksInPost = postContent.getElementsByTagName("a");
    for (var i = 0; i < linksInPost.length; i++) {
        var a = linksInPost[i];
        a.onclick = function(event) {
            event.preventDefault();
            var gui = require("nw.gui");
            gui.Shell.openExternal(a.href);
        };
    }
    
    var tags = document.createElement("div");
    tags.className = "post-tags";
    for (var i = 0; i < post.tags.length; i++) {
        var span = document.createElement("span");
        span.className = "tag";
        span.textContent = post.tags[i];
        span.onclick = function(event) {
            navigationController
.showViewForState(2, new Timeline(undefined, [this.textContent]));
        };
        tags.appendChild(span);
        //tagsSpans += "<span class='tag'>"+post.tags[i]+"</span>";
    }
    //tags.innerHTML = tagsSpans;
    article.appendChild(tags);
    
    return article;
}

var months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "Juny",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
];

var monthLengths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

var weekDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
];

function monthToTable(month) {
    var div = document.createElement("div");
    div.className = "archive-month";
    
    var header = document.createElement("h3");
    header.className = "archive-month-name";
    header.textContent = months[month.getMonth()-1];
    div.appendChild(header);
    
    var table = document.createElement("table");
    table.className = "month-table";
    
    var firstDay = new Date(month.getYear(), month.getMonth(), 1);
    var length = (firstDay.getFullYear()%4 == 0 && firstDay.getMonth() == 1)? (monthLengths[firstDay.getMonth()] + 1) : monthLengths[firstDay.getMonth()];
    var tr = document.createElement("tr");
    var ix = 0;
    while(ix != firstDay.getDay()) {
        var td = document.createElement("td");
        tr.appendChild(td);
        ix++;
    }    
    for (var i = 1; i <= length; i++) {
        var td = document.createElement("td");
        td.textContent = i;
        tr.appendChild(td);
        ix++;
        if (ix % 7 == 0) {
            table.appendChild(tr);
            tr = document.createElement("tr");
        }
    }
    while(ix%7 != 0) {
        var td = document.createElement("td");
        tr.appendChild(td);
        ix++;
        if (ix%7 == 0) {
            table.appendChild(tr);
        }
    }
    
    div.appendChild(table);
}
        
        
    
    
