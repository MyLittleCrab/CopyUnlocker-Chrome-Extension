/**
 * Tracks and provides mouse cursor position coordinates
 */
'use strict';

class CursorPositionGetter {
    /**
     * Creates a new cursor position tracker
     */
    constructor() {
        this.x = 0;
        this.y = 0;
        this._isInitialized = false;
        
        this._initializeEventListeners();
    }

    /**
     * Initializes mouse event listeners for position tracking
     * @private
     */
    _initializeEventListeners() {
        try {
            const boundHandler = this._handleMousePosition.bind(this);
            
            document.addEventListener('mousemove', boundHandler, { passive: true });
            document.addEventListener('mouseenter', boundHandler, { passive: true });
            
            this._isInitialized = true;
        } catch (error) {
            window.COPY_UNLOCKER_UTILS?.logError('CursorPositionGetter initialization', error);
        }
    }

    /**
     * Handles mouse position events and updates coordinates
     * @param {MouseEvent} event - The mouse event
     * @private
     */
    _handleMousePosition(event) {
        if (event && typeof event.pageX === 'number' && typeof event.pageY === 'number') {
            this.x = event.pageX;
            this.y = event.pageY;
        }
    }

    /**
     * Gets the current X coordinate of the mouse cursor
     * @returns {number} The X coordinate
     */
    getX() {
        return this.x;
    }

    /**
     * Gets the current Y coordinate of the mouse cursor
     * @returns {number} The Y coordinate
     */
    getY() {
        return this.y;
    }

    /**
     * Gets both coordinates as an object
     * @returns {{x: number, y: number}} The current coordinates
     */
    getPosition() {
        return { x: this.x, y: this.y };
    }

    /**
     * Checks if the position tracker is properly initialized
     * @returns {boolean} True if initialized successfully
     */
    isInitialized() {
        return this._isInitialized;
    }
}