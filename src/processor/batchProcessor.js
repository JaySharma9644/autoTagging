/**
 * Batch Processor Module
 * Handles parallel batch processing with independent logins
 */

import { logger, CONFIG } from '../config.js';
import { createPage, closePage } from '../browser/browserManager.js';
import { login } from '../auth/login.js';
import { navigateToTransporter, navigateToEpass } from '../auth/navigation.js';
import { processVehicle } from './vehicleProcessor.js';

/**
 * Processes a single column group in its own browser page with INDEPENDENT LOGIN
 */
export async function processColumnGroup(context, group, worksheet, portalUrl) {
    let page;
    
    try {
        const groupLabel = `Column ${group.columnLetter}`;
        logger.step(`${groupLabel}: Creating parallel page with independent login`, { vehicles: group.vehicles.length });
        
        // Create new page in the SAME context (but will have independent login)
        page = await createPage(context);
        logger.success(`${groupLabel}: Parallel page created`);
        
        // Navigate to portal
        logger.debug(`${groupLabel}: Navigating to portal`, { url: portalUrl });
        await page.goto(portalUrl, { waitUntil: 'networkidle' });
        logger.success(`${groupLabel}: Portal loaded`);
        
        // Navigate to Transporter
        logger.step(`${groupLabel}: Navigating to Transporter Login`);
        await navigateToTransporter(page);
        
        // Perform independent LOGIN for this batch
        logger.step(`${groupLabel}: Attempting independent authentication`);
        await login(page);
        logger.success(`${groupLabel}: Login successful`);
        
        // Navigate to E-pass vehicle search section
        logger.step(`${groupLabel}: Navigating to E-pass section`);
        await navigateToEpass(page);
        logger.success(`${groupLabel}: E-pass section ready for vehicle processing`);
        
        // Process all vehicles in this column group
        let successCount = 0;
        let skippedCount = 0;
        let failedCount = 0;
        
        for (const vehicleData of group.vehicles) {
            const result = await processVehicle(page, vehicleData, groupLabel);
            
            if (result.status === 'success') successCount++;
            else if (result.status === 'skipped') skippedCount++;
            else if (result.status === 'failed') failedCount++;
        }
        
        logger.info(`${groupLabel}: Group processing completed`, { successCount, skippedCount, failedCount });
        return { success: successCount, skipped: skippedCount, failed: failedCount };
        
    } catch (error) {
        logger.exception(error, { function: 'processColumnGroup', column: group.columnLetter });
        throw error;
    } finally {
        await closePage(page, `Column ${group.columnLetter}`);
    }
}

/**
 * Processes all vehicle column groups in parallel browser pages with INDEPENDENT LOGINS
 */
export async function processVehicleGroupsInParallel(context, vehicleGroups, worksheet, portalUrl) {
    try {
        logger.step(`Initiating parallel processing with independent logins for ${vehicleGroups.length} column groups`);
        
        // Create a page for each column group from the same context with independent login
        const processPromises = vehicleGroups.map(group => 
            processColumnGroup(context, group, worksheet, portalUrl)
        );
        
        // Wait for all groups to complete
        const results = await Promise.allSettled(processPromises);
        
        // Aggregate results
        let totalSuccess = 0;
        let totalSkipped = 0;
        let totalFailed = 0;
        const failedGroups = [];
        
        results.forEach((result, index) => {
            const group = vehicleGroups[index];
            if (result.status === 'fulfilled') {
                const { success, skipped, failed } = result.value;
                totalSuccess += success;
                totalSkipped += skipped;
                totalFailed += failed;
                logger.success(`Column Group ${group.columnLetter} completed`, { success, skipped, failed });
            } else {
                failedGroups.push({
                    column: group.columnLetter,
                    error: result.reason.message
                });
                logger.error(`Column Group ${group.columnLetter} failed`, { error: result.reason.message });
            }
        });
        
        logger.info('Parallel processing completed', {
            totalSuccess,
            totalSkipped,
            totalFailed,
            failedGroups: failedGroups.length > 0 ? failedGroups : 'None'
        });
        
    } catch (error) {
        logger.exception(error, { function: 'processVehicleGroupsInParallel' });
        throw error;
    }
}
