import { useEffect, useState } from "react";
import { AppNavbar } from "../components/AppNavbar";
import { authService } from "../api/services/auth.service";
import { AppSidebar } from "../components/AppSidebar";
import { useNavigate } from "react-router-dom";
import type { EnterpriseCreationResponse, EnterpriseJoinRequestResponse, EnterpriseUserMembership, HandleEnterpriseJoinRequestOutput, UserEnterpriseResponse } from "../interfaces/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { ShieldCheck, UserMinus } from "lucide-react";

export function JoinRequest() {
    const [darkMode, setDarkMode] = useState<boolean>(() => {
        try {
            return localStorage.getItem('darkMode') === 'true';
        } catch (e) {
            return false;
        }
    });
    const [activeSection] = useState('join-request');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [joinRequests, setJoinRequests] = useState<EnterpriseJoinRequestResponse[]>([]);
    const [members, setMembers] = useState<EnterpriseUserMembership[]>([]);
    const [isOwner, setIsOwner] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Estado para la notificación
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const navigate = useNavigate();
    const DEFAULT_PROFILE_IMG = "https://http2.mlstatic.com/D_NQ_NP_632686-MCO77519551393_072024-O.webp";

    const handleSidebarNavigation = (section: string) => {
        void navigate(`/home?section=${encodeURIComponent(section)}`);
    };

    const toggleDarkMode = () => setDarkMode(prev => !prev);

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

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const storedEnterprise = localStorage.getItem('currentEnterprise');

            // Fetch Requests
            if (storedEnterprise) {
                const enterpriseId = (JSON.parse(storedEnterprise) as EnterpriseCreationResponse).id;
                const requests = await authService.getPendingJoinRequests(enterpriseId);
                setJoinRequests(requests);
            }

            // Fetch Members & Check Owner
            const myEnterprise = await authService.getMyEnterprise();
            if (myEnterprise.enterprise && myEnterprise.enterprise.users) {
                setMembers(myEnterprise.enterprise.users);
            }

            const userRelation = localStorage.getItem('userRelationEnterprise');
            if (userRelation) {
                const relation = JSON.parse(userRelation) as UserEnterpriseResponse;
                setIsOwner(relation.enterprises[0]?.isOwner || false);
            }

        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void fetchData();
    }, []);


    const handleApprove = async (id: string) => {
        try {
            const response: HandleEnterpriseJoinRequestOutput = await authService.processJoinRequest(id, true);
            showNotification(response.message || "Solicitud aprobada correctamente", 'success');
            setJoinRequests(prev => prev.filter(req => req.id !== id));
            void fetchData(); // Refresh members list
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

    const handleRemoveMember = async (userId: string) => {
        if (!confirm("Are you sure you want to remove this user from the enterprise?")) {return;}
        try {
            await authService.deleteMemberEnterprise(userId);
            showNotification("Miembro eliminado correctamente", 'success');
            setMembers(prev => prev.filter(m => m.userId !== userId));
        } catch (error) {
            console.error("Error removing member", error);
            showNotification("Error al eliminar miembro", 'error');
        }
    };

    const handleTransferOwnership = async (userId: string) => {
        if (!confirm("Are you sure you want to transfer ownership to this user? You will lose owner privileges.")) {return;}
        try {
            await authService.trasnferEnterpriseOwner(userId);
            showNotification("Propiedad transferida correctamente", 'success');
            // Refresh page or functionality as permissions changed
            setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
            console.error("Error transferring ownership", error);
            showNotification("Error al transferir propiedad", 'error');
        }
    };

    const handleViewProfile = (userId: string) => {
        localStorage.setItem('userIdSearch', userId);
        void navigate('/user-profile');
    };

    return (
        <div className={`h-screen overflow-hidden bg-white dark:bg-gray-950 ${darkMode ? 'dark' : ''}`}>

            {/* NOTIFICACIÓN FLOTANTE (TOAST) */}
            {notification && (
                <div className={`fixed bottom-5 right-5 z-[100] flex items-center p-4 mb-4 text-sm rounded-lg shadow-lg transition-all duration-300 transform translate-y-0 ${notification.type === 'success'
                    ? 'text-green-800 bg-green-50 dark:bg-gray-800 dark:text-green-400 border border-green-300 dark:border-green-800'
                    : 'text-red-800 bg-red-50 dark:bg-gray-800 dark:text-red-400 border border-red-300 dark:border-red-800'
                    }`} role="alert">
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

            <div className="flex pt-16 min-h-screen overflow-hidden">
                <div className={`hidden md:block transition-all duration-300 border-r border-gray-100 dark:border-gray-800 ${sidebarCollapsed ? 'w-16' : 'w-64'} shrink-0 md:self-start`}>
                    <AppSidebar
                        activeSection={activeSection}
                        collapsed={sidebarCollapsed}
                        onSectionChange={handleSidebarNavigation}
                        onToggleCollapse={toggleSidebarCollapse}
                    />
                </div>

                {/* Main Content area */}
                <main className="flex-1 overflow-y-auto p-6 md:p-8 relative bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-900 dark:to-gray-950">
                    <div className="w-full max-w-7xl mx-auto">

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-6 border-b border-gray-100 dark:border-gray-800 gap-6">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-purple-600 dark:text-white">
                                    <strong>Gestión de Usuarios</strong>
                                </h1>
                                <p className="text-lg text-gray-500 dark:text-gray-400 mt-2">
                                    Administra solicitudes y miembros de tu empresa.
                                </p>
                            </div>
                        </div>

                        <Tabs className="w-full" defaultValue="requests">
                            <TabsList className="grid w-full max-w-[400px] grid-cols-2 mb-8 mx-auto md:mx-0">
                                <TabsTrigger value="requests">Solicitudes ({joinRequests.length})</TabsTrigger>
                                <TabsTrigger value="members">Miembros ({members.length})</TabsTrigger>
                            </TabsList>

                            <TabsContent value="requests">
                                {isLoading ? (
                                    <div className="flex justify-center items-center h-64">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
                                    </div>
                                ) : joinRequests.length === 0 ? (
                                    <div className="mt-12 flex flex-col items-center justify-center py-16 px-4 bg-white/50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 backdrop-blur-sm">
                                        <div className="h-20 w-20 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center mb-6 shadow-sm">
                                            <svg className="w-10 h-10 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No hay solicitudes pendientes</h3>
                                        <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">Todo está tranquilo por aquí.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {joinRequests.map((request) => (
                                            <div key={request.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700 overflow-hidden">
                                                <div className="p-6">
                                                    <div className="flex items-center space-x-4">
                                                        <Avatar className="h-16 w-16 border-2 border-gray-200">
                                                            <AvatarImage className="object-cover" src={request.user.profile?.profilePhotoUrl ?? DEFAULT_PROFILE_IMG} />
                                                            <AvatarFallback>{request.user.email[0].toUpperCase()}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate cursor-pointer hover:text-purple-600 hover:underline" onClick={() => handleViewProfile(request.user.id)}>
                                                                {request.user.profile?.firstName} {request.user.profile?.lastName}
                                                            </h3>
                                                            <p className="text-sm text-gray-500 truncate">{request.user.email}</p>
                                                            <p className="text-xs text-gray-400 mt-1">Solicitado: {formatDate(request.requestedAt)}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700 flex gap-3">
                                                    <Button className="flex-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" variant="outline" onClick={() => handleReject(request.id)}>Rechazar</Button>
                                                    <Button className="flex-1" onClick={() => handleApprove(request.id)}>Aprobar</Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="members">
                                {isLoading ? (
                                    <div className="flex justify-center items-center h-64">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
                                    </div>
                                ) : members.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">No hay miembros para mostrar.</div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {members.map((member) => (
                                            <div key={member.userId} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col">
                                                <div className="flex items-center space-x-4 mb-4">
                                                    <Avatar className="h-14 w-14 border border-gray-200">
                                                        <AvatarImage className="object-cover" src={member.user.profile?.profilePhotoUrl ?? DEFAULT_PROFILE_IMG} />
                                                        <AvatarFallback>{member.user.email[0].toUpperCase()}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 dark:text-white cursor-pointer hover:text-purple-600 hover:underline" onClick={() => handleViewProfile(member.userId)}>
                                                            {member.user.profile ? `${member.user.profile.firstName} ${member.user.profile.lastName}` : "Unknown User"}
                                                        </h3>
                                                        <p className="text-sm text-gray-500">{member.user.email}</p>
                                                        {member.isOwner && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium">Owner</span>}
                                                    </div>
                                                </div>

                                                {isOwner && !member.isOwner && (
                                                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 grid grid-cols-2 gap-2">
                                                        <Button size="sm" title="Remove User" variant="destructive" onClick={() => handleRemoveMember(member.userId)}>
                                                            <UserMinus className="w-4 h-4 mr-2" /> Remove
                                                        </Button>
                                                        <Button size="sm" title="Transfer Ownership" variant="outline" onClick={() => handleTransferOwnership(member.userId)}>
                                                            <ShieldCheck className="w-4 h-4 mr-2" /> Transfer
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>
                </main>
            </div>
        </div>
    );
}