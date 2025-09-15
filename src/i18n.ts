import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import detector from "i18next-browser-languagedetector";

import translateEn from "./locales/en/translation.json";
import translateEs from "./locales/es/translation.json";

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

export default i18n;