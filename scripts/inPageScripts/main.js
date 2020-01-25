'use strict'

// Ждем, пока пользователь нажмет на кнопку в popup
chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
    const data = request.data || {};

    switch (data) {
        case 'rLBclick' :
            new CopyUnlocker().unlock();
            break;
    }

    sendResponse({data, success: true});
});