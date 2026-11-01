import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  UserRound,
  Mail,
  Phone,
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

function Signup() {
  const { t, i18n } = useTranslation();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const isArabic = i18n.language === "ar";

  const handleSignup = async (e) => {
  e.preventDefault();

  setError("");
  setSuccess("");

  if (password !== confirmPassword) {
    setError("Passwords do not match.");
    return;
  }

  try {
    setLoading(true);

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signup`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          phone: phone || null,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Signup failed");
    }

    setSuccess("Account created successfully!");

    setTimeout(() => {
      navigate("/login");
    }, 1200);
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
      <header className="h-16 border-b border-black/10 bg-[#faf9f2]/95 sm:h-[74px]">
        <div className="mx-auto flex h-full max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* Logo */}
          <Link
            to="/"
            className="font-serif text-xl tracking-[0.25em] text-[#173d2b] sm:text-[26px] sm:tracking-[6px]"
          >
            SABONA
          </Link>

          {/* Language */}
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

          {/* Left Content */}
          <section className="hidden pl-4 lg:block">
            <div className="max-w-[550px]">

              {/* Small Title */}
              <div className="mb-5 flex items-center gap-4 text-[13px] uppercase tracking-[6px] text-[#173d2b]">
                <span>{t("signup.joinSabona")}</span>
                <span className="h-px w-12 bg-[#173d2b]/40" />
              </div>

              {/* Main Title */}
              <h1 className="font-serif text-5xl leading-[1.15] tracking-[-1px] text-[#173d2b] xl:text-[58px]">
                {t("signup.titleLine1")}
                <br />
                {t("signup.titleLine2")}
              </h1>

              {/* Description */}
              <p className="mt-6 max-w-[500px] text-[17px] leading-8 text-[#405047]">
                {t("signup.description")}
              </p>

              {/* Features */}
              <div className="mt-10 space-y-7">

                {/* Feature 1 */}
                <div className="flex items-center gap-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#173d2b]/30">
                    <Leaf size={25} strokeWidth={1.4} />
                  </div>

                  <div>
                    <h3 className="text-[16px] font-medium text-[#173d2b]">
                      {t("signup.features.exclusiveOffers.title")}
                    </h3>

                    <p className="mt-1 text-[14px] text-[#68736c]">
                      {t("signup.features.exclusiveOffers.description")}
                    </p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="flex items-center gap-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#173d2b]/30">
                    <Heart size={25} strokeWidth={1.4} />
                  </div>

                  <div>
                    <h3 className="text-[16px] font-medium text-[#173d2b]">
                      {t("signup.features.personalizedExperience.title")}
                    </h3>

                    <p className="mt-1 text-[14px] text-[#68736c]">
                      {t("signup.features.personalizedExperience.description")}
                    </p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="flex items-center gap-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#173d2b]/30">
                    <ShieldCheck size={25} strokeWidth={1.4} />
                  </div>

                  <div>
                    <h3 className="text-[16px] font-medium text-[#173d2b]">
                      {t("signup.features.safeSecure.title")}
                    </h3>

                    <p className="mt-1 text-[14px] text-[#68736c]">
                      {t("signup.features.safeSecure.description")}
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* Signup Card */}
          <section className="flex justify-center px-0 sm:px-5 lg:justify-end lg:px-0">
            <div className="w-full max-w-[500px] rounded-2xl border border-white/60 bg-[#faf9f2]/95 px-5 py-7 shadow-[0_15px_50px_rgba(35,55,42,0.08)] sm:rounded-[10px] sm:px-10 sm:py-10 lg:px-12 lg:py-12">

              {/* Card Header */}
              <div className="text-center">

                <h2 className="font-serif text-[28px] tracking-[5px] text-[#173d2b] sm:text-[38px] sm:tracking-[7px]">
                  SABONA
                </h2>

                <p className="mt-3 text-[13px] uppercase tracking-[5px] text-[#173d2b]">
                  {t("signup.card.title")}
                </p>

              </div>

              {/* Form */}
              <form
                onSubmit={handleSignup}
                className="mt-6 space-y-4 sm:mt-8 sm:space-y-5"
              >

                {/* Full Name */}
                <div>
                  <label className="mb-2 block text-[13px] font-medium text-[#20372c]">
                    {t("signup.form.fullName.label")}
                  </label>

                  <div className="relative">
                    <UserRound
                      size={19}
                      strokeWidth={1.5}
                      className={`absolute top-1/2 -translate-y-1/2 text-[#294238] ${
                        isArabic ? "right-4" : "left-4"
                      }`}
                    />

                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t("signup.form.fullName.placeholder")}
                      className={`h-[48px] w-full rounded-full border border-[#173d2b]/15 bg-transparent text-[14px] text-[#173d2b] outline-none transition placeholder:text-[#a1a6a1] focus:border-[#173d2b]/50 ${
                        isArabic ? "pr-14 pl-5" : "pl-14 pr-5"
                      }`}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="mb-2 block text-[13px] font-medium text-[#20372c]">
                    {t("signup.form.email.label")}
                  </label>

                  <div className="relative">
                    <Mail
                      size={19}
                      strokeWidth={1.5}
                      className={`absolute top-1/2 -translate-y-1/2 text-[#294238] ${
                        isArabic ? "right-4" : "left-4"
                      }`}
                    />

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("signup.form.email.placeholder")}
                      className={`h-[48px] w-full rounded-full border border-[#173d2b]/15 bg-transparent text-[14px] text-[#173d2b] outline-none transition placeholder:text-[#a1a6a1] focus:border-[#173d2b]/50 ${
                        isArabic
                          ? "pr-14 pl-5"
                          : "pl-14 pr-5"
                      }`}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-[13px] font-medium text-[#20372c]">
                      {t("signup.form.phone.label")}
                    </label>

                    <span className="text-[12px] text-[#999f99]">
                      {t("signup.form.phone.optional")}
                    </span>
                  </div>

                  <div className="relative">
                    <Phone
                      size={19}
                      strokeWidth={1.5}
                      className={`absolute top-1/2 -translate-y-1/2 text-[#294238] ${
                        isArabic ? "right-4" : "left-4"
                      }`}
                    />

                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={t("signup.form.phone.placeholder")}
                      className={`h-[48px] w-full rounded-full border border-[#173d2b]/15 bg-transparent text-[14px] text-[#173d2b] outline-none transition placeholder:text-[#a1a6a1] focus:border-[#173d2b]/50 ${
                        isArabic
                          ? "pr-14 pl-5"
                          : "pl-14 pr-5"
                      }`}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="mb-2 block text-[13px] font-medium text-[#20372c]">
                    {t("signup.form.password.label")}
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={19}
                      strokeWidth={1.5}
                      className={`absolute top-1/2 -translate-y-1/2 text-[#294238] ${
                        isArabic ? "right-4" : "left-4"
                      }`}
                    />

                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t("signup.form.password.placeholder")}
                      className={`h-[48px] w-full rounded-full border border-[#173d2b]/15 bg-transparent text-[14px] text-[#173d2b] outline-none transition placeholder:text-[#a1a6a1] focus:border-[#173d2b]/50 ${
                        isArabic
                          ? "pr-14 pl-12"
                          : "pl-14 pr-12"
                      }`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((prev) => !prev)
                      }
                      className={`absolute top-1/2 -translate-y-1/2 text-[#7d8580] transition hover:text-[#173d2b] ${
                        isArabic ? "left-4" : "right-4"
                      }`}
                    >
                      {showPassword ? (
                        <EyeOff size={18} strokeWidth={1.5} />
                      ) : (
                        <Eye size={18} strokeWidth={1.5} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="mb-2 block text-[13px] font-medium text-[#20372c]">
                    {t("signup.form.confirmPassword.label")}
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={19}
                      strokeWidth={1.5}
                      className={`absolute top-1/2 -translate-y-1/2 text-[#294238] ${
                        isArabic ? "right-4" : "left-4"
                      }`}
                    />

                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={t("signup.form.confirmPassword.placeholder")}
                      className={`h-[48px] w-full rounded-full border border-[#173d2b]/15 bg-transparent text-[14px] text-[#173d2b] outline-none transition placeholder:text-[#a1a6a1] focus:border-[#173d2b]/50 ${
                        isArabic
                          ? "pr-14 pl-12"
                          : "pl-14 pr-12"
                      }`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((prev) => !prev)
                      }
                      className={`absolute top-1/2 -translate-y-1/2 text-[#7d8580] transition hover:text-[#173d2b] ${
                        isArabic ? "left-4" : "right-4"
                      }`}
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} strokeWidth={1.5} />
                      ) : (
                        <Eye size={18} strokeWidth={1.5} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                {error && (
                  <p className="text-center text-sm text-red-600">
                    {error}
                  </p>
                )}

                {success && (
                  <p className="text-center text-sm text-green-700">
                    {success}
                  </p>
                )}
                <button
                  type="submit"
                  className="mt-2 flex h-[48px] w-full items-center justify-center gap-3 rounded-full bg-[#173d2b] text-[14px] font-medium text-white transition hover:bg-[#204b37]"
                >
                  {loading ? "Creating..." : t("signup.form.createAccount")}

                  {!loading && (
                  <ArrowRight
                    size={18}
                    strokeWidth={1.7}
                    className={isArabic ? "rotate-180" : ""}
                  />
                )}
                </button>

              </form>

              {/* Divider */}
              <div className="my-7 flex items-center gap-4">

                <div className="h-px flex-1 bg-[#173d2b]/15" />

                <span className="text-[12px] text-[#8a918c]">
                  {t("signup.form.or")}
                </span>

                <div className="h-px flex-1 bg-[#173d2b]/15" />

              </div>

              {/* Login */}
              <p className="text-center text-[13px] text-[#a0a59f]">
                {t("signup.form.alreadyHaveAccount")}{" "}

                <Link
                  to="/login"
                  className="font-medium text-[#173d2b] transition hover:underline"
                >
                  {t("signup.form.login")}
                </Link>
              </p>

            </div>
          </section>

        </div>
      </main>

      {/* Footer */}
      <Footer className="mt-0" />
    </div>
  );
}

export default Signup;