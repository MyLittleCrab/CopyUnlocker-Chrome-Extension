    chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
        var data = request.data || {};
        if (request.type == 'copy'){
            newdiv = document.createElement('div');
            newdiv.style.position = 'absolute';
            newdiv.style.left = '-99999px';
            document.body.appendChild(newdiv);
            newdiv.innerHTML = data;   
            window.getSelection().selectAllChildren(newdiv);
            document.execCommand('copy');  
            window.setTimeout(function () {
                document.body.removeChild(newdiv);
            }, 100);
        };
        sendResponse({data: data, success: true});
    });