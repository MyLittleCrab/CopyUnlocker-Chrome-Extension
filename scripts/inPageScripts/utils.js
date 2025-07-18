/**
 * Utility functions for CopyUnlocker extension
 */
'use strict';

const Utils = {
    /**
     * Builds an absolute URL from a relative path
     * @param {string} relativePath - The relative path to convert
     * @returns {string} The absolute URL
     */
    buildAbsolutePath(relativePath) {
        if (relativePath && !relativePath.includes('//')) {
            return `${window.location.protocol}//${window.location.host}${relativePath}`;
        }
        return relativePath;
    },

    /**
     * Safely applies styles to an element
     * @param {HTMLElement} element - The element to style
     * @param {Object} styles - Object containing style properties and values
     */
    applyStyles(element, styles) {
        try {
            Object.entries(styles).forEach(([property, value]) => {
                element.style[property] = value;
            });
        } catch (error) {
            console.warn('Failed to apply styles:', error);
        }
    },

    /**
     * Safely removes an element from the DOM
     * @param {HTMLElement} element - The element to remove
     */
    safeRemoveElement(element) {
        try {
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }
        } catch (error) {
            console.warn('Failed to remove element:', error);
        }
    },

    /**
     * Creates a debounced version of a function
     * @param {Function} func - The function to debounce
     * @param {number} delay - The delay in milliseconds
     * @returns {Function} The debounced function
     */
    debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    },

    /**
     * Logs errors with context information
     * @param {string} context - The context where the error occurred
     * @param {Error} error - The error object
     */
    logError(context, error) {
        console.error(`[CopyUnlocker] Error in ${context}:`, error);
    },

    /**
     * Checks if an element is valid and in the DOM
     * @param {HTMLElement} element - The element to check
     * @returns {boolean} True if element is valid
     */
    isValidElement(element) {
        return element && element.nodeType === Node.ELEMENT_NODE && document.contains(element);
    }
};

// Make utils globally available
window.COPY_UNLOCKER_UTILS = Utils;