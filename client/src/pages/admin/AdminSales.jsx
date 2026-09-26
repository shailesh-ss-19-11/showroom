import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../api/client";
import Loader from "../../components/ui/Loader";

const PAYMENT_STATUSES = ["PENDING", "PARTIAL", "PAID", "REFUNDED"];

const STATUS_STYLES = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PARTIAL: "bg-blue-100 text-blue-700",
  PAID: "bg-green-100 text-green-700",
  REFUNDED: "bg-red-100 text-red-700",
};

function formatPrice(price) {
  return `₹${Number(price).toLocaleString("en-IN")}`;
}

export default function AdminSales() {
  const [searchParams] = useSearchParams();
  const [sales, setSales] = useState([]);
  const [bikes, setBikes] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    bikeId: searchParams.get("bikeId") || "",
    customerName: searchParams.get("name") || "",
    customerPhone: searchParams.get("phone") || "",
    customerEmail: searchParams.get("email") || "",
    salePrice: "",
    paymentStatus: "PENDING",
    notes: "",
    soldById: "",
    enquiryId: searchParams.get("enquiryId") || null,
    bookingId: searchParams.get("bookingId") || null,
  });

  function load() {
    setLoading(true);
    api.get("/sales").then((res) => setSales(res.data)).finally(() => setLoading(false));
  }

  useEffect(load, []);
  useEffect(() => {
    api.get("/bikes", { params: { status: "all" } }).then((res) => setBikes(res.data));
    api.get("/staff-directory").then((res) => setStaff(res.data));
  }, []);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.post("/sales", {
        ...form,
        bikeId: form.bikeId || null,
        salePrice: Number(form.salePrice),
        soldById: form.soldById || null,
      });
      setForm({
        bikeId: "",
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        salePrice: "",
        paymentStatus: "PENDING",
        notes: "",
        soldById: "",
        enquiryId: null,
        bookingId: null,
      });
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to record sale");
    } finally {
      setSaving(false);
    }
  }

  async function updatePaymentStatus(id, status) {
    await api.patch(`/sales/${id}/payment-status`, { status });
    load();
  }

  async function remove(id) {
    if (!confirm("Delete this sale record?")) return;
    await api.delete(`/sales/${id}`);
    load();
  }

  const totalRevenue = sales.reduce((sum, s) => sum + Number(s.salePrice), 0);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-ink">Sales</h1>
        <div className="rounded-2xl border border-black/5 bg-white px-5 py-2 text-right shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Total Revenue</p>
          <p className="text-lg font-black text-ink">{formatPrice(totalRevenue)}</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-ink">Record a Sale</h2>
        <form onSubmit={submit} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <select
            value={form.bikeId}
            onChange={(e) => setForm({ ...form, bikeId: e.target.value })}
            className="rounded-lg border border-black/10 px-3 py-2 text-sm"
          >
            <option value="">Select bike (optional)</option>
            {bikes.map((b) => (
              <option key={b.id} value={b.id}>{b.brand} {b.name}</option>
            ))}
          </select>
          <select
            value={form.soldById}
            onChange={(e) => setForm({ ...form, soldById: e.target.value })}
            className="rounded-lg border border-black/10 px-3 py-2 text-sm"
          >
            <option value="">Sold by (optional)</option>
            {staff.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
          <input
            required
            placeholder="Customer name"
            value={form.customerName}
            onChange={(e) => setForm({ ...form, customerName: e.target.value })}
            className="rounded-lg border border-black/10 px-3 py-2 text-sm"
          />
          <input
            required
            placeholder="Customer phone"
            value={form.customerPhone}
            onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
            className="rounded-lg border border-black/10 px-3 py-2 text-sm"
          />
          <input
            placeholder="Customer email (optional)"
            value={form.customerEmail}
            onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
            className="rounded-lg border border-black/10 px-3 py-2 text-sm"
          />
          <input
            required
            type="number"
            min="0"
            placeholder="Sale price (₹)"
            value={form.salePrice}
            onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
            className="rounded-lg border border-black/10 px-3 py-2 text-sm"
          />
          <select
            value={form.paymentStatus}
            onChange={(e) => setForm({ ...form, paymentStatus: e.target.value })}
            className="rounded-lg border border-black/10 px-3 py-2 text-sm"
          >
            {PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <input
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="rounded-lg border border-black/10 px-3 py-2 text-sm sm:col-span-2"
          />

          {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-brand px-6 py-2 text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-dark disabled:opacity-50 sm:col-span-2 sm:w-fit"
          >
            {saving ? "Saving..." : "Record Sale"}
          </button>
        </form>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-black/5 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-black/5 bg-gray-50 text-xs uppercase tracking-wide text-ink-soft">
              <tr>
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Bike</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Sold By</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {sales.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3 font-mono text-xs text-ink-soft">{s.invoiceNumber}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-ink">{s.customerName}</p>
                    <p className="text-xs text-ink-soft">{s.customerPhone}</p>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{s.bike ? `${s.bike.brand} ${s.bike.name}` : "—"}</td>
                  <td className="px-4 py-3 font-semibold text-ink">{formatPrice(s.salePrice)}</td>
                  <td className="px-4 py-3 text-ink-soft">{s.soldBy?.name || "—"}</td>
                  <td className="px-4 py-3 text-ink-soft">{new Date(s.saleDate).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3">
                    <select
                      value={s.paymentStatus}
                      onChange={(e) => updatePaymentStatus(s.id, e.target.value)}
                      className={`rounded-full border-0 px-3 py-1 text-xs font-bold uppercase tracking-wide ${STATUS_STYLES[s.paymentStatus]}`}
                    >
                      {PAYMENT_STATUSES.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => remove(s.id)} className="text-sm font-semibold text-red-600 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sales.length === 0 && <p className="p-6 text-center text-sm text-ink-soft">No sales recorded yet.</p>}
        </div>
      )}
    </div>
  );
}
