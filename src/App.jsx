import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import { useAuth } from "./auth/AuthProvider";

function RequireAuth({ children }) {
  const { session, loading } = useAuth();
  if (loading) {
    return <div className="min-h-screen bg-alliance-black" />;
  }
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/admin"
        element={
          <RequireAuth>
            <Admin />
          </RequireAuth>
        }
      />
    </Routes>
  );
}
