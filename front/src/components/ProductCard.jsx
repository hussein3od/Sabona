import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";
import { useTranslation } from "react-i18next";

function ProductCard({ product }) {
  const { i18n } = useTranslation();

  const isArabic = i18n.language === "ar";

  const productName = isArabic
    ? product.name_ar
    : product.name_en;

  const productDescription = isArabic
    ? product.short_description_ar
    : product.short_description_en;

  const productImage =
  product.images?.length > 0
    ? product.images[0].image_url
    : product.image_url;

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartMessage, setCartMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    const checkWishlist = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/wishlist`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        const exists = data.wishlist?.some(
          (item) => Number(item.product_id) === Number(product.id)
        );

        setIsWishlisted(exists);
      } catch (error) {
        console.error("Wishlist check failed:", error);
      }
    };

    checkWishlist();
  }, [product.id]);

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    if (wishlistLoading) {
      return;
    }

    try {
      setWishlistLoading(true);

      if (isWishlisted) {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/wishlist/${product.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to remove from wishlist");
        }

        setIsWishlisted(false);
      } else {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/wishlist`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              product_id: product.id,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to add to wishlist");
        }

        setIsWishlisted(true);
      }
    } catch (error) {
      console.error("Wishlist error:", error);
    } finally {
      setWishlistLoading(false);
    }
  };
  const handleAddToCart = async (e) => {
  e.preventDefault();
  e.stopPropagation();

  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/login";
    return;
  }

  if (cartLoading || Number(product.stock) <= 0) {
    return;
  }

  try {
    setCartLoading(true);
    setCartMessage("");

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/cart`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: product.id,
          quantity: 1,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to add product to cart"
      );
    }

    setCartMessage(
      i18n.language === "ar"
        ? "تمت الإضافة ✓"
        : "Added ✓"
    );
    window.dispatchEvent(new Event("cartUpdated"));
    setTimeout(() => {
      setCartMessage("");
    }, 1800);
  } catch (error) {
    console.error("Add to cart error:", error);

    setCartMessage(
      i18n.language === "ar"
        ? "حدث خطأ"
        : "Error"
    );
  } finally {
    setCartLoading(false);
  }
};

  return (
    <Link
      to={`/products/${product.id}`}
      className="group block overflow-hidden rounded-lg bg-[#f7f6ef] shadow-[0_4px_18px_rgba(0,0,0,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(0,0,0,0.09)]"
    >
      <div className="relative aspect-[1.35/1] overflow-hidden bg-[#ebe9df]">
        {productImage ? (
          <img
            src={productImage}
            alt={productName}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[#7b8179]">
            No image
          </div>
        )}

        <button
          type="button"
          onClick={handleWishlist}
          disabled={wishlistLoading}
          className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#173d2b] shadow-sm backdrop-blur-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          aria-label={
            isWishlisted
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
        >
          <Heart
            size={19}
            strokeWidth={1.7}
            className={
              isWishlisted
                ? "fill-red-500 text-red-500"
                : ""
            }
          />
        </button>
      </div>

      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[15px] font-medium leading-6 text-[#173d2b]">
            {productName}
          </h3>

          <span className="shrink-0 text-[14px] font-medium text-[#173d2b]">
            ${product.price}
          </span>
        </div>

        <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-[#737a72]">
          {productDescription}
        </p>
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={cartLoading || Number(product.stock) <= 0}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#173d2b] py-2.5 text-xs font-medium text-white transition hover:bg-[#102d20] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ShoppingCart size={16} strokeWidth={1.6} />

          {Number(product.stock) <= 0
            ? i18n.language === "ar"
              ? "غير متوفر"
              : "Out of stock"
            : cartLoading
            ? i18n.language === "ar"
              ? "جاري الإضافة..."
              : "Adding..."
            : cartMessage
            ? cartMessage
            : i18n.language === "ar"
            ? "أضف إلى السلة"
            : "Add to Cart"}
        </button>
      </div>
    </Link>
  );
}

export default ProductCard;