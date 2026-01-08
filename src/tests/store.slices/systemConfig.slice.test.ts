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

const sampleConfig = { meta: { id: 'CID', version: '1.2.3', signature: 'abc' } } as any;

describe('System + Config slices', () => {
  beforeEach(resetStore);

  it('boot(valid) updates config and routes to Welcome/Main', () => {
    useAppStore.getState().boot({
      config: sampleConfig,
      isBackup: false,
      lastUpdated: new Date(),
      error: undefined,
      hasAcceptedTermsAndConditions: false,
    });

    const s = getState();
    expect(s.config.data.meta.id).toBe('CID');
    expect(s.config.isBackup).toBe(false);
    expect(s.config.isInitial).toBe(false);
    expect([SCREENS.WELCOME, SCREENS.MAIN]).toContain(s.screen);
  });

  it('boot(error) routes to INVALID_CONFIG and sets message', () => {
    useAppStore.getState().boot({
      config: sampleConfig,
      isBackup: false,
      lastUpdated: new Date(),
      error: 'Bad config',
      hasAcceptedTermsAndConditions: false,
    });

    const s = getState();
    expect(s.screen).toBe(SCREENS.INVALID_CONFIG);
    expect(s.config.data.meta.id).toBe('CID');
    expect(s.config.isInitial).toBe(true);
    expect(s.errorMessage).toMatch(/Bad config/);
    expect(s.isRuntimeError).toBe(false);
  });

  it('onLoadNewConfigDone(success) updates config and routes to CONFIG_UPDATED', () => {
    useAppStore.getState().onLoadNewConfigDone({
      success: true,
      cancelled: false,
      config: sampleConfig,
      lastUpdated: new Date(),
    });

    const s = getState();
    expect(s.screen).toBe(SCREENS.CONFIG_UPDATED);
    expect(s.config.data.meta.id).toBe('CID');
    expect(s.config.isBackup).toBe(false);
    expect(s.config.isInitial).toBe(false);
  });

  it('onLoadNewConfigDone(cancelled) routes to INVALID_CONFIG if not booted', () => {
      useAppStore.getState().onLoadNewConfigDone({
      success: false,
      cancelled: true,
      config: sampleConfig,
      lastUpdated: new Date(),
    });
    const s = getState();
    expect(s.screen).toBe(SCREENS.INVALID_CONFIG);
  });

  it('onLoadNewConfigDone(cancelled) routes to MAIN without changes', () => {
    useAppStore.getState().boot({
      config: sampleConfig,
      isBackup: false,
      lastUpdated: new Date(),
      error: undefined,
      hasAcceptedTermsAndConditions: false,
    });
    useAppStore.getState().onLoadNewConfigDone({
      success: false,
      cancelled: true,
      config: sampleConfig,
      lastUpdated: new Date(),
    });
    const s = getState();
    expect(s.screen).toBe(SCREENS.MAIN);
  });

  it('onLoadNewConfigDone(error) without BOOT routes to INVALID_CONFIG', () => {
    useAppStore.getState().onLoadNewConfigDone({
      success: false,
      cancelled: false,
      config: sampleConfig,
      error: 'Invalid config',
      lastUpdated: new Date(),
    });
    const s = getState();
    expect(s.screen).toBe(SCREENS.INVALID_CONFIG);
  });

  it('onLoadNewConfigDone(error) after BOOT routes to ERROR', () => {
    useAppStore.getState().boot({
      config: sampleConfig,
      isBackup: false,
      lastUpdated: new Date(),
      error: undefined,
      hasAcceptedTermsAndConditions: false,
    });
    useAppStore.getState().onLoadNewConfigDone({
      success: false,
      cancelled: false,
      config: sampleConfig,
      error: 'Invalid config',
      lastUpdated: new Date(),
    });
    const s = getState();
    expect(s.screen).toBe(SCREENS.ERROR);
  });

  it('onRemoveUserConfigDone(success) updates config', () => {
    useAppStore.getState().onRemoveUserConfigDone({
      success: true,
      config: sampleConfig,
      lastUpdated: new Date(),
    });
    const s = getState();
    expect(s.screen).toBe(SCREENS.CONFIG_UPDATED);
    expect(s.config.data.meta.id).toBe('CID');
    expect(s.config.isBackup).toBe(true);
    expect(s.config.isInitial).toBe(false);
  });

  it('onRemoveUserConfigDone(error) keeps the old config and routes to ERROR', () => {
    // load new config
    useAppStore.getState().onLoadNewConfigDone({
      success: true,
      cancelled: false,
      config: sampleConfig,
      lastUpdated: new Date(),
    });
    // attempt to replace with bad config, fallback should be the previous good one
    useAppStore.getState().onRemoveUserConfigDone({
      success: false,
      config: sampleConfig,
      error: 'Configuration error',
      lastUpdated: new Date(),
    });
    const s = getState();
    expect(s.screen).toBe(SCREENS.ERROR);
    expect(s.config.data.meta.id).toBe('CID'); // config should be unchanged if new one is bad
    expect(s.errorMessage).toMatch(/Configuration error/);
  });

  it('acceptTermsAndConditions routes to WELCOME', () => {
    useAppStore.getState().showTermsAndConditions();
    let s = getState();
    expect(s.screen).toBe(SCREENS.WELCOME);
  });

  it('showTermsAndConditions routes to MAIN', () => {
    useAppStore.getState().acceptTermsAndConditions();
    let s = getState();
    expect(s.screen).toBe(SCREENS.MAIN);
  });

  it('setConfig correctly sets config', () => {
    useAppStore.getState().setConfig(sampleConfig, true);
    let s = getState();
    expect(s.config.data.meta.id).toBe('CID');
    expect(s.config.isBackup).toBe(true);
    expect(s.config.isInitial).toBe(false);
    expect(s.config.lastUpdated).toBeInstanceOf(Date);
  });

  it('markInitial', () => {
    useAppStore.getState().markInitial(true);
    let s = getState();
    expect(s.config.isInitial).toBe(true);
  });
});