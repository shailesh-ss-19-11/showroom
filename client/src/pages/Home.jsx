import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import BikeCard from "../components/ui/BikeCard";
import Loader from "../components/ui/Loader";

const categories = [
  { name: "Sport", emoji: "🏍️" },
  { name: "Cruiser", emoji: "🛣️" },
  { name: "Commuter", emoji: "🛵" },
  { name: "Adventure", emoji: "⛰️" },
  { name: "Scooter", emoji: "🛴" },
  { name: "Electric", emoji: "⚡" },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/bikes", { params: { featured: true, status: "active" } }),
      api.get("/bikes/meta"),
    ])
      .then(([bikesRes, metaRes]) => {
        setFeatured(bikesRes.data.slice(0, 6));
        setBrands(metaRes.data.brands);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-20 sm:px-6 md:grid-cols-2 lg:px-8">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-brand">
              Every Brand. One Showroom.
            </p>
            <h1 className="text-4xl font-black leading-tight sm:text-5xl">
              Find Your Perfect Ride, From Every Major Brand
            </h1>
            <p className="mt-4 max-w-md text-white/70">
              Browse, compare, and book test rides across sport bikes, cruisers, commuters,
              scooters, and EVs — all under one roof.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/bikes"
                className="rounded-full bg-brand px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-brand-dark"
              >
                Explore Bikes
              </Link>
              <Link
                to="/contact"
                className="rounded-full border border-white/30 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-white/10"
              >
                Book Test Ride
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] w-full rounded-3xl bg-gradient-to-br from-brand/30 to-white/5" />
          </div>
        </div>
      </section>

      {brands.length > 0 && (
        <section className="border-b border-black/5 bg-white py-6">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 sm:px-6 lg:px-8">
            {brands.map((b) => (
              <span key={b} className="text-sm font-bold uppercase tracking-wide text-ink-soft">
                {b}
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-extrabold text-ink sm:text-3xl">Shop by Category</h2>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={`/bikes?category=${encodeURIComponent(cat.name)}`}
              className="flex flex-col items-center gap-2 rounded-2xl border border-black/5 bg-white p-5 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <span className="text-3xl">{cat.emoji}</span>
              <span className="text-sm font-bold text-ink">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">Featured Bikes</h2>
            <Link to="/bikes" className="text-sm font-bold text-brand hover:underline">
              View All →
            </Link>
          </div>

          {loading ? (
            <Loader label="Loading featured bikes..." />
          ) : featured.length === 0 ? (
            <p className="mt-8 text-ink-soft">No featured bikes yet — check back soon.</p>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((bike) => (
                <BikeCard key={bike.id} bike={bike} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-ink py-16 text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 text-center sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <p className="text-3xl font-black text-brand">15+</p>
            <p className="mt-1 text-sm text-white/70">Brands Available</p>
          </div>
          <div>
            <p className="text-3xl font-black text-brand">1000+</p>
            <p className="mt-1 text-sm text-white/70">Happy Riders</p>
          </div>
          <div>
            <p className="text-3xl font-black text-brand">24/7</p>
            <p className="mt-1 text-sm text-white/70">WhatsApp Support</p>
          </div>
        </div>
      </section>
    </div>
  );
}
