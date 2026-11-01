import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import Container from "../components/container.jsx";
import LanguageSwitcher from "../components/languageSwitcher.jsx";
import SuggestedProducts from "../components/SuggestedProducts";
import { Link } from "react-router-dom";
import Footer from "../components/footer.jsx";
import { Leaf, Heart, Truck, ShieldCheck } from "lucide-react";
import heroBackground from "../assets/heroBackground.webp";
import sectionAr from "../assets/sectionAr.webp";
import sectionEn from "../assets/sectionEn.webp";

const features = [
  { icon: Leaf, translationKey: "naturalIngredients" },
  { icon: Heart, translationKey: "allSkinTypes" },
  { icon: Truck, translationKey: "fastDelivery" },
  { icon: ShieldCheck, translationKey: "trustedQuality" },
];

function Landing() {
  const { i18n, t } = useTranslation();
  const isArabic = i18n.language === "ar";
  const section = isArabic ? sectionAr : sectionEn;
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/products`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div dir={isArabic ? "rtl" : "ltr"}>
      <section className="relative h-[520px] w-full overflow-hidden sm:h-[580px] lg:h-[640px]">
        <div
          aria-hidden="true"
          className={`absolute inset-0 bg-cover bg-[position:65%_center] bg-no-repeat lg:bg-center ${
            isArabic ? "scale-x-[-1]" : ""
          }`}
          style={{ backgroundImage: `url(${heroBackground})` }}
        />
        <div
          aria-hidden="true"
          className={`absolute inset-0 ${
            isArabic
              ? "bg-gradient-to-l from-[#f7f2e7]/95 via-[#f7f2e7]/75 to-[#f7f2e7]/15"
              : "bg-gradient-to-r from-[#f7f2e7]/95 via-[#f7f2e7]/75 to-[#f7f2e7]/15"
          }`}
        />

        <Container className="relative z-10 h-full">
          <header className="flex items-center justify-between pt-5 sm:pt-7">
            <p className="text-xl font-bold tracking-[0.3em] text-[var(--primary)] sm:text-2xl">
              SABONA
            </p>
            <LanguageSwitcher />
          </header>

          <div
            className={`absolute top-[53%] w-[calc(100%-2rem)] max-w-[34rem] -translate-y-1/2 sm:top-1/2 ${
              isArabic
                ? "right-4 text-right sm:right-6 lg:right-8"
                : "left-4 text-left sm:left-6 lg:left-8"
            }`}
          >
            <p
              className={`relative mb-3 text-xs font-semibold uppercase text-[#52604b] before:absolute before:top-1/2 before:h-px before:w-10 before:bg-[#385335] ${
                isArabic
                  ? "before:-right-12"
                  : "before:-left-12"
              } sm:mb-4 sm:text-sm`}
            >
              {t("hero.subtitle")}
            </p>

            <h1 className="text-[2rem] font-bold leading-[1.12] text-[#263b2a] sm:text-[2.75rem] lg:text-[3.5rem]">
              <span className="block">{t("hero.titleLine1")}</span>
              <span className="mt-1 block">{t("hero.titleLine2")}</span>
            </h1>

            <p className="mt-4 max-w-[28rem] text-sm leading-6 text-[#4b5148] sm:mt-5 sm:text-base sm:leading-7">
              {t("hero.description")}
            </p>

            <Link
              to="/home"
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#3d5d43] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] sm:mt-7"
            >
              {t("hero.shop")}
            </Link>
          </div>
        </Container>
      </section>

      <Container className="relative z-10">
        <section
          aria-label={isArabic ? "مميزاتنا" : "Our benefits"}
          className="-mt-16 grid grid-cols-2 gap-3 rounded-2xl bg-white p-3 shadow-[0_12px_35px_-18px_rgba(38,59,42,0.4)] sm:-mt-16 sm:p-4 md:grid-cols-4 md:gap-0"
        >
          {features.map(({ icon: Icon, translationKey }) => (
            <div
              key={translationKey}
              className="flex min-h-36 flex-col items-center justify-center rounded-xl border border-[#e7ebe4] px-3 py-5 text-center sm:min-h-40 md:border-0 md:px-2"
            >
              <Icon
                className="text-[#38633c]"
                size={28}
                strokeWidth={1.6}
                aria-hidden="true"
              />
              <h2 className="mt-3 text-sm font-semibold leading-5 text-[#263b2a] sm:text-base">
                {t(`features.${translationKey}.title`)}
              </h2>
              <p className="mt-2 text-xs leading-5 text-[#6f756b] sm:text-sm">
                {t(`features.${translationKey}.description.line1`)}
                <br />
                {t(`features.${translationKey}.description.line2`)}
              </p>
            </div>
          ))}
        </section>

        <SuggestedProducts products={products.slice(0, 8)} />

        <img
          className="mb-12 mt-12 h-[150px] w-full rounded-2xl object-cover sm:mb-16 sm:mt-16 sm:h-[220px] md:h-[280px]"
          src={section}
          alt={`${t("hero.titleLine1")} ${t("hero.titleLine2")}`}
        />
      </Container>

      <Footer />
    </div>
  );
}

export default Landing;
