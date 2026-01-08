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
import { renderHook, act } from '@testing-library/react';
import { useAppStore, useScreen, useConfig } from '../store';
import { SCREENS } from '../../common/screens';
import { resetStore } from './_storeTestUtils';

describe('Zustand store', () => {
  beforeEach(() => resetStore());

  it('initializes with expected default shape', () => {
    const state = useAppStore.getState();

    expect(state).toHaveProperty('config');
    expect(state).toHaveProperty('screen', SCREENS.BOOT);
    expect(state).toHaveProperty('startPreprocessing');
    expect(state).toHaveProperty('boot');

    expect(state.config.isInitial).toBe(true);
    expect(state.config.data.meta.id).toBe('UNKNOWN');
  });

  it('useScreen reflects store.screen', () => {
    const { result, rerender } = renderHook(() => useScreen());
    expect(result.current).toBe(SCREENS.BOOT);
    act(() => {
      useAppStore.setState({ screen: SCREENS.MAIN });
    });
    rerender();
    expect(result.current).toBe(SCREENS.MAIN);
  });

  it('useConfig returns the live config object', () => {
    const { result } = renderHook(() => useConfig());
    expect(result.current.isInitial).toBe(true);
    expect(result.current.data.meta.id).toBe('UNKNOWN');
  });
});
