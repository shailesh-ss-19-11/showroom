import { useState } from "react";

const categoryOptions = ["Sport", "Cruiser", "Commuter", "Adventure", "Scooter", "Touring"];

const emptyForm = {
  name: "",
  brand: "",
  category: "",
  price: "",
  batteryCapacityKwh: "",
  rangeKm: "",
  chargingTimeHours: "",
  topSpeedKmph: "",
  power: "",
  description: "",
  featured: false,
};

export default function BikeForm({ initial, onSubmit, submitLabel = "Save" }) {
  const [form, setForm] = useState(() => ({ ...emptyForm, ...initial }));
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit({
        ...form,
        price: Number(form.price),
        batteryCapacityKwh: form.batteryCapacityKwh ? Number(form.batteryCapacityKwh) : null,
        rangeKm: form.rangeKm ? Number(form.rangeKm) : null,
        chargingTimeHours: form.chargingTimeHours ? Number(form.chargingTimeHours) : null,
        topSpeedKmph: form.topSpeedKmph ? Number(form.topSpeedKmph) : null,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Bike Name" required>
          <input required value={form.name} onChange={(e) => update("name", e.target.value)} className="input" />
        </Field>
        <Field label="Brand" required>
          <input required value={form.brand} onChange={(e) => update("brand", e.target.value)} className="input" placeholder="e.g. Yamaha, Honda, TVS" />
        </Field>
        <Field label="Category" required>
          <select required value={form.category} onChange={(e) => update("category", e.target.value)} className="input">
            <option value="">Select category</option>
            {categoryOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Price (₹)" required>
          <input required type="number" min="0" value={form.price} onChange={(e) => update("price", e.target.value)} className="input" />
        </Field>
        <Field label="Battery Capacity (kWh)">
          <input type="number" min="0" step="0.01" value={form.batteryCapacityKwh} onChange={(e) => update("batteryCapacityKwh", e.target.value)} className="input" />
        </Field>
        <Field label="Power">
          <input value={form.power} onChange={(e) => update("power", e.target.value)} className="input" placeholder="e.g. 3 kW BLDC motor" />
        </Field>
        <Field label="Range (km)">
          <input type="number" min="0" step="0.1" value={form.rangeKm} onChange={(e) => update("rangeKm", e.target.value)} className="input" />
        </Field>
        <Field label="Top Speed (km/h)">
          <input type="number" min="0" value={form.topSpeedKmph} onChange={(e) => update("topSpeedKmph", e.target.value)} className="input" />
        </Field>
        <Field label="Charging Time (hours)">
          <input type="number" min="0" step="0.1" value={form.chargingTimeHours} onChange={(e) => update("chargingTimeHours", e.target.value)} className="input" placeholder="e.g. 4.5" />
        </Field>
        <Field label="Featured on homepage">
          <label className="flex h-10 items-center gap-2 text-sm text-ink-soft">
            <input type="checkbox" checked={form.featured} onChange={(e) => update("featured", e.target.checked)} />
            Show in featured bikes
          </label>
        </Field>
      </div>

      <div className="mt-4">
        <Field label="Description">
          <textarea rows={4} value={form.description} onChange={(e) => update("description", e.target.value)} className="input" />
        </Field>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="mt-6 rounded-full bg-brand px-6 py-2 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-brand-dark disabled:opacity-50"
      >
        {saving ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}

function Field({ label, required, children }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-semibold text-ink">
        {label} {required && <span className="text-brand">*</span>}
      </span>
      {children}
    </label>
  );
}
