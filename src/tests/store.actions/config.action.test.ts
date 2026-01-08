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
import * as configAction from '../../store/actions/config.action';
import * as bridge from '../../ipc/intercom-bridge';
import { resetStore, getState } from '../_storeTestUtils';
import { SCREENS } from '../../../common/screens';

describe('config actions', () => {
  beforeEach(() => {
    resetStore();
    vi.restoreAllMocks();
  });

  it('loadNewConfig calls IPC and ends in CONFIG_UPDATED (success)', async () => {
    vi.spyOn(bridge, 'loadNewConfig').mockResolvedValue({
      success: true, cancelled: false, config: { meta: { id: 'X', version: '1', signature: '' } }, lastUpdated: new Date()
    } as any);

    await configAction.loadNewConfig();

    expect(bridge.loadNewConfig).toHaveBeenCalled();
    expect(getState().screen).toBe(SCREENS.CONFIG_UPDATED);
    expect(getState().config.data.meta.id).toBe('X');
  });


  it('loadNewConfig: sets LOAD_NEW_CONFIG before IPC resolves', async () => {
    // Hold the promise so we can assert the intermediate state
    let resolve!: (v?: unknown) => void;
    const promise = new Promise((r) => (resolve = r));
    vi.spyOn(bridge, 'loadNewConfig').mockReturnValue(promise as any);

    const promiseCall = configAction.loadNewConfig();
    expect(getState().screen).toBe(SCREENS.LOAD_NEW_CONFIG);

    resolve({ success: true, cancelled: false, config: { meta: { id: 'X', version: '1', signature: '' } }, lastUpdated: new Date() } as any);
    await promiseCall;

    expect(getState().screen).toBe(SCREENS.CONFIG_UPDATED);
    expect(getState().config.data.meta.id).toBe('X');
  });

  it('removeUserConfig calls IPC and updates backup state', async () => {
    vi.spyOn(bridge, 'removeUserConfig').mockResolvedValue({
      success: true, config: { meta: { id: 'B', version: '1', signature: '' } }, lastUpdated: new Date()
    } as any);

    await configAction.removeUserConfig();

    expect(bridge.removeUserConfig).toHaveBeenCalled();
    expect(getState().screen).toBe(SCREENS.CONFIG_UPDATED);
    expect(getState().config.isBackup).toBe(true);
  });

  it('removeUserConfig: sets LOAD_NEW_CONFIG before IPC resolves', async () => {
    let resolve!: (v?: unknown) => void;
    const promise = new Promise((r) => (resolve = r));
    vi.spyOn(bridge, 'removeUserConfig').mockReturnValue(promise as any);

    const promiseCall = configAction.removeUserConfig();
    expect(getState().screen).toBe(SCREENS.LOAD_NEW_CONFIG);

    resolve({ success: true, config: { meta: { id: 'B', version: '1', signature: '' } }, lastUpdated: new Date() } as any);
    await promiseCall;

    expect(getState().screen).toBe(SCREENS.CONFIG_UPDATED);
    expect(getState().config.isBackup).toBe(true);
  });


  it('acceptTermsAndConditions calls IPC and updates state', async () => {
    vi.spyOn(bridge, 'acceptTermsAndConditions').mockResolvedValue();
    await configAction.acceptTermsAndConditions();

    expect(bridge.acceptTermsAndConditions).toHaveBeenCalled();
    expect(getState().screen).toBe(SCREENS.MAIN);
  })
});
