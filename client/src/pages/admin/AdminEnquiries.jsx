import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";
import Loader from "../../components/ui/Loader";

const STATUSES = ["NEW", "CONTACTED", "CONVERTED", "CLOSED"];

const STATUS_STYLES = {
  NEW: "bg-yellow-100 text-yellow-800",
  CONTACTED: "bg-blue-100 text-blue-700",
  CONVERTED: "bg-green-100 text-green-700",
  CLOSED: "bg-gray-200 text-gray-600",
};

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [staff, setStaff] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  function load() {
    setLoading(true);
    api
      .get("/enquiries", { params: statusFilter ? { status: statusFilter } : {} })
      .then((res) => setEnquiries(res.data))
      .finally(() => setLoading(false));
  }

  useEffect(load, [statusFilter]);
  useEffect(() => {
    api.get("/staff-directory").then((res) => setStaff(res.data));
  }, []);

  async function changeStatus(id, status) {
    await api.patch(`/enquiries/${id}/status`, { status });
    load();
  }

  async function assign(id, adminId) {
    await api.patch(`/enquiries/${id}/assign`, { adminId: adminId || null });
    load();
  }

  async function remove(id) {
    if (!confirm("Delete this enquiry?")) return;
    await api.delete(`/enquiries/${id}`);
    load();
  }

  async function exportCsv() {
    setExporting(true);
    try {
      const res = await api.get("/enquiries/export", {
        params: statusFilter ? { status: statusFilter } : {},
        responseType: "blob",
      });
      const url = URL.createObjectURL(new Blob([res.data], { type: "text/csv" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-ink">Enquiries</h1>
        <button
          onClick={exportCsv}
          disabled={exporting}
          className="rounded-full border border-black/10 px-5 py-2 text-sm font-bold uppercase tracking-wide text-ink hover:bg-gray-50 disabled:opacity-50"
        >
          {exporting ? "Exporting..." : "Export CSV"}
        </button>
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
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Assigned To</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {enquiries.map((e) => (
                <tr key={e.id}>
                  <td className="px-4 py-3 font-semibold text-ink">{e.name}</td>
                  <td className="px-4 py-3 text-ink-soft">{e.phone}</td>
                  <td className="px-4 py-3 text-ink-soft">{e.bike ? `${e.bike.brand} ${e.bike.name}` : "—"}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-ink-soft">{e.message || "—"}</td>
                  <td className="px-4 py-3 text-ink-soft">{new Date(e.createdAt).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3">
                    <select
                      value={e.status}
                      onChange={(ev) => changeStatus(e.id, ev.target.value)}
                      className={`rounded-full border-0 px-3 py-1 text-xs font-bold uppercase tracking-wide ${STATUS_STYLES[e.status]}`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={e.assignedTo?.id || ""}
                      onChange={(ev) => assign(e.id, ev.target.value)}
                      className="rounded-lg border border-black/10 px-2 py-1 text-xs"
                    >
                      <option value="">Unassigned</option>
                      {staff.map((a) => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Link
                      to={`/admin/sales?enquiryId=${e.id}&bikeId=${e.bike?.id || ""}&name=${encodeURIComponent(e.name)}&phone=${encodeURIComponent(e.phone)}&email=${encodeURIComponent(e.email || "")}`}
                      className="mr-3 text-sm font-semibold text-brand hover:underline"
                    >
                      Mark Sold
                    </Link>
                    <button onClick={() => remove(e.id)} className="text-sm font-semibold text-red-600 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {enquiries.length === 0 && <p className="p-6 text-center text-sm text-ink-soft">No enquiries yet.</p>}
        </div>
      )}
    </div>
  );
}
