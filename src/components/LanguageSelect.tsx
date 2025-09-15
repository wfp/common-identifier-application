// Common Identifier Application
// Copyright (C) 2024 World Food Programme
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { useTranslation } from 'react-i18next';
import { useState } from "react";

const LanguageSelect = () => {
  const { i18n } = useTranslation();
  const [selectedLang, setSelectedLang] = useState(i18n.language || 'en');

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setSelectedLang(lng);
  }

  return (
    <div className="language-select">
      <button className={`language-tab ${selectedLang === 'en' ? 'active' : ''}`} onClick={() => changeLanguage('en')}>
        <img alt='switch language to English' src="/locales/en/gb.svg" />
      </button>
      <button className={`language-tab ${selectedLang === 'es' ? 'active' : ''}`} onClick={() => changeLanguage('es')}>
        <img alt='switch language to Spanish' src="/locales/es/es.svg" />
      </button>
    </div>
  )
}

export default LanguageSelect;