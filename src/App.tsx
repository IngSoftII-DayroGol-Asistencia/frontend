import { useState, useEffect } from "react";
import { LoginPage } from "./components/LoginPage";
import { SignupPage } from "./components/SignupPage";
import { AppNavbar } from "./components/AppNavbar";
import { AppSidebar } from "./components/AppSidebar";
import { MobileSidebar } from "./components/MobileSidebar";
import { FeedContent } from "./components/FeedContent";
import { VideoCallContent } from "./components/VideoCallContent";
import { DashboardContent } from "./components/DashboardContent";
import { MessagesContent } from "./components/MessagesContent";

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('login');
  const [darkMode, setDarkMode] = useState(false);
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

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleLogout = () => {
    setCurrentPage('login');
  };

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
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

  if (currentPage === 'login') {
    return (
      <div className={darkMode ? 'dark' : ''}>
        <div className="size-full">
          <LoginPage onNavigate={setCurrentPage} />
        </div>
      </div>
    );
  }

  if (currentPage === 'signup') {
    return (
      <div className={darkMode ? 'dark' : ''}>
        <div className="size-full">
          <SignupPage onNavigate={setCurrentPage} />
        </div>
      </div>
    );
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="size-full flex flex-col bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-950 dark:via-blue-950/30 dark:to-purple-950/30">
        <AppNavbar 
          darkMode={darkMode} 
          toggleDarkMode={toggleDarkMode} 
          onLogout={handleLogout}
          onMobileMenuToggle={toggleMobileSidebar}
        />
        
        <div className="flex-1 flex overflow-hidden">
          {/* Desktop Sidebar */}
          <div className="hidden md:block">
            <AppSidebar 
              activeSection={activeSection} 
              onSectionChange={setActiveSection}
              collapsed={sidebarCollapsed}
              onToggleCollapse={toggleSidebarCollapse}
            />
          </div>

          {/* Mobile Sidebar */}
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
