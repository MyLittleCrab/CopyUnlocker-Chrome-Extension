/**
 * Custom selection end event implementation
 * Fires when user completes a text selection
 */
'use strict';

class SelectionEndEventManager {
    /**
     * Creates a new selection end event manager
     */
    constructor() {
        this._isSelecting = false;
        this._customEvent = null;
        this._isInitialized = false;
        
        this._initialize();
    }

    /**
     * Initializes the selection end event system
     * @private
     */
    _initialize() {
        try {
            this._createCustomEvent();
            this._attachEventListeners();
            this._isInitialized = true;
        } catch (error) {
            window.COPY_UNLOCKER_UTILS?.logError('SelectionEndEventManager initialization', error);
        }
    }

    /**
     * Creates the custom 'selectend' event
     * @private
     */
    _createCustomEvent() {
        this._customEvent = document.createEvent('Event');
        this._customEvent.initEvent('selectend', true, true);
    }

    /**
     * Attaches necessary event listeners for tracking selection
     * @private
     */
    _attachEventListeners() {
        document.addEventListener('selectstart', this._handleSelectionStart.bind(this), { passive: true });
        document.addEventListener('mouseup', this._handleMouseUp.bind(this), { passive: true });
    }

    /**
     * Handles the start of text selection
     * @private
     */
    _handleSelectionStart() {
        this._isSelecting = true;
    }

    /**
     * Handles mouse up event and fires selectend if appropriate
     * @private
     */
    _handleMouseUp() {
        this._checkAndFireSelectEnd();
    }

    /**
     * Checks if selection ended and fires the custom event
     * @private
     */
    _checkAndFireSelectEnd() {
        try {
            const selection = window.getSelection();
            const hasSelection = selection && selection.toString().length > 0;
            
            if (hasSelection && this._isSelecting) {
                this._isSelecting = false;
                document.dispatchEvent(this._customEvent);
            }
        } catch (error) {
            window.COPY_UNLOCKER_UTILS?.logError('SelectionEndEventManager selectend check', error);
        }
    }

    /**
     * Checks if the event manager is properly initialized
     * @returns {boolean} True if initialized successfully
     */
    isInitialized() {
        return this._isInitialized;
    }

    /**
     * Manually triggers a selectend event (for testing or special cases)
     */
    triggerSelectEnd() {
        if (this._customEvent) {
            document.dispatchEvent(this._customEvent);
        }
    }
}

// Initialize the selection end event manager
window.COPY_UNLOCKER_SELECTION_MANAGER = new SelectionEndEventManager();