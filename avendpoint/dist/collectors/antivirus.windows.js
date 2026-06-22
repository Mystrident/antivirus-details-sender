import fs from 'fs';
import { logger } from '../logger.js';
import { collectMcAfee } from './vendors/mcafee.collector.js';
import { collectNorton } from './vendors/norton.collector.js';
import { collectGenericAntivirus } from './vendors/generic.collector.js';
import { WINDOWS_PATHS, PRODUCT_STATE } from '../config/constants.js';
function isMcAfeeInstalled() {
    try {
        return fs.existsSync(WINDOWS_PATHS.MCAFEE_DIR);
    }
    catch {
        return false;
    }
}
function isNortonInstalled() {
    try {
        return fs.existsSync(WINDOWS_PATHS.NORTON_DIR);
    }
    catch {
        return false;
    }
}
export async function getWindowsAntivirusInfo() {
    try {
        if (isMcAfeeInstalled()) {
            const antivirus = {
                displayName: 'McAfee',
                productState: PRODUCT_STATE.ENABLED,
            };
            return collectMcAfee(antivirus);
        }
        if (isNortonInstalled()) {
            const antivirus = {
                displayName: 'Norton',
                productState: PRODUCT_STATE.ENABLED,
            };
            return collectNorton(antivirus);
        }
        return collectGenericAntivirus({
            displayName: 'Unknown',
            productState: PRODUCT_STATE.DISABLED,
        });
    }
    catch (error) {
        logger.error({ err: error }, 'Failed to collect antivirus info');
        return {
            productName: 'Unknown',
            version: null,
            enabled: false,
            lastScan: null,
            expiryDate: null,
        };
    }
}
