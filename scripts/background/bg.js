// Принимает сообщение с текстом, и помещает его в буфер
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const data = request.data || {};
    if (request.type === 'copy') {
        newdiv = document.createElement('div');
        newdiv.style.position = 'absolute';
        newdiv.style.left = '-99999px';
        document.body.appendChild(newdiv);
        newdiv.innerHTML = data;
        window.getSelection().selectAllChildren(newdiv);
        document.execCommand('copy');
        window.setTimeout(() => {
            document.body.removeChild(newdiv);
        }, 100);
    };
    sendResponse({ data, success: true });
});