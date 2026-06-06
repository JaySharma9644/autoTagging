/**
 * Status Report Generator Module
 * Creates and maintains a status worksheet tracking record processing results with color-coded text
 */

import { logger } from '../config.js';

// Color codes for different statuses (for text color, not background)
const TEXT_COLOR_CODES = {
    tagged: 'FF00B050',        // Green - Successfully tagged
    alreadyTagged: 'FFFF0000',  // Orange - Already tagged/Skipped
    failed: 'FFFF9900',         // Red - Failed
    pending: 'FF000000'         // Black - Pending/Not processed
};

// Border style for all cells
const CELL_BORDER = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
};

/**
 * Creates a new worksheet for status reporting that mirrors the original data structure
 */
export function createStatusWorksheet(workbook, originalWorksheet) {
    try {
        logger.step('Creating Color-Coded Status Report worksheet');
        
        // Remove existing Status worksheet if present
        const existingSheet = workbook.getWorksheet('Status Report');
        if (existingSheet) {
            workbook.removeWorksheet(existingSheet.id);
        }
        
        const statusWorksheet = workbook.addWorksheet('Status Report');
        
        // Copy header from original worksheet (row 1)
        const originalHeaders = [];
        for (let col = 1; col <= originalWorksheet.columnCount; col++) {
            const headerCell = originalWorksheet.getCell(1, col);
            originalHeaders.push(headerCell.value || `Column ${col}`);
        }
        
        // Set columns with appropriate widths
        const columns = originalHeaders.map((header, index) => ({
            header: header,
            key: `col${index}`,
            width: 18
        }));
        
        statusWorksheet.columns = columns;
        
        // Style header row
        const headerRow = statusWorksheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF366092' } };
        headerRow.alignment = { horizontal: 'center', vertical: 'center' };
        
        // Apply border to header
        for (let i = 1; i <= columns.length; i++) {
            headerRow.getCell(i).border = CELL_BORDER;
        }
        
        // Copy data from original worksheet (starting from row 2)
        for (let row = 2; row <= originalWorksheet.rowCount; row++) {
            const rowData = {};
            for (let col = 1; col <= originalWorksheet.columnCount; col++) {
                const cell = originalWorksheet.getCell(row, col);
                rowData[`col${col - 1}`] = cell.value;
            }
            statusWorksheet.addRow(rowData);
        }
        
        // Apply borders to all cells
        for (let row = 2; row <= statusWorksheet.rowCount; row++) {
            for (let col = 1; col <= columns.length; col++) {
                const cell = statusWorksheet.getCell(row, col);
                cell.border = CELL_BORDER;
            }
        }
        
        logger.success('Status Report worksheet created with data structure', { 
            rows: originalWorksheet.rowCount, 
            columns: originalWorksheet.columnCount 
        });
        return statusWorksheet;
    } catch (error) {
        logger.exception(error, { function: 'createStatusWorksheet' });
        throw error;
    }
}

/**
 * Updates a cell in the status worksheet with text color based on processing status
 */
export function updateCellStatus(statusWorksheet, row, column, status) {
    try {
        // Row mapping is 1:1 - row 2 in original is row 2 in status report
        const dataRow = row;
        
        const cell = statusWorksheet.getCell(dataRow, column);
        
        // Apply text color based on status
        let textColor = TEXT_COLOR_CODES.pending;
        if (status === 'success') {
            textColor = TEXT_COLOR_CODES.tagged;
        } else if (status === 'skipped') {
            textColor = TEXT_COLOR_CODES.alreadyTagged;
        } else if (status === 'failed') {
            textColor = TEXT_COLOR_CODES.failed;
        }
        
        cell.font = { color: { argb: textColor }, bold: true };
        cell.alignment = { horizontal: 'center', vertical: 'center' };
        cell.border = CELL_BORDER;
        
        logger.debug(`Status cell updated with text color`, { row: dataRow, column, status, color: textColor });
        
    } catch (error) {
        logger.exception(error, { function: 'updateCellStatus' });
        throw error;
    }
}

/**
 * Adds a legend worksheet explaining the color coding
 */
export function addLegendWorksheet(workbook) {
    try {
        logger.step('Adding Legend worksheet');
        
        // Remove existing Legend if present
        const existingLegend = workbook.getWorksheet('Legend');
        if (existingLegend) {
            workbook.removeWorksheet(existingLegend.id);
        }
        
        const legendWorksheet = workbook.addWorksheet('Legend');
        
        // Add title
        const titleRow = legendWorksheet.addRow(['STATUS LEGEND']);
        titleRow.font = { bold: true, size: 14 };
        titleRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF366092' } };
        titleRow.getCell(1).font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
        titleRow.getCell(1).border = CELL_BORDER;
        
        // Add empty row
        const emptyRow = legendWorksheet.addRow([]);
        emptyRow.getCell(1).border = CELL_BORDER;
        
        // Add legend entries
        const legendData = [
            ['Status', 'Text Color', 'Meaning'],
            ['Tagged', 'Green', 'Record was successfully tagged'],
            ['Already Tagged', 'Red', 'Record was already tagged, skipped'],
            ['Failed', 'Orange', 'Record processing failed'],
            ['Pending', 'Black', 'Record not yet processed']
        ];
        
        legendData.forEach((row, index) => {
            const newRow = legendWorksheet.addRow(row);
            
            if (index === 0) {
                // Header row
                newRow.font = { bold: true };
                newRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE7E6E6' } };
                newRow.getCell(1).alignment = { horizontal: 'center', vertical: 'center' };
                newRow.getCell(2).alignment = { horizontal: 'center', vertical: 'center' };
                newRow.getCell(3).alignment = { horizontal: 'left', vertical: 'center' };
            } else {
                // Apply text color to status cell
                let textColor = TEXT_COLOR_CODES.pending;
                if (index === 1) textColor = TEXT_COLOR_CODES.tagged;
                else if (index === 2) textColor = TEXT_COLOR_CODES.alreadyTagged;
                else if (index === 3) textColor = TEXT_COLOR_CODES.failed;
                
                newRow.getCell(1).font = { color: { argb: textColor }, bold: true };
                newRow.getCell(2).font = { color: { argb: textColor }, bold: true };
                newRow.getCell(1).alignment = { horizontal: 'center', vertical: 'center' };
                newRow.getCell(2).alignment = { horizontal: 'center', vertical: 'center' };
                newRow.getCell(3).alignment = { horizontal: 'left', vertical: 'center' };
            }
            
            // Add borders to all cells
            for (let i = 1; i <= 3; i++) {
                newRow.getCell(i).border = CELL_BORDER;
            }
        });
        
        // Adjust column widths
        legendWorksheet.columns = [
            { width: 18 },
            { width: 15 },
            { width: 40 }
        ];
        
        logger.success('Legend worksheet added with color-coded text');
        
    } catch (error) {
        logger.exception(error, { function: 'addLegendWorksheet' });
        throw error;
    }
}
