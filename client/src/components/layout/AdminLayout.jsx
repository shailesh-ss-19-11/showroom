import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const baseLinks = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/bikes", label: "Bikes" },
  { to: "/admin/enquiries", label: "Enquiries" },
  { to: "/admin/bookings", label: "Test Rides" },
  { to: "/admin/time-slots", label: "Test Ride Slots" },
  { to: "/admin/sales", label: "Sales" },
  { to: "/admin/site-content", label: "Homepage Content" },
  { to: "/admin/attendance", label: "Attendance" },
];

export default function AdminLayout() {
  const { admin, logout, isOwner } = useAuth();
  const navigate = useNavigate();
  const links = isOwner ? [...baseLinks, { to: "/admin/admins", label: "Admins" }] : baseLinks;

  function handleLogout() {
    logout();
    navigate("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="flex w-56 flex-col border-r border-black/5 bg-ink text-white">
        <div className="border-b border-white/10 px-6 py-5">
          <p className="text-lg font-extrabold">Admin Panel</p>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-5">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `block rounded-lg px-4 py-2 text-sm font-semibold ${
                  isActive ? "bg-brand text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 px-4 py-4">
          <p className="truncate text-sm font-semibold text-white/90">{admin?.name}</p>
          <p className="truncate text-xs text-white/50">{admin?.email} · {admin?.role}</p>
          <button
            onClick={handleLogout}
            className="mt-2 w-full rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20"
          >
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden p-6 sm:p-8">
        <Outlet />
      </main>
    </div>
  );
}
