import { useEffect, useState } from "react";
import { AppNavbar } from "../components/AppNavbar";
import { authService } from "../api/services/auth.service";
import { AppSidebar } from "../components/AppSidebar";
import type { UserProfileResponse } from "../interfaces/user";
import { Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import type { Post } from "../contents/FeedContent";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { BigNamedUserInitial } from "../components/UserInitial";

export function AnyProfile() {
    const [darkMode, setDarkMode] = useState<boolean>(() => {
        try {
            return localStorage.getItem('darkMode') === 'true';
        } catch (e) {
            return false;
        }
    });
    const [activeSection] = useState('feed');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    const [profileData, setProfileData] = useState<UserProfileResponse | null>(null);

    const navigate = useNavigate();

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

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const storedId = localStorage.getItem('userIdSearch');

                if (!storedId) {
                    console.warn("No se encontró 'userIdSearch' en localStorage. Abortando búsqueda.");
                    return;
                }
                const data = await authService.getUserProfile(storedId);
                console.log("Perfil cargado:", data);
                setProfileData(data);

            } catch (error) {
                console.error("Error al obtener el perfil:", error);
            }
        };
        void fetchUserProfile();

    }, []);

    const mockPosts: Post[] = [
        {
            id: 101,
            author: profileData ? `${profileData.firstName} ${profileData.lastName}` : "User",
            avatar: profileData?.profilePhotoUrl || "",
            role: profileData?.jobTitle || "Member",
            time: "2d ago",
            content: "Excited to share my latest project! #coding #react",
            tags: ["coding", "react"],
            upvotes: 45,
            downvotes: 2,
            comments: 12,
            trending: false
        },
        {
            id: 102,
            author: profileData ? `${profileData.firstName} ${profileData.lastName}` : "User",
            avatar: profileData?.profilePhotoUrl || "",
            role: profileData?.jobTitle || "Member",
            time: "1w ago",
            content: "Just finished a great book on leadership. Highly recommend 'The Mom Test' for anyone in product.",
            tags: ["reading", "product", "growth"],
            upvotes: 89,
            downvotes: 0,
            comments: 24,
            trending: true
        }
    ];

    return (
        <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 ${darkMode ? 'dark' : ''}`}>
            <div className="fixed inset-0 z-0 overflow-hidden">
                <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full opacity-100 test-animation" />
            </div>

            <AppNavbar
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
                onLogout={handleLogout}
                onMobileMenuToggle={toggleMobileSidebar}
            />

            <div className="flex-1 flex pt-16">
                <div className={`hidden md:block relative z-10 transition-all duration-300 border-r border-white/20 dark:border-gray-700/50 ${sidebarCollapsed ? 'w-16' : 'w-64'} shrink-0 md:self-start`}>
                    <AppSidebar
                        activeSection={activeSection}
                        collapsed={sidebarCollapsed}
                        onSectionChange={handleSidebarNavigation}
                        onToggleCollapse={toggleSidebarCollapse}
                    />
                </div>

                {/* Main Content area */}
                <div className="flex-1 flex flex-col items-center justify-center py-2 relative overflow-y-auto pb-20">


                    {/* Profile Photo */}
                    <div className="mb-1 relative group mt-16">
                        <BigNamedUserInitial name={profileData?.firstName} />
                    </div>

                    <h1 className="text-gray-900 dark:text-white text-2xl mt-2">
                        <strong>{profileData?.firstName ?? 'John'} {profileData?.lastName ?? 'Doe'}</strong>
                    </h1>

                    <div className="flex items-center gap-2 mt-1 h-8 mb-6">
                        <span className="text-gray-600 dark:text-gray-400 text-lg">
                            {profileData?.jobTitle ?? 'No job title'}
                        </span>
                    </div>

                    <div className="w-full max-w-4xl px-4">
                        <Tabs className="w-full" defaultValue="profile">
                            <TabsList className="grid w-full grid-cols-2 mb-6">
                                <TabsTrigger value="profile">Profile</TabsTrigger>
                                <TabsTrigger value="posts">Posts</TabsTrigger>
                            </TabsList>

                            <TabsContent value="profile">
                                <div className="flex flex-col md:flex-row w-full gap-4 justify-center bg-white/90 dark:bg-gray-800/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-lg shadow-lg p-6 border border-white/20 dark:border-gray-700/50">

                                    {/* COLUMNA IZQUIERDA */}
                                    <div className="w-full md:w-1/2 flex flex-col gap-6">
                                        {/* Contact Info */}
                                        <div className="flex flex-col gap-2 w-full">
                                            <span className="text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-1"><strong>Contact Information:</strong></span>
                                            <div className="flex flex-col gap-2">
                                                <div className="flex justify-between gap-1.5 items-center h-8">
                                                    <span className="text-gray-600 dark:text-gray-300">Phone:</span>
                                                </div>
                                                <div className="flex justify-between gap-1.5 items-center h-8">
                                                    <span className="text-gray-600 dark:text-gray-300">Country:</span>

                                                </div>
                                                <div className="flex justify-between gap-1.5 items-center h-8">
                                                    <span className="text-gray-600 dark:text-gray-300">City:</span>
                                                </div>
                                                <div className="flex justify-between gap-1.5 items-center h-8">
                                                    <span className="text-gray-600 dark:text-gray-300">Address:</span>
                                                </div>
                                                <div className="flex justify-between gap-1.5 items-center h-8">
                                                    <span className="text-gray-600 dark:text-gray-300">Postal Code:</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Emergency Contact */}
                                        <div className="flex flex-col gap-2 w-full">
                                            <span className="text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-1"><strong>Emergency Contact:</strong></span>
                                            <div className="flex flex-col gap-2">
                                                <div className="flex justify-between gap-1.5 items-center h-8">
                                                    <span className="text-gray-600 dark:text-gray-300">Name:</span>
                                                </div>
                                                <div className="flex justify-between gap-1.5 items-center h-8">
                                                    <span className="text-gray-600 dark:text-gray-300">Phone:</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* COLUMNA DERECHA */}
                                    <div className="w-full md:w-1/2 flex flex-col gap-6">

                                        {/* Bio & Department */}
                                        <div className="flex flex-col gap-3 w-full">
                                            <div className="flex flex-col gap-1 w-full">
                                                <span className="text-gray-900 dark:text-white"><strong>Bio:</strong></span>
                                                <span className="text-gray-400 text-sm italic">{profileData?.bio ?? 'No bio yet'}</span>
                                            </div>
                                            <div className="flex justify-between gap-1.5 items-center h-8 border-t border-gray-200 dark:border-gray-700 pt-2">
                                                <span className="text-gray-900 dark:text-white"><strong>Department:</strong></span>
                                            </div>
                                        </div>

                                        {/* --- EXPERIENCE EDITABLE CON FECHAS --- */}
                                        <div className="flex flex-col gap-2 w-full">
                                            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-1">
                                                <span className="text-gray-900 dark:text-white"><strong>Experience:</strong></span>
                                            </div>

                                            <div className="flex flex-col gap-4">
                                                {profileData?.experiences?.map((exp, index) => (
                                                    <div key={exp.id || index} className="flex flex-col gap-1 border-l-2 border-blue-300 dark:border-blue-600 pl-3 relative group">
                                                        <>
                                                            <span className="text-gray-800 dark:text-gray-200 font-semibold text-sm">{exp.jobTitle}</span>
                                                            <span className="text-gray-600 dark:text-gray-400 text-sm">{exp.companyName}</span>
                                                            <span className="text-gray-400 dark:text-gray-500 text-xs flex items-center gap-1">
                                                                <Calendar size={12} />
                                                                {new Date(exp.startDate).getFullYear()} - {exp.isCurrent ? 'Present' : (exp.endDate ? new Date(exp.endDate).getFullYear() : '')}
                                                            </span>
                                                        </>
                                                    </div>
                                                ))}
                                                {(!profileData?.experiences || profileData.experiences.length === 0) && (
                                                    <span className="text-gray-400 text-sm">No experience added</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* --- EDUCATION EDITABLE CON FECHAS --- */}
                                        <div className="flex flex-col gap-2 w-full">
                                            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-1">
                                                <span className="text-gray-900 dark:text-white"><strong>Education:</strong></span>
                                            </div>
                                            <div className="flex flex-col gap-4">
                                                {profileData?.educations?.map((edu, index) => (
                                                    <div key={edu.id || index} className="flex flex-col gap-1 border-l-2 border-green-300 dark:border-green-600 pl-3 relative">
                                                        <>
                                                            <span className="text-gray-800 dark:text-gray-200 font-semibold text-sm">{edu.degree}</span>
                                                            <span className="text-gray-600 dark:text-gray-400 text-sm">{edu.school}</span>
                                                            <span className="text-gray-400 dark:text-gray-500 text-xs flex items-center gap-1">
                                                                <Calendar size={12} />
                                                                {new Date(edu.startDate).getFullYear()} - {edu.isCurrent ? 'Present' : (edu.endDate ? new Date(edu.endDate).getFullYear() : '')}
                                                            </span>
                                                        </>
                                                    </div>
                                                ))}
                                                {(!profileData?.educations || profileData.educations.length === 0) && (
                                                    <span className="text-gray-400 text-sm">No education added</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* --- SKILLS EDITABLES (Mantenido igual) --- */}
                                        <div className="flex flex-col gap-2 w-full">
                                            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-1">
                                                <span className="text-gray-900 dark:text-white"><strong>Skills:</strong></span>
                                            </div>

                                            <div className="flex flex-col gap-1">
                                                {profileData?.skills?.map((skill, index) => (
                                                    <div key={skill.id || index} className="flex justify-between items-center group">
                                                        <span className="text-gray-600 dark:text-gray-300">{skill.name}</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-gray-400 dark:text-gray-500 text-sm">{skill.proficiency || 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                ))}

                                                {(!profileData?.skills || profileData.skills.length === 0) && (
                                                    <span className="text-gray-400 text-sm">No skills added</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* --- IDIOMAS EDITABLES (Mantenido igual) --- */}
                                        <div className="flex flex-col gap-2 w-full">
                                            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-1">
                                                <span className="text-gray-900 dark:text-white"><strong>Languages:</strong></span>
                                            </div>

                                            <div className="flex flex-col gap-1">
                                                {profileData?.languages?.map((lang, index) => (
                                                    <div key={lang.id || index} className="flex justify-between items-center">
                                                        <span className="text-gray-600 dark:text-gray-300">{lang.language}</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-gray-400 dark:text-gray-500 text-sm">{lang.proficiency}</span>
                                                        </div>
                                                    </div>
                                                ))}

                                                {(!profileData?.languages || profileData.languages.length === 0) && (
                                                    <span className="text-gray-400 text-sm">No languages added</span>
                                                )}
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="posts">
                                <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
                                    {mockPosts.map(post => (
                                        <Card key={post.id} className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-white/20 dark:border-gray-700/50 hover:shadow-lg transition-shadow">
                                            <CardHeader className="p-4 md:p-6">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex gap-2 md:gap-3 min-w-0 flex-1">
                                                        <Avatar className="w-10 h-10 md:w-12 md:h-12 shrink-0">
                                                            <AvatarImage src={post.avatar || undefined} />
                                                            <AvatarFallback>{post.author[0]}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <h4 className="truncate">{post.author}</h4>
                                                                {post.trending && (
                                                                    <Badge className="gap-1 shrink-0" variant="secondary">
                                                                        <span className="hidden sm:inline">Trending</span>
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-muted-foreground truncate">{post.role}</p>
                                                            <p className="text-xs text-muted-foreground">{post.time}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="px-4 md:px-6">
                                                <p className="whitespace-pre-line mb-3 text-sm md:text-base">{post.content}</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {post.tags.map(tag => (
                                                        <Badge key={tag} className="backdrop-blur-sm bg-blue-500/10 border-blue-500/20 text-xs" variant="outline">
                                                            #{tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    );
}