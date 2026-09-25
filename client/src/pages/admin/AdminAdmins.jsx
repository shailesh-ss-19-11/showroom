import { useEffect, useState } from "react";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import Loader from "../../components/ui/Loader";

const emptyForm = { name: "", email: "", password: "", role: "STAFF" };

export default function AdminAdmins() {
  const { admin: me } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    api.get("/admins").then((res) => setAdmins(res.data)).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function addAdmin(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.post("/admins", form);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add admin");
    } finally {
      setSaving(false);
    }
  }

  async function changeRole(id, role) {
    try {
      await api.patch(`/admins/${id}/role`, { role });
      load();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update role");
    }
  }

  async function remove(id) {
    if (!confirm("Remove this admin's access?")) return;
    try {
      await api.delete(`/admins/${id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete admin");
    }
  }

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink">Admin Users</h1>
      <p className="mt-1 text-sm text-ink-soft">Owners can manage staff access to this panel.</p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-black/5 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/5 bg-gray-50 text-xs uppercase tracking-wide text-ink-soft">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {admins.map((a) => (
              <tr key={a.id}>
                <td className="px-4 py-3 font-semibold text-ink">{a.name} {a.id === me?.id && <span className="text-xs text-ink-soft">(you)</span>}</td>
                <td className="px-4 py-3 text-ink-soft">{a.email}</td>
                <td className="px-4 py-3">
                  <select
                    value={a.role}
                    onChange={(e) => changeRole(a.id, e.target.value)}
                    disabled={a.id === me?.id}
                    className="rounded-lg border border-black/10 px-2 py-1 text-xs font-semibold disabled:opacity-50"
                  >
                    <option value="STAFF">STAFF</option>
                    <option value="OWNER">OWNER</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-right">
                  {a.id !== me?.id && (
                    <button onClick={() => remove(a.id)} className="text-sm font-semibold text-red-600 hover:underline">
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-ink">Add Admin</h2>
        <form onSubmit={addAdmin} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            required
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-lg border border-black/10 px-4 py-2 text-sm"
          />
          <input
            required
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="rounded-lg border border-black/10 px-4 py-2 text-sm"
          />
          <input
            required
            type="password"
            placeholder="Password (min 8 characters)"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="rounded-lg border border-black/10 px-4 py-2 text-sm"
          />
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="rounded-lg border border-black/10 px-4 py-2 text-sm"
          >
            <option value="STAFF">Staff</option>
            <option value="OWNER">Owner</option>
          </select>

          {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-brand px-6 py-2 text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-dark disabled:opacity-50 sm:col-span-2 sm:w-fit"
          >
            {saving ? "Adding..." : "Add Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}
