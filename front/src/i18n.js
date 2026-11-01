import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en/translation";
import ar from "./locales/ar/translation";

const savedLanguage = localStorage.getItem("language") || "en";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: en,
      },
      ar: {
        translation: ar,
      },
    },

    lng: savedLanguage,
    fallbackLng: "en",

    interpolation: {
      escapeValue: false,
    },
  })
  .then(() => {
    document.documentElement.dir =
      i18n.language === "ar" ? "rtl" : "ltr";

    document.documentElement.lang = i18n.language;
  });

export default i18n;