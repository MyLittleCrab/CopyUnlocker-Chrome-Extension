'use strict'

function removeLock(){
    document.onselectstart = null;

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

    document.oncopy = () => false;
    var jQuery = chrome.extension.getURL('scripts/jquery-3.1.1.min.js');
    var inPageScript = `(function (){
        if (typeof jQuery == 'undefined' || jQuery().jquery[0] == '1'){
            var jQueryNode = document.createElement('script');
            jQueryNode.id = 'jQuery';
            jQueryNode.src = '${jQuery}';
            document.head.appendChild(jQueryNode);
        }

        var menu = [{
            name: 'Copy',
            title: 'Copy selected text',
            fun: function () {
                var textblock = document.getElementById('extension_textblock');
                var event = new Event("change");
                textblock.dispatchEvent(event);
                alertify.success("Copied");
            }
        }, {
            name: 'Remove custom menu',
            title: 'Remove custom context menu',
            fun: function () {
                $(document.body).contextMenu('destroy');
            }
        }];

        setTimeout(function(){$(document.body).contextMenu(menu,{triggerOn:'contextmenu'})},300);;

    })()`;

    var inPageScriptNode = document.createElement('script');
    inPageScriptNode.id = 'customCopy';
    inPageScriptNode.textContent = inPageScript;
    document.body.appendChild(inPageScriptNode);

    var cuteAlerts = document.createElement('script');
    cuteAlerts.id = 'cuteAlerts';
    cuteAlerts.src = chrome.extension.getURL('scripts/alertify.js');
    document.head.appendChild(cuteAlerts);

    var contextMenu = document.createElement('script');
    contextMenu.id = 'contextMenu';
    contextMenu.src = chrome.extension.getURL('scripts/contextMenu.min.js');
    document.head.appendChild(contextMenu);    
    
    var contextMenuCss = document.createElement('link');
    contextMenuCss.rel = 'stylesheet';
    contextMenuCss.type = 'text/css';
    contextMenuCss.href = chrome.extension.getURL('css/contextMenu.min.css');
    document.head.appendChild(contextMenuCss); 

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

