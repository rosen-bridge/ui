import { vi } from 'vitest';

import * as utils from '../../lib/utils';

const spyOn = vi.spyOn;
export const applyStartOfDayMock = () => {
  spyOn(utils, 'startOfDay').mockImplementation((timestamp: number) => {
    const d = new Date(timestamp * 1000);
    d.setUTCHours(0, 0, 0, 0);
    return Math.floor(d.getTime() / 1000);
  });
};
