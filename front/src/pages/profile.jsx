import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  UserRound,
  Heart,
  Package,
  Mail,
  Phone,
  Pencil,
  ShoppingCart,
} from "lucide-react";

import Header from "../components/header";
import Footer from "../components/footer";

import background from "../assets/loginP.webp";

const profileImage = background;

function Profile() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isArabic = i18n.language === "ar";

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const getProfile = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }

        setUser(data.user);

        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div
        dir={isArabic ? "rtl" : "ltr"}
        className="min-h-screen bg-[#f5f3e9]"
      >
        <Header />

        <div className="flex min-h-[70vh] items-center justify-center">
          <p className="text-sm text-[#52655c]">
            {t("profile.loading")}
          </p>
        </div>

        <Footer />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div
      dir={isArabic ? "rtl" : "ltr"}
      className="min-h-screen bg-[#f5f3e9] text-[#173d2b]"
    >
      {/* Header */}
      <Header />

      {/* Main */}
      <main className="relative overflow-hidden bg-[#f5f3e9] px-4 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-16">

        {/* Background image */}
        {profileImage && (
          <img
            src={profileImage}
            alt=""
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          />
        )}

        <div className="relative z-10 mx-auto w-full max-w-[1200px]">

          {/* Page Heading */}
          <div className="mb-8 px-1 sm:mb-12 sm:px-6 lg:px-10">
            <div className="mb-4 flex items-center gap-4">
              <p className="text-[13px] font-medium uppercase tracking-[5px] text-[#173d2b]">
                {t("profile.pageLabel")}
              </p>

              <div className="h-[1px] w-[48px] bg-[#718077]" />
            </div>

            <h1 className="font-serif text-3xl leading-tight text-[#173d2b] sm:text-[42px] lg:text-[48px]">
              {t("profile.welcome")}
            </h1>

            <p className="mt-2 text-[16px] text-[#52655c]">
              {t("profile.subtitle")}
            </p>
          </div>

          {/* Profile Container */}
          <div className="rounded-2xl border border-white/70 bg-white/55 p-3 shadow-[0_10px_45px_rgba(23,61,43,0.08)] backdrop-blur-sm sm:rounded-[20px] sm:p-5 lg:p-8">

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">

              {/* Sidebar */}
              <aside className="rounded-[16px] border border-[#d9ddd4] bg-white/45 p-3">

                {/* Profile */}
                <Link
                  to="/profile"
                  className="flex h-[70px] items-center gap-5 rounded-[12px] bg-[#e5e6da] px-5 text-[#173d2b]"
                >
                  <UserRound
                    size={27}
                    strokeWidth={1.5}
                  />

                  <span className="text-[15px] font-medium">
                    {t("profile.sidebar.profile")}
                  </span>
                </Link>

                {/* Wishlist */}
                <Link
                  to="/wishlist"
                  className="flex h-[70px] items-center gap-5 rounded-[12px] px-5 text-[#294238] transition hover:bg-[#ecece4]"
                >
                  <Heart
                    size={27}
                    strokeWidth={1.5}
                  />

                  <span className="text-[15px]">
                    {t("profile.sidebar.wishlist")}
                  </span>
                </Link>

                {/* Orders */}
                <Link
                  to="/orders"
                  className="flex h-[70px] items-center gap-5 rounded-[12px] px-5 text-[#294238] transition hover:bg-[#ecece4]"
                >
                  <Package
                    size={27}
                    strokeWidth={1.5}
                  />

                  <span className="text-[15px]">
                    {t("profile.sidebar.orders")}
                  </span>
                </Link>

                {/* Cart */}
                <Link
                  to="/cart"
                  className="flex h-[70px] items-center gap-5 rounded-[12px] px-5 text-[#294238] transition hover:bg-[#ecece4]"
                >
                  <ShoppingCart
                    size={27}
                    strokeWidth={1.5}
                  />

                  <span className="text-[15px]">
                    {t("profile.sidebar.cart")}
                  </span>
                </Link>

                {/* Sidebar bottom */}
                <div className="mt-auto hidden min-h-[330px] flex-col justify-end px-6 pb-5 lg:flex">

                  <div className="mb-8 h-[1px] w-[48px] bg-[#aeb7af]" />

                  <p className="font-serif text-[24px] tracking-[7px] text-[#173d2b]">
                    SABONA
                  </p>

                  <p className="mt-2 whitespace-pre-line text-[12px] leading-5 text-[#718077]">
                    {t("profile.sidebar.tagline")}
                  </p>

                </div>
              </aside>

              {/* Profile Content */}
              <section className="rounded-[16px] border border-white/70 bg-white/60 p-4 sm:p-7 lg:p-10">

                {/* Top Profile */}
                <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">

                  <div className="flex flex-col items-center gap-6 sm:flex-row">

                    {/* Profile Image */}
                    <div className="relative shrink-0">

                      <div className="flex h-[145px] w-[145px] items-center justify-center overflow-hidden rounded-full bg-[#e5e7df]">

                        {profileImage ? (
                          <img
                            src={profileImage}
                            alt={user.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <UserRound
                            size={64}
                            strokeWidth={1.2}
                            className="text-[#718077]"
                          />
                        )}

                      </div>

                      {/* Edit Image Button */}
                      <button
                        type="button"
                        className="absolute bottom-1 right-1 flex h-[38px] w-[38px] items-center justify-center rounded-full bg-[#173d2b] text-white shadow-md transition hover:opacity-90"
                        aria-label={t("profile.editImage")}
                      >
                        <Pencil
                          size={17}
                          strokeWidth={1.8}
                        />
                      </button>

                    </div>

                    {/* User Info */}
                    <div className="text-center sm:text-start">

                      <h2 className="break-words font-serif text-2xl text-[#173d2b] sm:text-[31px]">
                        {user.name}
                      </h2>

                      <div className="mt-4 flex items-center justify-center gap-3 text-[#687870] sm:justify-start">
                        <Mail
                          size={19}
                          strokeWidth={1.5}
                        />

                        <span className="break-all text-[14px]">
                          {user.email}
                        </span>
                      </div>

                      {user.phone && (
                        <div className="mt-3 flex items-center justify-center gap-3 text-[#687870] sm:justify-start">
                          <Phone
                            size={19}
                            strokeWidth={1.5}
                          />

                          <span className="text-[14px]">
                            {user.phone}
                          </span>
                        </div>
                      )}

                    </div>
                  </div>

                  {/* Edit Profile */}
                  <button
                    type="button"
                    className="flex h-[46px] items-center justify-center gap-2 self-center rounded-full bg-[#e5e6da] px-6 text-[14px] font-medium text-[#173d2b] transition hover:bg-[#dcded3] md:self-auto"
                  >
                    <Pencil
                      size={17}
                      strokeWidth={1.7}
                    />

                    <span>
                      {t("profile.editProfile")}
                    </span>
                  </button>

                </div>

                {/* Divider */}
                <div className="my-9 h-[1px] bg-[#d9ddd7]" />

                {/* Account Information */}
                <div>
                  <h3 className="font-serif text-[24px] text-[#173d2b]">
                    {t("profile.accountInformation")}
                  </h3>

                  <div className="mt-6">

                    {/* Name */}
                    <div className="flex flex-col gap-3 border-b border-[#e0e3de] py-5 sm:flex-row sm:items-center sm:justify-between">

                      <div className="flex items-center gap-4">
                        <UserRound
                          size={23}
                          strokeWidth={1.5}
                        />

                        <span className="text-[15px] text-[#294238]">
                          {t("profile.fields.fullName")}
                        </span>
                      </div>

                      <span className="text-[14px] text-[#718077]">
                        {user.name}
                      </span>

                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-3 border-b border-[#e0e3de] py-5 sm:flex-row sm:items-center sm:justify-between">

                      <div className="flex items-center gap-4">
                        <Mail
                          size={23}
                          strokeWidth={1.5}
                        />

                        <span className="text-[15px] text-[#294238]">
                          {t("profile.fields.email")}
                        </span>
                      </div>

                      <span className="break-all text-[14px] text-[#718077]">
                        {user.email}
                      </span>

                    </div>

                    {/* Phone */}
                    <div className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">

                      <div className="flex items-center gap-4">
                        <Phone
                          size={23}
                          strokeWidth={1.5}
                        />

                        <span className="text-[15px] text-[#294238]">
                          {t("profile.fields.phone")}
                        </span>
                      </div>

                      <span className="text-[14px] text-[#718077]">
                        {user.phone || t("profile.notProvided")}
                      </span>

                    </div>

                  </div>
                </div>

              </section>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer className="mt-0" />
    </div>
  );
}

export default Profile;