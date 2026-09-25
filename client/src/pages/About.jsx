const SHOWROOM_NAME = import.meta.env.VITE_SHOWROOM_NAME || "Revolt Motors";

const values = [
  { title: "Multi-Brand Choice", desc: "Every major two-wheeler brand under one roof, so you can compare before you decide." },
  { title: "Transparent Pricing", desc: "No hidden charges — on-road price breakdowns shared upfront." },
  { title: "Trusted Service", desc: "Certified technicians and genuine parts for every brand we sell." },
  { title: "Easy Finance", desc: "Flexible EMI options tied up with leading banks and NBFCs." },
];

export default function About() {
  return (
    <div>
      <section className="bg-ink py-16 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand">About Us</p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">{SHOWROOM_NAME}</h1>
          <p className="mt-4 text-white/70">
            We're a multi-brand two-wheeler showroom built for riders who want real choice.
            Instead of walking into a single-brand dealership, you get every major brand's
            lineup, honest comparisons, and a team that helps you find the bike that actually
            fits your life — not just the one on the showroom floor.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-extrabold text-ink">Our Story</h2>
            <p className="mt-4 text-ink-soft">
              Founded by a team of lifelong riders, {SHOWROOM_NAME} started with a simple idea:
              buying a bike shouldn't mean being locked into one brand's showroom. Today, we
              stock sport bikes, cruisers, commuters, adventure tourers, scooters, and electric
              two-wheelers from every major manufacturer — all backed by our own sales,
              service, and finance desk.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-ink">Why Riders Choose Us</h2>
            <ul className="mt-4 space-y-3">
              {values.map((v) => (
                <li key={v.title} className="rounded-xl border border-black/5 bg-white p-4 shadow-sm">
                  <p className="font-bold text-ink">{v.title}</p>
                  <p className="mt-1 text-sm text-ink-soft">{v.desc}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
