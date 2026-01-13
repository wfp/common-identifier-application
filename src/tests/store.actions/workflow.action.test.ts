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
import * as workflowAction from '../../store/actions/workflow.action';
import * as bridge from '../../ipc/intercom-bridge';
import { getState } from '../_storeTestUtils';
import { SCREENS } from '../../../common/screens';

describe('workflow actions', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('startValidation(file) calls fileDropped and updates store', async () => {
    vi.spyOn(bridge, 'validateFileDropped').mockResolvedValue(undefined);

    await workflowAction.startValidation('in.csv');

    expect(bridge.validateFileDropped).toHaveBeenCalledWith('in.csv');
    const s = getState();
    expect(s.inputFilePath).toBe('in.csv');
    expect(s.screen).toBe(SCREENS.FILE_LOADING);
  });

  it('startValidation() with no path opens dialog', async () => {
    vi.spyOn(bridge, 'validateFileOpenDialogue').mockResolvedValue(undefined);

    await workflowAction.startValidation();

    expect(bridge.validateFileOpenDialogue).toHaveBeenCalled();
    expect(getState().screen).toBe(SCREENS.FILE_LOADING);
  });

  it('startProcessing calls processFile and updates store', async () => {
    vi.spyOn(bridge, 'processFile').mockResolvedValue(undefined);

    await workflowAction.startProcessing('in.csv');

    expect(bridge.processFile).toHaveBeenCalledWith('in.csv');
    expect(getState().screen).toBe(SCREENS.PROCESSING_IN_PROGRESS);
  });

  it('startEncryption calls encryptFile', async () => {
    vi.spyOn(bridge, 'encryptFile').mockResolvedValue(undefined);

    await workflowAction.startEncryption('in.csv');

    expect(bridge.encryptFile).toHaveBeenCalledWith('in.csv');
  });
});