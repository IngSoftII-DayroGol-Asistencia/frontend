import { useEffect, useState } from "react";
import { authService } from "../api/services/auth.service";
import { ApiException } from "../api/client";
import { AppNavbar } from "../components/AppNavbar";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import type { CreateEnterpriseInput } from "../interfaces/auth";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../components/ui/alert-dialog";

export function RegisterEnterprise() {

    const [darkMode, setDarkMode] = useState<boolean>(() => {
        try {
            return localStorage.getItem('darkMode') === 'true';
        } catch (e) {
            return false;
        }
    });

    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    const [viewMode, setViewMode] = useState<'initial' | 'join' | 'create'>('initial');

    const [joinId, setJoinId] = useState("");
    const [createFormData, setCreateFormData] = useState<CreateEnterpriseInput>({
        name: "",
        description: "",
        logo: "",
        website: "",
    });
    const [handleError, setHandleError] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [handleSuccess, setHandleSuccess] = useState<boolean>(false);
    const [successMessage, setSuccessMessage] = useState<string>("");

    const handleErrorsForm = (message: string) => {
        setHandleError(true);
        setErrorMessage(message);
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
    const toggleMobileSidebar = () => setMobileSidebarOpen(!mobileSidebarOpen);

    const navigate = useNavigate();

    const handleLogout = async () => {
        await authService.logoutUser();
        window.location.href = '/';
    };


    const handleJoinSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {   
                await authService.joinEnterprise(joinId);
                setHandleSuccess(true);
                setSuccessMessage("Solicitud enviada al administrador de la empresa.");
        } catch (error) {
                console.error("Error joining enterprise:", error);
                if (error instanceof ApiException) {
                    handleErrorsForm(error.message || "Failed to join enterprise.");
                } else if ((error as any)?.message) {
                    handleErrorsForm((error as any).message);
                } else {
                    handleErrorsForm("Failed to join enterprise. Please try again.");
                }
        }
    };

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (createFormData.name === "" || createFormData.logo === "" || createFormData.website === "" || createFormData.description === "") {
            handleErrorsForm("Please fill in all fields.");
            return;
        }
        await authService.createEnterprise(createFormData)
            .then(async () => {
                await authService.seedEnterprisePermissions();
                setHandleSuccess(true);
                setSuccessMessage("Enterprise created successfully!");
                // void navigate('/home');
            })
            .catch((error) => {
                console.error("Error creating enterprise:", error);
                handleErrorsForm("Failed to create enterprise. Please try again.");
                return;
            });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCreateFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className={`h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 ${darkMode ? 'dark' : ''}`}>

            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-white-500/20 via-blue-500/20 to-purple-500/20 dark:from-green-600/30 dark:via-blue-600/30 dark:to-purple-600/30 pointer-events-none" />
            <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gray-500/30 rounded-full blur-3xl animate-pulse pointer-events-none" />
            <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg_gray-500/30 rounded-full blur-3xl animate-pulse delay-75 pointer-events-none" />
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-20 w-72 h-72 bg-purple-700 rounded-full opacity-100 test-animation" />
            </div>

            <AppNavbar
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
                onLogout={handleLogout}
                onMobileMenuToggle={toggleMobileSidebar}
            />

            <div className="flex flex-col items-center justify-center py-2 w-full relative mt-8 md:mt-0 z-10 min-h-[80vh]">
                <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border border-white/20 dark:border-gray-700/50 rounded-2xl p-8 shadow-2xl w-full max-w-2xl transition-all duration-300">

                    <div className="mb-8 text-center">
                        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
                            {viewMode === 'initial' && "Create or join enterprise"}
                            {viewMode === 'join' && "Join an Enterprise"}
                            {viewMode === 'create' && "Create your Enterprise"}
                        </h1>
                        <p className="text-muted-foreground text-gray-500 dark:text-gray-400">
                            {viewMode === 'initial' && "Join our community today"}
                            {viewMode === 'join' && "Enter the unique ID provided by your administrator"}
                            {viewMode === 'create' && "Fill in the details to start your new organization"}
                        </p>
                    </div>

                    {viewMode === 'initial' && (
                        <div className="flex flex-col md:flex-row w-full gap-4 justify-center py-4">
                            <div className="w-full md:w-1/2 flex flex-col gap-6">
                                <Button
                                    variant="outline"
                                    className="w-full h-12 text-lg"
                                    onClick={() => setViewMode('join')}
                                >
                                    Join Enterprise
                                </Button>
                            </div>
                            <div className="w-full md:w-1/2 flex flex-col gap-6">
                                <Button
                                    className="w-full h-12 text-lg"
                                    onClick={() => setViewMode('create')}
                                >
                                    Create Enterprise
                                </Button>
                            </div>
                        </div>
                    )}

                    {viewMode === 'join' && (
                        <form onSubmit={handleJoinSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-gray-200">
                                    Enterprise ID
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ex: ENT-123456"
                                    value={joinId}
                                    onChange={(e) => setJoinId(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:placeholder:text-gray-400"
                                    required
                                />
                            </div>
                            <div className="flex gap-4 pt-2">
                                <Button
                                    variant="outline"
                                    type="button"
                                    className="w-1/2"
                                    onClick={() => setViewMode('initial')}
                                >
                                    Back
                                </Button>
                                <Button type="submit" className="w-1/2">
                                    Join Now
                                </Button>
                            </div>
                        </form>
                    )}

                    {viewMode === 'create' && (
                        <form onSubmit={handleCreateSubmit} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="space-y-2">
                                <label className="text-sm font-medium dark:text-gray-200">Enterprise Name</label>
                                <input
                                    name="name"
                                    value={createFormData.name}
                                    onChange={handleInputChange}
                                    placeholder="My Awesome Company"
                                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium dark:text-gray-200">Logo URL</label>
                                <input
                                    name="logo"
                                    type="text"
                                    value={createFormData.logo}
                                    onChange={handleInputChange}
                                    placeholder="https://mycompany.com/logo.png"
                                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium dark:text-gray-200">Website URL</label>
                                <input
                                    name="website"
                                    type="text"
                                    value={createFormData.website}
                                    onChange={handleInputChange}
                                    placeholder="https://mycompany.com/"
                                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium dark:text-gray-200">Description</label>
                                <textarea
                                    name="description"
                                    value={createFormData.description}
                                    onChange={handleInputChange}
                                    placeholder="What does your enterprise do?"
                                    className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                                />
                            </div>
                            <div className="flex justify-between pt-4 w-full">
                                <Button
                                    variant="outline"
                                    type="button"
                                    className="w-32"
                                    onClick={() => setViewMode('initial')}
                                >
                                    Back
                                </Button>
                                <Button
                                    type="submit"
                                    className="w-1/2 px-8 "
                                    onClick={handleCreateSubmit}
                                >
                                    Create Enterprise
                                </Button>
                            </div>
                            {handleError && (
                                <div className="justify-center align-middle items-center">
                                    <p className="text-sm text-red-600 mt-2">{errorMessage}</p>
                                </div>
                            )}
                        </form>
                    )}
                </div>
                <AlertDialog open={handleSuccess} onOpenChange={setHandleSuccess}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Enterprise process done!</AlertDialogTitle>
                            <AlertDialogDescription>
                                {`${successMessage} \n Back to login page`}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogAction onClick={() => {
                                setHandleSuccess(false)
                                void authService.logoutUser();
                                void navigate('/');
                            }}>
                                Ok
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}
