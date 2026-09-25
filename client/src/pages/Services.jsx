import { Link } from "react-router-dom";

const services = [
  { title: "New Bike Sales", emoji: "🏍️", desc: "Explore and buy bikes from every major brand with transparent on-road pricing." },
  { title: "Test Ride Booking", emoji: "🔑", desc: "Book a free test ride at our showroom before you commit." },
  { title: "Periodic Service", emoji: "🔧", desc: "Genuine parts and certified technicians for scheduled maintenance." },
  { title: "Finance & EMI", emoji: "💳", desc: "Flexible loan options tied up with leading banks and NBFCs." },
  { title: "Insurance", emoji: "🛡️", desc: "First and renewal insurance for every bike we sell." },
  { title: "Exchange Offers", emoji: "🔄", desc: "Trade in your old bike for a fair valuation towards your new one." },
];

export default function Services() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand">What We Offer</p>
        <h1 className="mt-2 text-3xl font-extrabold text-ink sm:text-4xl">Our Services</h1>
        <p className="mx-auto mt-3 max-w-2xl text-ink-soft">
          From your first test ride to years of after-sales service, our team supports you
          across every brand we sell.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <div key={s.title} className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm transition hover:shadow-md">
            <span className="text-3xl">{s.emoji}</span>
            <h3 className="mt-3 text-lg font-bold text-ink">{s.title}</h3>
            <p className="mt-2 text-sm text-ink-soft">{s.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-2xl bg-ink px-8 py-10 text-center text-white">
        <h2 className="text-2xl font-extrabold">Ready to find your next ride?</h2>
        <p className="mt-2 text-white/70">Book a test ride or talk to our team today.</p>
        <Link
          to="/contact"
          className="mt-6 inline-block rounded-full bg-brand px-6 py-3 text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-dark"
        >
          Contact Us
        </Link>
      </div>
    </div>
  );
}
