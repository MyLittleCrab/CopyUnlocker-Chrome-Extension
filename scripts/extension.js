var removeLockBtn = document.getElementById('removeLock');
var statusBar = document.getElementById('status');

document.addEventListener('DOMContentLoaded', function() {
    removeLockBtn.addEventListener('click', function () {
        statusBar.textContent = 'Processing...';
        var message = 'rLBclick';
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {data: message}, function(response) {
                statusBar.textContent = 'Done!';
            });
        });
    });
});

