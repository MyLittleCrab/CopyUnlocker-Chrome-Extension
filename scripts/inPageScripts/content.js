'use strict'

// Отработало ли расширение
let isScriptDone = false;

// Ждем, пока пользователь нажмет на кнопку в popup
chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
    const data = request.data || {};

    switch (data) {
        case 'rLBclick' :
            selectionFix(); 
            customCopy();
            addSelectEndListener();
            createCustomCopyBtn();
            break;
    }

    sendResponse({data: data, success: true});
});

// Удаление всего, что может помешать выделить текст и вызвать контекстное меню
function selectionFix(){
    document.onselectstart = null;
    document.oncontextmenu = null;
    document.onmousedown = null;

    if (getComputedStyle(document.body).userSelect == 'none'){
        document.body.style.userSelect = 'text';
        return;
    }

    for (const el of document.body.getElementsByTagName('*')){
        el.style.userSelect='text';
        el.oncontextmenu = null;
    }
}

// Создание невидимого dom елемента, куда попадает выделенный текст
function customCopy(){
    if (document.getElementById('extension_textblock')){
        return;
    }

    const sendEvent = function(){
        chrome.runtime.sendMessage({
            data : document.getElementById('extension_textblock').textContent,
            type : 'copy'
        });
    }

    const textblock = document.createElement('textarea');
    textblock.id = "extension_textblock";
    textblock.style.position = 'absolute';
    textblock.style.left = '-99999px';
    document.body.appendChild(textblock);
    textblock.addEventListener('change',sendEvent);

    document.oncopy = function(){
        const textblock = document.getElementById('extension_textblock');
        const event = new Event("change");
        textblock.dispatchEvent(event);  
        return false;  
    }

};

// Подписывается на событие selectEnd и помещает весь выделенный текст в невидимый dom елемент
function addSelectEndListener(){
    if (!isScriptDone){
        document.addEventListener('selectend',function(){
            const textblock = document.getElementById('extension_textblock');
            textblock.textContent = window.getSelection();
        });
    }
    
    isScriptDone = true;
}

// создание кнопки "скопировать" возле курсора
function createCustomCopyBtn(){
    const cursorPositionGetter = new CursorPositionGetter();
    const popupBtn = document.createElement('div');
    popupBtn.className = 'popup';
    popupBtn.textContent = 'Copy';
    document.body.appendChild(popupBtn);

    // listeners
    popupBtn.onclick = () => {
        popupBtn.style.display = 'none';
        document.execCommand('copy')
    };
    document.addEventListener('click', () => {
        if (!window.getSelection().toString().length){
            popupBtn.style.display = 'none';
        }
    });
    document.addEventListener('selectend', () => {
        popupBtn.style.display = 'block';
        popupBtn.style.left = cursorPositionGetter.getX() - 35 + 'px';
        popupBtn.style.top = cursorPositionGetter.getY() + 10 + 'px';
    });
}
