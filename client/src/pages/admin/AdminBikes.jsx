import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { resolveImage } from "../../api/client";
import Loader from "../../components/ui/Loader";

function formatPrice(price) {
  return `₹${Number(price).toLocaleString("en-IN")}`;
}

export default function AdminBikes() {
  const navigate = useNavigate();
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [bulkRunning, setBulkRunning] = useState(false);

  function load() {
    setLoading(true);
    api
      .get("/bikes", { params: { status: status || "all" } })
      .then((res) => setBikes(res.data))
      .finally(() => setLoading(false));
  }

  useEffect(load, [status]);

  const { brands, categories } = useMemo(() => {
    return {
      brands: [...new Set(bikes.map((b) => b.brand))].sort(),
      categories: [...new Set(bikes.map((b) => b.category))].sort(),
    };
  }, [bikes]);

  const filtered = useMemo(() => {
    return bikes.filter((b) => {
      if (brand && b.brand !== brand) return false;
      if (category && b.category !== category) return false;
      if (search && !`${b.name} ${b.brand}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [bikes, brand, category, search]);

  function toggleOne(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => (prev.size === filtered.length ? new Set() : new Set(filtered.map((b) => b.id))));
  }

  async function runBulk(action) {
    if (selected.size === 0) return;
    if (action === "delete" && !confirm(`Delete ${selected.size} bike(s)? This cannot be undone.`)) return;
    setBulkRunning(true);
    try {
      await api.patch("/bikes/bulk", { ids: [...selected], action });
      setSelected(new Set());
      load();
    } finally {
      setBulkRunning(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this bike? This cannot be undone.")) return;
    await api.delete(`/bikes/${id}`);
    load();
  }

  async function handleDuplicate(id) {
    const { data } = await api.post(`/bikes/${id}/duplicate`);
    navigate(`/admin/bikes/${data.id}`);
  }

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-ink">Bikes</h1>
        <Link
          to="/admin/bikes/new"
          className="rounded-full bg-brand px-5 py-2 text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-dark"
        >
          + Add Bike
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <input
          placeholder="Search name or brand..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border border-black/10 px-4 py-2 text-sm sm:w-64"
        />
        <select value={brand} onChange={(e) => setBrand(e.target.value)} className="rounded-lg border border-black/10 px-3 py-2 text-sm">
          <option value="">All Brands</option>
          {brands.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-lg border border-black/10 px-3 py-2 text-sm">
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-black/10 px-3 py-2 text-sm">
          <option value="">All Statuses</option>
          <option value="active">Published</option>
          <option value="inactive">Draft</option>
        </select>
      </div>

      {selected.size > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-ink px-4 py-3 text-sm text-white">
          <span className="font-semibold">{selected.size} selected</span>
          <button disabled={bulkRunning} onClick={() => runBulk("feature")} className="rounded-full bg-white/10 px-3 py-1 hover:bg-white/20 disabled:opacity-50">Feature</button>
          <button disabled={bulkRunning} onClick={() => runBulk("unfeature")} className="rounded-full bg-white/10 px-3 py-1 hover:bg-white/20 disabled:opacity-50">Unfeature</button>
          <button disabled={bulkRunning} onClick={() => runBulk("publish")} className="rounded-full bg-white/10 px-3 py-1 hover:bg-white/20 disabled:opacity-50">Publish</button>
          <button disabled={bulkRunning} onClick={() => runBulk("unpublish")} className="rounded-full bg-white/10 px-3 py-1 hover:bg-white/20 disabled:opacity-50">Unpublish</button>
          <button disabled={bulkRunning} onClick={() => runBulk("delete")} className="rounded-full bg-red-500/80 px-3 py-1 hover:bg-red-500 disabled:opacity-50">Delete</button>
        </div>
      )}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-black/5 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/5 bg-gray-50 text-xs uppercase tracking-wide text-ink-soft">
            <tr>
              <th className="w-10 px-4 py-3">
                <input type="checkbox" checked={selected.size > 0 && selected.size === filtered.length} onChange={toggleAll} />
              </th>
              <th className="px-4 py-3">Photo</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Brand</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Featured</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {filtered.map((bike) => {
              const img = bike.images.find((i) => i.isPrimary) || bike.images[0];
              return (
                <tr key={bike.id}>
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.has(bike.id)} onChange={() => toggleOne(bike.id)} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-12 w-16 overflow-hidden rounded-md bg-gray-100">
                      {img && <img src={resolveImage(img.url)} alt="" className="h-full w-full object-cover" />}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-ink">
                    <Link to={`/admin/bikes/${bike.id}/view`} className="hover:text-brand hover:underline">
                      {bike.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{bike.brand}</td>
                  <td className="px-4 py-3 text-ink-soft">{bike.category}</td>
                  <td className="px-4 py-3 text-ink-soft">{formatPrice(bike.price)}</td>
                  <td className="px-4 py-3">{bike.featured ? "✅" : "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                        bike.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {bike.isActive ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Link to={`/admin/bikes/${bike.id}/view`} className="mr-3 text-sm font-semibold text-ink hover:underline">
                      View
                    </Link>
                    <Link to={`/admin/bikes/${bike.id}`} className="mr-3 text-sm font-semibold text-brand hover:underline">
                      Edit
                    </Link>
                    <button onClick={() => handleDuplicate(bike.id)} className="mr-3 text-sm font-semibold text-ink hover:underline">
                      Duplicate
                    </button>
                    <button onClick={() => handleDelete(bike.id)} className="text-sm font-semibold text-red-600 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="p-6 text-center text-sm text-ink-soft">No bikes match these filters.</p>}
      </div>
    </div>
  );
}
