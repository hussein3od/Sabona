import { useTranslation } from "react-i18next";
import footer from "../assets/footer.webp";
import Container from "./container";
import { FiPhone, FiMail, FiMapPin } from "react-icons/fi";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";
function Footer({ className = "mt-3" }) {
    const { i18n, t } = useTranslation();
        
          const isArabic = i18n.language === "ar";
  return (
    <footer className={`relative overflow-hidden bg-[#1D3022] text-white ${className}`}>

      <img src={footer} className="absolute inset-0 h-full w-full object-cover opacity-40"/>

      <div className="absolute inset-0 bg-[#1D3022]/70"></div>

      <Container className="relative z-10 pt-3">

        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-3">

          <div
            className={`text-center ${
              isArabic ? "md:text-right" : "md:text-left"
            }`}
          >
            <h2 className="font-serif text-3xl tracking-[6px] sm:text-4xl sm:tracking-[8px]">
              SABONA
            </h2>
          </div>

          <div className="space-y-4 text-sm text-white/80">

            <a
              href="tel:+9647874581735"
              className="flex items-center gap-3 transition hover:text-white"
            >
              <FiPhone size={19} />
              <span>+964 787 458 1735</span>
            </a>

            <a
              href="mailto:hhssing@gmail.com"
              className="flex items-center gap-3 transition hover:text-white"
            >
              <FiMail size={19} />
              <span>hhssing@gmail.com</span>
            </a>

            <div className="flex items-center gap-3">
              <FiMapPin size={19} />
              <span>{t("footer.location")}</span>
            </div>

          </div>

          <div
            className={`text-center ${
              isArabic ? "md:text-right" : "md:text-left"
            }`}
          >

            <p className={`mb-4 text-sm text-white/80 ${
                isArabic
                  ? "before:right-0 text-right"
                  : "before:left-0 text-left"
              }`}>
              {t("footer.folow")}
            </p>

            <div className="flex justify-center gap-3 md:justify-start">

              <a
                href="https://instagram.com/h163_55"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 transition hover:bg-white/30"
              >
                <FaInstagram size={18} />
              </a>

              <a
                href="https://wa.me/9647874581735"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 transition hover:bg-white/30"
              >
                <FaWhatsapp size={18} />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-4 border-t border-white/20 pt-2 text-center">
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} Sabona. All rights reserved.
          </p>
        </div>

      </Container>
    </footer>
  );
}

export default Footer;