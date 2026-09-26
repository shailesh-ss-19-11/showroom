import { useEffect, useState } from "react";
import api from "../../api/client";
import Loader from "../../components/ui/Loader";

const STATUSES = ["PRESENT", "ABSENT", "LEAVE", "HALF_DAY"];

const STATUS_STYLES = {
  PRESENT: "bg-green-100 text-green-700",
  ABSENT: "bg-red-100 text-red-700",
  LEAVE: "bg-yellow-100 text-yellow-800",
  HALF_DAY: "bg-blue-100 text-blue-700",
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function AdminAttendance() {
  const [date, setDate] = useState(todayIso());
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  function load() {
    setLoading(true);
    api.get("/attendance", { params: { date } }).then((res) => setRows(res.data)).finally(() => setLoading(false));
  }

  useEffect(load, [date]);

  async function updateStatus(adminId, status, notes) {
    setSavingId(adminId);
    try {
      await api.put("/attendance", { adminId, workDate: date, status, notes: notes || "" });
      load();
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-ink">Attendance</h1>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-lg border border-black/10 px-3 py-2 text-sm" />
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-black/5 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-black/5 bg-gray-50 text-xs uppercase tracking-wide text-ink-soft">
              <tr>
                <th className="px-4 py-3">Staff</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {rows.map((r) => (
                <AttendanceRow
                  key={r.adminId}
                  row={r}
                  saving={savingId === r.adminId}
                  onSave={(status, notes) => updateStatus(r.adminId, status, notes)}
                />
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <p className="p-6 text-center text-sm text-ink-soft">No admins yet.</p>}
        </div>
      )}
    </div>
  );
}

function AttendanceRow({ row, saving, onSave }) {
  const [notes, setNotes] = useState(row.notes || "");

  return (
    <tr>
      <td className="px-4 py-3 font-semibold text-ink">{row.name}</td>
      <td className="px-4 py-3">
        <select
          value={row.status || ""}
          onChange={(e) => onSave(e.target.value, notes)}
          disabled={saving}
          className={`rounded-full border-0 px-3 py-1 text-xs font-bold uppercase tracking-wide disabled:opacity-50 ${
            row.status ? STATUS_STYLES[row.status] : "bg-gray-100 text-gray-500"
          }`}
        >
          <option value="" disabled>Not marked</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s.replace("_", " ")}</option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3">
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => row.status && onSave(row.status, notes)}
          placeholder="Optional note"
          className="w-full rounded-lg border border-black/10 px-2 py-1 text-xs"
        />
      </td>
    </tr>
  );
}
