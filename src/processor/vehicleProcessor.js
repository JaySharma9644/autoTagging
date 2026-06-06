/**
 * Vehicle Processor Module
 * Handles individual vehicle tagging logic
 */

import { logger } from '../config.js';
import { SELECTORS } from '../utils/selectors.js';
import { captureScreenshot } from '../utils/helpers.js';
import { solveCaptcha } from '../captcha/captchaSolver.js';

/**
 * Processes a single vehicle and updates its status in the worksheet
 */
export async function processVehicle(page, vehicleData, groupLabel) {
    try {
        logger.step(`${groupLabel}: Processing Vehicle ${vehicleData.vehicle}`, { row: vehicleData.row });
        
        // Check if already processed
        const currentStatus = vehicleData.cell.value;
        if (currentStatus && (currentStatus === 'Success' || currentStatus.includes('Skipped'))) {
            logger.debug(`${groupLabel}: Vehicle ${vehicleData.vehicle} already processed`);
            return { status: 'skipped' };
        }
        
        // Enter vehicle number and search  
        const searchInput = page.locator(SELECTORS.VEHICLE_PROCESSING.SEARCH_INPUT);
        await searchInput.click();
        await searchInput.fill(vehicleData.vehicle);
        logger.debug(`${groupLabel}: Filled vehicle number: ${vehicleData.vehicle}`);
        
        await page.locator(SELECTORS.VEHICLE_PROCESSING.SEARCH_BUTTON).click();
        logger.debug(`${groupLabel}: Clicked search button`);
        
        // Wait for network response/DOM update
        await page.waitForLoadState('networkidle');
        logger.debug(`${groupLabel}: Page loaded`);
        
        //Check if already tagged
        const alreadyTaggedLocator = page.locator(SELECTORS.VEHICLE_PROCESSING.ALREADY_TAGGED);
        const isTagged = await alreadyTaggedLocator.isVisible({ timeout: 3000 }).catch(() => false);
        
        // if (isTagged) {
        //     logger.warning(`${groupLabel}: Vehicle ${vehicleData.vehicle} is already tagged`);
        //     vehicleData.cell.value = 'Skipped - Already Tagged';
        //     logger.logVehicleResult(vehicleData.vehicle, 'Skipped - Already Tagged', { row: vehicleData.row });
        //     return { status: 'skipped' };
        // }
        
        // logger.debug(`${groupLabel}: Vehicle not tagged, proceeding to captcha`);
        
        // // Solve Captcha
        // await page.waitForSelector(SELECTORS.CAPTCHA.CONTAINER, { state: 'visible' });
        // logger.debug(`${groupLabel}: Captcha container found`);
        
        // const captchaAnswer = await solveCaptcha(page, page.locator(SELECTORS.CAPTCHA.IMAGE));
        // logger.info(`${groupLabel}: Captcha solved`, { vehicle: vehicleData.vehicle, answer: captchaAnswer });
        
        // // Submit form
        // await page.locator(SELECTORS.CAPTCHA.INPUT).fill(captchaAnswer);
        // await page.locator(SELECTORS.CAPTCHA.AGREEMENT_CHECKBOX).check();
        // logger.debug(`${groupLabel}: Filled captcha and checked agreement`);
        
        // await page.locator(SELECTORS.CAPTCHA.SUBMIT_BUTTON).click();
        // logger.debug(`${groupLabel}: Submitted vehicle tagging form`);
        
        // // Wait for success
        // await page.waitForSelector(SELECTORS.RESULTS.SUCCESS_MESSAGE, { state: 'visible', timeout: 10000 });
        // logger.success(`${groupLabel}: Vehicle ${vehicleData.vehicle} tagged successfully`, { captcha: captchaAnswer });
        // logger.logVehicleResult(vehicleData.vehicle, 'Success', { row: vehicleData.row, captcha: captchaAnswer });
        
        //vehicleData.cell.value = 'Success';
        return { status: 'success' };
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`${groupLabel}: Failed to process vehicle ${vehicleData.vehicle}`, { error: errorMessage });
        logger.logVehicleResult(vehicleData.vehicle, `Failed: ${errorMessage}`, { row: vehicleData.row });
        //vehicleData.cell.value = `Failed: ${errorMessage}`;
        
        try {
            await page.reload({ waitUntil: 'networkidle' });
            logger.debug(`${groupLabel}: Page reloaded after error`);
        } catch (reloadError) {
            logger.warning(`${groupLabel}: Failed to reload page`, { error: reloadError.message });
        }
        
        return { status: 'failed', error: errorMessage };
    }
}
