import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import api from "../../api/client";
import Loader from "../../components/ui/Loader";

const SEQUENTIAL_BLUE = "#2a78d6";
const CATEGORICAL = ["#2a78d6", "#eb6834", "#1baf7a"];
const MUTED = "#898781";
const GRIDLINE = "#e1e0d9";
const AXIS_TEXT = { fontSize: 12, fill: MUTED };

function formatDayLabel(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function formatPrice(price) {
  return `₹${Number(price).toLocaleString("en-IN")}`;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentEnquiries, setRecentEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/stats/dashboard"), api.get("/enquiries")])
      .then(([statsRes, enquiriesRes]) => {
        setStats(statsRes.data);
        setRecentEnquiries(enquiriesRes.data.slice(0, 5));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  const enquiriesByDay = stats.enquiriesByDay.map((d) => ({ ...d, label: formatDayLabel(d.date) }));

  const topBrands = stats.brandSplit.slice(0, 3);
  const otherCount = stats.brandSplit.slice(3).reduce((sum, b) => sum + b.count, 0);
  const brandPie = [
    ...topBrands.map((b, i) => ({ name: b.brand, value: b.count, color: CATEGORICAL[i] })),
    ...(otherCount > 0 ? [{ name: "Other", value: otherCount, color: MUTED }] : []),
  ];

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink">Dashboard</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Bikes" value={stats.totalBikes} />
        <StatCard label="Active Bikes" value={stats.activeBikes} />
        <StatCard label="Featured" value={stats.featuredBikes} />
        <StatCard label="New Enquiries" value={stats.newEnquiries} sub={`${stats.totalEnquiries} total`} />
        <StatCard label="Pending Bookings" value={stats.pendingBookings} sub={`${stats.totalBookings} total`} />
        <StatCard label="Total Sales" value={stats.totalSales} />
        <StatCard label="Total Revenue" value={formatPrice(stats.totalRevenue)} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-ink">Enquiries — Last 14 Days</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={enquiriesByDay} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid stroke={GRIDLINE} vertical={false} />
                <XAxis dataKey="label" tick={AXIS_TEXT} axisLine={{ stroke: GRIDLINE }} tickLine={false} interval={1} />
                <YAxis allowDecimals={false} tick={AXIS_TEXT} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: "#f9f9f7" }}
                  contentStyle={{ borderRadius: 8, border: "1px solid #e1e0d9", fontSize: 12 }}
                />
                <Bar dataKey="count" name="Enquiries" fill={SEQUENTIAL_BLUE} radius={[4, 4, 0, 0]} maxBarSize={28} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-ink">Bikes by Brand</h2>
          {brandPie.length === 0 ? (
            <p className="mt-4 text-sm text-ink-soft">No bikes yet.</p>
          ) : (
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={brandPie} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2} isAnimationActive={false}>
                    {brandPie.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} stroke="#fff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e1e0d9", fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12, color: MUTED }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-bold text-ink">Most-Enquired Bikes</h2>
          {stats.topBikes.length === 0 ? (
            <p className="mt-4 text-sm text-ink-soft">No enquiries linked to bikes yet.</p>
          ) : (
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.topBikes.map((b) => ({ ...b, label: `${b.brand} ${b.name}` }))}
                  layout="vertical"
                  margin={{ top: 4, right: 24, left: 8, bottom: 0 }}
                >
                  <CartesianGrid stroke={GRIDLINE} horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={AXIS_TEXT} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="label" tick={AXIS_TEXT} axisLine={false} tickLine={false} width={160} />
                  <Tooltip
                    cursor={{ fill: "#f9f9f7" }}
                    contentStyle={{ borderRadius: 8, border: "1px solid #e1e0d9", fontSize: 12 }}
                  />
                  <Bar dataKey="count" name="Enquiries" fill={SEQUENTIAL_BLUE} radius={[0, 4, 4, 0]} maxBarSize={22} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">Recent Enquiries</h2>
          <Link to="/admin/enquiries" className="text-sm font-semibold text-brand hover:underline">
            View all →
          </Link>
        </div>
        {recentEnquiries.length === 0 ? (
          <p className="mt-4 text-sm text-ink-soft">No enquiries yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-black/5">
            {recentEnquiries.map((e) => (
              <li key={e.id} className="py-3">
                <p className="text-sm font-semibold text-ink">{e.name} — {e.phone}</p>
                <p className="text-xs text-ink-soft">{e.bike ? `${e.bike.brand} ${e.bike.name}` : e.source}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Link
        to="/admin/bikes/new"
        className="mt-8 inline-block rounded-full bg-brand px-6 py-3 text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-dark"
      >
        + Add New Bike
      </Link>
    </div>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}</p>
      <p className="mt-2 text-3xl font-black text-ink">{value}</p>
      {sub && <p className="mt-1 text-xs text-ink-soft">{sub}</p>}
    </div>
  );
}
