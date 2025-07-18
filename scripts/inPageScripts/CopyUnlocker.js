/**
 * Main CopyUnlocker class - Enables text selection and copying on protected websites
 */
'use strict';

class CopyUnlocker {
    /**
     * Creates a new CopyUnlocker instance (singleton pattern)
     */
    constructor() {
        // Implement singleton pattern
        if (CopyUnlocker.instance) {
            return CopyUnlocker.instance;
        }
        CopyUnlocker.instance = this;

        // Get configuration and utilities
        this.config = window.COPY_UNLOCKER_CONFIG;
        this.utils = window.COPY_UNLOCKER_UTILS;

        // Initialize components
        this.cursorPositionGetter = null;
        this.copyContainer = null;
        this.popupButton = null;
        this._isUnlocked = false;

        this._validateDependencies();
    }

    /**
     * Validates that required dependencies are available
     * @private
     */
    _validateDependencies() {
        if (!this.config) {
            throw new Error('CopyUnlocker configuration not found. Ensure config.js is loaded first.');
        }
        if (!this.utils) {
            console.warn('CopyUnlocker utilities not found. Some features may not work properly.');
        }
    }

    /**
     * Main method to unlock copy functionality
     * @returns {Promise<boolean>} True if unlock was successful
     */
    async unlock() {
        try {
            if (this._isUnlocked) {
                console.log('CopyUnlocker already active');
                return true;
            }

            await this._initializeCursorTracker();
            this._unlockSelection();
            this._createCopyContainer();
            this._createCopyPopupButton();

            this._isUnlocked = true;
            console.log('CopyUnlocker activated successfully');
            return true;
        } catch (error) {
            this.utils?.logError('unlock', error);
            return false;
        }
    }

    /**
     * Initializes the cursor position tracker
     * @private
     */
    async _initializeCursorTracker() {
        try {
            this.cursorPositionGetter = new CursorPositionGetter();
            
            // Wait a bit to ensure initialization
            await new Promise(resolve => setTimeout(resolve, 10));
            
            if (!this.cursorPositionGetter.isInitialized()) {
                throw new Error('Failed to initialize cursor position tracker');
            }
        } catch (error) {
            this.utils?.logError('cursor tracker initialization', error);
            throw error;
        }
    }

    /**
     * Removes selection restrictions from DOM elements
     * @private
     */
    _unlockSelection() {
        try {
            // Remove global selection restrictions
            document.onselectstart = null;
            document.oncontextmenu = null;
            document.onmousedown = null;

            // Handle body element specifically
            if (getComputedStyle(document.body).userSelect === 'none') {
                document.body.style.userSelect = 'text';
                return;
            }

            // Process all elements
            this._processAllElements();
        } catch (error) {
            this.utils?.logError('selection unlock', error);
        }
    }

    /**
     * Processes all DOM elements to remove selection restrictions
     * @private
     */
    _processAllElements() {
        const elements = document.body.getElementsByTagName('*');
        let processed = 0;
        let failed = 0;

        for (const element of elements) {
            try {
                element.style.userSelect = 'text';
                element.oncontextmenu = null;
                processed++;
            } catch (error) {
                failed++;
                if (failed < 5) { // Only log first few failures to avoid spam
                    console.warn('Failed to process element:', element, error);
                }
            }
        }

        console.log(`Processed ${processed} elements, ${failed} failed`);
    }

    /**
     * Creates the hidden copy container element
     * @private
     */
    _createCopyContainer() {
        if (this.copyContainer) {
            console.log('Copy container already exists');
            return;
        }

        try {
            this.copyContainer = this._buildCopyContainer();
            this._attachCopyContainerEvents();
            document.body.appendChild(this.copyContainer);
            
            this._setupGlobalCopyHandler();
            this._setupSelectionEndHandler();
        } catch (error) {
            this.utils?.logError('copy container creation', error);
        }
    }

