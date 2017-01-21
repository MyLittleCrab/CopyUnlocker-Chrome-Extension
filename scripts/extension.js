var removeLockBtn = document.getElementById('removeLock');
var copyBtn = document.getElementById('copyLock');
var statusBar = document.getElementById('status');

function sendEvent(message){
    statusBar.textContent = 'Processing...';
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {data: message}, function(response) {
            statusBar.textContent = 'Done!';
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    removeLockBtn.addEventListener('click', function () {
        sendEvent('rLBclick');
    });
    copyBtn.addEventListener('click', function(){
        sendEvent('cBclick');
    });
});

