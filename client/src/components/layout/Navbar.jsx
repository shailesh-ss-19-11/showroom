import { useState } from "react";
import { NavLink } from "react-router-dom";

const SHOWROOM_NAME = import.meta.env.VITE_SHOWROOM_NAME || "Revolt Motors";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/bikes", label: "Bikes" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `relative text-xs font-semibold uppercase tracking-[0.15em] transition-colors after:absolute after:-bottom-1 after:left-0 after:h-px after:bg-brand after:transition-all ${
      isActive ? "text-white after:w-full" : "text-white/60 hover:text-white after:w-0 hover:after:w-full"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <NavLink to="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand font-display text-lg font-black leading-none text-white">
            R
          </span>
          <span className="font-display text-xl font-bold uppercase tracking-wide text-white">
            {SHOWROOM_NAME}
          </span>
        </NavLink>

        <div className="hidden items-center gap-9 md:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
          <NavLink
            to="/contact"
            className="rounded-full bg-brand px-5 py-2 text-xs font-bold uppercase tracking-[0.1em] text-white transition hover:bg-brand-dark"
          >
            Book Test Ride
          </NavLink>
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-md border border-white/15 text-white md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span className="text-xl">{open ? "✕" : "☰"}</span>
        </button>
      </nav>

      {open && (
        <div className="border-t border-white/10 bg-ink px-4 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `text-sm font-semibold uppercase tracking-wide ${isActive ? "text-brand" : "text-white/70"}`
                }
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
