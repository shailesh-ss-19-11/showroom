import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { resolveImage } from "../api/client";
import BikeCard from "../components/ui/BikeCard";
import Loader from "../components/ui/Loader";

const SHOWROOM_NAME = import.meta.env.VITE_SHOWROOM_NAME || "Revolt Motors";
const GHOST_WORD = SHOWROOM_NAME.split(" ")[0].toUpperCase();

const categories = [
  {
    name: "Sport",
    icon: (
      <path d="M4 17l3-6h5l2 4h6M9 11l2-4h4M17 17a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM7 17a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    ),
  },
  {
    name: "Cruiser",
    icon: <path d="M3 17h2l2-5h6l3 5h5M9 12l3-5h3M6 17a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM18 17a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />,
  },
  {
    name: "Commuter",
    icon: <path d="M5 17h1l1-6h8l2 6h2M9 11h5M7 17a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM17 17a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />,
  },
  {
    name: "Adventure",
    icon: <path d="M4 17l4-9 3 5 2-3 3 7M6 17a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM18 17a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />,
  },
  {
    name: "Scooter",
    icon: <path d="M5 17h2l1-4h4l3 4h4M12 13V8h3M7.5 17a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM17.5 17a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />,
  },
  {
    name: "Electric",
    icon: <path d="M13 3 5 13h5l-1 8 8-10h-5l1-8Z" />,
  },
];

const FALLBACK_HERO_IMAGE = "https://imgd.aeplcdn.com/664x374/n/tghapeb_1773039.jpg?q=80";

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [brands, setBrands] = useState([]);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/bikes", { params: { featured: true, status: "active" } }),
      api.get("/bikes/meta"),
      api.get("/site-content"),
    ])
      .then(([bikesRes, metaRes, contentRes]) => {
        setFeatured(bikesRes.data.slice(0, 6));
        setBrands(metaRes.data.brands);
        setContent(contentRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const heroBike = featured[0];
  const bikeImage = heroBike?.images?.find((i) => i.isPrimary) || heroBike?.images?.[0];
  const heroImageSrc = content?.heroImageUrl
    ? resolveImage(content.heroImageUrl)
    : bikeImage
      ? resolveImage(bikeImage.url)
      : FALLBACK_HERO_IMAGE;

  return (
    <div>
      {/* Hero */}
      <section className="bg-grain relative overflow-hidden bg-ink text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-1/2 hidden -translate-y-1/2 select-none font-display text-[16rem] font-black leading-none text-transparent sm:block lg:text-[22rem]"
          style={{ WebkitTextStroke: "1px rgba(255,255,255,0.06)" }}
        >
          {GHOST_WORD}
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-0 h-[36rem] w-[36rem] rounded-full bg-brand/25 blur-[120px]"
        />

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-24 sm:px-6 md:grid-cols-2 md:py-32 lg:px-8">
          <div>
            <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-brand">
              <span className="h-px w-8 bg-brand" />
              {content?.heroEyebrow || "Every Brand. One Showroom."}
            </p>
            <h1 className="font-display text-6xl font-black uppercase leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">
              {content?.heroHeadingLine1 || "Ride"}
              <br />
              <span className="text-brand">{content?.heroHeadingLine2 || "Beyond"}</span>
              <br />
              {content?.heroHeadingLine3 || "Ordinary"}
            </h1>
            <p className="mt-6 max-w-md text-white/60">
              {content?.heroSubtext ||
                "Browse, compare, and book test rides across sport bikes, cruisers, commuters, scooters, and EVs — all under one roof."}
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                to="/bikes"
                className="rounded-full bg-brand px-7 py-3.5 text-xs font-bold uppercase tracking-[0.15em] text-white transition hover:bg-brand-dark"
              >
                Explore Bikes
              </Link>
              <Link
                to="/contact"
                className="rounded-full border border-white/25 px-7 py-3.5 text-xs font-bold uppercase tracking-[0.15em] text-white transition hover:border-white hover:bg-white hover:text-ink"
              >
                Book Test Ride
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-brand/20 via-brand/5 to-transparent blur-2xl" />
            <div className="animate-float relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/10 to-white/0 shadow-2xl">
              <img
                src={heroImageSrc}
                alt={heroBike?.name || "Revolt electric bike"}
                className="h-full w-full object-cover"
              />
            </div>
            {heroBike && !content?.heroImageUrl && (
              <div className="absolute -bottom-6 left-6 rounded-2xl border border-white/10 bg-ink/90 px-5 py-3 backdrop-blur">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand">{heroBike.brand}</p>
                <p className="font-display text-lg font-bold uppercase tracking-wide">{heroBike.name}</p>
              </div>
            )}
          </div>
        </div>

        <div className="relative flex justify-center pb-8">
          <span className="h-8 w-px animate-pulse bg-white/30" />
        </div>
      </section>

      {brands.length > 0 && (
        <section className="group overflow-hidden border-b border-black/5 bg-white py-6">
          <div className="flex whitespace-nowrap">
            {[...brands, ...brands].map((b, i) => (
              <span
                key={`${b}-${i}`}
                className="animate-marquee flex items-center gap-10 pr-10 text-sm font-bold uppercase tracking-[0.2em] text-ink-soft/70"
              >
                {b}
                <span className="h-1 w-1 rounded-full bg-ink-soft/30" />
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-brand">Find Your Fit</p>
          <h2 className="font-display text-4xl font-black uppercase tracking-tight text-ink sm:text-5xl">
            Shop by Category
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={`/bikes?category=${encodeURIComponent(cat.name)}`}
              className="group relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl border border-black/10 bg-white p-6 text-center transition hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg"
            >
              <svg
                viewBox="0 0 22 22"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8 text-ink transition group-hover:text-brand"
              >
                {cat.icon}
              </svg>
              <span className="text-xs font-bold uppercase tracking-[0.1em] text-ink">{cat.name}</span>
              <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-brand transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </div>
      </section>

      {/* Featured bikes */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-brand">Handpicked</p>
              <h2 className="font-display text-4xl font-black uppercase tracking-tight text-ink sm:text-5xl">
                Featured Bikes
              </h2>
            </div>
            <Link
              to="/bikes"
              className="rounded-full border border-ink/15 px-6 py-2.5 text-xs font-bold uppercase tracking-[0.15em] text-ink transition hover:border-ink hover:bg-ink hover:text-white"
            >
              View All →
            </Link>
          </div>

          {loading ? (
            <Loader label="Loading featured bikes..." />
          ) : featured.length === 0 ? (
            <p className="mt-8 text-ink-soft">No featured bikes yet — check back soon.</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((bike) => (
                <BikeCard key={bike.id} bike={bike} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Stats + closing CTA */}
      <section className="bg-grain relative overflow-hidden bg-ink text-white">
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 divide-y divide-white/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <div className="px-4 py-6 text-center first:pt-0 sm:py-0">
              <p className="font-display text-5xl font-black text-brand">{content?.stat1Value || "15+"}</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-white/50">
                {content?.stat1Label || "Brands Available"}
              </p>
            </div>
            <div className="px-4 py-6 text-center sm:py-0">
              <p className="font-display text-5xl font-black text-brand">{content?.stat2Value || "1000+"}</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-white/50">
                {content?.stat2Label || "Happy Riders"}
              </p>
            </div>
            <div className="px-4 py-6 text-center last:pb-0 sm:py-0">
              <p className="font-display text-5xl font-black text-brand">{content?.stat3Value || "24/7"}</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-white/50">
                {content?.stat3Label || "WhatsApp Support"}
              </p>
            </div>
          </div>

          <div className="mt-20 flex flex-col items-center gap-6 text-center">
            <h2 className="font-display text-4xl font-black uppercase tracking-tight sm:text-5xl">
              Ready to Ride?
            </h2>
            <p className="max-w-md text-white/60">
              Book a test ride today and feel the difference for yourself — no obligation, no pressure.
            </p>
            <Link
              to="/contact"
              className="rounded-full bg-brand px-8 py-4 text-xs font-bold uppercase tracking-[0.15em] text-white transition hover:bg-brand-dark"
            >
              Book Test Ride
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
