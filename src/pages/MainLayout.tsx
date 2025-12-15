import { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import type { UserEnterpriseResponse } from "../interfaces/auth";
import { authService } from "../api/services/auth.service";
import { VideoCallContent } from "../contents/VideoCallContent";
import { DashboardContent } from "../contents/DashboardContent";
import { MessagesContent } from "../contents/MessagesContent";
import { FeedContent } from "../contents/FeedContent";
import { AppNavbar } from "../components/AppNavbar";
import { AppSidebar } from "../components/AppSidebar";
import { MobileSidebar } from "../components/MobileSidebar";

// Componente para el layout principal (después del login)
export function MainLayout() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('darkMode') === 'true';
    } catch (e) {
      return false;
    }
  });
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState('feed');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    try {
      if (darkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('darkMode', 'true');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('darkMode', 'false');
      }
    } catch (e) {
      // ignore storage errors
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);
  const toggleSidebarCollapse = () => setSidebarCollapsed(!sidebarCollapsed);
  const toggleMobileSidebar = () => setMobileSidebarOpen(!mobileSidebarOpen);

  const validateRelationEnterprise = () => {
    try {
      const storedData = localStorage.getItem('userRelationEnterprise');
      if (storedData) {
        const data: UserEnterpriseResponse = JSON.parse(storedData) as UserEnterpriseResponse;
        if (data.enterprises?.length === 0) {
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

    if (sectionParam === 'messages' || sectionParam === 'video' || sectionParam === 'feed' || sectionParam === 'dashboard') {
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
    <div className={`${darkMode ? 'dark' : ''} min-h-screen`}>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-950 dark:via-blue-950/30 dark:to-purple-950/30">
        <AppNavbar
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          onLogout={handleLogout}
          onMobileMenuToggle={toggleMobileSidebar}
        />

        <div className="flex-1 flex overflow-hidden pt-16">
          <div className={`hidden md:block transition-all duration-300 border-r border-white/20 dark:border-gray-700/50 ${sidebarCollapsed ? 'w-16' : 'w-64'} shrink-0 md:self-start`}>
            <AppSidebar
              activeSection={activeSection}
              collapsed={sidebarCollapsed}
              onSectionChange={setActiveSection}
              onToggleCollapse={toggleSidebarCollapse}
            />
          </div>

          <MobileSidebar
            activeSection={activeSection}
            open={mobileSidebarOpen}
            onOpenChange={setMobileSidebarOpen}
            onSectionChange={setActiveSection}
          />

          <main className="flex-1 overflow-y-auto">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
}