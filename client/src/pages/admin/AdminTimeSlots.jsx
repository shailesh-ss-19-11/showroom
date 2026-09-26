import { useEffect, useState } from "react";
import api from "../../api/client";
import Loader from "../../components/ui/Loader";

const DAYS = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 7, label: "Sun" },
];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function AdminTimeSlots() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [from, setFrom] = useState(todayIso());
  const [to, setTo] = useState(todayIso());

  const [form, setForm] = useState({
    startDate: todayIso(),
    endDate: todayIso(),
    times: "10:00, 12:00, 14:00, 16:00",
    capacity: 2,
    daysOfWeek: DAYS.map((d) => d.value),
  });

  function load() {
    setLoading(true);
    api
      .get("/time-slots", { params: { from, to } })
      .then((res) => setSlots(res.data))
      .finally(() => setLoading(false));
  }

  useEffect(load, [from, to]);

  function toggleDay(value) {
    setForm((f) => ({
      ...f,
      daysOfWeek: f.daysOfWeek.includes(value)
        ? f.daysOfWeek.filter((d) => d !== value)
        : [...f.daysOfWeek, value],
    }));
  }

  async function generate(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    setResult(null);
    try {
      const times = form.times.split(",").map((t) => t.trim()).filter(Boolean);
      const { data } = await api.post("/time-slots/generate", {
        startDate: form.startDate,
        endDate: form.endDate,
        times,
        capacity: Number(form.capacity),
        daysOfWeek: form.daysOfWeek,
      });
      setResult(data.created);
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to generate slots");
    } finally {
      setSaving(false);
    }
  }

  async function removeSlot(id) {
    if (!confirm("Delete this time slot? Existing bookings will keep their scheduled time.")) return;
    await api.delete(`/time-slots/${id}`);
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink">Test Ride Slots</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Generate bookable time slots for customers to pick from on the public site.
      </p>

      <div className="mt-6 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-ink">Generate Slots</h2>
        <form onSubmit={generate} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block font-semibold text-ink">Start Date</span>
            <input
              required
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="input"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-semibold text-ink">End Date</span>
            <input
              required
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className="input"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block font-semibold text-ink">Times (comma-separated, 24h)</span>
            <input
              required
              placeholder="10:00, 12:00, 14:00, 16:00"
              value={form.times}
              onChange={(e) => setForm({ ...form, times: e.target.value })}
              className="input"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-semibold text-ink">Capacity per slot</span>
            <input
              required
              type="number"
              min="1"
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              className="input"
            />
          </label>
          <div className="sm:col-span-2">
            <span className="mb-1 block text-sm font-semibold text-ink">Days of Week</span>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => toggleDay(d.value)}
                  className={`rounded-full border px-3 py-1 text-xs font-bold uppercase ${
                    form.daysOfWeek.includes(d.value)
                      ? "border-brand bg-brand text-white"
                      : "border-black/10 text-ink-soft hover:bg-gray-50"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
          {result !== null && <p className="text-sm text-green-600 sm:col-span-2">{result} slot(s) created.</p>}

          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-brand px-6 py-2 text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-dark disabled:opacity-50 sm:col-span-2 sm:w-fit"
          >
            {saving ? "Generating..." : "Generate Slots"}
          </button>
        </form>
      </div>

      <div className="mt-8">
        <div className="flex flex-wrap items-end gap-3">
          <h2 className="text-lg font-bold text-ink">Upcoming Slots</h2>
          <label className="text-sm">
            <span className="mr-2 text-ink-soft">From</span>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-lg border border-black/10 px-2 py-1 text-sm" />
          </label>
          <label className="text-sm">
            <span className="mr-2 text-ink-soft">To</span>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-lg border border-black/10 px-2 py-1 text-sm" />
          </label>
        </div>

        {loading ? (
          <Loader />
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-black/5 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-black/5 bg-gray-50 text-xs uppercase tracking-wide text-ink-soft">
                <tr>
                  <th className="px-4 py-3">Date &amp; Time</th>
                  <th className="px-4 py-3">Capacity</th>
                  <th className="px-4 py-3">Booked</th>
                  <th className="px-4 py-3">Remaining</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {slots.map((s) => (
                  <tr key={s.id}>
                    <td className="px-4 py-3 font-semibold text-ink">
                      {new Date(s.slotTime).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{s.capacity}</td>
                    <td className="px-4 py-3 text-ink-soft">{s.booked}</td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${s.remaining === 0 ? "text-red-600" : "text-green-600"}`}>
                        {s.remaining}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => removeSlot(s.id)} className="text-sm font-semibold text-red-600 hover:underline">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {slots.length === 0 && <p className="p-6 text-center text-sm text-ink-soft">No slots in this range.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
