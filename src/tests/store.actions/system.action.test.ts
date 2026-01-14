/* ************************************************************************
*  Common Identifier Application
*  Copyright (C) 2026  World Food Programme
*  
*  This program is free software: you can redistribute it and/or modify
*  it under the terms of the GNU Affero General Public License as published by
*  the Free Software Foundation, either version 3 of the License, or
*  (at your option) any later version.
*  
*  This program is distributed in the hope that it will be useful,
*  but WITHOUT ANY WARRANTY; without even the implied warranty of
*  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*  GNU Affero General Public License for more details.
*  
*  You should have received a copy of the GNU Affero General Public License
*  along with this program.  If not, see <http://www.gnu.org/licenses/>.
************************************************************************ */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as systemAction from '../../store/actions/system.action';
import * as bridge from '../../ipc/intercom-bridge';
import { getState } from '../_storeTestUtils';
import { SCREENS } from '../../../common/screens';

describe('system actions', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('boot requests config and calls reducer', async () => {
    vi.spyOn(bridge, 'reset').mockResolvedValue(undefined);
    vi.spyOn(bridge, 'loadSystemConfig').mockResolvedValue({
      config: { meta: { id: 'CID', version: '1', signature: '' } },
      isBackup: false,
      lastUpdated: new Date(),
      error: undefined,
      hasAcceptedTermsAndConditions: true,
    } as any);

    await systemAction.boot();

    expect(bridge.loadSystemConfig).toHaveBeenCalled();
    expect(bridge.reset).toHaveBeenCalled();
    expect(getState().config.data.meta.id).toBe('CID');
    expect([SCREENS.MAIN, SCREENS.WELCOME]).toContain(getState().screen);
  });

  it('quit simply forwards to IPC', async () => {
    const spy = vi.spyOn(bridge, 'quit').mockResolvedValue(undefined);
    await systemAction.quit();
    expect(spy).toHaveBeenCalled();
  });

  it('openOutputFile simply forwards to IPC', async () => {
    const spy = vi.spyOn(bridge, 'openOutputFile').mockResolvedValue(undefined);
    const testPath = '/some/test/path.txt';
    await systemAction.openOutputFile(testPath);
    expect(spy).toHaveBeenCalledWith(testPath);
  });
});
