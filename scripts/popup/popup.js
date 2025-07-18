/**
 * Popup interface controller for CopyUnlocker extension
 * Handles user interactions and communication with content scripts
 */
'use strict';

class PopupController {
    /**
     * Initializes the popup controller
     */
    constructor() {
        this.removeLockButton = null;
        this.statusBar = null;
        this.isProcessing = false;
        
        this._initializeElements();
        this._attachEventListeners();
    }

    /**
     * Initializes DOM elements
     * @private
     */
    _initializeElements() {
        this.removeLockButton = document.getElementById('removeLock');
        this.statusBar = document.getElementById('status');
        
        if (!this.removeLockButton || !this.statusBar) {
            console.error('Required DOM elements not found');
            return;
        }
    }

    /**
     * Attaches event listeners to DOM elements
     * @private
     */
    _attachEventListeners() {
        if (!this.removeLockButton) {
            return;
        }

        document.addEventListener('DOMContentLoaded', () => {
            this.removeLockButton.addEventListener('click', () => {
                this._handleUnlockClick();
            });
        });
    }

    /**
     * Handles the unlock button click
     * @private
     */
    async _handleUnlockClick() {
        if (this.isProcessing) {
            return;
        }

        try {
            this.isProcessing = true;
            this._updateStatus('Processing...', 'processing');
            this._disableButton();

            await this._sendUnlockMessage();
        } catch (error) {
            console.error('Error handling unlock click:', error);
            this._updateStatus('Error occurred!', 'error');
        } finally {
            this.isProcessing = false;
            this._enableButton();
        }
    }

    /**
     * Sends unlock message to the active tab
     * @private
     * @returns {Promise<void>}
     */
    _sendUnlockMessage() {
        return new Promise((resolve, reject) => {
            try {
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                        return;
                    }

                    if (!tabs || tabs.length === 0) {
                        reject(new Error('No active tab found'));
                        return;
                    }

                    const activeTab = tabs[0];
                    
                    chrome.tabs.sendMessage(
                        activeTab.id, 
                        { data: 'rLBclick' }, 
                        (response) => {
                            this._handleUnlockResponse(response, resolve, reject);
                        }
                    );
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Handles the response from the unlock message
     * @param {Object} response - The response from content script
     * @param {Function} resolve - Promise resolve function
     * @param {Function} reject - Promise reject function
     * @private
     */
    _handleUnlockResponse(response, resolve, reject) {
        if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
        }

        if (!response) {
            reject(new Error('No response from content script'));
            return;
        }

        if (response.success) {
            this._updateStatus('Done!', 'success');
            resolve();
        } else {
            const errorMessage = response.error || 'Unknown error occurred';
            this._updateStatus(`Error: ${errorMessage}`, 'error');
            reject(new Error(errorMessage));
        }
    }

    /**
     * Updates the status bar with a message and style
     * @param {string} message - The status message
     * @param {string} type - The status type (processing, success, error)
     * @private
     */
    _updateStatus(message, type = '') {
        if (!this.statusBar) {
            return;
        }

        this.statusBar.textContent = message;
        
        // Remove existing status classes
        this.statusBar.classList.remove('processing', 'success', 'error');
        
        // Add new status class if provided
        if (type) {
            this.statusBar.classList.add(type);
        }
    }

    /**
     * Disables the unlock button
     * @private
     */
    _disableButton() {
        if (this.removeLockButton) {
            this.removeLockButton.disabled = true;
            this.removeLockButton.classList.add('disabled');
        }
    }

    /**
     * Enables the unlock button
     * @private
     */
    _enableButton() {
        if (this.removeLockButton) {
            this.removeLockButton.disabled = false;
            this.removeLockButton.classList.remove('disabled');
        }
    }

    /**
     * Gets the current popup status
     * @returns {Object} Popup status information
     */
    getStatus() {
        return {
            isProcessing: this.isProcessing,
            hasRequiredElements: !!(this.removeLockButton && this.statusBar)
        };
    }
}

// Initialize the popup controller when the script loads
const popupController = new PopupController();