    /**
     * Builds the copy container element with proper styling
     * @private
     * @returns {HTMLElement} The copy container element
     */
    _buildCopyContainer() {
        const container = document.createElement('div');
        container.id = this.config.COPY_CONTAINER.ID;
        
        const styles = {
            position: 'absolute',
            left: this.config.COPY_CONTAINER.HIDDEN_POSITION,
            width: `${window.innerWidth * this.config.COPY_CONTAINER.SIZE_MULTIPLIER}px`,
            height: `${window.innerHeight * this.config.COPY_CONTAINER.SIZE_MULTIPLIER}px`
        };

        this.utils?.applyStyles(container, styles) || this._fallbackApplyStyles(container, styles);
        return container;
    }

    /**
     * Fallback method to apply styles when utils are not available
     * @private
     */
    _fallbackApplyStyles(element, styles) {
        Object.entries(styles).forEach(([prop, value]) => {
            element.style[prop] = value;
        });
    }

    /**
     * Attaches event listeners to the copy container
     * @private
     */
    _attachCopyContainerEvents() {
        this.copyContainer.addEventListener('change', () => {
            try {
                chrome.runtime.sendMessage({
                    data: this.copyContainer.innerHTML,
                    type: this.config.MESSAGES.COPY_DATA
                });
            } catch (error) {
                this.utils?.logError('copy message sending', error);
            }
        });
    }

    /**
     * Sets up the global copy event handler
     * @private
     */
    _setupGlobalCopyHandler() {
        document.oncopy = () => {
            try {
                const changeEvent = new Event("change");
                this.copyContainer.dispatchEvent(changeEvent);
                return false;
            } catch (error) {
                this.utils?.logError('copy handler', error);
                return false;
            }
        };
    }

    /**
     * Sets up the selection end event handler
     * @private
     */
    _setupSelectionEndHandler() {
        document.addEventListener('selectend', this._handleSelectionEnd.bind(this));
    }

    /**
     * Creates the copy popup button
     * @private
     */
    _createCopyPopupButton() {
        if (this.popupButton) {
            console.log('Popup button already exists');
            return;
        }

        try {
            this.popupButton = this._buildPopupButton();
            this._attachPopupButtonEvents();
            document.body.appendChild(this.popupButton);
        } catch (error) {
            this.utils?.logError('popup button creation', error);
        }
    }

    /**
     * Builds the popup button element
     * @private
     * @returns {HTMLElement} The popup button element
     */
    _buildPopupButton() {
        const button = document.createElement('div');
        button.className = this.config.POPUP_BUTTON.CLASS_NAME;
        button.textContent = this.config.POPUP_BUTTON.TEXT;
        button.style.display = 'none';
        return button;
    }

    /**
     * Attaches event listeners to the popup button
     * @private
     */
    _attachPopupButtonEvents() {
        // Button click handler
        this.popupButton.onclick = () => {
            this.popupButton.style.display = 'none';
            document.execCommand('copy');
        };

        // Hide button when clicking elsewhere
        document.addEventListener('click', () => {
            if (!this._hasTextSelection()) {
                this.popupButton.style.display = 'none';
            }
        });

        // Show button on selection end
        document.addEventListener('selectend', () => {
            this._showPopupButton();
        });
    }

    /**
     * Shows the popup button at the cursor position
     * @private
     */
    _showPopupButton() {
        if (!this.cursorPositionGetter || !this._hasTextSelection()) {
            return;
        }

        try {
            const position = this.cursorPositionGetter.getPosition();
            const styles = {
                display: 'block',
                left: `${position.x + this.config.POPUP_BUTTON.OFFSET_X}px`,
                top: `${position.y + this.config.POPUP_BUTTON.OFFSET_Y}px`
            };

            this.utils?.applyStyles(this.popupButton, styles) || 
                this._fallbackApplyStyles(this.popupButton, styles);
        } catch (error) {
            this.utils?.logError('popup button positioning', error);
        }
    }

