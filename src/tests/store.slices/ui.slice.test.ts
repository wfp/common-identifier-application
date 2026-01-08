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
import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../../store';
import { resetStore, getState } from '../_storeTestUtils';
import { SCREENS } from '../../../common/screens';

describe("store::slice::ui", () => {
  beforeEach(resetStore);

  it('go() navigates to the correct screen', () => {
    useAppStore.getState().go(SCREENS.MAIN);
    expect(getState().screen).toBe(SCREENS.MAIN);
  });
  
  it('showError() sets message + ERROR; clearError() clears it', () => {
    useAppStore.getState().showError("Error", true);
    expect(getState().screen).toBe(SCREENS.ERROR);
    expect(getState().errorMessage).toBe("Error");
    expect(getState().isRuntimeError).toBe(true);

    useAppStore.getState().clearError();
    expect(getState().errorMessage).toBeUndefined();
    expect(getState().isRuntimeError).toBeUndefined();
  });
});