import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  Leaf,
  Heart,
  ShieldCheck,
} from "lucide-react";

import Footer from "../components/footer";
import LanguageSwitcher from "../components/languageSwitcher";
import backgroundImage from "../assets/loginP.webp";

function Login() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isArabic = i18n.language === "ar";

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError(
        isArabic
          ? "يرجى إدخال البريد الإلكتروني وكلمة المرور."
          : "Please enter your email and password."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            (isArabic
              ? "فشل تسجيل الدخول."
              : "Login failed.")
        );
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/home");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      dir={isArabic ? "rtl" : "ltr"}
      className="min-h-screen bg-[#f5f3e9] text-[#173d2b]"
    >
      {/* Header */}
      <header className="h-16 bg-[#f5f3e9] sm:h-[74px]">
        <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="text-xl font-bold tracking-[0.25em] text-[var(--primary)] sm:text-[24px] sm:tracking-[6px]"
          >
            SABONA
          </Link>

          <LanguageSwitcher />
        </div>
      </header>

      {/* Main */}
      <main className="relative flex min-h-[calc(100vh-64px)] w-full items-center overflow-hidden px-4 py-8 sm:min-h-[calc(100vh-74px)] sm:px-6 sm:py-10 lg:px-8 lg:py-14">

        {/* Background Image */}
        <img
          src={backgroundImage}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[#f5f3e9]/45"
        />

        {/* Content Container */}
        <div className="relative z-10 mx-auto grid w-full max-w-[1400px] grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-20">

          {/* Left Section */}
          <div className="hidden flex-col justify-center px-8 lg:flex lg:px-12 xl:px-20">
            <div className="max-w-[500px]">

              <p className="mb-4 text-[15px] font-semibold uppercase tracking-[4px] text-[var(--primary)]">
                {t("login.welcome")}
              </p>

              <h1 className="mb-6 text-[42px] font-bold leading-[1.15] text-[#173d2b]">
                {t("login.titleLine1")}
                <br />

                <span className="text-[var(--primary)]">
                  {t("login.titleLine2")}
                </span>
              </h1>

              <p className="mb-10 max-w-[470px] text-[16px] leading-[1.8] text-[#294238]">
                {t("login.description")}
              </p>

              {/* Feature 1 */}
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                  <Leaf
                    size={22}
                    strokeWidth={1.8}
                    className="text-[var(--primary)]"
                  />
                </div>

                <div>
                  <h3 className="mb-1 text-[15px] font-bold">
                    {t("login.features.naturalCare.title")}
                  </h3>

                  <p className="text-[13px] text-[#52655c]">
                    {t("login.features.naturalCare.description")}
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                  <Heart
                    size={22}
                    strokeWidth={1.8}
                    className="text-[var(--primary)]"
                  />
                </div>

                <div>
                  <h3 className="mb-1 text-[15px] font-bold">
                    {t("login.features.personalized.title")}
                  </h3>

                  <p className="text-[13px] text-[#52655c]">
                    {t("login.features.personalized.description")}
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-center gap-4">
                <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                  <ShieldCheck
                    size={22}
                    strokeWidth={1.8}
                    className="text-[var(--primary)]"
                  />
                </div>

                <div>
                  <h3 className="mb-1 text-[15px] font-bold">
                    {t("login.features.secure.title")}
                  </h3>

                  <p className="text-[13px] text-[#52655c]">
                    {t("login.features.secure.description")}
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Login Card */}
          <div className="flex items-center justify-center px-0 py-5 sm:px-6 sm:py-8 lg:px-12 lg:py-12">

            <div className="w-full max-w-[460px] rounded-2xl bg-white/95 p-5 shadow-[0_10px_40px_rgba(23,61,43,0.12)] backdrop-blur-sm sm:rounded-[28px] sm:p-8 md:p-10">

              {/* Logo */}
              <div className="mb-6 text-center sm:mb-8">

                <p className="mb-2 text-xl font-bold tracking-[0.25em] text-[var(--primary)] sm:text-[22px] sm:tracking-[5px]">
                  SABONA
                </p>

                <h2 className="text-2xl font-bold text-[#173d2b] sm:text-[28px]">
                  {t("login.card.title")}
                </h2>

                <p className="mt-2 text-[14px] text-[#687870]">
                  {t("login.card.description")}
                </p>

              </div>

              {/* Login Form */}
              <form
                onSubmit={handleLogin}
                className="space-y-4 sm:space-y-5"
              >

                {/* Email */}
                <div>

                  <label className="mb-2 block text-[14px] font-semibold text-[#294238]">
                    {t("login.form.email.label")}
                  </label>

                  <div className="relative">

                    <Mail
                      size={19}
                      strokeWidth={1.8}
                      className={`absolute top-1/2 -translate-y-1/2 text-[#294238] ${
                        isArabic ? "right-4" : "left-4"
                      }`}
                    />

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t(
                        "login.form.email.placeholder"
                      )}
                      className={`h-[52px] w-full rounded-[14px] border border-[#d8ded9] bg-[#fafbf9] text-[14px] text-[#173d2b] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 ${
                        isArabic
                          ? "pr-14 pl-5"
                          : "pl-14 pr-5"
                      }`}
                    />

                  </div>
                </div>

                {/* Password */}
                <div>

                  <label className="mb-2 block text-[14px] font-semibold text-[#294238]">
                    {t("login.form.password.label")}
                  </label>

                  <div className="relative">

                    <LockKeyhole
                      size={19}
                      strokeWidth={1.8}
                      className={`absolute top-1/2 -translate-y-1/2 text-[#294238] ${
                        isArabic ? "right-4" : "left-4"
                      }`}
                    />

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      placeholder={t(
                        "login.form.password.placeholder"
                      )}
                      className={`h-[52px] w-full rounded-[14px] border border-[#d8ded9] bg-[#fafbf9] text-[14px] text-[#173d2b] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 ${
                        isArabic
                          ? "pr-14 pl-12"
                          : "pl-14 pr-12"
                      }`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                      className={`absolute top-1/2 -translate-y-1/2 cursor-pointer text-[#687870] transition hover:text-[var(--primary)] ${
                        isArabic
                          ? "left-4"
                          : "right-4"
                      }`}
                    >
                      {showPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}
                    </button>

                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="rounded-[12px] bg-red-50 px-4 py-3 text-center text-[13px] text-red-600">
                    {error}
                  </div>
                )}

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-3 flex h-[52px] w-full cursor-pointer items-center justify-center gap-2 rounded-[14px] bg-[var(--primary)] text-[15px] font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span>
                    {loading
                      ? isArabic
                        ? "جاري تسجيل الدخول..."
                        : "Logging in..."
                      : t("login.form.login")}
                  </span>

                  {!loading && (
                    <ArrowRight
                      size={18}
                      className={
                        isArabic
                          ? "rotate-180"
                          : ""
                      }
                    />
                  )}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-4 py-2">

                  <div className="h-[1px] flex-1 bg-[#e0e4e1]" />

                  <span className="text-[12px] font-medium text-[#89958f]">
                    {t("login.form.or")}
                  </span>

                  <div className="h-[1px] flex-1 bg-[#e0e4e1]" />

                </div>

                {/* Signup */}
                <p className="text-center text-[13px] text-[#687870]">

                  {t("login.form.dontHaveAccount")}{" "}

                  <Link
                    to="/signup"
                    className="font-bold text-[var(--primary)] transition hover:opacity-70"
                  >
                    {t("login.form.signup")}
                  </Link>

                </p>

              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer className="mt-0" />
    </div>
  );
}

export default Login;