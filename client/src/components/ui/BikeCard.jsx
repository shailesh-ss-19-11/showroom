import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { resolveImage } from "../../api/client";

function formatPrice(price) {
  return `₹${Number(price).toLocaleString("en-IN")}`;
}

const HOVER_SLIDE_INTERVAL_MS = 900;

export default function BikeCard({ bike }) {
  const images = bike.images || [];
  const primaryIndex = Math.max(
    images.findIndex((img) => img.isPrimary),
    0
  );
  const [index, setIndex] = useState(primaryIndex);
  const [hovering, setHovering] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (hovering && images.length > 1) {
      timerRef.current = setInterval(() => {
        setIndex((i) => (i + 1) % images.length);
      }, HOVER_SLIDE_INTERVAL_MS);
    } else {
      setIndex(primaryIndex);
    }
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hovering, images.length]);

  const displayedImage = images[index];

  return (
    <Link
      to={`/bikes/${bike.id}`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className="group flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {displayedImage ? (
          <img
            src={resolveImage(displayedImage.url)}
            alt={bike.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-ink-soft">No image</div>
        )}
        {bike.featured && (
          <span className="absolute left-3 top-3 rounded-full bg-brand px-3 py-1 text-xs font-bold text-white">
            Featured
          </span>
        )}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
            {images.map((img, i) => (
              <span
                key={img.id}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  i === index ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-brand">{bike.brand}</span>
        <h3 className="text-lg font-bold text-ink">{bike.name}</h3>
        <p className="text-xs text-ink-soft">{bike.category}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-base font-extrabold text-ink">{formatPrice(bike.price)}</span>
          {bike.colors?.length > 0 && (
            <div className="flex -space-x-1">
              {bike.colors.slice(0, 4).map((c) => (
                <span
                  key={c.id}
                  title={c.name}
                  className="h-4 w-4 rounded-full border border-white shadow"
                  style={{ backgroundColor: c.hexCode }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
