import { BrowserRouter, Routes, Route, useLocation, useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { LoginPage } from "./components/LoginPage";
import { SignupPage } from "./components/SignupPage";
import { NotFound } from "./pages/NotFound";
import { AppNavbar } from "./components/AppNavbar";
import { AppSidebar } from "./components/AppSidebar";
import { MobileSidebar } from "./components/MobileSidebar";
import { FeedContent } from "./components/FeedContent";
import { VideoCallContent } from "./components/VideoCallContent";
import { DashboardContent } from "./components/DashboardContent";
import { MessagesContent } from "./components/MessagesContent";
import { authService } from "./api/services/auth.service";
import { MyProfile } from "./components/MyProfile";
import { UserEnterpriseResponse } from "./interfaces/auth";
import { RegisterEnterprise } from "./components/RegisterEnterprise";
import { Roles } from "./components/Roles";
import { JoinRequest } from "./components/JoinRequest";
import { AnyProfile } from "./components/AnyProfile";
import { Settings } from "./components/Settings";

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

// Componente para el layout principal (después del login)
function MainLayout() {
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState('feed');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleSidebarCollapse = () => setSidebarCollapsed(!sidebarCollapsed);
  const toggleMobileSidebar = () => setMobileSidebarOpen(!mobileSidebarOpen);

  const validateRelationEnterprise = () => {
    try {
      const storedData = localStorage.getItem('userRelationEnterprise');
      if (storedData) {
        const data: UserEnterpriseResponse = JSON.parse(storedData) as UserEnterpriseResponse;
        if (data.enterprises && data.enterprises.length === 0) {
          window.location.href = '/no-enterprise';
        }
      } else {
        // If no data, potentially also redirect or handle as needed, assuming flow requires check
        // For now, if no data, we might be in inconsistent state, or just wait.
        // But user requirement says: if no enterprise -> /no-enterprise.
        // If we have no data, we can't be sure. But usually login sets it.
        // Let's assume safely that if empty array -> redirect.
      }
    } catch (e) {
      console.error("Error parsing userRelationEnterprise", e);
    }
  }

  useEffect(() => {
    validateRelationEnterprise();
  }, []);

  // Keep section selection consistent without props: derive from pathname
  useEffect(() => {
    const path = location.pathname;
    const sectionParam = searchParams.get('section');

    if (path === '/dashboard') {
      setActiveSection('dashboard');
    } else if (sectionParam === 'messages' || sectionParam === 'video' || sectionParam === 'feed') {
      setActiveSection(sectionParam);
    } else {
      setActiveSection('feed');
    }
  }, [location.pathname, searchParams]);


  const handleLogout = async () => {
    await authService.logoutUser();
    window.location.href = '/';
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'video':
        return <VideoCallContent />;
      case 'dashboard':
        return <DashboardContent />;
      case 'messages':
        return <MessagesContent />;
      default:
        return <FeedContent />;
    }
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="size-full flex flex-col bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-950 dark:via-blue-950/30 dark:to-purple-950/30">
        <AppNavbar
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          onLogout={handleLogout}
          onMobileMenuToggle={toggleMobileSidebar}
        />

        <div className="flex-1 flex overflow-hidden pt-16">
          <div className={`hidden md:block h-full transition-all duration-300 border-r border-white/20 dark:border-gray-700/50 ${sidebarCollapsed ? 'w-16' : 'w-64'} shrink-0`}>
            <AppSidebar
              activeSection={activeSection}
              onSectionChange={setActiveSection}
              collapsed={sidebarCollapsed}
              onToggleCollapse={toggleSidebarCollapse}
            />
          </div>

          <MobileSidebar
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            open={mobileSidebarOpen}
            onOpenChange={setMobileSidebarOpen}
          />

          <main className="flex-1 overflow-y-auto">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
}


// Componente principal con las rutas
export default function App() {
  return (
    <BrowserRouter>
      <TokenRefresher />
      <div className="h-screen">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/home" element={<MainLayout />} />
          <Route path="/dashboard" element={<DashboardContent />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/profile" element={<MyProfile />} />
          <Route path="/roles" element={<Roles />} />
          <Route path="/no-enterprise" element={<RegisterEnterprise />} />
          <Route path="/users-settings" element={<JoinRequest />} />
          <Route path="/user-profile" element={<AnyProfile />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}