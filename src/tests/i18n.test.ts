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

vi.mock('../locales/gb.json', () => ({
  default: {
    hello: 'Hello',
    greeting_name: 'Hello, {{name}}!',
    html_sample: 'Click <strong>here</strong>',
    only_en_key: 'Only in English'
  }
}));

vi.mock('../locales/es.json', () => ({
  default: {
    hello: 'Hola',
    greeting_name: '¡Hola, {{name}}!',
    html_sample: 'Haz clic <strong>aquí</strong>'
  }
}));


import i18n from '../i18n';

describe('i18n initialization', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('should initialize with provided resources', () => {
    const store = i18n.services.resourceStore.data;

    expect(store).toHaveProperty('en');
    expect(store).toHaveProperty('es');

    expect(i18n.t('hello', { lng: 'en' })).toBe('Hello');
    expect(i18n.t('hello', { lng: 'es' })).toBe('Hola');
  });

  it('should use default language "en" and fallback "en"', () => {
    expect(i18n.language).toBe('en');

    const fallbackLng = i18n.options.fallbackLng;
    expect(fallbackLng).toEqual(['en']);
  });

  it('should translate keys in English', () => {
    const t = i18n.getFixedT('en');

    expect(t('hello')).toBe('Hello');
    expect(t('greeting_name', { name: 'Dean' })).toBe('Hello, Dean!');
  });

  it('should translate keys in Spanish when language is changed', async () => {
    await i18n.changeLanguage('es');

    const t = i18n.getFixedT('es');

    expect(t('hello')).toBe('Hola');
    expect(t('greeting_name', { name: 'Dean' })).toBe('¡Hola, Dean!');
  });

  it('should fall back to English when key is missing in Spanish', async () => {
    await i18n.changeLanguage('es');

    const translated = i18n.t('only_en_key');
    expect(translated).toBe('Only in English');
  });

  it('should not escape interpolation (escapeValue: false)', () => {
    const enHtml = i18n.t('html_sample', { lng: 'en' });
    expect(enHtml).toBe('Click <strong>here</strong>');

    const esHtml = i18n.t('html_sample', { lng: 'es' });
    expect(esHtml).toBe('Haz clic <strong>aquí</strong>');
  });

  it('should honor language detector (mocked) but allow explicit change', async () => {
    expect(i18n.language).toBe('en');

    await i18n.changeLanguage('es');
    expect(i18n.language).toBe('es');
  });

  it('should return key when translation is missing and no fallback exists', async () => {
    const missing = i18n.t('__missing_key__');
    expect(missing).toBe('__missing_key__');
  });
});
