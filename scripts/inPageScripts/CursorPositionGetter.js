'use strict'

class CursorPositionGetter{
    constructor(){
        this.x = 0;
        this.y = 0;

        document.addEventListener('mousemove', this.setMousePosition.bind(this), false);
        document.addEventListener('mouseenter', this.setMousePosition.bind(this), false);
    }

    setMousePosition(DOMEvent){
        this.x = DOMEvent.pageX;
        this.y = DOMEvent.pageY;
    }

    getX(){
        return this.x;
    }

    getY(){
        return this.y;
    }
}