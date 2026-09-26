import { Link } from "react-router-dom";

const SHOWROOM_NAME = import.meta.env.VITE_SHOWROOM_NAME || "Revolt Motors";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ink text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 py-16 sm:px-6 md:grid-cols-4 lg:px-8">
        <div>
          <div className="mb-4 flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand font-display text-lg font-black leading-none text-white">
              R
            </span>
            <span className="font-display text-lg font-bold uppercase tracking-wide">{SHOWROOM_NAME}</span>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-white/50">
            Every brand. One showroom. Compare, book test rides, and get on the road faster.
          </p>
        </div>

        <div>
          <h3 className="mb-4 font-display text-xs font-bold uppercase tracking-[0.2em] text-white/40">Explore</h3>
          <ul className="space-y-3 text-sm text-white/70">
            <li><Link to="/bikes" className="transition hover:text-brand">All Bikes</Link></li>
            <li><Link to="/about" className="transition hover:text-brand">About Us</Link></li>
            <li><Link to="/services" className="transition hover:text-brand">Services</Link></li>
            <li><Link to="/contact" className="transition hover:text-brand">Contact Us</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-display text-xs font-bold uppercase tracking-[0.2em] text-white/40">Services</h3>
          <ul className="space-y-3 text-sm text-white/70">
            <li>New Bike Sales</li>
            <li>Test Ride Booking</li>
            <li>Periodic Service</li>
            <li>Finance &amp; Insurance</li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-display text-xs font-bold uppercase tracking-[0.2em] text-white/40">Visit Us</h3>
          <ul className="space-y-3 text-sm text-white/70">
            <li>123 MG Road, Pune, Maharashtra</li>
            <li>+91 90212 69997</li>
            <li>info@varexa.in</li>
            <li>Mon–Sun: 9:30 AM – 8:30 PM</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-6 text-center text-xs tracking-wide text-white/30">
        © {new Date().getFullYear()} {SHOWROOM_NAME}. All rights reserved.
      </div>
    </footer>
  );
}
