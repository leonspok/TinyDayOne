function PostEditor(post) {
    var self = this;
    this.currentPost = post? post : new Post();

    this.dateInput = document.getElementById("post-editor-date");
    this.dateInput.value = this.currentPost.dateTime.toISOString().replace("Z", "");
    
    this.favoriteCheck = document.getElementById("post-editor-favorite");
    this.favoriteCheck = this.currentPost.favorite;
    
    this.postEditorTags = document.getElementById("post-editor-tags");
    this.postEditorNewTag = document.getElementById("post-editor-new-tag");
    
    this.updateTags = function() {
        var oldTags = this.postEditorTags.getElementsByTagName("span");
        for (var i = 0; i < oldTags.length; i++) {
            this.postEditorTags.removeChild(oldTags[i]);
        }
        
        this.postEditorTags.removeChild(this.postEditorNewTag);
        
        var innerHTML = "";
        for (var i = 0; i < this.currentPost.tags.length; i++) {
            innerHTML += "<span>"+this.currentPost.tags[i]+" <i class='tag-remove fa fa-times' data-index-of-tag='"+i+"'></i></span>";
        }
        this.postEditorTags.innerHTML = innerHTML;
        this.postEditorNewTag.value = "";
        this.postEditorTags.appendChild(this.postEditorNewTag);
        
        var is = this.postEditorTags.getElementsByClassName("tag-remove");
        for (var i = 0; i < is.length; i++) {
            is[i].onclick = function() {
                var index = parseInt(this.getAttribute("data-index-of-tag"), 10);
                self.currentPost.tags.splice(index, 1);
                self.updateTags();
            }
        }                
    };
    
    this.postEditorNewTag.onkeydown = function(event) {
        if (event.keyCode == 13) {
            for (var i = 0; i < self.currentPost.tags.length; i++) {
                if (this.value.valueOf() == self.currentPost.tags[i].valueOf()) {
                    this.value = "";
                    return;
                }
            }

            self.currentPost.tags.push(this.value);
            this.value = "";
            self.updateTags();
        }
    };
    
    this.updateTags();
    
    this.textarea = document.getElementById("post-editor-text");
    this.textarea.value = self.currentPost.plainText;
    
    this.postEditorImageArea = document.getElementById("post-editor-image-area");
    
    var showImage = function() {
        var img = document.createElement("img");
        img.src = self.imageDataURL;
        self.postEditorImageArea.appendChild(img);
        document.getElementById("remove-image-button").style.display = "block";
    };
    
    var showImageByPath = function(path) {
        var img = document.createElement("img");
        img.src = path;
        self.postEditorImageArea.appendChild(img);
        document.getElementById("remove-image-button").style.display = "block";
    };
    
    this.loadImageFromFS = function(path) {
        self.image = fs.readFileSync(path);
        self.imageExtension = path.substr(path.lastIndexOf(".")+1);		
        showImageByPath(path);
    };
        
    this.imageDataURL = undefined;
    this.imageExtension = undefined;
    this.imageChanged = false;
    
    if (this.currentPost.uuid && photos[this.currentPost.uuid]) {
        this.loadImageFromFS(photos[this.currentPost.uuid]);
    }
    
    this.removeImageButton = document.getElementById("remove-image-button");
    this.removeImageButton.onclick = function() {
        var img = self.postEditorImageArea.getElementsByTagName("img")[0];
        self.postEditorImageArea.removeChild(img);
        self.imageDataURL = undefined;
        self.imageExtension = undefined;
        self.imageChanged = true;
        this.style.display = "none";
    };
    
    this.loadImage = function(imgFile) {
        self.removeImageButton.click();
        if (imgFile.type != "image/jpg") {
            self.imageExtension = "jpg";
        } else if (imgFile.type != "image/jpeg") {
            self.imageExtension = "jpeg";
        } else if (imgFile.type != "image/png") {
            self.imageExtension = "png";
        } else {
			console.log("Wrong MIME type!");
			return;
		}
        
		var imageReader = new FileReader();
		imageReader.onload = function(data) {
			self.imageDataURL = data.target.result;
            self.imageChanged = true;
            showImage();
		};
		imageReader.readAsDataURL(imgFile);
    };
    
    var loadFromArea = function(event) {
		event.stopPropagation();
		event.preventDefault();
		self.loadImage(event.dataTransfer.files[0]);
	};
	var areaDragOver = function(event) {
		event.stopPropagation();
		event.preventDefault();
		event.dataTransfer.dropEffect = "copy";
	};
    
    this.postEditorImageArea.ondragover = function(event) {
        areaDragOver(event);
    };
    
    this.postEditorImageArea.ondrop = function(event) {
        loadFromArea(event);
    };
    
    this.saveButton = document.getElementById("post-save-button");
    this.saveButton.onclick = function() {
        self.currentPost.dateTime = new Date(self.dateInput.value);
        self.currentPost.favorite = self.favoriteCheck.checked;
        self.currentPost.plainText = self.textarea.value;
        if (self.currentPost.uuid == undefined || self.currentPost.uuid.length != 32) {
                self.currentPost.createUUID();
        }
        
        if (self.imageChanged) {
            if (photos[self.currentPost.uuid] != undefined) {
                fs.unlink(photos[self.currentPost.uuid]);    
            }
            if (self.imageDataURL != undefined) {
               var base64 = self.imageDataURL.split(",")[1]; fs.writeFile(photosPath+"/"+self.currentPost.uuid+"."+self.imageExtension, base64, 'base64', function(err) {
                    if (err) throw err;
                    console.log("Image saved");
                    loadPosts();
                });
            }
        }
        
        self.currentPost.saveToFile();
        navigator.showViewForState(2, new Timeline(self.currentPost));
    };
};