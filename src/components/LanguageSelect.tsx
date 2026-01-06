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

import { useTranslation } from 'react-i18next';
import { useState } from "react";


// TODO: move locale selection into the backend as preload to auto-select from the users OS preference
const SUPPORTED_LOCALES = [
  {
    name: "Spanish",
    code: "es",
    flagUrl: new URL('/locales/es.svg', import.meta.url).href,
  }
]

const LanguageSelect = () => {
  const { i18n } = useTranslation();
  const [selectedLang, setSelectedLang] = useState(i18n.language || 'en');

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setSelectedLang(lng);
  }

  const envLocale = import.meta.env.VITE_LOCALE as string | undefined;
  const locale = envLocale ? SUPPORTED_LOCALES.find((loc) => loc.code === envLocale) : undefined;

  if (envLocale && !locale) console.warn(`Unsupported LOCALE "${envLocale}". Falling back to English.`);

  if (!locale) return <div />;

  return (
    <div className="language-select">
      <button className={`language-tab ${selectedLang === 'en' ? 'active' : ''}`} onClick={() => changeLanguage('en')}>
        <img alt='switch language to English' src={new URL('/locales/gb.svg', import.meta.url).href} />
      </button>
      <button className={`language-tab ${selectedLang === locale.code ? 'active' : ''}`} onClick={() => changeLanguage(locale.code)}>
        <img alt={`switch language to ${locale.name}`} src={locale.flagUrl} />
      </button>
    </div>
  )
}

export default LanguageSelect;