import { BrowserRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { NotFound } from "./pages/NotFound";
import { authService } from "./api/services/auth.service";
import { MyProfile } from "./pages/MyProfile";
import { RegisterEnterprise } from "./pages/RegisterEnterprise";
import { Roles } from "./pages/Roles";
import { JoinRequest } from "./pages/JoinRequest";
import { AnyProfile } from "./pages/AnyProfile";
import { Settings } from "./pages/Settings";
import { MainLayout } from "./pages/MainLayout";

// Componente para refrescar el token en cada cambio de ruta
function TokenRefresher() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Escuchar evento global de 'unauthorized'
    const handleUnauthorized = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('currentUser');
      navigate('/');
    };

    window.addEventListener('unauthorized', handleUnauthorized);

    // Evitar refrescar en login/signup si no hay token (opcional, pero buena práctica)
    const token = localStorage.getItem('token');
    if (token) {
      authService.refreshToken().catch((err: any) => {
        console.error("Token refresh failed", err);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (err?.status === 401) {
          handleUnauthorized();
        }
      });
    }

    return () => {
      window.removeEventListener('unauthorized', handleUnauthorized);
    };
  }, [location, navigate]);

  return null;
}

// Componente principal con las rutas
export default function App() {
  return (
    <BrowserRouter>
      <TokenRefresher />
      <div className="min-h-screen flex flex-col">
        <Routes>
          <Route element={<LoginPage />} path="/" />
          <Route element={<SignupPage />} path="/signup" />
          <Route element={<MainLayout />} path="/home" />
          <Route element={<NotFound />} path="*" />
          <Route element={<MyProfile />} path="/profile" />
          <Route element={<Roles />} path="/roles" />
          <Route element={<RegisterEnterprise />} path="/no-enterprise" />
          <Route element={<JoinRequest />} path="/users-settings" />
          <Route element={<AnyProfile />} path="/user-profile" />
          <Route element={<Settings />} path="/settings" />
        </Routes>
      </div>
    </BrowserRouter>
  );
}