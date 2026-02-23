import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function ProtectedRoute({ allowedRoles = [] }) {
  const location = useLocation();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const userType = localStorage.getItem("userType");

  useEffect(() => {
    if (token && allowedRoles.length > 0 && !allowedRoles.includes(userType)) {
      navigate(-1);
    }
  }, [token, userType, allowedRoles, navigate]);

  if (!token) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userType)) {
    return null;
  }

  return <Outlet />;
}


