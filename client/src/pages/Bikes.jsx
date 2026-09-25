import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/client";
import BikeCard from "../components/ui/BikeCard";
import Loader from "../components/ui/Loader";

export default function Bikes() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [bikes, setBikes] = useState([]);
  const [meta, setMeta] = useState({ brands: [], categories: [] });
  const [loading, setLoading] = useState(true);

  const brand = searchParams.get("brand") || "";
  const category = searchParams.get("category") || "";
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "";

  useEffect(() => {
    api.get("/bikes/meta").then((res) => setMeta(res.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .get("/bikes", { params: { brand, category, search, sort, status: "active" } })
      .then((res) => setBikes(res.data))
      .finally(() => setLoading(false));
  }, [brand, category, search, sort]);

  function updateParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-ink">All Bikes</h1>
      <p className="mt-1 text-ink-soft">Browse our full multi-brand lineup.</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by name or brand..."
          defaultValue={search}
          onChange={(e) => updateParam("search", e.target.value)}
          className="w-full rounded-lg border border-black/10 px-4 py-2 text-sm sm:w-64"
        />

        <select
          value={brand}
          onChange={(e) => updateParam("brand", e.target.value)}
          className="rounded-lg border border-black/10 px-4 py-2 text-sm"
        >
          <option value="">All Brands</option>
          {meta.brands.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>

        <select
          value={category}
          onChange={(e) => updateParam("category", e.target.value)}
          className="rounded-lg border border-black/10 px-4 py-2 text-sm"
        >
          <option value="">All Categories</option>
          {meta.categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="rounded-lg border border-black/10 px-4 py-2 text-sm"
        >
          <option value="">Sort: Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      {loading ? (
        <Loader label="Loading bikes..." />
      ) : bikes.length === 0 ? (
        <p className="mt-12 text-center text-ink-soft">No bikes match your filters.</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {bikes.map((bike) => (
            <BikeCard key={bike.id} bike={bike} />
          ))}
        </div>
      )}
    </div>
  );
}
