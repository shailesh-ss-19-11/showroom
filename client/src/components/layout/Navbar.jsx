import { useState } from "react";
import { NavLink } from "react-router-dom";

const SHOWROOM_NAME = import.meta.env.VITE_SHOWROOM_NAME || "Revolt Motors";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/bikes", label: "Bikes" },
  { to: "/about", label: "About Us" },
  { to: "/services", label: "Services" },
  { to: "/contact", label: "Contact Us" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `text-sm font-semibold uppercase tracking-wide transition-colors ${
      isActive ? "text-brand" : "text-ink hover:text-brand"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <NavLink to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-lg font-black text-white">
            R
          </span>
          <span className="text-lg font-extrabold tracking-tight text-ink">{SHOWROOM_NAME}</span>
        </NavLink>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
          <NavLink
            to="/contact"
            className="rounded-full bg-brand px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-brand-dark"
          >
            Book Test Ride
          </NavLink>
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-md border border-black/10 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span className="text-xl">{open ? "✕" : "☰"}</span>
        </button>
      </nav>

      {open && (
        <div className="border-t border-black/5 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={linkClass}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
            <NavLink
              to="/contact"
              onClick={() => setOpen(false)}
              className="rounded-full bg-brand px-5 py-2 text-center text-sm font-bold text-white"
            >
              Book Test Ride
            </NavLink>
          </div>
        </div>
      )}
    </header>
  );
}
