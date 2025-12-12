/* eslint-disable no-nested-ternary */
import { useEffect, useState } from "react";
import { AppNavbar } from "./AppNavbar";
import { authService } from "../api/services/auth.service";
import { AppSidebar } from "./AppSidebar";
import { useNavigate } from "react-router-dom";
import type { EnterpriseCreationResponse, EnterpriseJoinRequestResponse, HandleEnterpriseJoinRequestOutput } from "../interfaces/auth";

export function JoinRequest() {
    const [darkMode, setDarkMode] = useState(false);
    const [activeSection] = useState('join-request');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [joinRequests, setJoinRequests] = useState<EnterpriseJoinRequestResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Estado para la notificación
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const navigate = useNavigate();
    const DEFAULT_PROFILE_IMG = "https://http2.mlstatic.com/D_NQ_NP_632686-MCO77519551393_072024-O.webp";

    const handleSidebarNavigation = (section: string) => {
        void navigate('/home', { state: { section: section } });
    };

    const toggleDarkMode = () => setDarkMode(!darkMode);
    const toggleSidebarCollapse = () => setSidebarCollapsed(!sidebarCollapsed);
    const toggleMobileSidebar = () => setMobileSidebarOpen(!mobileSidebarOpen);

    const handleLogout = async () => {
        await authService.logoutUser();
        window.location.href = '/';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Función auxiliar para mostrar notificaciones temporales
    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000); // Se oculta a los 3 segundos
    };

    const handleJoinRequest = async (): Promise<EnterpriseJoinRequestResponse[]> => {
        try {
            const storedEnterprise = localStorage.getItem('currentEnterprise');
            if (!storedEnterprise) { return []; }

            const enterpriseId = (JSON.parse(storedEnterprise) as EnterpriseCreationResponse).id;
            const response = await authService.getPendingJoinRequests(enterpriseId);
            return response;
        } catch (error) {
            console.error("Error fetching requests", error);
            return [];
        }
    }

    useEffect(() => {
        setIsLoading(true);
        void handleJoinRequest().then((response) => {
            setJoinRequests(response);
            setIsLoading(false);
        });
    }, []);

    const handleApprove = async (id: string) => {
        try {
            const response: HandleEnterpriseJoinRequestOutput = await authService.processJoinRequest(id, true);

            showNotification(response.message || "Solicitud aprobada correctamente", 'success');

            setJoinRequests(prev => prev.filter(req => req.id !== id));

        } catch (error) {
            console.error(error);
            showNotification("Error al aprobar la solicitud", 'error');
        }
    };

    const handleReject = async (id: string) => {
        try {
            const response: HandleEnterpriseJoinRequestOutput = await authService.processJoinRequest(id, false);
            showNotification(response.message || "Solicitud rechazada correctamente", 'success');
            setJoinRequests(prev => prev.filter(req => req.id !== id));

        } catch (error) {
            console.error(error);
            showNotification("Error al rechazar la solicitud", 'error');
        }
    };

    const handleViewProfile = (userId: string) => {
        localStorage.setItem('userIdSearch', userId);
        void navigate('/user-profile');
    };

    return (
        <div className={`h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 ${darkMode ? 'dark' : ''}`}>

            {/* NOTIFICACIÓN FLOTANTE (TOAST) */}
            {notification && (
                <div className={`fixed bottom-5 right-5 z-[100] flex items-center p-4 mb-4 text-sm rounded-lg shadow-lg transition-all duration-300 transform translate-y-0 ${notification.type === 'success'
                    ? 'text-green-800 bg-green-50 dark:bg-gray-800 dark:text-green-400 border border-green-300 dark:border-green-800'
                    : 'text-red-800 bg-red-50 dark:bg-gray-800 dark:text-red-400 border border-red-300 dark:border-red-800'
                    }`} role="alert">
                    <svg className="flex-shrink-0 inline w-4 h-4 mr-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                        {notification.type === 'success' ? (
                            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
                        ) : (
                            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z" />
                        )}
                    </svg>
                    <span className="sr-only">Info</span>
                    <div className="font-medium">
                        {notification.message}
                    </div>
                </div>
            )}

            {/* Background animation */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full opacity-10 blur-3xl" />
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500 rounded-full opacity-10 blur-3xl" />
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
            <div className={`flex flex-col py-2 w-full relative mt-16 align-center justify-center items-center transition-all duration-300 ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
                <div className="p-6 md:p-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 pb-6 border-b border-gray-100 dark:border-gray-800 gap-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-purple-600 dark:text-white">
                                <strong>Solicitudes de Ingreso</strong>
                            </h1>
                            <p className="text-lg text-gray-500 dark:text-gray-400 mt-2">
                                Gestiona los usuarios que quieren unirse a tu empresa.
                            </p>
                        </div>
                        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-violet-100 text-violet-950 border border-violet-200 shadow-sm dark:bg-violet-900/50 dark:text-violet-100 dark:border-violet-700">
                            {joinRequests.length} {joinRequests.length === 1 ? 'Pendiente' : 'Pendientes'}
                        </span>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
                        </div>
                    ) : joinRequests.length === 0 ? (
                        <div className="mt-12 flex flex-col items-center justify-center py-16 px-4 bg-white/50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 backdrop-blur-sm transition-all hover:border-violet-200 dark:hover:border-violet-900/50">
                            <div className="h-20 w-20 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center mb-6 shadow-sm group">
                                <svg
                                    className="w-10 h-10 text-violet-600 dark:text-violet-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                No hay solicitudes pendientes
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
                                Todo está tranquilo por aquí. Te avisaremos cuando alguien quiera unirse a tu equipo.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {joinRequests.map((request) => (
                                <div
                                    key={request.id}
                                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden"
                                >
                                    <div className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center space-x-4">
                                                {/* Avatar */}
                                                <div className="relative">
                                                    <img
                                                        alt="Profile"
                                                        className="border-4 border-gray-300 dark:border-gray-600 rounded-full"
                                                        src={request.user.profile?.profilePhotoUrl ?? DEFAULT_PROFILE_IMG}
                                                        style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '50%' }}
                                                    />
                                                    <span className="absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full ring-2 ring-white dark:ring-gray-800 bg-yellow-400" title="Pendiente" />
                                                </div>

                                                {/* Info Principal */}
                                                <div className="flex-1 min-w-0">
                                                    <h3
                                                        onClick={() => handleViewProfile(request.user.id)}
                                                        className="text-lg font-bold text-gray-900 dark:text-white truncate cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 hover:underline transition-all"
                                                    >
                                                        {request.user.profile?.firstName} {request.user.profile?.lastName}
                                                    </h3>
                                                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400 truncate">
                                                        {request.user.profile?.jobTitle ?? 'Sin cargo definido'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 space-y-2">
                                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                <svg className="mr-2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
                                                <span className="truncate">{request.user.email}</span>
                                            </div>
                                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                <svg className="mr-2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
                                                <span>Solicitado: {formatDate(request.requestedAt)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer con Acciones */}
                                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700 flex gap-3 items-center">
                                        <button
                                            className="flex-1 py-2 px-3 text-sm font-medium text-red-600 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-red-50 dark:hover:bg-gray-700 transition-colors focus:ring-2 focus:ring-red-500 focus:outline-none"
                                            onClick={() => handleReject(request.id)}
                                        >
                                            Rechazar
                                        </button>
                                        <button
                                            className="flex-1 py-2 px-3 text-sm font-medium text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors shadow-sm focus:ring-2 focus:ring-gray-500 focus:outline-none"
                                            onClick={() => handleApprove(request.id)}
                                        >
                                            Aprobar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}