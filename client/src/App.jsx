import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PublicLayout from "./components/layout/PublicLayout";
import AdminLayout from "./components/layout/AdminLayout";
import ProtectedRoute from "./components/ui/ProtectedRoute";

import Home from "./pages/Home";
import Bikes from "./pages/Bikes";
import BikeDetail from "./pages/BikeDetail";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBikes from "./pages/admin/AdminBikes";
import AdminBikeEdit from "./pages/admin/AdminBikeEdit";
import AdminBikeDetail from "./pages/admin/AdminBikeDetail";
import AdminEnquiries from "./pages/admin/AdminEnquiries";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminAdmins from "./pages/admin/AdminAdmins";
import OwnerRoute from "./components/ui/OwnerRoute";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="bikes" element={<Bikes />} />
            <Route path="bikes/:id" element={<BikeDetail />} />
            <Route path="about" element={<About />} />
            <Route path="services" element={<Services />} />
            <Route path="contact" element={<Contact />} />
          </Route>

          <Route path="admin/login" element={<AdminLogin />} />
          <Route element={<ProtectedRoute />}>
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="bikes" element={<AdminBikes />} />
              <Route path="bikes/:id/view" element={<AdminBikeDetail />} />
              <Route path="bikes/:id" element={<AdminBikeEdit />} />
              <Route path="enquiries" element={<AdminEnquiries />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route element={<OwnerRoute />}>
                <Route path="admins" element={<AdminAdmins />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
