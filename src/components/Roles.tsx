import { useState, useEffect } from "react";
import { AppNavbar } from "./AppNavbar";
import { authService } from "../api/services/auth.service";
import { AppSidebar } from "./AppSidebar";
import { hasPermission } from "../utils/permissionUtils";
import { useNavigate } from "react-router-dom";
import { CreateRoleInput, GetRolesResponse, PermissionResponse } from "../interfaces/auth/roles.interface";
import { Button } from "./ui/button"; // Assuming you have a Button component
import { Input } from "./ui/input"; // Assuming Input component
import { Textarea } from "./ui/textarea"; // Assuming Textarea
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "./ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Users, UserPlus, Trash2 } from "lucide-react";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { EnterpriseUserMembership } from "../interfaces/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

const PERMISSION_DESCRIPTIONS: Record<string, string> = {
    READ: "Can view details but cannot make changes.",
    CREATE: "Can create new entries.",
    UPDATE: "Can modify existing entries.",
    DELETE: "Can remove entries permanently.",
    MANAGE: "Full administrative access, including sensitive operations."
};

export function Roles() {
    const [darkMode, setDarkMode] = useState(false);
    const [activeSection] = useState('roles');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    // activeTab is now managed by Tabs component mostly, but we might want to control it for the "Create First Role" button
    const [activeTab, setActiveTab] = useState("list");

    // Data states
    const [roles, setRoles] = useState<GetRolesResponse>([]);
    const [permissions, setPermissions] = useState<PermissionResponse[]>([]);
    const [enterpriseUsers, setEnterpriseUsers] = useState<EnterpriseUserMembership[]>([]);

    // Form states
    const [createRoleForm, setCreateRoleForm] = useState<CreateRoleInput>({ name: '', description: '', permissionIds: [] });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Assign Role State
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
    const [assignUserId, setAssignUserId] = useState('');

    const navigate = useNavigate();

    // Permission checks
    const canAccess = hasPermission('ROLES', ['READ', 'UPDATE', 'MANAGE', 'CREATE', 'DELETE']);
    const canEdit = hasPermission('ROLES', ['MANAGE', 'UPDATE', 'CREATE', 'DELETE']);
    const canDeleteUserRole = hasPermission('ROLES', ['MANAGE']) && hasPermission('USERS', ['MANAGE']);

    useEffect(() => {
        if (!canAccess) {
            void navigate('/home');
        }
    }, [canAccess, navigate]);

    useEffect(() => {
        fetchRoles();
        fetchPermissions();
        fetchEnterpriseUsers();
    }, []);

    const fetchRoles = async () => {
        try {
            const data = await authService.getRolesEnterprise();
            setRoles(data);
        } catch (error) {
            console.error("Failed to fetch roles", error);
        }
    };

    const fetchPermissions = async () => {
        try {
            const data = await authService.getEnterprisePermissionsForUsers();
            setPermissions(data);
        } catch (error) {
            console.error("Failed to fetch permissions", error);
        }
    };

    const fetchEnterpriseUsers = async () => {
        try {
            // Check localStorage first as requested
            const storedEnterprise = localStorage.getItem('myEnterprise');
            if (storedEnterprise) {
                const parsed = JSON.parse(storedEnterprise) as { enterprise: { users: EnterpriseUserMembership[] } };
                if (parsed.enterprise && parsed.enterprise.users) {
                    setEnterpriseUsers(parsed.enterprise.users);
                    // Still fetch fresh data in background if needed, but for now this suffices as per instruction
                    return;
                }
            }

            const response = await authService.getMyEnterprise();
            if (response.enterprise && response.enterprise.users) {
                setEnterpriseUsers(response.enterprise.users);
            }
        } catch (error) {
            console.error("Failed to fetch enterprise users", error);
        }
    };

    const handleProfileClick = (e: React.MouseEvent | React.PointerEvent, userId: string) => {
        e.preventDefault();
        e.stopPropagation();
        localStorage.setItem('userIdSearch', userId);
        window.open('/user-profile', '_blank');
    };

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

    // Create Role Handlers
    const handleCreateInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCreateRoleForm(prev => ({ ...prev, [name]: value }));
    };

    const handlePermissionToggle = (permissionId: string) => {
        setCreateRoleForm(prev => {
            const currentIds = prev.permissionIds;
            if (currentIds.includes(permissionId)) {
                return { ...prev, permissionIds: currentIds.filter(id => id !== permissionId) };
            } else {
                return { ...prev, permissionIds: [...currentIds, permissionId] };
            }
        });
    };

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await authService.createRolesEnterprise(createRoleForm);
            await fetchRoles(); // Refresh list
            setCreateRoleForm({ name: '', description: '', permissionIds: [] });
            setActiveTab('list');
        } catch (error) {
            console.error("Error creating role", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Assign Role Handlers
    const openAssignDialog = (roleId: string) => {
        setSelectedRoleId(roleId);
        setAssignDialogOpen(true);
    };

    const handleAssignSubmit = async () => {
        if (!selectedRoleId || !assignUserId) return;
        try {
            await authService.assignRoleToUser({ roleId: selectedRoleId, userId: assignUserId });
            setAssignDialogOpen(false);
            setAssignUserId('');
            setSelectedRoleId(null);
            await fetchRoles(); // Update counts if necessary
        } catch (error) {
            console.error("Error assigning role", error);
        }
    };

    // Group permissions by resource for better UI
    const permissionsByResource = permissions.reduce((acc, perm) => {
        if (!acc[perm.resource]) acc[perm.resource] = [];
        acc[perm.resource].push(perm);
        return acc;
    }, {} as Record<string, PermissionResponse[]>);

    // USERS PER ROLE TRAVERSAL
    const [roleUsersMap, setRoleUsersMap] = useState<Record<string, EnterpriseUserMembership[]>>({});
    const [viewUsersDialogOpen, setViewUsersDialogOpen] = useState(false);
    const [selectedRoleUsers, setSelectedRoleUsers] = useState<EnterpriseUserMembership[]>([]);
    const [selectedRoleName, setSelectedRoleName] = useState("");
    const [currentViewRoleId, setCurrentViewRoleId] = useState<string | null>(null);

    useEffect(() => {
        if (enterpriseUsers.length > 0) {
            void fetchAllUserRoles();
        }
    }, [enterpriseUsers]);

    // ... fetchAllUserRoles ...

    const handleRemoveUserFromRole = async (userId: string) => {
        if (!currentViewRoleId) return;
        if (!confirm("Are you sure you want to remove this user from the role?")) return;

        try {
            await authService.deletePersonRole(currentViewRoleId, userId);
            // Refresh logic:
            // 1. Remove from local state for immediate feedback
            setSelectedRoleUsers(prev => prev.filter(u => u.userId !== userId));
            // 2. Refetch in background to sync everything
            await fetchAllUserRoles();
            await fetchRoles(); // Update counts
        } catch (error) {
            console.error("Failed to remove user from role", error);
        }
    };

    const openViewUsersDialog = (roleId: string, roleName: string) => {
        setSelectedRoleUsers(roleUsersMap[roleId] || []);
        setSelectedRoleName(roleName);
        setCurrentViewRoleId(roleId);
        setViewUsersDialogOpen(true);
    };

    const fetchAllUserRoles = async () => {
        const map: Record<string, EnterpriseUserMembership[]> = {};

        try {
            // Iterate all users to get their roles
            // Optimization: Promise.all could be too heavy if many users, keeping it simple for now or batching could be better
            // Given the requirement is explicit about iterating:
            const userRolePromises = enterpriseUsers.map(async (member) => {
                try {
                    const userRoles = await authService.getRolesUser(member.userId);
                    // Handle response being either array or object with roles array
                    const rolesList = Array.isArray(userRoles) ? userRoles : (userRoles as any).roles || [];

                    rolesList.forEach((role: any) => { // using any to bypass type mismatch if interface is wrong
                        if (!map[role.id]) {
                            map[role.id] = [];
                        }
                        // Check if user already added to avoid dupes (though logic shouldn't produce dupes if map is fresh)
                        if (!map[role.id].some(u => u.userId === member.userId)) {
                            map[role.id].push(member);
                        }
                    });
                } catch (e) {
                    console.error(`Failed to fetch roles for user ${member.userId}`, e);
                }
            });

            await Promise.all(userRolePromises);
            setRoleUsersMap(map);
        } catch (error) {
            console.error("Error aggregating role users", error);
        }
    };



    return (
        <div className={`h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 ${darkMode ? 'dark' : ''}`}>
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-white-500/20 via-blue-500/20 to-purple-500/20 dark:from-green-600/30 dark:via-blue-600/30 dark:to-purple-600/30 pointer-events-none" />
            <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gray-500/30 rounded-full blur-3xl animate-pulse pointer-events-none" />
            <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse delay-1000 pointer-events-none" />

            <AppNavbar
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
                onLogout={handleLogout}
                onMobileMenuToggle={toggleMobileSidebar}
            />

            {/* Main Flex Container */}
            <div className="flex pt-16 h-screen overflow-hidden">
                {/* Sidebar Container - Sticky/Fixed behavior handled via flex */}
                <div className={`hidden md:block h-full transition-all duration-300 border-r border-white/20 dark:border-gray-700/50 ${sidebarCollapsed ? 'w-16' : 'w-64'} shrink-0`}>
                    <AppSidebar
                        activeSection={activeSection}
                        collapsed={sidebarCollapsed}
                        onSectionChange={handleSidebarNavigation}
                        onToggleCollapse={toggleSidebarCollapse}
                    />
                </div>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-6 md:p-8 relative">
                    <div className="max-w-7xl mx-auto">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <div className="flex justify-between items-center mb-8 align-center">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white"><strong>Roles & Permissions</strong></h1>
                                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage enterprise roles and assign them to users.</p>
                                </div>

                                <TabsList className="grid w-full max-w-[400px] grid-cols-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                    <TabsTrigger value="list">Manage Roles</TabsTrigger>
                                    <TabsTrigger value="create">Create New Role</TabsTrigger>
                                </TabsList>
                            </div>

                            <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border border-white/20 dark:border-gray-700/50 rounded-2xl shadow-xl overflow-hidden min-h-[60vh]">
                                <TabsContent value="list" className="m-0 h-full">
                                    <div className="p-6 w-full h-full">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {roles.length === 0 ? (
                                                <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                                        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                                    </div>
                                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No roles found</h3>
                                                    <p className="text-gray-500 max-w-sm mt-2">Get started by creating a new role to manage permissions for your users.</p>
                                                    <Button onClick={() => setActiveTab('create')} className="mt-6">Create First Role</Button>
                                                </div>
                                            ) : (
                                                roles.map((role) => (
                                                    <div key={role.id} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-5 hover:shadow-lg hover:border-purple-200 dark:hover:border-purple-900 transition-all duration-300 group relative overflow-hidden flex flex-col justify-between h-full">
                                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ">
                                                            <svg className="w-24 h-24 transform translate-x-8 -translate-y-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>

                                                        <div className="relative z-10 flex flex-col items-center text-center h-full">
                                                            <div className="flex-1 w-full flex flex-col items-center">
                                                                <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                                                    <strong>{role.name}</strong>
                                                                </h3>
                                                                {role.isSystem && (
                                                                    <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 ">
                                                                        System Role
                                                                    </span>
                                                                )}
                                                                <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-3 line-clamp-3 min-h-[40px] max-w-[25ch]">
                                                                    {role.description || "No description provided for this role."}
                                                                </p>
                                                            </div>

                                                            <div className="flex items-center justify-center gap-4 my-6 text-xs text-gray-500 dark:text-gray-400 font-medium w-full">
                                                                <div className="flex items-center gap-1.5 tooltip" title="Users assigned">
                                                                    <span className="bg-purple-100 dark:bg-purple-900/20 p-1.5 rounded-md text-purple-600 dark:text-purple-400">
                                                                        <Users className="w-3.5 h-3.5" />
                                                                    </span>
                                                                    {role._count?.users || 0} Users
                                                                </div>
                                                                <div className="flex items-center gap-1.5" title="Permissions included">
                                                                    <span className="bg-green-100 dark:bg-green-900/20 p-1.5 rounded-md text-green-600 dark:text-green-400">
                                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                                    </span>
                                                                    {role.permissions.length} Permissions
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex gap-3 mt-auto relative z-10 w-full px-2 pb-2">
                                                            <Button
                                                                variant="outline"
                                                                className="flex-1 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700 text-sm h-10 shadow-sm"
                                                                onClick={() => openViewUsersDialog(role.id, role.name)}
                                                            >
                                                                <Users className="w-4 h-4 mr-2" />
                                                                View Users
                                                            </Button>
                                                            {canEdit && (
                                                                <Button
                                                                    className="flex-1 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700 text-sm h-10 shadow-sm"
                                                                    onClick={() => openAssignDialog(role.id)}
                                                                >
                                                                    <UserPlus className="w-4 h-4 mr-2" />
                                                                    Assign
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="create" className="m-0 h-full">
                                    <div className="p-8 w-full max-w-6xl mx-auto">
                                        <form onSubmit={handleCreateSubmit} className="space-y-6">
                                            <div className="flex flex-col lg:flex-row gap-8">
                                                {/* LEFT COLUMN: Basic Info */}
                                                <div className="w-full lg:w-1/3 space-y-6">
                                                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                                            <span className="bg-purple-100 dark:bg-purple-900/30 p-1.5 rounded-lg">
                                                                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                            </span>
                                                            Role Details
                                                        </h3>
                                                        <div className="space-y-4">
                                                            <div className="space-y-2">
                                                                <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                    Role Name <span className="text-red-500">*</span>
                                                                </Label>
                                                                <Input
                                                                    id="name"
                                                                    name="name"
                                                                    value={createRoleForm.name}
                                                                    onChange={handleCreateInputChange}
                                                                    placeholder="e.g. Content Moderator"
                                                                    required
                                                                    maxLength={30}
                                                                    className="bg-gray-50/50 dark:bg-gray-900/50 focus:bg-white dark:focus:bg-gray-800 transition-colors"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</Label>
                                                                <Textarea
                                                                    id="description"
                                                                    name="description"
                                                                    value={createRoleForm.description}
                                                                    onChange={handleCreateInputChange}
                                                                    placeholder="What is this role for?"
                                                                    maxLength={100}
                                                                    className="bg-gray-50/50 dark:bg-gray-900/50 focus:bg-white dark:focus:bg-gray-800 transition-colors min-h-[120px] resize-none"
                                                                />
                                                                <p className="text-xs text-muted-foreground">Short description to help admins understand this role's purpose.</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-6 border border-blue-100 dark:border-blue-900/30">
                                                        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">Did you know?</h4>
                                                        <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                                                            Roles bundle permissions together. Once created, you can assign this role to multiple users to grant them all associated permissions at once.
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* RIGHT COLUMN: Permissions */}
                                                <div className="w-full lg:w-2/3 h-full">
                                                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col h-[600px]">
                                                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50 rounded-t-xl">
                                                            <div>
                                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                                                    <span className="bg-green-100 dark:bg-green-900/30 p-1.5 rounded-lg">
                                                                        <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 14l-1 1-1 1H6v2H2v-2v-2h2v-2h2l2.293-2.293A6 6 0 0115 7z" /></svg>
                                                                    </span>
                                                                    Permissions
                                                                </h3>
                                                                <p className="text-sm text-gray-500 mt-1">Select the capabilities for this role</p>
                                                            </div>
                                                            <div className="text-xs font-mono bg-gray-100 dark:bg-gray-900 px-3 py-1 rounded-full text-gray-600 dark:text-gray-400">
                                                                {createRoleForm.permissionIds.length} Selected
                                                            </div>
                                                        </div>

                                                        <div className="p-6 overflow-y-auto flex-1 space-y-6 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
                                                            {Object.entries(permissionsByResource).map(([resource, perms]) => (
                                                                <div key={resource} className="relative">
                                                                    <div className="sticky top-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm z-10 py-2 mb-3 border-b border-gray-100 dark:border-gray-700">
                                                                        <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                                                            {resource.replace('_', ' ')}
                                                                            <span className="text-gray-400 font-normal normal-case">({perms.length})</span>
                                                                        </h4>
                                                                    </div>
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                        {perms.map((perm) => (
                                                                            <label
                                                                                key={perm.id}
                                                                                className={`
                                                                                    flex items-start p-3 rounded-lg border transition-all cursor-pointer group
                                                                                    ${createRoleForm.permissionIds.includes(perm.id)
                                                                                        ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
                                                                                        : 'bg-gray-50 dark:bg-gray-900/30 border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                                                    }
                                                                                `}
                                                                            >
                                                                                <Checkbox
                                                                                    id={perm.id}
                                                                                    checked={createRoleForm.permissionIds.includes(perm.id)}
                                                                                    onCheckedChange={() => handlePermissionToggle(perm.id)}
                                                                                    className="mt-0.5"
                                                                                    disabled={!canEdit}
                                                                                />
                                                                                <div className="ml-3 select-none">
                                                                                    <span className={`block text-sm font-medium ${createRoleForm.permissionIds.includes(perm.id) ? 'text-purple-700 dark:text-purple-300' : 'text-gray-700 dark:text-gray-300'}`}>
                                                                                        {perm.name}
                                                                                    </span>
                                                                                    <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                                                                                        {PERMISSION_DESCRIPTIONS[perm.action] || perm.description || perm.action}
                                                                                    </span>
                                                                                </div>
                                                                            </label>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            {permissions.length === 0 && (
                                                                <div className="text-center py-10 opacity-50">
                                                                    <p>No permissions available to display.</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-end items-center pt-6 border-t border-gray-100 dark:border-gray-700 gap-4">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    onClick={() => setActiveTab('list')}
                                                    className="bg-white text-black border border-gray-300 hover:bg-gray-100 hover:text-black dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 transition-all"
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    disabled={isSubmitting || !createRoleForm.name || createRoleForm.permissionIds.length === 0 || !canEdit}
                                                    className="bg-white text-black border border-gray-300 hover:bg-gray-100 hover:text-black dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 transition-all"
                                                >
                                                    {isSubmitting ? (
                                                        <span className="flex items-center gap-2">
                                                            <svg className="animate-spin h-4 w-4 text-green-400" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                            Creating...
                                                        </span>
                                                    ) : "Create Role"}
                                                </Button>
                                            </div>
                                        </form>
                                    </div>
                                </TabsContent>
                            </div>
                        </Tabs>
                    </div>
                </main>
            </div>

            {/* Assign Role Dialog */}
            <AlertDialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Assign Role to User</AlertDialogTitle>
                        <AlertDialogDescription>
                            Enter the ID of the user you want to assign this role to.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <div className="py-4 space-y-3">
                            <Label htmlFor="userId" className="block text-sm font-medium">Select User</Label>
                            <Select value={assignUserId} onValueChange={setAssignUserId}>
                                <SelectTrigger className="w-full h-14 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                    <SelectValue placeholder="Select a user to assign role..." />
                                </SelectTrigger>
                                <SelectContent className="max-h-[300px]">
                                    {enterpriseUsers.map((member) => (
                                        <SelectItem key={member.userId} value={member.userId} className="py-3 px-4 cursor-pointer focus:bg-purple-50 dark:focus:bg-purple-900/20">
                                            <div className="flex items-center gap-3 w-full">
                                                <Avatar className="h-10 w-10 border border-gray-200 dark:border-gray-700">
                                                    <AvatarImage src={member.user.profile?.profilePhotoUrl || "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ffloridapolitics.com%2Fwp-content%2Fuploads%2F2020%2F02%2FCharlie_Kirk_48514436497.jpg&f=1&nofb=1&ipt=3b1e9482b94ba47ee063675a8b4cc6fcdc4a63f01ef0f44242a88ed23e11ae53"} alt={member.user.profile?.firstName || "User"} className="object-cover" />
                                                    <AvatarFallback className="bg-purple-100 text-purple-700 font-medium">
                                                        {(member.user.email[0]).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col text-left">
                                                    <div
                                                        onPointerDown={(e) => handleProfileClick(e, member.user.id)}
                                                        className="font-semibold text-gray-900 dark:text-gray-100 hover:text-purple-600 dark:hover:text-purple-400 hover:underline cursor-pointer transition-colors w-fit"
                                                    >
                                                        {member.user.profile
                                                            ? `${member.user.profile.firstName} ${member.user.profile.lastName}`
                                                            : 'Unknown User'
                                                        }
                                                    </div>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {member.user.email}
                                                    </span>
                                                </div>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500">
                                Click on the user's name to view their full profile in a new tab.
                            </p>
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleAssignSubmit} disabled={!assignUserId.trim()}>
                            Assign Role
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog open={viewUsersDialogOpen} onOpenChange={setViewUsersDialogOpen}>
                <DialogContent className="sm:max-w-[360px]">
                    <DialogHeader>
                        <DialogTitle>Users in {selectedRoleName}</DialogTitle>
                    </DialogHeader>
                    <div className="max-h-[60vh] overflow-y-auto pr-1">
                        {selectedRoleUsers.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>No users assigned to this role.</p>
                            </div>
                        ) : (
                            <div className="space-y-3 pt-2">
                                {selectedRoleUsers.map((member) => (
                                    <div key={member.userId} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-700 group">
                                        <Avatar className="h-20 w-20 border border-gray-200 dark:border-gray-700 ring-2 ring-transparent group-hover:ring-purple-100 transition-all">
                                            <AvatarImage src={member.user.profile?.profilePhotoUrl || "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ffloridapolitics.com%2Fwp-content%2Fuploads%2F2020%2F02%2FCharlie_Kirk_48514436497.jpg&f=1&nofb=1&ipt=3b1e9482b94ba47ee063675a8b4cc6fcdc4a63f01ef0f44242a88ed23e11ae53"} className="object-cover" />
                                            <AvatarFallback className="bg-purple-100 text-purple-700 text-xl font-bold">
                                                {(member.user.email[0] || '?').toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div
                                                onClick={(e) => handleProfileClick(e, member.userId)}
                                                className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate hover:text-purple-600 cursor-pointer hover:underline"
                                            >
                                                {member.user.profile ? `${member.user.profile.firstName} ${member.user.profile.lastName}` : 'Unknown User'}
                                            </div>
                                            <p className="text-xs text-gray-500 truncate">{member.user.email}</p>
                                        </div>

                                        {canDeleteUserRole && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 transition-colors rounded-md"
                                                onClick={() => handleRemoveUserFromRole(member.userId)}
                                                title="Remove user from role"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
