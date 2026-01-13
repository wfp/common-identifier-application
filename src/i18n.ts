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
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import detector from "i18next-browser-languagedetector";

import translateEn from "./locales/gb.json";
import translateEs from "./locales/es.json";

i18n
  .use(detector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: translateEn },
      es: { translation: translateEs }
    },
    lng: "en",
    fallbackLng: "en",
    keySeparator: false,
    interpolation: { escapeValue: false }
  });

// Development Only: hot module Replacement for translation files
if (import.meta.hot) {
  import.meta.hot.accept(['./locales/gb.json', './locales/es.json'], ([newEn, newEs]) => {
    if (newEn) i18n.addResourceBundle('en', 'translation', newEn.default, true, true);
    if (newEs) i18n.addResourceBundle('es', 'translation', newEs.default, true, true);
    i18n.emit('languageChanged', i18n.language);
  });
}

export default i18n;