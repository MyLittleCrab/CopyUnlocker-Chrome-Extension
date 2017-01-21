'use strict'

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


function autoCopy(){
    if (document.getElementById('autoCopy')){
        return;
    }
    var inPageScript = '('+function (){
        var onSelectEnd = function(){
            if (!window.getSelection) {
                return;
            };

            var event = document.createEvent('Event');
            event.initEvent('selectend', true, true);

            var selectstart = false;
            document.addEventListener('selectstart', function() {
                selectstart = true;
            });

            document.addEventListener('mouseup', function() {
                raiseEvent();
            });

            function raiseEvent() {
                if (window.getSelection().toString().length && selectstart) {
                    selectstart = false;
                    document.dispatchEvent(event);
                }
            };
        };
        onSelectEnd();

        document.addEventListener('selectend',function(){
            document.execCommand('copy');  
            alertify.success("Copied");
        });

    }+')()';

    var cuteAlerts = document.createElement('script');
    cuteAlerts.id = 'cuteAlerts';
    cuteAlerts.src = 'https://cdn.rawgit.com/alertifyjs/alertify.js/v1.0.10/dist/js/alertify.js';
    document.head.appendChild(cuteAlerts);

    var inPageScriptNode = document.createElement('script');
    inPageScriptNode.id = 'autoCopy';
    inPageScriptNode.textContent = inPageScript;
    document.body.appendChild(inPageScriptNode);
};

function removeCopyLock(){
    if (document.getElementById('copyFix')){
        return;
    }
    var inPageScript = '(' + function(){
        var removeFromDoc = function(){
            var isDone = false;
            var eventListeners = getEventListeners(document).copy;
            if (eventListeners !== undefined && eventListeners.length > 0){
                eventListeners.forEach(el=>el.remove());
                isDone = true;
            };
            return isDone;
        }
        if (! removeFromDoc() ){
            var els = document.body.getElementsByTagName('*');
            for (var i = 0; i < els.length; i ++){
                var eventListeners = getEventListeners(els[i]).copy;
                if (eventListeners !== undefined && eventListeners.length > 0){
                    eventListeners.forEach(el=>el.remove());
                };
            };
        };
    } + ')()';
    var inPageScriptNode = document.createElement('script');
    inPageScriptNode.id = 'copyFix';
    inPageScriptNode.textContent = inPageScript;
    document.body.appendChild(inPageScriptNode);
};

chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
    var data = request.data || {};

    switch (data) {
        case 'rLBclick' :
            removeLock(); 
            autoCopy();
            break;
        case 'cBclick':
            removeCopyLock();
            autoCopy();
            break;
    }

    sendResponse({data: data, success: true});
});

