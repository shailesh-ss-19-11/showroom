import { useState } from "react";
import api from "../../api/client";

export default function ColorManager({ bikeId, colors, onChange }) {
  const [name, setName] = useState("");
  const [hex, setHex] = useState("#1a1a1a");
  const [saving, setSaving] = useState(false);

  async function addColor(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await api.post(`/bikes/${bikeId}/colors`, { name, hexCode: hex });
      setName("");
      onChange();
    } finally {
      setSaving(false);
    }
  }

  async function removeColor(colorId) {
    if (!confirm("Remove this color? Any images linked to it will be unlinked.")) return;
    await api.delete(`/bikes/${bikeId}/colors/${colorId}`);
    onChange();
  }

  return (
    <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-ink">Colors</h2>

      <div className="mt-4 flex flex-wrap gap-2">
        {colors.map((c) => (
          <span
            key={c.id}
            className="flex items-center gap-2 rounded-full border border-black/10 px-3 py-1 text-xs font-semibold"
          >
            <span className="h-3 w-3 rounded-full border" style={{ backgroundColor: c.hexCode }} />
            {c.name}
            <button onClick={() => removeColor(c.id)} className="text-red-600" aria-label={`Remove ${c.name}`}>
              ✕
            </button>
          </span>
        ))}
        {colors.length === 0 && <p className="text-sm text-ink-soft">No colors added yet.</p>}
      </div>

      <form onSubmit={addColor} className="mt-4 flex flex-wrap items-center gap-2">
        <input
          type="text"
          placeholder="Color name (e.g. Racing Blue)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded-lg border border-black/10 px-3 py-2 text-sm"
        />
        <input
          type="color"
          value={hex}
          onChange={(e) => setHex(e.target.value)}
          className="h-9 w-12 rounded border border-black/10"
        />
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-50"
        >
          Add Color
        </button>
      </form>
    </div>
  );
}
