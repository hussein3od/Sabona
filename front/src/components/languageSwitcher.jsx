import { useTranslation } from "react-i18next";

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);

    localStorage.setItem("language", language);

    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  };

  return (
    <div className="flex gap-3 rounded-full bg-[var(--primary)] text-white p-2 opacity-90 border border-[1px] border-white text-[12px]">

      <p
        onClick={() => changeLanguage("en")}
        className={`relative cursor-pointer
          before:content-['']
          before:absolute
          before:top-[-3px]
          before:h-6
          before:w-[1px]
          before:bg-white
          ${
            i18n.language === "ar"
              ? "before:left-[-8px]"
              : "before:right-[-8px]"
          }
          ${i18n.language === "en" ? "font-bold" : ""}
        `}
      >
        EN
      </p>

      <p
        onClick={() => changeLanguage("ar")}
        className={`cursor-pointer ${
          i18n.language === "ar" ? "font-bold" : ""
        }`}
      >
        عربي
      </p>

    </div>
  );
}

export default LanguageSwitcher;