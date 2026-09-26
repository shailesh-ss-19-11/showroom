import { useEffect, useState } from "react";
import api, { resolveImage } from "../../api/client";
import Loader from "../../components/ui/Loader";

const emptyForm = {
  heroEyebrow: "",
  heroHeadingLine1: "",
  heroHeadingLine2: "",
  heroHeadingLine3: "",
  heroSubtext: "",
  heroImageUrl: "",
  stat1Value: "",
  stat1Label: "",
  stat2Value: "",
  stat2Label: "",
  stat3Value: "",
  stat3Label: "",
};

export default function AdminSiteContent() {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    api.get("/site-content").then((res) => setForm(res.data)).finally(() => setLoading(false));
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function uploadImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const { data } = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      update("heroImageUrl", data.url);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setStatus("idle");
    try {
      const { data } = await api.put("/site-content", form);
      setForm(data);
      setStatus("saved");
    } catch {
      setStatus("error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink">Homepage Content</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Edit the hero copy, hero image, and stat band shown on the public homepage.
      </p>

      <form onSubmit={submit} className="mt-6 flex flex-col gap-6">
        <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-ink">Hero</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Eyebrow text" full>
              <input value={form.heroEyebrow || ""} onChange={(e) => update("heroEyebrow", e.target.value)} className="input" />
            </Field>
            <Field label="Heading line 1">
              <input value={form.heroHeadingLine1 || ""} onChange={(e) => update("heroHeadingLine1", e.target.value)} className="input" />
            </Field>
            <Field label="Heading line 2 (brand color)">
              <input value={form.heroHeadingLine2 || ""} onChange={(e) => update("heroHeadingLine2", e.target.value)} className="input" />
            </Field>
            <Field label="Heading line 3">
              <input value={form.heroHeadingLine3 || ""} onChange={(e) => update("heroHeadingLine3", e.target.value)} className="input" />
            </Field>
            <Field label="Subtext" full>
              <textarea
                rows={3}
                value={form.heroSubtext || ""}
                onChange={(e) => update("heroSubtext", e.target.value)}
                className="input"
              />
            </Field>
          </div>

          <div className="mt-5 border-t border-black/5 pt-5">
            <p className="mb-2 text-sm font-semibold text-ink">Hero Image</p>
            <p className="mb-3 text-xs text-ink-soft">
              Overrides the featured bike's photo on the homepage hero. Leave empty to fall back automatically.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              {form.heroImageUrl && (
                <div className="relative h-24 w-32 overflow-hidden rounded-lg bg-gray-100">
                  <img src={resolveImage(form.heroImageUrl)} alt="Hero preview" className="h-full w-full object-cover" />
                </div>
              )}
              <label className="cursor-pointer rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-black">
                {uploading ? "Uploading..." : "Upload Image"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="hidden"
                  onChange={uploadImage}
                  disabled={uploading}
                />
              </label>
              {form.heroImageUrl && (
                <button
                  type="button"
                  onClick={() => update("heroImageUrl", "")}
                  className="text-sm font-semibold text-red-600 hover:underline"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-ink">Stats Band</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <input placeholder="Value (e.g. 15+)" value={form.stat1Value || ""} onChange={(e) => update("stat1Value", e.target.value)} className="input" />
              <input placeholder="Label" value={form.stat1Label || ""} onChange={(e) => update("stat1Label", e.target.value)} className="input" />
            </div>
            <div className="flex flex-col gap-2">
              <input placeholder="Value (e.g. 1000+)" value={form.stat2Value || ""} onChange={(e) => update("stat2Value", e.target.value)} className="input" />
              <input placeholder="Label" value={form.stat2Label || ""} onChange={(e) => update("stat2Label", e.target.value)} className="input" />
            </div>
            <div className="flex flex-col gap-2">
              <input placeholder="Value (e.g. 24/7)" value={form.stat3Value || ""} onChange={(e) => update("stat3Value", e.target.value)} className="input" />
              <input placeholder="Label" value={form.stat3Label || ""} onChange={(e) => update("stat3Label", e.target.value)} className="input" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-brand px-6 py-2 text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-dark disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {status === "saved" && <p className="text-sm text-green-600">Saved — refresh the homepage to see it live.</p>}
          {status === "error" && <p className="text-sm text-red-600">Something went wrong. Please try again.</p>}
        </div>
      </form>
    </div>
  );
}

function Field({ label, full, children }) {
  return (
    <label className={`block text-sm ${full ? "sm:col-span-2" : ""}`}>
      <span className="mb-1 block font-semibold text-ink">{label}</span>
      {children}
    </label>
  );
}
