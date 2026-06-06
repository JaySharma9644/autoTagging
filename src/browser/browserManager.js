/**
 * Browser Manager Module
 * Handles browser initialization and cleanup
 */

import { chromium } from 'playwright';
import { logger } from '../config.js';

/**
 * Initializes and launches browser with new context
 */
export async function initializeBrowser() {
    try {
        logger.step('Launching browser');
        const browser = await chromium.launch({ headless: false }); // Set to true for production
        const context = await browser.newContext();
        logger.success('Browser launched successfully');
        
        return { browser, context };
    } catch (error) {
        logger.exception(error, { function: 'initializeBrowser' });
        throw error;
    }
}

/**
 * Closes browser and associated resources
 */
export async function closeBrowser(browser) {
    try {
        if (browser) {
            logger.step('Closing browser');
            await browser.close();
            logger.success('Browser closed');
        }
    } catch (error) {
        logger.exception(error, { function: 'closeBrowser' });
        throw error;
    }
}

/**
 * Creates a new page in the given context
 */
export async function createPage(context) {
    return await context.newPage();
}

/**
 * Closes a page
 */
export async function closePage(page, label = 'Page') {
    try {
        if (page) {
            await page.close();
            logger.debug(`${label}: Page closed`);
        }
    } catch (error) {
        logger.warning(`${label}: Error closing page`, { error: error.message });
    }
}
