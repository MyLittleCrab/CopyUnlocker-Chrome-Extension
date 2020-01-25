'use strict'

class CopyUnlocker {
    constructor() {
        // singleton
        if (CopyUnlocker.instance !== undefined) {
            return CopyUnlocker.instance;
        }
        CopyUnlocker.instance = this;

        this.copyPropsList = ["color", "width", "height", "background", "font", "textAlign",
                              "border", "margin", "padding"];
        this.linkableProps = {
            IMG: [
                'src'
            ],
            A: [
                'href'
            ]
        };
        this.cursorPositionGetter = new CursorPositionGetter();
    }

    unlock() {
        this._unlockSelection();
        this._createCopyContainer();
        this._createCopyPopupBtn();
    }

    /* user-select : text to DOM elements */
    _unlockSelection() {
        document.onselectstart = null;
        document.oncontextmenu = null;
        document.onmousedown = null;

        if (getComputedStyle(document.body).userSelect == 'none') {
            document.body.style.userSelect = 'text';
            return;
        }

        for (const el of document.body.getElementsByTagName('*')) {
            try {
                el.style.userSelect = 'text';
                el.oncontextmenu = null;
            } catch (error) {
                console.log(error);
            }

        }
    }

    _createCopyContainer() {
        if (this.textblock) {
            return;
        }

        this.textblock = document.createElement('div');
        this.textblock.id = "extension_textblock";
        this.textblock.style.position = 'absolute';
        this.textblock.style.left = '-99999px';
        this.textblock.style.width = window.innerWidth + 'px';
        this.textblock.style.height = window.innerWidth + 'px';

        this.textblock.addEventListener('change', () => {
            chrome.runtime.sendMessage({
                data: this.textblock.innerHTML,
                type: 'copy'
            });
        });

        document.body.appendChild(this.textblock);
        document.oncopy = () => {
            const event = new Event("change");
            this.textblock.dispatchEvent(event);
            return false;
        }
        document.addEventListener('selectend', this._selectionEndHandler.bind(this));
    }

    _createCopyPopupBtn() {
        if (this.popupBtn) {
            return;
        }
        this.popupBtn = document.createElement('div');
        this.popupBtn.className = 'remove-lock-popup';
        this.popupBtn.textContent = 'Copy';
        document.body.appendChild(this.popupBtn);

        // listeners
        this.popupBtn.onclick = () => {
            this.popupBtn.style.display = 'none';
            document.execCommand('copy')
        };
        document.addEventListener('click', () => {
            if (!window.getSelection().toString().trim().length) {
                this.popupBtn.style.display = 'none';
            }
        });
        document.addEventListener('selectend', () => {
            this.popupBtn.style.display = 'block';
            this.popupBtn.style.left = this.cursorPositionGetter.getX() - 35 + 'px';
            this.popupBtn.style.top = this.cursorPositionGetter.getY() + 10 + 'px';
        });
    }

    _buildAbsolutePath(relativePath) {
        if (relativePath && !relativePath.includes('//')) {
            return `${window.location.protocol}//${window.location.host}${relativePath}`;
        } else {
            return relativePath;
        }
    }

    _selectionEndHandler() {
        this.textblock.innerHTML = '';

        const selection = window.getSelection();
        for (let i = 0; i < selection.rangeCount; i++) {
            const range = selection.getRangeAt(i);
            const content = range.cloneContents();

            this.textblock.appendChild(content);
        }

        for (const element of this.textblock.querySelectorAll('*')) {
            const computedStyle = getComputedStyle(element);
            // if element contain linkable props
            if (Object.keys(this.linkableProps).includes(element.tagName)) {
                const props = this.linkableProps[element.tagName];
                // building absolute paths
                for (const prop of props) {
                    element[prop] = this._buildAbsolutePath(element[prop]);
                }
            }

            for (const prop of this.copyPropsList) {
                element.style[prop] = computedStyle.getPropertyValue(prop);
            }
        }
    }
}