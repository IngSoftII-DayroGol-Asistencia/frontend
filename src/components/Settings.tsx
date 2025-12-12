import { useState, useEffect } from "react";
import { AppNavbar } from "./AppNavbar";
import { AppSidebar } from "./AppSidebar";
import { authService } from "../api/services/auth.service";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { LogOut, AlertTriangle } from "lucide-react";
import { UserEnterpriseResponse } from "../interfaces/auth";

export function Settings() {
    const [darkMode, setDarkMode] = useState(false);
    const [activeSection] = useState('settings');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Check owner status
        const userRelation = localStorage.getItem('userRelationEnterprise');
        if (userRelation) {
            const relation = JSON.parse(userRelation) as UserEnterpriseResponse;
            setIsOwner(relation.enterprises[0]?.isOwner || false);
        }
    }, []);

    const toggleDarkMode = () => setDarkMode(!darkMode);
    const toggleSidebarCollapse = () => setSidebarCollapsed(!sidebarCollapsed);
    const toggleMobileSidebar = () => setMobileSidebarOpen(!mobileSidebarOpen);

    const handleLogout = async () => {
        await authService.logoutUser();
        window.location.href = '/';
    };

    const handleSidebarNavigation = (section: string) => {
        void navigate('/home', { state: { section: section } });
    };

    const handleLeaveEnterprise = async () => {
        if (!confirm("Are you sure you want to leave this enterprise? You will lose access to all resources.")) return;

        try {
            await authService.leaveEnterprise();
            // Force logout or redirect to a 'no-enterprise' state? 
            // Usually after leaving, user has no enterprise contexts.
            // Let's redirect to home which will likely trigger 'no-enterprise' check or login
            window.location.href = '/home';
        } catch (error) {
            console.error("Failed to leave enterprise", error);
            alert("Error leaving enterprise. Please try again.");
        }
    };

    return (
        <div className={`h-screen overflow-hidden bg-white dark:bg-gray-950 ${darkMode ? 'dark' : ''}`}>

            <AppNavbar
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
                onLogout={handleLogout}
                onMobileMenuToggle={toggleMobileSidebar}
            />

            <div className="flex pt-16 h-screen overflow-hidden">
                <div className={`hidden md:block h-full transition-all duration-300 border-r border-gray-100 dark:border-gray-800 ${sidebarCollapsed ? 'w-16' : 'w-64'} shrink-0`}>
                    <AppSidebar
                        activeSection={activeSection}
                        collapsed={sidebarCollapsed}
                        onSectionChange={handleSidebarNavigation}
                        onToggleCollapse={toggleSidebarCollapse}
                    />
                </div>

                <main className="flex-1 overflow-y-auto p-6 md:p-8 relative bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-900 dark:to-gray-950">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
                        <p className="text-gray-500 dark:text-gray-400 mb-8">Manage your enterprise preferences and membership.</p>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" />
                                Danger Zone
                            </h2>
                            <div className="bg-white dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                                <div>
                                    <h3 className="font-medium text-gray-900 dark:text-gray-200">Leave Enterprise</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        Revoke your access and leave this organization. This action cannot be undone.
                                    </p>
                                </div>
                                {isOwner ? (
                                    <div className="text-sm text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-md border border-amber-100 dark:border-amber-800/30">
                                        Owners must transfer ownership before leaving.
                                    </div>
                                ) : (
                                    <Button variant="destructive" onClick={handleLeaveEnterprise} className="whitespace-nowrap">
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Leave Enterprise
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
