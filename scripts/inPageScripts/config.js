/**
 * Configuration constants for CopyUnlocker extension
 */
'use strict';

const CONFIG = {
    // UI Configuration
    POPUP_BUTTON: {
        TEXT: 'Copy',
        OFFSET_X: -35,
        OFFSET_Y: 10,
        CLASS_NAME: 'remove-lock-popup'
    },
    
    // Container Configuration
    COPY_CONTAINER: {
        ID: 'extension_textblock',
        HIDDEN_POSITION: '-99999px',
        SIZE_MULTIPLIER: 1
    },
    
    // CSS Properties to copy when preserving styles
    COPYABLE_STYLE_PROPERTIES: [
        'color',
        'width', 
        'height',
        'background',
        'font',
        'textAlign',
        'border',
        'margin',
        'padding'
    ],
    
    // HTML elements with linkable properties that need absolute URLs
    LINKABLE_PROPERTIES: {
        IMG: ['src'],
        A: ['href']
    },
    
    // Messages for communication between scripts
    MESSAGES: {
        UNLOCK_REQUEST: 'rLBclick',
        COPY_DATA: 'copy'
    },
    
    // Timing constants
    TIMING: {
        CLEANUP_DELAY: 100
    }
};

// Make config globally available
window.COPY_UNLOCKER_CONFIG = CONFIG;