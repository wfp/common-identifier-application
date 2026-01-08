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
import { resetStore, getState } from '../_storeTestUtils';
import { SCREENS } from '../../../common/screens';

describe('workflow actions', () => {
  beforeEach(() => {
    resetStore();
    vi.restoreAllMocks();
  });

  it('startPreprocessing(file) calls fileDropped and updates store', async () => {
    vi.spyOn(bridge, 'fileDropped').mockResolvedValue(undefined);

    await workflowAction.startPreprocessing('in.csv');

    expect(bridge.fileDropped).toHaveBeenCalledWith('in.csv');
    const s = getState();
    expect(s.inputFilePath).toBe('in.csv');
    expect(s.screen).toBe(SCREENS.FILE_LOADING);
  });

  it('startPreprocessing() with no path opens dialog', async () => {
    vi.spyOn(bridge, 'preProcessFileOpenDialog').mockResolvedValue(undefined);

    await workflowAction.startPreprocessing();

    expect(bridge.preProcessFileOpenDialog).toHaveBeenCalled();
    expect(getState().screen).toBe(SCREENS.FILE_LOADING);
  });

  it('startProcessing calls processFile and updates store', async () => {
    vi.spyOn(bridge, 'processFile').mockResolvedValue(undefined);

    await workflowAction.startProcessing('in.csv');

    expect(bridge.processFile).toHaveBeenCalledWith('in.csv');
    expect(getState().screen).toBe(SCREENS.PROCESSING_IN_PROGRESS);
  });
});
