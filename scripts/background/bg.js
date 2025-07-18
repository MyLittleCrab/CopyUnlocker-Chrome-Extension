/**
 * Background script for CopyUnlocker extension
 * Handles copy operations by placing content in clipboard
 */
'use strict';

class BackgroundController {
    /**
     * Initializes the background controller
     */
    constructor() {
        this.tempElements = new Set();
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
            console.error('[CopyUnlocker] Failed to initialize message listener:', error);
        }
    }

    /**
     * Handles incoming messages from content scripts
     * @param {Object} request - The message request object
     * @param {Object} sender - The message sender information  
     * @param {Function} sendResponse - Function to send response back
     * @private
     */
    _handleMessage(request, sender, sendResponse) {
        try {
            const data = request.data || {};
            
            if (request.type === 'copy') {
                this._handleCopyRequest(data, sendResponse);
            } else {
                this._handleUnknownMessage(request, sendResponse);
            }
        } catch (error) {
            console.error('[CopyUnlocker] Error handling message:', error);
            sendResponse({ 
                success: false, 
                error: error.message 
            });
        }
    }

    /**
     * Handles copy requests by placing content in clipboard
     * @param {string} data - The HTML content to copy
     * @param {Function} sendResponse - Function to send response back
     * @private
     */
    _handleCopyRequest(data, sendResponse) {
        try {
            if (!data || typeof data !== 'string') {
                throw new Error('Invalid copy data provided');
            }

            const success = this._copyToClipboard(data);
            
            sendResponse({ 
                success,
                message: success ? 'Content copied successfully' : 'Failed to copy content'
            });
        } catch (error) {
            console.error('[CopyUnlocker] Error in copy request:', error);
            sendResponse({ 
                success: false, 
                error: error.message 
            });
        }
    }

    /**
     * Copies content to clipboard using a temporary DOM element
     * @param {string} htmlContent - The HTML content to copy
     * @returns {boolean} True if copy was successful
     * @private
     */
    _copyToClipboard(htmlContent) {
        let tempElement = null;
        
        try {
            // Create temporary element for clipboard operation
            tempElement = this._createTempElement(htmlContent);
            
            // Select all content in the temporary element
            const selection = window.getSelection();
            selection.selectAllChildren(tempElement);
            
            // Execute copy command
            const success = document.execCommand('copy');
            
            // Clean up selection
            selection.removeAllRanges();
            
            return success;
        } catch (error) {
            console.error('[CopyUnlocker] Error copying to clipboard:', error);
            return false;
        } finally {
            // Clean up temporary element
            if (tempElement) {
                this._removeTempElement(tempElement);
            }
        }
    }

    /**
     * Creates a temporary DOM element for clipboard operations
     * @param {string} content - The content to place in the element
     * @returns {HTMLElement} The temporary element
     * @private
     */
    _createTempElement(content) {
        const element = document.createElement('div');
        
        // Style the element to be hidden but selectable
        const styles = {
            position: 'absolute',
            left: '-99999px',
            top: '-99999px',
            width: '1px',
            height: '1px',
            overflow: 'hidden',
            userSelect: 'text',
            pointerEvents: 'none'
        };

        Object.entries(styles).forEach(([prop, value]) => {
            element.style[prop] = value;
        });

        element.innerHTML = content;
        document.body.appendChild(element);
        
        // Track the element for cleanup
        this.tempElements.add(element);
        
        return element;
    }

    /**
     * Removes a temporary element from the DOM
     * @param {HTMLElement} element - The element to remove
     * @private
     */
    _removeTempElement(element) {
        try {
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
                this.tempElements.delete(element);
            }
        } catch (error) {
            console.warn('[CopyUnlocker] Failed to remove temp element:', error);
        }
    }

    /**
     * Handles unknown message types
     * @param {Object} request - The message request
     * @param {Function} sendResponse - Function to send response back
     * @private
     */
    _handleUnknownMessage(request, sendResponse) {
        console.warn('[CopyUnlocker] Unknown message type received:', request);
        sendResponse({ 
            success: true,
            message: 'Message received but not processed'
        });
    }

    /**
     * Cleanup method to remove all temporary elements
     */
    cleanup() {
        try {
            for (const element of this.tempElements) {
                this._removeTempElement(element);
            }
            this.tempElements.clear();
        } catch (error) {
            console.error('[CopyUnlocker] Error during cleanup:', error);
        }
    }

    /**
     * Gets the current background controller status
     * @returns {Object} Status information
     */
    getStatus() {
        return {
            tempElementsCount: this.tempElements.size,
            isInitialized: true
        };
    }
}

// Initialize the background controller
const backgroundController = new BackgroundController();

// Cleanup on extension unload (if supported)
if (chrome.runtime.onSuspend) {
    chrome.runtime.onSuspend.addListener(() => {
        backgroundController.cleanup();
    });
}