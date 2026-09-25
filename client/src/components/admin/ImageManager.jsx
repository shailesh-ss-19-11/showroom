import { useEffect, useState } from "react";
import api, { resolveImage } from "../../api/client";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function ImageManager({ bikeId, images, colors, onChange }) {
  const [colorId, setColorId] = useState("");
  const [isPrimary, setIsPrimary] = useState(images.length === 0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState(images);
  const [dragIndex, setDragIndex] = useState(null);
  const [reordering, setReordering] = useState(false);

  useEffect(() => setOrder(images), [images]);

  function handleDragStart(index) {
    setDragIndex(index);
  }

  function handleDragOver(e, index) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    setOrder((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(index, 0, moved);
      return next;
    });
    setDragIndex(index);
  }

  async function handleDragEnd() {
    setDragIndex(null);
    setReordering(true);
    try {
      await api.patch(`/bikes/${bikeId}/images/reorder`, { order: order.map((img) => img.id) });
      onChange();
    } finally {
      setReordering(false);
    }
  }

  async function handleFiles(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const oversized = files.filter((f) => f.size > MAX_FILE_SIZE);
    if (oversized.length > 0) {
      setError(`${oversized.map((f) => f.name).join(", ")} exceeds the 5MB limit and was skipped.`);
    } else {
      setError("");
    }

    const validFiles = files.filter((f) => f.size <= MAX_FILE_SIZE);
    setUploading(true);
    try {
      for (const [index, file] of validFiles.entries()) {
        const formData = new FormData();
        formData.append("image", file);
        const { data } = await api.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        await api.post(`/bikes/${bikeId}/images`, {
          url: data.url,
          colorId: colorId || null,
          isPrimary: isPrimary && index === 0,
        });
      }
      onChange();
    } catch {
      setError((prev) => (prev ? `${prev} Upload failed for one or more photos.` : "Upload failed. Please try a smaller JPEG/PNG/WEBP image."));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function removeImage(imageId) {
    if (!confirm("Delete this photo?")) return;
    await api.delete(`/bikes/${bikeId}/images/${imageId}`);
    onChange();
  }

  return (
    <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-ink">Photos</h2>
      {order.length > 1 && (
        <p className="mt-1 text-xs text-ink-soft">Drag photos to reorder. {reordering && "Saving order..."}</p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {order.map((img, index) => (
          <div
            key={img.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`group relative aspect-square cursor-grab overflow-hidden rounded-lg bg-gray-100 active:cursor-grabbing ${
              dragIndex === index ? "opacity-50" : ""
            }`}
          >
            <img src={resolveImage(img.url)} alt="" className="h-full w-full object-cover" />
            {img.isPrimary && (
              <span className="absolute left-1 top-1 rounded bg-brand px-2 py-0.5 text-[10px] font-bold text-white">
                Primary
              </span>
            )}
            <button
              onClick={() => removeImage(img.id)}
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs text-white opacity-0 transition group-hover:opacity-100"
              aria-label="Delete photo"
            >
              ✕
            </button>
          </div>
        ))}
        {order.length === 0 && <p className="col-span-full text-sm text-ink-soft">No photos uploaded yet.</p>}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-black/5 pt-4">
        <select
          value={colorId}
          onChange={(e) => setColorId(e.target.value)}
          className="rounded-lg border border-black/10 px-3 py-2 text-sm"
        >
          <option value="">No specific color</option>
          {colors.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <label className="flex items-center gap-2 text-sm text-ink-soft">
          <input type="checkbox" checked={isPrimary} onChange={(e) => setIsPrimary(e.target.checked)} />
          Set as primary photo
        </label>

        <label className="cursor-pointer rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-black">
          {uploading ? "Uploading..." : "Upload Photos"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            className="hidden"
            onChange={handleFiles}
            disabled={uploading}
          />
        </label>
      </div>

      <p className="mt-2 text-xs text-ink-soft">
        You can select multiple photos at once. JPEG, PNG, WEBP, or AVIF — max 5MB per photo.
      </p>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
