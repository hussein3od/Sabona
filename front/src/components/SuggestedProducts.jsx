import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";
import { useTranslation } from "react-i18next";

export default function SuggestedProducts({ products = [] }) {
  const scrollRef = useRef(null);
  const { i18n } = useTranslation();

  const isArabic = i18n.language === "ar";

  const scroll = (direction) => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollBy({
      left:
        direction === "right"
          ? scrollRef.current.clientWidth * 0.8
          : -scrollRef.current.clientWidth * 0.8,
      behavior: "smooth",
    });
  };

  return (
    <section dir={isArabic ? "rtl" : "ltr"} className="my-12 w-full">
      <div className="mb-5 flex items-center justify-between px-4 sm:px-6">
        <div>
          <h2 className="text-2xl font-bold text-[#173d2b]">
            {isArabic ? "منتجات مقترحة" : "Recommended Products"}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {isArabic
              ? "اكتشف منتجات قد تعجبك"
              : "Discover products you may like"}
          </p>
        </div>

        <div className="hidden min-[350px]:flex gap-2">
          <button
            type="button"
            onClick={() => scroll("left")}
            aria-label="Previous products"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 transition hover:border-[#166700] hover:text-[#166700]"
          >
            {isArabic
            ? <ChevronRight size={20} />
            : <ChevronLeft size={20} />}
          </button>

          <button
            type="button"
            onClick={() => scroll("right")}
            aria-label="Next products"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 transition hover:border-[#166700] hover:text-[#166700]"
          >
            {isArabic
            ? <ChevronLeft size={20} />
            : <ChevronRight size={20} />}
          </button>
        </div>
      </div>

      {products.length > 0 ? (
        <div
          ref={scrollRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scrollbar-none px-4 pb-4 sm:px-6"
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="w-[240px] min-w-[240px] shrink-0 snap-start"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      ) : (
        <p className="px-4 text-sm text-gray-500">
          {isArabic
            ? "لا توجد منتجات لعرضها حالياً."
            : "No products available right now."}
        </p>
      )}
    </section>
  );
}