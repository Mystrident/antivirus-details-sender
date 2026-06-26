import os from 'os';

import { getMockAntivirusInfo } from './antivirus.mock.js';
import { getMacOSAntivirusInfo } from './antivirus.macos.js';
import { PLATFORMS } from '../config/constants.js';

export async function getAntivirusInfo() {
  if (os.platform() === PLATFORMS.MACOS) {
    return getMacOSAntivirusInfo();
  }

  return getMockAntivirusInfo();
}
