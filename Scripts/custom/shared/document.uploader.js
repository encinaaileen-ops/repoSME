documentUploader = {
    uploadToTemp: function(url, file, doneFunc, failFunc) {
    	var xhr = new XMLHttpRequest();
    	xhr.addEventListener("load", function () {
	        console.log(this);
    	    if (this.status == 200) {
                var response = JSON.parse(this.responseText);
                if (response.Success) {
                    return doneFunc(response);
                }
            }
            return failFunc();
        }, false);

    	xhr.open('POST', url);
    	xhr.send(file);
    }
}