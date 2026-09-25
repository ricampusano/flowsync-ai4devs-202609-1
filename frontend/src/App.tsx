import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/lib/auth-context";
import { LoginPage } from "@/pages/login-page";
import { ProfilePage } from "@/pages/profile-page";
import { SignupPage } from "@/pages/signup-page";

function App() {
  const { token } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={token ? "/profile" : "/login"} replace />}
      />
      <Route
        path="/login"
        element={token ? <Navigate to="/profile" replace /> : <LoginPage />}
      />
      <Route
        path="/signup"
        element={token ? <Navigate to="/profile" replace /> : <SignupPage />}
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
