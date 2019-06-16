// Событие, выстреливающее, когда пользователь завершил выделение
const event = document.createEvent('Event');
event.initEvent('selectend', true, true);

let selectstart = false;
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