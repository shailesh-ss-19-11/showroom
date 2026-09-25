import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api, { resolveImage } from "../../api/client";
import Loader from "../../components/ui/Loader";

function formatPrice(price) {
  return `₹${Number(price).toLocaleString("en-IN")}`;
}

export default function AdminBikeDetail() {
  const { id } = useParams();
  const [bike, setBike] = useState(null);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(null);
  const [togglingPublish, setTogglingPublish] = useState(false);

  function load() {
    setLoading(true);
    Promise.all([
      api.get(`/bikes/${id}`),
      api.get("/enquiries", { params: { bikeId: id } }),
    ])
      .then(([bikeRes, enquiriesRes]) => {
        setBike(bikeRes.data);
        setActiveImage(bikeRes.data.images.find((img) => img.isPrimary) || bikeRes.data.images[0] || null);
        setEnquiries(enquiriesRes.data);
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  async function togglePublish() {
    setTogglingPublish(true);
    try {
      await api.put(`/bikes/${id}`, { isActive: !bike.isActive });
      load();
    } finally {
      setTogglingPublish(false);
    }
  }

  if (loading) return <Loader />;
  if (!bike) {
    return (
      <div>
        <Link to="/admin/bikes" className="text-sm font-semibold text-brand hover:underline">← Back to bikes</Link>
        <p className="mt-4 text-ink-soft">Bike not found.</p>
      </div>
    );
  }

  const specs = [
    ["Battery Capacity", bike.batteryCapacityKwh ? `${bike.batteryCapacityKwh} kWh` : null],
    ["Power", bike.power],
    ["Range", bike.rangeKm ? `${bike.rangeKm} km` : null],
    ["Top Speed", bike.topSpeedKmph ? `${bike.topSpeedKmph} km/h` : null],
    ["Charging Time", bike.chargingTimeHours ? `${bike.chargingTimeHours} hrs` : null],
  ].filter(([, value]) => value);

  return (
    <div>
      <div className="flex items-center justify-between">
        <Link to="/admin/bikes" className="text-sm font-semibold text-brand hover:underline">← Back to bikes</Link>
        <div className="flex gap-3">
          <a
            href={`/bikes/${bike.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-black/10 px-5 py-2 text-sm font-bold uppercase tracking-wide text-ink hover:bg-gray-50"
          >
            View on Site
          </a>
          <Link
            to={`/admin/bikes/${bike.id}`}
            className="rounded-full bg-brand px-5 py-2 text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-dark"
          >
            Edit Bike
          </Link>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100">
            {activeImage ? (
              <img src={resolveImage(activeImage.url)} alt={bike.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-ink-soft">No photos uploaded</div>
            )}
          </div>

          {bike.images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {bike.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(img)}
                  className={`h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 ${
                    activeImage?.id === img.id ? "border-brand" : "border-transparent"
                  }`}
                >
                  <img src={resolveImage(img.url)} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold uppercase tracking-wide text-brand">{bike.brand}</span>
            {bike.featured && (
              <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-bold text-brand">Featured</span>
            )}
            <button
              onClick={togglePublish}
              disabled={togglingPublish}
              className={`rounded-full px-2 py-0.5 text-xs font-bold disabled:opacity-50 ${
                bike.isActive ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
              title="Click to toggle"
            >
              {bike.isActive ? "Published" : "Draft"} · {togglingPublish ? "..." : bike.isActive ? "Unpublish" : "Publish"}
            </button>
          </div>

          <h1 className="mt-1 text-3xl font-extrabold text-ink">{bike.name}</h1>
          <p className="mt-1 text-ink-soft">{bike.category}</p>
          <p className="mt-4 text-3xl font-black text-ink">{formatPrice(bike.price)}</p>

          {bike.colors.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-sm font-bold uppercase tracking-wide text-ink-soft">Colors</p>
              <div className="flex flex-wrap gap-2">
                {bike.colors.map((c) => (
                  <span key={c.id} className="flex items-center gap-2 rounded-full border border-black/10 px-3 py-1 text-xs font-semibold">
                    <span className="h-3 w-3 rounded-full border" style={{ backgroundColor: c.hexCode }} />
                    {c.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {specs.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl bg-gray-50 p-5 sm:grid-cols-3">
              {specs.map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs uppercase tracking-wide text-ink-soft">{label}</p>
                  <p className="text-sm font-bold text-ink">{value}</p>
                </div>
              ))}
            </div>
          )}

          {bike.description && <p className="mt-6 text-ink-soft">{bike.description}</p>}
        </div>
      </div>

      <div className="mt-10 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-ink">Enquiries for this bike ({enquiries.length})</h2>
        {enquiries.length === 0 ? (
          <p className="mt-3 text-sm text-ink-soft">No enquiries yet for this bike.</p>
        ) : (
          <ul className="mt-4 divide-y divide-black/5">
            {enquiries.map((e) => (
              <li key={e.id} className="py-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-ink">{e.name} — {e.phone}</p>
                  <p className="text-xs text-ink-soft">{new Date(e.createdAt).toLocaleDateString("en-IN")}</p>
                </div>
                {e.message && <p className="mt-1 text-sm text-ink-soft">{e.message}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
