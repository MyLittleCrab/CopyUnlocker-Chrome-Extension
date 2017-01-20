function removeLock(){
    document.onselectstart = null;

    var styles = ['userSelect','MozUserSelect','WebkitUserSelect','msUserSelect'],
        bodystyles = getComputedStyle(document.body),
        setStyleToBody = function(){
            var isStyleApplied = false;
            for (var i = 0; i < styles.length; i ++)
                if (bodystyles[styles[i]] == 'none'){
                    document.body.style[styles[i]] = 'text';
                    isStyleApplied = true;
                }
            return isStyleApplied;
        };

        if (! setStyleToBody()){
            var els = document.body.getElementsByTagName('*');
            for (var i = 0; i < els.length; i ++)
                for (var s = 0; s < styles.length; s ++)
                    els[i].style[styles[s]] = 'text';
        };
}

chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
    var data = request.data || {};

    switch (data) {
        case 'rLBclick' :
            removeLock(); 
            break
    }

    sendResponse({data: data, success: true});
});

