import { useEffect, useState } from "react";
import api from "../../api/client";
import Loader from "../../components/ui/Loader";

const STATUSES = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];

const STATUS_STYLES = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api
      .get("/bookings", { params: statusFilter ? { status: statusFilter } : {} })
      .then((res) => setBookings(res.data))
      .finally(() => setLoading(false));
  }

  useEffect(load, [statusFilter]);

  async function changeStatus(id, status) {
    await api.patch(`/bookings/${id}/status`, { status });
    load();
  }

  async function remove(id) {
    if (!confirm("Delete this booking request?")) return;
    await api.delete(`/bookings/${id}`);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-ink">Test Ride Bookings</h1>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {["", ...STATUSES].map((s) => (
          <button
            key={s || "all"}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-wide ${
              statusFilter === s ? "border-brand bg-brand text-white" : "border-black/10 text-ink-soft hover:bg-gray-50"
            }`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-black/5 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-black/5 bg-gray-50 text-xs uppercase tracking-wide text-ink-soft">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Bike</th>
                <th className="px-4 py-3">Preferred Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td className="px-4 py-3 font-semibold text-ink">{b.name}</td>
                  <td className="px-4 py-3 text-ink-soft">{b.phone}</td>
                  <td className="px-4 py-3 text-ink-soft">{b.bike ? `${b.bike.brand} ${b.bike.name}` : "—"}</td>
                  <td className="px-4 py-3 text-ink-soft">
                    {new Date(b.preferredDate).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={b.status}
                      onChange={(e) => changeStatus(b.id, e.target.value)}
                      className={`rounded-full border-0 px-3 py-1 text-xs font-bold uppercase tracking-wide ${STATUS_STYLES[b.status]}`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => remove(b.id)} className="text-sm font-semibold text-red-600 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {bookings.length === 0 && <p className="p-6 text-center text-sm text-ink-soft">No bookings yet.</p>}
        </div>
      )}
    </div>
  );
}
