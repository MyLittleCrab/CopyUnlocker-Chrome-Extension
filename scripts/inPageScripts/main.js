/**
 * Main entry point for CopyUnlocker content script
 * Handles communication with the popup and initializes the unlocking functionality
 */
'use strict';

class CopyUnlockerController {
    /**
     * Initializes the CopyUnlocker controller
     */
    constructor() {
        this.copyUnlocker = null;
        this.config = window.COPY_UNLOCKER_CONFIG;
        this.utils = window.COPY_UNLOCKER_UTILS;
        
        this._initializeMessageListener();
    }

    /**
     * Sets up the Chrome runtime message listener
     * @private
     */
    _initializeMessageListener() {
        try {
            chrome.runtime.onMessage.addListener(this._handleMessage.bind(this));
        } catch (error) {
            this.utils?.logError('message listener initialization', error);
        }
    }

    /**
     * Handles incoming messages from the popup
     * @param {Object} request - The message request object
     * @param {Object} sender - The message sender information
     * @param {Function} sendResponse - Function to send response back
     * @private
     */
    _handleMessage(request, sender, sendResponse) {
        const data = request.data || {};
        
        try {
            switch (data) {
                case this.config?.MESSAGES.UNLOCK_REQUEST || 'rLBclick':
                    this._handleUnlockRequest(sendResponse);
                    break;
                    
                default:
                    this._handleUnknownMessage(data, sendResponse);
                    break;
            }
        } catch (error) {
            this.utils?.logError('message handling', error);
            sendResponse({ 
                data, 
                success: false, 
                error: error.message 
            });
        }
    }

    /**
     * Handles the unlock request from popup
     * @param {Function} sendResponse - Function to send response back
     * @private
     */
    async _handleUnlockRequest(sendResponse) {
        try {
            // Initialize CopyUnlocker if not already done
            if (!this.copyUnlocker) {
                this.copyUnlocker = new CopyUnlocker();
            }

            // Attempt to unlock copy functionality
            const success = await this.copyUnlocker.unlock();
            
            sendResponse({ 
                data: this.config?.MESSAGES.UNLOCK_REQUEST || 'rLBclick', 
                success,
                status: this.copyUnlocker.getStatus()
            });
        } catch (error) {
            this.utils?.logError('unlock request handling', error);
            sendResponse({ 
                data: this.config?.MESSAGES.UNLOCK_REQUEST || 'rLBclick', 
                success: false, 
                error: error.message 
            });
        }
    }

    /**
     * Handles unknown message types
     * @param {*} data - The message data
     * @param {Function} sendResponse - Function to send response back
     * @private
     */
    _handleUnknownMessage(data, sendResponse) {
        console.warn('Unknown message received:', data);
        sendResponse({ 
            data, 
            success: false, 
            error: 'Unknown message type' 
        });
    }

    /**
     * Gets the current controller status
     * @returns {Object} Controller status information
     */
    getStatus() {
        return {
            isInitialized: !!this.copyUnlocker,
            copyUnlockerStatus: this.copyUnlocker?.getStatus() || null
        };
    }

    /**
     * Cleanup method for the controller
     */
    cleanup() {
        if (this.copyUnlocker) {
            this.copyUnlocker.cleanup();
            this.copyUnlocker = null;
        }
    }
}

// Initialize the controller when the script loads
const copyUnlockerController = new CopyUnlockerController();