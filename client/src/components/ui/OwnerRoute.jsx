import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function OwnerRoute() {
  const { isOwner } = useAuth();
  return isOwner ? <Outlet /> : <Navigate to="/admin" replace />;
}
