import { useState } from "react";
import { AppNavbar } from "./AppNavbar";
import { authService } from "../api/services/auth.service";
import { AppSidebar } from "./AppSidebar";
import { useNavigate } from "react-router-dom";

export function Roles() {
    const [darkMode, setDarkMode] = useState(false);
    const [activeSection] = useState('roles');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    const navigate = useNavigate();

    const handleSidebarNavigation = (section: string) => {
        void navigate(`/${section}`);
    };

    const toggleDarkMode = () => setDarkMode(!darkMode);
    const toggleSidebarCollapse = () => setSidebarCollapsed(!sidebarCollapsed);
    const toggleMobileSidebar = () => setMobileSidebarOpen(!mobileSidebarOpen);

    const handleLogout = async () => {
        await authService.logoutUser();
        window.location.href = '/';
    };

    return (
        <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 ${darkMode ? 'dark' : ''}`}>
            {/* Background animation similar to MyProfile */}
            <div className="fixed inset-0 z-0 overflow-hidden">
                <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full opacity-100 test-animation" />
            </div>

            <AppNavbar
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
                onLogout={handleLogout}
                onMobileMenuToggle={toggleMobileSidebar}
            />

            <div className="hidden md:block fixed left-0 top-0.5 h-screen z-50">
                <AppSidebar
                    activeSection={activeSection}
                    collapsed={sidebarCollapsed}
                    onSectionChange={handleSidebarNavigation}
                    onToggleCollapse={toggleSidebarCollapse}
                />
            </div>

            {/* Main Content area */}
            <div className={`flex flex-col py-2 w-full relative mt-16 transition-all duration-300 ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
                <div className="p-6 justify-center align-center text-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Roles Management</h1>
                    {/* Empty content as requested */}
                </div>
            </div>
        </div>
    );
}
