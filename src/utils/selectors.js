/**
 * Selectors Module
 * Centralized CSS/XPath selectors for portal elements
 */

export const SELECTORS = {
    // Login form selectors (iframe-aware)
    LOGIN: {
        USER: ['#txtusr', '[name="txtUser"]', 'input[type="text"]'],
        PASSWORD: ['#txtpwd', '[name="txtpwd"]', 'input[type="password"]'],
        SUBMIT: ['#btnSubmit', 'input[type="submit"]', 'button[type="submit"]', 'input[value="Submit" i]', 'text="Submit"'],
    },
    
    // Navigation selectors
    NAVIGATION: {
        TRANSPORTER: 'text="Transporter"',
        EPASS_MENU: 'a:has-text("ePass")',
        REQUEST_FOR_VEHICLE: 'a:has-text("Request For Vehicle")',
        NEW_REQUEST: 'a:has-text("New Request")',
        NO_RECORDS_FOUND: 'td:has-text("No Record(s) Found...")',
        VIEW_REQUEST_STATUS: 'a:has-text("View Request Status")',
        TAG_MORE_VEHICLE: 'td a:has-text("Tag More Vechile")',
    },
    
    // Vehicle processing selectors
    VEHICLE_PROCESSING: {
        SEARCH_INPUT: '#txtVehicleNo',
        SEARCH_BUTTON: 'text="Search"',
        ALREADY_TAGGED: 'text="VEHICLE IS ALREADY TAGGED ON THIS PERMIT"',
    },
    
    // Captcha selectors
    CAPTCHA: {
        CONTAINER: '#captchaContainer',
        IMAGE: '#captchaImage',
        INPUT: '#captchaInput',
        AGREEMENT_CHECKBOX: '#agreementCheckbox',
        SUBMIT_BUTTON: '#submitVehicleBtn',
    },
    
    // Success/Error selectors
    RESULTS: {
        DASHBOARD: '.dashboard-welcome, .dashboard, [class*="dashboard"]',
        SUCCESS_MESSAGE: '.success-message',
        LOGIN_ERROR: '.login-error, .error-message, .alert-danger, [class*="error"], [class*="fail"]',
    },
};
