import { Link } from "react-router-dom";

const SHOWROOM_NAME = import.meta.env.VITE_SHOWROOM_NAME || "Revolt Motors";

export default function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-14 sm:px-6 md:grid-cols-4 lg:px-8">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-lg font-black text-white">
              R
            </span>
            <span className="text-lg font-extrabold">{SHOWROOM_NAME}</span>
          </div>
          <p className="text-sm text-white/60">
            Your multi-brand showroom for every major two-wheeler brand — one roof, every ride.
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-white/80">Explore</h3>
          <ul className="space-y-2 text-sm text-white/60">
            <li><Link to="/bikes" className="hover:text-white">All Bikes</Link></li>
            <li><Link to="/about" className="hover:text-white">About Us</Link></li>
            <li><Link to="/services" className="hover:text-white">Services</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact Us</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-white/80">Services</h3>
          <ul className="space-y-2 text-sm text-white/60">
            <li>New Bike Sales</li>
            <li>Test Ride Booking</li>
            <li>Periodic Service</li>
            <li>Finance & Insurance</li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-white/80">Visit Us</h3>
          <ul className="space-y-2 text-sm text-white/60">
            <li>123 MG Road, Pune, Maharashtra</li>
            <li>+91 90212 69997</li>
            <li>info@varexa.in</li>
            <li>Mon–Sun: 9:30 AM – 8:30 PM</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-5 text-center text-xs text-white/40">
        © {new Date().getFullYear()} {SHOWROOM_NAME}. All rights reserved.
      </div>
    </footer>
  );
}
