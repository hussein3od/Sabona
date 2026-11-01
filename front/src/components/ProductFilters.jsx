import { Search, SlidersHorizontal, X } from "lucide-react";
import { useTranslation } from "react-i18next";

function ProductFilters({
  search,
  setSearch,
  selectedSkinTypes,
  setSelectedSkinTypes,
  selectedUsageTypes,
  setSelectedUsageTypes,
}) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  const skinTypes = [
    { value: "oily", label: t("filters.skin.oily") },
    { value: "dry", label: t("filters.skin.dry") },
    { value: "normal", label: t("filters.skin.normal") },
    { value: "sensitive", label: t("filters.skin.sensitive") },
  ];

  const usageTypes = [
    { value: "face", label: t("filters.usage.face") },
    { value: "body", label: t("filters.usage.body") },
    { value: "hair", label: t("filters.usage.hair") },
  ];

  const toggleFilter = (value, selected, setSelected) => {
    if (selected.includes(value)) {
      setSelected(selected.filter((item) => item !== value));
    } else {
      setSelected([...selected, value]);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedSkinTypes([]);
    setSelectedUsageTypes([]);
  };

  const hasFilters =
    search ||
    selectedSkinTypes.length > 0 ||
    selectedUsageTypes.length > 0;

  return (
    <section
      dir={isArabic ? "rtl" : "ltr"}
      className="mx-auto mt-5 w-full max-w-7xl px-4 sm:mt-8 sm:px-6 lg:px-8"
    >
      <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:flex-wrap sm:items-center">

        {/* Filter icon */}
        <div className="flex items-center gap-2 text-[#173d2b]">
          <SlidersHorizontal size={20} strokeWidth={1.6} />
          <span className="text-sm font-medium">
            {t("filters.title")}
          </span>
        </div>

        {/* Skin Type */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500">
            {t("filters.skin.label")}
          </span>

          {skinTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() =>
                toggleFilter(
                  type.value,
                  selectedSkinTypes,
                  setSelectedSkinTypes
                )
              }
              className={`rounded-full border px-4 py-2 text-xs transition ${
                selectedSkinTypes.includes(type.value)
                  ? "border-[#173d2b] bg-[#173d2b] text-white"
                  : "border-black/15 bg-white text-[#263d32] hover:border-[#173d2b]"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Usage */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500">
            {t("filters.usage.label")}
          </span>

          {usageTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() =>
                toggleFilter(
                  type.value,
                  selectedUsageTypes,
                  setSelectedUsageTypes
                )
              }
              className={`rounded-full border px-4 py-2 text-xs transition ${
                selectedUsageTypes.includes(type.value)
                  ? "border-[#173d2b] bg-[#173d2b] text-white"
                  : "border-black/15 bg-white text-[#263d32] hover:border-[#173d2b]"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:ms-auto sm:min-w-[220px] sm:flex-1 md:flex-none">
          <Search
            size={17}
            strokeWidth={1.7}
            className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${
              isArabic ? "right-3" : "left-3"
            }`}
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("filters.search")}
            className={`w-full rounded-full border border-black/15 bg-white py-3 text-sm outline-none transition focus:border-[#173d2b] ${
              isArabic ? "pr-10 pl-4" : "pl-10 pr-4"
            }`}
          />
        </div>

        {/* Clear */}
        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="flex min-h-10 items-center gap-1 self-start text-xs text-gray-500 hover:text-[#173d2b] sm:self-auto"
          >
            <X size={15} />
            {t("filters.clear")}
          </button>
        )}
      </div>
    </section>
  );
}

export default ProductFilters;