import { useEffect, useState } from "react";
import { ShoppingCart, UserRound } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

import LanguageSwitcher from "./languageSwitcher";

function Header() {
  const { t, i18n } = useTranslation();
  const [cartCount, setCartCount] = useState(0);
  const isArabic = i18n.language === "ar";

useEffect(() => {
  const loadCartCount = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setCartCount(0);
      return;
    }
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/cart`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        return;
      }

      const totalItems = (data.cart || []).reduce(
        (total, item) =>
          total + Number(item.quantity),
        0
      );

      setCartCount(totalItems);
    } catch (error) {
      console.error(
        "Failed to load cart count:",
        error
      );
    }
  };

  loadCartCount();
  
  window.addEventListener(
    "cartUpdated",
    loadCartCount
  );
  
  return () => {
    window.removeEventListener(
      "cartUpdated",
      loadCartCount
    );
  };
}, []);

const navLinkClass = ({ isActive }) =>
  `relative flex min-h-10 items-center py-2 transition after:absolute after:bottom-0 after:start-0 after:h-0.5 after:w-full after:bg-[#173d2b] after:content-[''] md:after:-bottom-[10px] ${
    isActive
      ? "font-medium text-[#173d2b]"
      : "text-[#263d32] after:scale-x-0 after:transition-transform after:duration-200 hover:text-[#173d2b] hover:after:scale-x-100"
    }`;
    
    const user = JSON.parse(localStorage.getItem("user") || "null");
  return (
    <header dir={isArabic ? "rtl" : "ltr"} className="w-full border-b border-black/10 bg-[#faf9f2]">
      <div className="mx-auto flex min-h-[104px] max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-0 px-4 py-2 sm:px-6 md:min-h-[72px] md:flex-nowrap md:py-0 lg:px-8">

        {/* Logo */}
        <NavLink to="/home" className="order-1">
          <h1 className="font-serif text-xl tracking-[0.25em] text-[#173d2b] sm:text-[26px] sm:tracking-[6px]">
            SABONA
          </h1>
        </NavLink>

        {/* Navigation */}
        <nav className="order-3 flex min-h-10 w-full items-center justify-center gap-7 text-[13px] sm:gap-10 sm:text-[14px] md:order-2 md:min-h-0 md:w-auto md:gap-5 lg:gap-8">
          <NavLink
            to="/home"
            className={navLinkClass}
          >
            {t("nav.home")}
          </NavLink>

          <NavLink
            to="/contact"
            className={navLinkClass}
          >
            {t("nav.contact")}
          </NavLink>
          {user?.role === "admin" && (
            <NavLink
              to="/admin"
              className="text-sm font-medium text-[#173d2b] transition hover:text-[#7c837a]"
            >
              {t("nav.admin")}
            </NavLink>
          )}
        </nav>

        {/* Right Side */}
        <div className="order-2 flex items-center gap-3 sm:gap-5 md:order-3 md:gap-4 lg:gap-6">

          <LanguageSwitcher />

          {/* Cart */}
          <NavLink
            to="/cart"
            className={({ isActive }) =>
              `relative flex h-10 w-10 items-center justify-center transition ${
                isActive
                  ? "text-[#173d2b]"
                  : "text-[#263d32] hover:text-[#173d2b]"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <ShoppingCart
                  size={25}
                  strokeWidth={isActive ? 1.8 : 1.5}
                />

                {cartCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#263d32] px-1 text-[9px] text-white">
                    {cartCount}
                  </span>
                )}
              </>
            )}
          </NavLink>

          {/* Profile */}
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex h-10 w-10 items-center justify-center transition ${
                isActive
                  ? "text-[#173d2b]"
                  : "text-[#263d32] hover:text-[#173d2b]"
              }`
            }
          >
            {({ isActive }) => (
              <UserRound
                size={24}
                strokeWidth={isActive ? 1.8 : 1.5}
              />
            )}
          </NavLink>

        </div>
      </div>
    </header>
  );
}

export default Header;