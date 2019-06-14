'use strict'

function removeLock(){
    document.onselectstart = null;
    document.oncontextmenu = null;
    document.onmousedown = null;

    var setStyleToBody = function(){
            if (getComputedStyle(document.body).userSelect == 'none'){
                    document.body.style.userSelect = 'text';
                    return true;
                }
            return false;
    };

    if (! setStyleToBody()){
        for (let i of document.body.getElementsByTagName('*')){
            i.style.userSelect='text';
            i.oncontextmenu = null;
        }
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
            var textblock = document.getElementById('extension_textblock');
            textblock.textContent = window.getSelection();
        });

    }+')()';

    var inPageScriptNode = document.createElement('script');
    inPageScriptNode.id = 'autoCopy';
    inPageScriptNode.textContent = inPageScript;
    document.body.appendChild(inPageScriptNode);
};

function customCopy(){
    if (document.getElementById('extension_textblock')){
        return;
    }

    var sendEvent = function(){
        chrome.runtime.sendMessage({
            data : document.getElementById('extension_textblock').textContent,
            type : 'copy'
        });
    }

    var textblock = document.createElement('textarea');
    textblock.id = "extension_textblock";
    textblock.style.position = 'absolute';
    textblock.style.left = '-99999px';
    document.body.appendChild(textblock);
    textblock.addEventListener('change',sendEvent);

    document.oncopy = function(){
        var textblock = document.getElementById('extension_textblock');
        var event = new Event("change");
        textblock.dispatchEvent(event);  
        return false;  
    }

};

chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
    var data = request.data || {};

    switch (data) {
        case 'rLBclick' :
            removeLock(); 
            customCopy();
            autoCopy();
            break;
    }

    sendResponse({data: data, success: true});
});

