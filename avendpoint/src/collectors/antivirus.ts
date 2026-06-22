import os from 'os';

import { getMockAntivirusInfo } from './antivirus.mock.js';
import { getWindowsAntivirusInfo } from './antivirus.windows.js';
import { PLATFORMS } from '../config/constants.js';

export async function getAntivirusInfo() {
  if (os.platform() === PLATFORMS.WINDOWS) {
    return getWindowsAntivirusInfo();
  }

  return getMockAntivirusInfo();
}
