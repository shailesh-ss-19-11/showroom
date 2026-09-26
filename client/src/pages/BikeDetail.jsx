import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api, { resolveImage } from "../api/client";
import Loader from "../components/ui/Loader";

function formatPrice(price) {
  return `₹${Number(price).toLocaleString("en-IN")}`;
}

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "919999999999";

const SLIDE_INTERVAL_MS = 3500;

export default function BikeDetail() {
  const { id } = useParams();
  const [bike, setBike] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [status, setStatus] = useState("idle");
  const [bookingForm, setBookingForm] = useState({ name: "", phone: "", date: "", slotId: "", notes: "" });
  const [bookingStatus, setBookingStatus] = useState("idle");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/bikes/${id}`)
      .then((res) => setBike(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  const displayedImages = bike
    ? selectedColor
      ? bike.images.filter((img) => img.colorId === selectedColor)
      : bike.images
    : [];

  useEffect(() => {
    setActiveIndex(0);
  }, [selectedColor, bike?.id]);

  useEffect(() => {
    if (paused || displayedImages.length < 2) return;
    const timer = setInterval(() => {
      setActiveIndex((i) => (i + 1) % displayedImages.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [paused, displayedImages.length]);

  useEffect(() => {
    if (!bookingForm.date) {
      setAvailableSlots([]);
      return;
    }
    setSlotsLoading(true);
    setBookingForm((f) => ({ ...f, slotId: "" }));
    api
      .get("/time-slots", { params: { from: bookingForm.date, to: bookingForm.date } })
      .then((res) => setAvailableSlots(res.data))
      .finally(() => setSlotsLoading(false));
  }, [bookingForm.date]);

  if (loading) return <Loader label="Loading bike details..." />;
  if (!bike) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-lg text-ink-soft">Bike not found.</p>
        <Link to="/bikes" className="mt-4 inline-block text-brand hover:underline">← Back to all bikes</Link>
      </div>
    );
  }

  const activeImage = displayedImages[activeIndex] || null;

  function goTo(delta) {
    setActiveIndex((i) => (i + delta + displayedImages.length) % displayedImages.length);
  }

  const specs = [
    ["Battery Capacity", bike.batteryCapacityKwh ? `${bike.batteryCapacityKwh} kWh` : null],
    ["Power", bike.power],
    ["Range", bike.rangeKm ? `${bike.rangeKm} km` : null],
    ["Top Speed", bike.topSpeedKmph ? `${bike.topSpeedKmph} km/h` : null],
    ["Charging Time", bike.chargingTimeHours ? `${bike.chargingTimeHours} hrs` : null],
  ].filter(([, value]) => value);

  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hi, I'm interested in the ${bike.brand} ${bike.name} (${formatPrice(bike.price)}). Can you share more details?`
  )}`;

  async function submitEnquiry(e) {
    e.preventDefault();
    setStatus("sending");
    try {
      await api.post("/enquiries", { ...form, bikeId: bike.id, source: "bike-detail" });
      setStatus("sent");
      setForm({ name: "", phone: "", message: "" });
    } catch {
      setStatus("error");
    }
  }

  async function submitBooking(e) {
    e.preventDefault();
    if (!bookingForm.slotId) return;
    setBookingStatus("sending");
    try {
      await api.post("/bookings", {
        name: bookingForm.name,
        phone: bookingForm.phone,
        notes: bookingForm.notes,
        bikeId: bike.id,
        slotId: bookingForm.slotId,
      });
      setBookingStatus("sent");
      setBookingForm({ name: "", phone: "", date: "", slotId: "", notes: "" });
      setAvailableSlots([]);
    } catch (err) {
      setBookingStatus(err.response?.data?.error || "error");
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link to="/bikes" className="text-sm font-semibold text-brand hover:underline">← Back to all bikes</Link>

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100">
            {activeImage ? (
              <img
                key={activeImage.id}
                src={resolveImage(activeImage.url)}
                alt={bike.name}
                className="h-full w-full animate-[fadeIn_0.4s_ease] object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-ink-soft">No image available</div>
            )}

            {displayedImages.length > 1 && (
              <>
                <button
                  onClick={() => goTo(-1)}
                  aria-label="Previous photo"
                  className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-ink opacity-0 shadow transition group-hover:opacity-100 hover:bg-white"
                >
                  ‹
                </button>
                <button
                  onClick={() => goTo(1)}
                  aria-label="Next photo"
                  className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-ink opacity-0 shadow transition group-hover:opacity-100 hover:bg-white"
                >
                  ›
                </button>
                <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                  {displayedImages.map((img, i) => (
                    <span
                      key={img.id}
                      className={`h-1.5 rounded-full transition-all ${
                        i === activeIndex ? "w-5 bg-white" : "w-1.5 bg-white/60"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {displayedImages.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {displayedImages.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveIndex(i)}
                  className={`h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 ${
                    i === activeIndex ? "border-brand" : "border-transparent"
                  }`}
                >
                  <img src={resolveImage(img.url)} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <span className="text-sm font-bold uppercase tracking-wide text-brand">{bike.brand}</span>
          <h1 className="mt-1 text-3xl font-extrabold text-ink">{bike.name}</h1>
          <p className="mt-1 text-ink-soft">{bike.category}</p>
          <p className="mt-4 text-3xl font-black text-ink">{formatPrice(bike.price)}</p>

          {bike.colors.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-sm font-bold uppercase tracking-wide text-ink-soft">Available Colors</p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setSelectedColor(null)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                    !selectedColor ? "border-brand text-brand" : "border-black/10 text-ink-soft"
                  }`}
                >
                  All
                </button>
                {bike.colors.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedColor(c.id)}
                    className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${
                      selectedColor === c.id ? "border-brand text-brand" : "border-black/10 text-ink-soft"
                    }`}
                  >
                    <span className="h-3 w-3 rounded-full border" style={{ backgroundColor: c.hexCode }} />
                    {c.name}
                  </button>
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

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-[#25D366] px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:opacity-90"
            >
              Enquire on WhatsApp
            </a>
          </div>

          <div className="mt-10 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-ink">Request a Callback</h2>
            <form onSubmit={submitEnquiry} className="mt-4 flex flex-col gap-3">
              <input
                required
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="rounded-lg border border-black/10 px-4 py-2 text-sm"
              />
              <input
                required
                type="tel"
                placeholder="Phone number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="rounded-lg border border-black/10 px-4 py-2 text-sm"
              />
              <textarea
                placeholder="Message (optional)"
                rows={3}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="rounded-lg border border-black/10 px-4 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={status === "sending"}
                className="rounded-full bg-brand px-6 py-2 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-brand-dark disabled:opacity-50"
              >
                {status === "sending" ? "Sending..." : "Request Callback"}
              </button>
              {status === "sent" && <p className="text-sm text-green-600">Thanks! We'll call you back shortly.</p>}
              {status === "error" && <p className="text-sm text-red-600">Something went wrong. Please try again.</p>}
            </form>
          </div>

          <div className="mt-6 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-ink">Book a Test Ride</h2>
            <form onSubmit={submitBooking} className="mt-4 flex flex-col gap-3">
              <input
                required
                type="text"
                placeholder="Your name"
                value={bookingForm.name}
                onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                className="rounded-lg border border-black/10 px-4 py-2 text-sm"
              />
              <input
                required
                type="tel"
                placeholder="Phone number"
                value={bookingForm.phone}
                onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                className="rounded-lg border border-black/10 px-4 py-2 text-sm"
              />
              <input
                required
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                value={bookingForm.date}
                onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                className="rounded-lg border border-black/10 px-4 py-2 text-sm"
              />

              {bookingForm.date && (
                <div>
                  {slotsLoading ? (
                    <p className="text-xs text-ink-soft">Loading available times...</p>
                  ) : availableSlots.length === 0 ? (
                    <p className="text-xs text-ink-soft">No test ride slots available on this date — try another date.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {availableSlots.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          disabled={s.remaining === 0}
                          onClick={() => setBookingForm({ ...bookingForm, slotId: s.id })}
                          className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                            bookingForm.slotId === s.id
                              ? "border-brand bg-brand text-white"
                              : s.remaining === 0
                                ? "cursor-not-allowed border-black/10 text-ink-soft/40 line-through"
                                : "border-black/10 text-ink-soft hover:bg-gray-50"
                          }`}
                        >
                          {new Date(s.slotTime).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <textarea
                placeholder="Preferred showroom / notes (optional)"
                rows={2}
                value={bookingForm.notes}
                onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                className="rounded-lg border border-black/10 px-4 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={bookingStatus === "sending" || !bookingForm.slotId}
                className="rounded-full bg-ink px-6 py-2 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-black disabled:opacity-50"
              >
                {bookingStatus === "sending" ? "Booking..." : "Book Test Ride"}
              </button>
              {bookingStatus === "sent" && (
                <p className="text-sm text-green-600">Booked! We'll confirm your test ride slot shortly.</p>
              )}
              {bookingStatus !== "idle" && bookingStatus !== "sending" && bookingStatus !== "sent" && (
                <p className="text-sm text-red-600">
                  {bookingStatus === "error" ? "Something went wrong. Please try again." : bookingStatus}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
