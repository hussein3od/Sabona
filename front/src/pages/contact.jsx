import { useTranslation } from "react-i18next";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  ArrowUpRight,
  Leaf,
  ShieldCheck,
  Heart,
  Globe,
} from "lucide-react";

import Header from "../components/header";
import Footer from "../components/footer.jsx";
import Container from "../components/container.jsx";

function Contact() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language.startsWith("ar");

  const contactInfo = {
    phone: "+964 7874581735",
    email: "hhssing@gmail.com",
    instagram: "https://instagram.com/h163_55",
    whatsapp: "https://wa.me/9647874581735",
  };

  const socialLinks = [
    {
      name: "Instagram",
      description: t("contact.social.instagramDescription"),
      href: contactInfo.instagram,
      icon: Globe,
    },
    {
      name: "WhatsApp",
      description: t("contact.social.whatsappDescription"),
      href: contactInfo.whatsapp,
      icon: MessageCircle,
    },
  ];

  const contactItems = [
    {
      icon: Phone,
      title: t("contact.info.phone"),
      value: contactInfo.phone,
      href: `tel:${contactInfo.phone.replace(/\s/g, "")}`,
    },
    {
      icon: Mail,
      title: t("contact.info.email"),
      value: contactInfo.email,
      href: `mailto:${contactInfo.email}`,
    },
    {
      icon: MapPin,
      title: t("contact.info.addressLabel"),
      value: t("contact.info.address"),
      href: null,
    },
    {
      icon: Clock,
      title: t("contact.info.workingHours"),
      value: t("contact.info.workingHoursValue"),
      href: null,
    },
  ];

  return (
    <div
      dir={isArabic ? "rtl" : "ltr"}
      className="flex min-h-screen flex-col bg-[#fcfbf7] text-[#173d2b]"
    >
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-[#173d2b]">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full border border-white/10" />
          <div className="absolute -bottom-32 -right-16 h-80 w-80 rounded-full border border-white/10" />

          <Container className="relative mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-28">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm text-[#dce7d8]">
                <Leaf size={16} />
                <span>{t("contact.hero.eyebrow")}</span>
              </div>

              <h1 className="font-serif text-3xl font-medium leading-tight text-white sm:text-5xl lg:text-6xl">
                {t("contact.hero.title")}
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/75 sm:text-lg">
                {t("contact.hero.description")}
              </p>

              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <a
                  href={`tel:${contactInfo.phone.replace(/\s/g, "")}`}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#f7f6ef] px-6 py-3 text-sm font-semibold text-[#173d2b] transition hover:bg-white"
                >
                  <Phone size={17} />
                  {t("contact.hero.callButton")}
                </a>

                <a
                  href={contactInfo.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  <MessageCircle size={17} />
                  {t("contact.hero.whatsappButton")}
                </a>
              </div>
            </div>
          </Container>
        </section>

        {/* Contact Information */}
        <Container className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-20">
          <div className="grid min-w-0 grid-cols-1 gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <section>
              <div className="mb-4 flex items-center gap-3">
                <span className="h-px w-10 bg-[#365747]/40" />
                <span className="text-xs font-semibold uppercase tracking-[3px] text-[#52725d]">
                  {t("contact.info.eyebrow")}
                </span>
              </div>

              <h2 className="font-serif text-3xl leading-tight sm:text-4xl">
                {t("contact.info.title")}
              </h2>

              <p className="mt-5 max-w-lg text-sm leading-8 text-[#737a72] sm:text-base">
                {t("contact.info.description")}
              </p>

              <div className="mt-9 space-y-4">
                {contactItems.map((item) => {
                  const Icon = item.icon;

                  const content = (
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#edf1e8] text-[#365747] transition group-hover:bg-[#173d2b] group-hover:text-white">
                        <Icon size={21} strokeWidth={1.7} />
                      </div>

                      <div className="min-w-0 pt-1">
                        <h3 className="text-sm font-semibold">
                          {item.title}
                        </h3>
                        <p className="mt-2 break-words text-sm leading-6 text-[#737a72]">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  );

                  return (
                    <div
                      key={item.title}
                      className="group rounded-2xl border border-[#e9e9df] bg-white p-5 transition hover:border-[#cbd7c8] hover:shadow-[0_8px_25px_rgba(23,61,43,0.05)]"
                    >
                      {item.href ? (
                        <a href={item.href}>{content}</a>
                      ) : (
                        content
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Social Media */}
            <section className="rounded-3xl border border-[#e9e9df] bg-white p-4 sm:p-9">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf1e8] text-[#365747]">
                <Heart size={26} strokeWidth={1.5} />
              </div>

              <h2 className="mt-6 font-serif text-3xl sm:text-4xl">
                {t("contact.social.title")}
              </h2>

              <p className="mt-4 text-sm leading-8 text-[#737a72] sm:text-base">
                {t("contact.social.description")}
              </p>

              <div className="mt-8 space-y-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon;

                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between gap-4 rounded-2xl border border-[#eeeee6] p-4 transition hover:border-[#cbd7c8] hover:bg-[#fcfbf7]"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#edf1e8] text-[#365747] transition group-hover:bg-[#173d2b] group-hover:text-white">
                          <Icon size={20} strokeWidth={1.7} />
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold">
                            {social.name}
                          </h3>

                          <p className="mt-1 text-xs leading-5 text-[#858a82]">
                            {social.description}
                          </p>
                        </div>
                      </div>

                      <ArrowUpRight
                        size={19}
                        className="shrink-0 text-[#8b988b] transition group-hover:text-[#173d2b]"
                      />
                    </a>
                  );
                })}
              </div>

              <div className="mt-7 flex items-start gap-3 rounded-2xl bg-[#f7f6ef] p-4">
                <ShieldCheck
                  size={21}
                  className="mt-0.5 shrink-0 text-[#365747]"
                />

                <p className="text-xs leading-6 text-[#657365]">
                  {t("contact.social.note")}
                </p>
              </div>
            </section>
          </div>
        </Container>

        {/* Brand Closing Section */}
        <section className="border-t border-[#e9e9df] bg-[#f4f3eb]">
          <Container className="mx-auto w-full max-w-7xl px-4 py-12 text-center sm:px-6 sm:py-16">
            <Leaf
              size={28}
              strokeWidth={1.5}
              className="mx-auto text-[#52725d]"
            />

            <h2 className="mt-5 font-serif text-2xl sm:text-3xl">
              {t("contact.closing.title")}
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-8 text-[#737a72] sm:text-base">
              {t("contact.closing.description")}
            </p>
          </Container>
        </section>
      </main>

      <footer className="mt-auto">
        <Footer />
      </footer>
    </div>
  );
}

export default Contact;