    /**
     * Checks if there is currently a text selection
     * @private
     * @returns {boolean} True if there is a text selection
     */
    _hasTextSelection() {
        try {
            const selection = window.getSelection();
            return selection && selection.toString().trim().length > 0;
        } catch (error) {
            return false;
        }
    }

    /**
     * Handles the selection end event
     * @private
     */
    _handleSelectionEnd() {
        try {
            this._clearCopyContainer();
            this._cloneSelectionToCopyContainer();
            this._processClonedContent();
        } catch (error) {
            this.utils?.logError('selection end handling', error);
        }
    }

    /**
     * Clears the copy container content
     * @private
     */
    _clearCopyContainer() {
        if (this.copyContainer) {
            this.copyContainer.innerHTML = '';
        }
    }

    /**
     * Clones the current selection to the copy container
     * @private
     */
    _cloneSelectionToCopyContainer() {
        const selection = window.getSelection();
        if (!selection || !this.copyContainer) {
            return;
        }

        for (let i = 0; i < selection.rangeCount; i++) {
            const range = selection.getRangeAt(i);
            const content = range.cloneContents();
            this.copyContainer.appendChild(content);
        }
    }

    /**
     * Processes the cloned content to preserve styles and fix links
     * @private
     */
    _processClonedContent() {
        if (!this.copyContainer) {
            return;
        }

        const elements = this.copyContainer.querySelectorAll('*');
        
        for (const element of elements) {
            try {
                this._processLinkableProperties(element);
                this._preserveElementStyles(element);
            } catch (error) {
                console.warn('Failed to process element in copy container:', error);
            }
        }
    }

    /**
     * Processes linkable properties to ensure absolute URLs
     * @private
     * @param {HTMLElement} element - The element to process
     */
    _processLinkableProperties(element) {
        const linkableProps = this.config.LINKABLE_PROPERTIES[element.tagName];
        if (!linkableProps) {
            return;
        }

        for (const prop of linkableProps) {
            if (element[prop]) {
                element[prop] = this.utils?.buildAbsolutePath(element[prop]) || 
                    this._buildAbsolutePath(element[prop]);
            }
        }
    }

    /**
     * Fallback method to build absolute paths
     * @private
     */
    _buildAbsolutePath(relativePath) {
        if (relativePath && !relativePath.includes('//')) {
            return `${window.location.protocol}//${window.location.host}${relativePath}`;
        }
        return relativePath;
    }

    /**
     * Preserves element styles by copying computed styles
     * @private
     * @param {HTMLElement} element - The element to process
     */
    _preserveElementStyles(element) {
        const computedStyle = getComputedStyle(element);
        
        for (const prop of this.config.COPYABLE_STYLE_PROPERTIES) {
            try {
                const value = computedStyle.getPropertyValue(prop);
                if (value) {
                    element.style[prop] = value;
                }
            } catch (error) {
                // Silently continue if a property fails
            }
        }
    }

    /**
     * Cleanup method to remove all created elements and event listeners
     */
    cleanup() {
        try {
            if (this.copyContainer) {
                this.utils?.safeRemoveElement(this.copyContainer) || 
                    this.copyContainer.remove();
                this.copyContainer = null;
            }

            if (this.popupButton) {
                this.utils?.safeRemoveElement(this.popupButton) || 
                    this.popupButton.remove();
                this.popupButton = null;
            }

            this._isUnlocked = false;
            CopyUnlocker.instance = null;
            
            console.log('CopyUnlocker cleanup completed');
        } catch (error) {
            this.utils?.logError('cleanup', error);
        }
    }

    /**
     * Gets the current status of the CopyUnlocker
     * @returns {Object} Status information
     */
    getStatus() {
        return {
            isUnlocked: this._isUnlocked,
            hasCopyContainer: !!this.copyContainer,
            hasPopupButton: !!this.popupButton,
            hasCursorTracker: !!this.cursorPositionGetter
        };
    }
}