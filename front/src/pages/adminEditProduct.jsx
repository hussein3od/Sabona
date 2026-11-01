import { useEffect, useState } from "react";
import { ArrowLeft, Plus, X, ImagePlus } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import Header from "../components/header";
import Footer from "../components/footer";

const emptyForm = {
  name_en: "",
  name_ar: "",
  short_description_en: "",
  short_description_ar: "",
  description_en: "",
  description_ar: "",
  ingredients_en: "",
  ingredients_ar: "",
  usage_en: "",
  usage_ar: "",
  benefits_en: "",
  benefits_ar: "",
  warnings_en: "",
  warnings_ar: "",
  price: "",
  stock: "",
};

function AdminEditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [formData, setFormData] = useState(emptyForm);
  const [usageTypes, setUsageTypes] = useState([]);
  const [skinTypes, setSkinTypes] = useState([]);

  // الصور الموجودة أصلاً بالداتابيس: [{ id, image_url, sort_order }]
  const [existingImages, setExistingImages] = useState([]);
  // IDs الصور اللي الأدمن حذفها (تنحذف فعلياً عند الحفظ)
  const [removedImageIds, setRemovedImageIds] = useState([]);
  // الصور الجديدة: [{ file, preview }]
  const [newImages, setNewImages] = useState([]);

  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isArabic = i18n.language === "ar";
  const API = import.meta.env.VITE_API_URL;

  // -------------------------
  // Auth check
  // -------------------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!token || !user) {
      navigate("/login");
      return;
    }

    if (user.role !== "admin") {
      navigate("/home");
    }
  }, [navigate]);

  // -------------------------
  // Load product
  // -------------------------
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setPageLoading(true);

        const response = await fetch(`${API}/api/products/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || t("adminEditProduct.errors.loadProduct")
          );
        }

        const product = data.product || data;

        setFormData({
          name_en: product.name_en || "",
          name_ar: product.name_ar || "",
          short_description_en: product.short_description_en || "",
          short_description_ar: product.short_description_ar || "",
          description_en: product.description_en || "",
          description_ar: product.description_ar || "",
          ingredients_en: product.ingredients_en || "",
          ingredients_ar: product.ingredients_ar || "",
          usage_en: product.usage_en || "",
          usage_ar: product.usage_ar || "",
          benefits_en: product.benefits_en || "",
          benefits_ar: product.benefits_ar || "",
          warnings_en: product.warnings_en || "",
          warnings_ar: product.warnings_ar || "",
          price: product.price ?? "",
          stock: product.stock ?? "",
        });

        setUsageTypes(product.usage_types || []);
        setSkinTypes(product.skin_types || []);

        // نتعامل مع الشكلين: كائنات أو روابط نصية
        const loadedImages = (product.images || []).map((img, index) =>
          typeof img === "string"
            ? { id: null, image_url: img, sort_order: index }
            : img
        );

        setExistingImages(loadedImages);
      } catch (err) {
        console.error("Load product error:", err);
        setError(err.message || t("adminEditProduct.errors.loadProduct"));
      } finally {
        setPageLoading(false);
      }
    };

    fetchProduct();
  }, [id, API, t]);

  // تنظيف روابط المعاينة عند مغادرة الصفحة
  useEffect(() => {
    return () => {
      newImages.forEach((item) => URL.revokeObjectURL(item.preview));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------------------------
  // Handlers
  // -------------------------
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const toggleUsageType = (type) => {
    setUsageTypes((current) =>
      current.includes(type)
        ? current.filter((item) => item !== type)
        : [...current, type]
    );
  };

  const toggleSkinType = (type) => {
    setSkinTypes((current) =>
      current.includes(type)
        ? current.filter((item) => item !== type)
        : [...current, type]
    );
  };

  const handleImageChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    const validFiles = selectedFiles.filter((file) => {
      const validType = ["image/jpeg", "image/png", "image/webp"].includes(
        file.type
      );
      const validSize = file.size <= 5 * 1024 * 1024;

      return validType && validSize;
    });

    const items = validFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setNewImages((current) => [...current, ...items]);

    // حتى تكدر تختار نفس الصورة مرة ثانية
    event.target.value = "";
  };

  const removeNewImage = (index) => {
    setNewImages((current) => {
      URL.revokeObjectURL(current[index].preview);
      return current.filter((_, i) => i !== index);
    });
  };

  const removeExistingImage = (image) => {
    setExistingImages((current) =>
      current.filter((item) => item !== image)
    );

    if (image.id) {
      setRemovedImageIds((current) => [...current, image.id]);
    }
  };

  const uploadNewImages = async (token) => {
    const uploadedUrls = [];

    for (const { file } of newImages) {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(`${API}/api/upload/product-image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            t("adminEditProduct.errors.uploadImage", {
              fileName: file.name,
            })
        );
      }

      uploadedUrls.push(data.imageUrl);
    }

    return uploadedUrls;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (!formData.name_en.trim() || !formData.name_ar.trim()) {
      setError(t("adminAddProduct.errors.nameRequired"));
      return;
    }

    if (!formData.price || Number(formData.price) <= 0) {
      setError(t("adminAddProduct.errors.priceRequired"));
      return;
    }

    if (
      formData.stock === "" ||
      Number(formData.stock) < 0 ||
      !Number.isInteger(Number(formData.stock))
    ) {
      setError(t("adminAddProduct.errors.stockRequired"));
      return;
    }

    if (usageTypes.length === 0) {
      setError(t("adminAddProduct.errors.usageRequired"));
      return;
    }

    if (skinTypes.length === 0) {
      setError(t("adminAddProduct.errors.skinRequired"));
      return;
    }

    try {
      setLoading(true);

      const authHeaders = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      // 1) تحديث بيانات المنتج
      const response = await fetch(`${API}/api/products/${id}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          stock: Number(formData.stock),
          usage_types: usageTypes,
          skin_types: skinTypes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || t("adminEditProduct.errors.updateProduct")
        );
      }

      // 2) حذف الصور اللي الأدمن شالها
      for (const imageId of removedImageIds) {
        const deleteResponse = await fetch(
          `${API}/api/products/${id}/images/${imageId}`,
          {
            method: "DELETE",
            headers: authHeaders,
          }
        );

        if (!deleteResponse.ok) {
          const deleteData = await deleteResponse.json().catch(() => ({}));
          throw new Error(
            deleteData.message || t("adminEditProduct.errors.deleteImage")
          );
        }
      }

      // 3) رفع الصور الجديدة وحفظ روابطها
      if (newImages.length > 0) {
        const imageUrls = await uploadNewImages(token);

        const imageResponse = await fetch(
          `${API}/api/products/${id}/images`,
          {
            method: "POST",
            headers: authHeaders,
            body: JSON.stringify({ images: imageUrls }),
          }
        );

        const imageData = await imageResponse.json();

        if (!imageResponse.ok) {
          throw new Error(
            imageData.message || t("adminEditProduct.errors.saveImages")
          );
        }
      }

      setSuccess(
        t("adminEditProduct.success")
      );

      setTimeout(() => {
        navigate("/admin/products");
      }, 1000);
    } catch (err) {
      console.error("Update product error:", err);

      setError(
        err.message ||
          t("adminEditProduct.errors.updateProduct")
      );
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // Styles + options
  // -------------------------
  const inputClass =
    "mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-[#173d2b] outline-none transition placeholder:text-[#a1a69f] focus:border-[#173d2b] focus:ring-1 focus:ring-[#173d2b]";

  const textareaClass =
    "mt-2 min-h-[120px] w-full resize-y rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-[#173d2b] outline-none transition placeholder:text-[#a1a69f] focus:border-[#173d2b] focus:ring-1 focus:ring-[#173d2b]";

  const usageOptions = [
    { value: "face", label: t("adminAddProduct.usageTypes.face") },
    { value: "body", label: t("adminAddProduct.usageTypes.body") },
    { value: "hair", label: t("adminAddProduct.usageTypes.hair") },
  ];

  const skinOptions = [
    { value: "oily", label: t("adminAddProduct.skinTypes.oily") },
    { value: "dry", label: t("adminAddProduct.skinTypes.dry") },
    { value: "normal", label: t("adminAddProduct.skinTypes.normal") },
    { value: "sensitive", label: t("adminAddProduct.skinTypes.sensitive") },
  ];

  if (pageLoading) {
    return (
      <div dir={isArabic ? "rtl" : "ltr"} className="min-h-screen bg-[#faf9f2]">
        <Header />

        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-sm text-[#737a72]">
            {t("adminEditProduct.loading")}
          </p>
        </div>

        <Footer />
      </div>
    );
  }

  const totalImages = existingImages.length + newImages.length;

  return (
    <div dir={isArabic ? "rtl" : "ltr"} className="min-h-screen bg-[#faf9f2]">
      <Header />

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        {/* Page Header */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              className="mb-5 flex items-center gap-2 text-sm text-[#737a72] transition hover:text-[#173d2b]"
            >
              <ArrowLeft size={17} className={isArabic ? "rotate-180" : ""} />

              {t("adminAddProduct.backToProducts")}
            </button>

            <p className="text-[11px] font-medium uppercase tracking-[3px] text-[#7c837a]">
              {t("adminAddProduct.administration")}
            </p>

            <h1 className="mt-2 font-serif text-3xl text-[#173d2b] sm:text-4xl">
              {t("adminEditProduct.title")}
            </h1>

            <p className="mt-3 text-sm text-[#737a72]">
              {t("adminEditProduct.subtitle")}
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-8 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mt-8 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* Product Names */}
          <section className="rounded-2xl border border-black/5 bg-white p-4 sm:p-6 lg:p-8">
            <div>
              <h2 className="text-xl font-semibold text-[#173d2b]">
                {t("adminAddProduct.sections.productName.title")}
              </h2>

              <p className="mt-1 text-sm text-[#737a72]">
                {t("adminAddProduct.sections.productName.description")}
              </p>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-[#173d2b]">
                  {t("adminAddProduct.fields.nameEnglish")}
                </label>

                <input
                  type="text"
                  name="name_en"
                  value={formData.name_en}
                  onChange={handleChange}
                  placeholder={t("adminAddProduct.placeholders.nameEnglish")}
                  dir="ltr"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#173d2b]">
                  {t("adminAddProduct.fields.nameArabic")}
                </label>

                <input
                  type="text"
                  name="name_ar"
                  value={formData.name_ar}
                  onChange={handleChange}
                  placeholder={t("adminAddProduct.placeholders.nameArabic")}
                  dir="rtl"
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          {/* Short Description */}
          <section className="rounded-2xl border border-black/5 bg-white p-4 sm:p-6 lg:p-8">
            <h2 className="text-xl font-semibold text-[#173d2b]">
              {t("adminEditProduct.shortDescription.title")}
            </h2>

            <p className="mt-1 text-sm text-[#737a72]">
              {t("adminEditProduct.shortDescription.description")}
            </p>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-[#173d2b]">
                  {t("adminEditProduct.shortDescription.englishLabel")}
                </label>

                <textarea
                  name="short_description_en"
                  value={formData.short_description_en}
                  onChange={handleChange}
                  placeholder={t(
                    "adminEditProduct.shortDescription.englishPlaceholder"
                  )}
                  dir="ltr"
                  className={textareaClass}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#173d2b]">
                  {t("adminEditProduct.shortDescription.arabicLabel")}
                </label>

                <textarea
                  name="short_description_ar"
                  value={formData.short_description_ar}
                  onChange={handleChange}
                  placeholder={t(
                    "adminEditProduct.shortDescription.arabicPlaceholder"
                  )}
                  dir="rtl"
                  className={textareaClass}
                />
              </div>
            </div>
          </section>

          {/* Description */}
          <section className="rounded-2xl border border-black/5 bg-white p-4 sm:p-6 lg:p-8">
            <h2 className="text-xl font-semibold text-[#173d2b]">
              {t("adminAddProduct.sections.description.title")}
            </h2>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-[#173d2b]">
                  {t("adminAddProduct.fields.descriptionEnglish")}
                </label>

                <textarea
                  name="description_en"
                  value={formData.description_en}
                  onChange={handleChange}
                  placeholder={t(
                    "adminAddProduct.placeholders.descriptionEnglish"
                  )}
                  dir="ltr"
                  className={textareaClass}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#173d2b]">
                  {t("adminAddProduct.fields.descriptionArabic")}
                </label>

                <textarea
                  name="description_ar"
                  value={formData.description_ar}
                  onChange={handleChange}
                  placeholder={t(
                    "adminAddProduct.placeholders.descriptionArabic"
                  )}
                  dir="rtl"
                  className={textareaClass}
                />
              </div>
            </div>
          </section>

          {/* Ingredients */}
          <section className="rounded-2xl border border-black/5 bg-white p-4 sm:p-6 lg:p-8">
            <h2 className="text-xl font-semibold text-[#173d2b]">
              {t("adminAddProduct.sections.ingredients.title")}
            </h2>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-[#173d2b]">
                  {t("adminAddProduct.fields.ingredientsEnglish")}
                </label>

                <textarea
                  name="ingredients_en"
                  value={formData.ingredients_en}
                  onChange={handleChange}
                  placeholder={t(
                    "adminAddProduct.placeholders.ingredientsEnglish"
                  )}
                  dir="ltr"
                  className={textareaClass}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#173d2b]">
                  {t("adminAddProduct.fields.ingredientsArabic")}
                </label>

                <textarea
                  name="ingredients_ar"
                  value={formData.ingredients_ar}
                  onChange={handleChange}
                  placeholder={t(
                    "adminAddProduct.placeholders.ingredientsArabic"
                  )}
                  dir="rtl"
                  className={textareaClass}
                />
              </div>
            </div>
          </section>

          {/* Usage */}
          <section className="rounded-2xl border border-black/5 bg-white p-4 sm:p-6 lg:p-8">
            <h2 className="text-xl font-semibold text-[#173d2b]">
              {t("adminAddProduct.sections.usage.title")}
            </h2>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-[#173d2b]">
                  {t("adminAddProduct.fields.usageEnglish")}
                </label>

                <textarea
                  name="usage_en"
                  value={formData.usage_en}
                  onChange={handleChange}
                  placeholder={t("adminAddProduct.placeholders.usageEnglish")}
                  dir="ltr"
                  className={textareaClass}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#173d2b]">
                  {t("adminAddProduct.fields.usageArabic")}
                </label>

                <textarea
                  name="usage_ar"
                  value={formData.usage_ar}
                  onChange={handleChange}
                  placeholder={t("adminAddProduct.placeholders.usageArabic")}
                  dir="rtl"
                  className={textareaClass}
                />
              </div>
            </div>
          </section>

          {/* Benefits */}
          <section className="rounded-2xl border border-black/5 bg-white p-4 sm:p-6 lg:p-8">
            <h2 className="text-xl font-semibold text-[#173d2b]">
              {t("adminAddProduct.sections.benefits.title")}
            </h2>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-[#173d2b]">
                  {t("adminAddProduct.fields.benefitsEnglish")}
                </label>

                <textarea
                  name="benefits_en"
                  value={formData.benefits_en}
                  onChange={handleChange}
                  placeholder={t(
                    "adminAddProduct.placeholders.benefitsEnglish"
                  )}
                  dir="ltr"
                  className={textareaClass}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#173d2b]">
                  {t("adminAddProduct.fields.benefitsArabic")}
                </label>

                <textarea
                  name="benefits_ar"
                  value={formData.benefits_ar}
                  onChange={handleChange}
                  placeholder={t("adminAddProduct.placeholders.benefitsArabic")}
                  dir="rtl"
                  className={textareaClass}
                />
              </div>
            </div>
          </section>

          {/* Warnings */}
          <section className="rounded-2xl border border-black/5 bg-white p-4 sm:p-6 lg:p-8">
            <h2 className="text-xl font-semibold text-[#173d2b]">
              {t("adminAddProduct.sections.warnings.title")}
            </h2>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-[#173d2b]">
                  {t("adminAddProduct.fields.warningsEnglish")}
                </label>

                <textarea
                  name="warnings_en"
                  value={formData.warnings_en}
                  onChange={handleChange}
                  placeholder={t(
                    "adminAddProduct.placeholders.warningsEnglish"
                  )}
                  dir="ltr"
                  className={textareaClass}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#173d2b]">
                  {t("adminAddProduct.fields.warningsArabic")}
                </label>

                <textarea
                  name="warnings_ar"
                  value={formData.warnings_ar}
                  onChange={handleChange}
                  placeholder={t("adminAddProduct.placeholders.warningsArabic")}
                  dir="rtl"
                  className={textareaClass}
                />
              </div>
            </div>
          </section>

          {/* Product Images */}
          <section className="rounded-2xl border border-black/5 bg-white p-4 sm:p-6 lg:p-8">
            <div>
              <h2 className="text-xl font-semibold text-[#173d2b]">
                {t("adminEditProduct.images.title")}
              </h2>

              <p className="mt-1 text-sm text-[#737a72]">
                {t("adminEditProduct.images.description")}
              </p>
            </div>

            {totalImages > 0 && (
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {existingImages.map((image, index) => (
                  <div
                    key={`existing-${image.id ?? image.image_url}-${index}`}
                    className="relative overflow-hidden rounded-xl border border-black/5 bg-[#faf9f2]"
                  >
                    <img
                      src={image.image_url}
                      alt={t("adminEditProduct.images.existingAlt", {
                        index: index + 1,
                      })}
                      className="aspect-square w-full object-cover"
                    />

                    {index === 0 && (
                      <div className="absolute left-2 top-2 rounded-full bg-[#173d2b] px-3 py-1 text-[10px] font-medium text-white">
                        {t("adminEditProduct.images.main")}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => removeExistingImage(image)}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-red-600 shadow-sm transition hover:bg-red-50"
                      aria-label={t("adminEditProduct.images.remove")}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}

                {newImages.map((item, index) => (
                  <div
                    key={`new-${item.file.name}-${index}`}
                    className="relative overflow-hidden rounded-xl border border-[#173d2b]/30 bg-[#faf9f2]"
                  >
                    <img
                      src={item.preview}
                      alt={t("adminEditProduct.images.newAlt", {
                        index: index + 1,
                      })}
                      className="aspect-square w-full object-cover"
                    />

                    <div className="absolute bottom-2 left-2 rounded-full bg-white px-3 py-1 text-[10px] font-medium text-[#173d2b] shadow-sm">
                      {t("adminEditProduct.images.new")}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-red-600 shadow-sm transition hover:bg-red-50"
                      aria-label={t("adminEditProduct.images.remove")}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6">
              <label
                htmlFor="product-images"
                className="flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-black/10 bg-[#faf9f2] px-6 text-center transition hover:border-[#173d2b] hover:bg-[#f5f5ed]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#173d2b]">
                  <ImagePlus size={22} />
                </div>

                <p className="mt-3 text-sm font-medium text-[#173d2b]">
                  {t("adminEditProduct.images.add")}
                </p>

                <p className="mt-2 text-xs text-[#737a72]">
                  {t("adminEditProduct.images.requirements")}
                </p>

                <input
                  id="product-images"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </section>

          {/* Price + Stock */}
          <section className="rounded-2xl border border-black/5 bg-white p-4 sm:p-6 lg:p-8">
            <h2 className="text-xl font-semibold text-[#173d2b]">
              {t("adminAddProduct.sections.priceStock.title")}
            </h2>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-[#173d2b]">
                  {t("adminAddProduct.fields.price")}
                </label>

                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  placeholder="5000"
                  dir="ltr"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#173d2b]">
                  {t("adminAddProduct.fields.stock")}
                </label>

                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  placeholder="20"
                  dir="ltr"
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          {/* Usage Types */}
          <section className="rounded-2xl border border-black/5 bg-white p-4 sm:p-6 lg:p-8">
            <h2 className="text-xl font-semibold text-[#173d2b]">
              {t("adminAddProduct.sections.productUsage.title")}
            </h2>

            <p className="mt-1 text-sm text-[#737a72]">
              {t("adminAddProduct.sections.productUsage.description")}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {usageOptions.map((option) => {
                const selected = usageTypes.includes(option.value);

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleUsageType(option.value)}
                    className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition ${
                      selected
                        ? "border-[#173d2b] bg-[#173d2b] text-white"
                        : "border-black/10 bg-white text-[#173d2b] hover:border-[#173d2b]"
                    }`}
                  >
                    {selected && <Plus size={15} />}
                    {option.label}
                  </button>
                );
              })}
            </div>

            {usageTypes.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {usageTypes.map((type) => (
                  <span
                    key={type}
                    className="flex items-center gap-1 rounded-full bg-[#f3f4ed] px-3 py-1.5 text-xs text-[#173d2b]"
                  >
                    {t(`adminAddProduct.usageTypes.${type}`)}

                    <button
                      type="button"
                      onClick={() => toggleUsageType(type)}
                      className="text-[#737a72] hover:text-red-600"
                    >
                      <X size={13} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Skin Types */}
          <section className="rounded-2xl border border-black/5 bg-white p-4 sm:p-6 lg:p-8">
            <h2 className="text-xl font-semibold text-[#173d2b]">
              {t("adminAddProduct.sections.skinTypes.title")}
            </h2>

            <p className="mt-1 text-sm text-[#737a72]">
              {t("adminAddProduct.sections.skinTypes.description")}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {skinOptions.map((option) => {
                const selected = skinTypes.includes(option.value);

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleSkinType(option.value)}
                    className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition ${
                      selected
                        ? "border-[#173d2b] bg-[#173d2b] text-white"
                        : "border-black/10 bg-white text-[#173d2b] hover:border-[#173d2b]"
                    }`}
                  >
                    {selected && <Plus size={15} />}
                    {option.label}
                  </button>
                );
              })}
            </div>

            {skinTypes.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {skinTypes.map((type) => (
                  <span
                    key={type}
                    className="flex items-center gap-1 rounded-full bg-[#f3f4ed] px-3 py-1.5 text-xs text-[#173d2b]"
                  >
                    {t(`adminAddProduct.skinTypes.${type}`)}

                    <button
                      type="button"
                      onClick={() => toggleSkinType(type)}
                      className="text-[#737a72] hover:text-red-600"
                    >
                      <X size={13} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Submit */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              className="rounded-full border border-black/10 px-7 py-3 text-sm font-medium text-[#173d2b] transition hover:bg-white"
            >
              {t("adminAddProduct.buttons.cancel")}
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-[#173d2b] px-8 py-3 text-sm font-medium text-white transition hover:bg-[#24563d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? t("adminEditProduct.buttons.saving")
                : t("adminEditProduct.buttons.save")}
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}

export default AdminEditProduct;