import { Link } from "react-router-dom";
import { use, useEffect, useState } from "react";
import { AppNavbar } from "./AppNavbar";
import { authService } from "../api/services/auth.service";
import { AppSidebar } from "./AppSidebar";
import { UserProfileResponse } from "../interfaces/user";
import { Pencil } from "lucide-react";

export function MyProfile () {

  const [darkMode, setDarkMode] = useState(false);
  const [activeSection, setActiveSection] = useState('feed');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileData, setProfileData] = useState<UserProfileResponse | null>(null);

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleSidebarCollapse = () => setSidebarCollapsed(!sidebarCollapsed);
  const toggleMobileSidebar = () => setMobileSidebarOpen(!mobileSidebarOpen);

  const handleEdit = (field: string) => {
    console.log(`Editing ${field}`);
    // Aquí irá la lógica de edición
  };

  const handleLogout = async () => {
    await authService.logoutUser();
    window.location.href = '/';
  };

    useEffect(() => {
    const data: string = localStorage.getItem('currentUser') ?? '';
    console.warn(data);
    if (data) {
      const parsedData: UserProfileResponse = JSON.parse(data) as UserProfileResponse;
      setProfileData(parsedData);
    }
  }, []);

    return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 ${darkMode ? 'dark' : ''}`}> 
        {/* Animated Background */}
        <div className="fixed inset-0 z-0 overflow-hidden">
            {/* Animated circles */}
            <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full opacity-100 test-animation" />
        </div>

        <AppNavbar 
            darkMode={darkMode} 
            toggleDarkMode={toggleDarkMode} 
            onLogout={handleLogout}
            onMobileMenuToggle={toggleMobileSidebar}
        />
        
        {/* Sidebar - SIN el contenedor extra */}
        <div className="hidden md:block fixed left-0 top-16">
            <AppSidebar 
                activeSection={activeSection} 
                onSectionChange={setActiveSection}
                collapsed={sidebarCollapsed}
                onToggleCollapse={toggleSidebarCollapse}
            />
        </div>

        {/* Main Content area */}
        <div className="flex flex-col items-center justify-center py-2 w-full relative">
            {/* Profile Photo */}
            <div className="mb-1 relative group">
                <img 
                    src={profileData?.profilePhotoUrl ?? 'https://www.diariodemexico.com/sites/default/files/styles/max_width_770px/public/2024-02/ye.jpg?itok=vVaQ0qoK'} 
                    alt="Profile" 
                    style={{ width: '300px', height: '300px', objectFit: 'cover', borderRadius: '50%' }}
                    className="border-4 border-gray-300 dark:border-gray-600"
                />
                <button 
                    onClick={() => handleEdit('profilePhoto')}
                    className="absolute bottom-2 right-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:bg-gray-700 p-2 rounded-full shadow-lg transition-all"
                    title="Edit profile photo"
                >
                    <Pencil className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
            </div>
            <h1 className="text-gray-900 dark:text-white text-2xl">
                <strong>{profileData?.firstName ??  'John'} {profileData?.lastName ?? 'Doe'}</strong>
            </h1>
            <div className="flex items-center gap-2">
                <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-300">
                    {profileData?. jobTitle ?? 'No job title'}
                </span>
                <button 
                    onClick={() => handleEdit('jobTitle')}
                    className="hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:bg-gray-800 p-1 rounded transition-all"
                    title="Edit job title"
                >
                    <Pencil className="w-4 h-4 text-gray-500 dark:text-gray-400 dark:text-gray-400" />
                </button>
            </div>
        </div>
            <div className="flex justify-center items-start px-4 pb-2 w-full">
                {/** Bloque superior */}
                <div className="flex w-full gap-4 justify-center max-w-4xl bg-white/90 dark:bg-gray-800/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-lg shadow-lg p-4 border border-white/20 dark:border-gray-700/50">
                
                    {/* Mitad izquierda - Contacto y Emergencia */}
                    <div className="w-1/2 flex flex-col gap-3">
                        {/* Datos de Contacto */}
                        <div className="flex flex-col gap-1 w-full">
                            <span className="text-gray-900 dark:text-white"><strong>Contact Information:</strong></span>
                            <div className="flex flex-col gap-0.5">
                                <div className="flex justify-between gap-1.5 items-center">
                                    <span className="text-gray-600">Phone:</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-400">{profileData?.phone ?? 'N/A'}</span>
                                        <button 
                                            onClick={() => handleEdit('phone')}
                                            className="hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded transition-all"
                                            title="Edit phone"
                                        >
                                            <Pencil className="w-3 h-3 text-gray-500" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex justify-between gap-1.5 items-center">
                                    <span className="text-gray-600">Country:</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-400">{profileData?.country ?? 'N/A'}</span>
                                        <button 
                                            onClick={() => handleEdit('country')}
                                            className="hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded transition-all"
                                            title="Edit country"
                                        >
                                            <Pencil className="w-3 h-3 text-gray-500" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex justify-between gap-1.5 items-center">
                                    <span className="text-gray-600">City:</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-400">{profileData?.city ?? 'N/A'}</span>
                                        <button 
                                            onClick={() => handleEdit('city')}
                                            className="hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded transition-all"
                                            title="Edit city"
                                        >
                                            <Pencil className="w-3 h-3 text-gray-500" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex justify-between gap-1.5 items-center">
                                    <span className="text-gray-600">Address:</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-400">{profileData?.address ?? 'N/A'}</span>
                                        <button 
                                            onClick={() => handleEdit('address')}
                                            className="hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded transition-all"
                                            title="Edit address"
                                        >
                                            <Pencil className="w-3 h-3 text-gray-500" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex justify-between gap-1.5 items-center">
                                    <span className="text-gray-600">Postal Code:</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-400">{profileData?.postalCode ?? 'N/A'}</span>
                                        <button 
                                            onClick={() => handleEdit('postalCode')}
                                            className="hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded transition-all"
                                            title="Edit postal code"
                                        >
                                            <Pencil className="w-3 h-3 text-gray-500" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contacto de Emergencia */}
                        <div className="flex flex-col gap-1 w-full">
                            <span className="text-gray-900 dark:text-white"><strong>Emergency Contact:</strong></span>
                            <div className="flex flex-col gap-0.5">
                                <div className="flex justify-between gap-1.5 items-center">
                                    <span className="text-gray-600">Name:</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-400">{profileData?.emergencyContact ?? 'N/A'}</span>
                                        <button 
                                            onClick={() => handleEdit('emergencyContact')}
                                            className="hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded transition-all"
                                            title="Edit emergency contact name"
                                        >
                                            <Pencil className="w-3 h-3 text-gray-500" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex justify-between gap-1.5 items-center">
                                    <span className="text-gray-600">Phone:</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-400">{profileData?.emergencyPhone ?? 'N/A'}</span>
                                        <button 
                                            onClick={() => handleEdit('emergencyPhone')}
                                            className="hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded transition-all"
                                            title="Edit emergency phone"
                                        >
                                            <Pencil className="w-3 h-3 text-gray-500" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Mitad derecha - Información Profesional */}
                    <div className="w-1/2 flex flex-col gap-3">
                        {/* Bio y Department */}
                        <div className="flex flex-col gap-1 w-full">
                            <div className="flex justify-between gap-1.5 items-center">
                                <span className="text-gray-900 dark:text-white"><strong>Bio:</strong></span>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400">{profileData?.bio ?? 'No bio yet'}</span>
                                    <button 
                                        onClick={() => handleEdit('bio')}
                                        className="hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded transition-all"
                                        title="Edit bio"
                                    >
                                        <Pencil className="w-3 h-3 text-gray-500" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-between gap-1.5 items-center">
                                <span className="text-gray-900 dark:text-white"><strong>Department:</strong></span>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400">{profileData?.department ?? 'No department yet'}</span>
                                    <button 
                                        onClick={() => handleEdit('department')}
                                        className="hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded transition-all"
                                        title="Edit department"
                                    >
                                        <Pencil className="w-3 h-3 text-gray-500" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Experience */}
                        <div className="flex flex-col gap-1 w-full">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-900 dark:text-white"><strong>Experience:</strong></span>
                                <button 
                                    onClick={() => handleEdit('experiences')}
                                    className="hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded transition-all"
                                    title="Edit experiences"
                                >
                                    <Pencil className="w-4 h-4 text-gray-500" />
                                </button>
                            </div>
                            {profileData?.experiences && profileData.experiences.length > 0 ? (
                                <div className="flex flex-col gap-2">
                                    {profileData.experiences.map((exp) => (
                                        <div key={exp.id} className="flex flex-col gap-0.5 border-l-2 border-gray-300 dark:border-gray-600 pl-2">
                                            <span className="text-gray-800 dark:text-gray-200 font-medium text-sm">{exp.jobTitle}</span>
                                            <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 text-sm">{exp.companyName}</span>
                                            <span className="text-gray-400 dark:text-gray-500 dark:text-gray-400 text-xs">
                                                {new Date(exp.startDate).getFullYear()} - {exp.isCurrent ? 'Present' : new Date(exp.endDate!).getFullYear()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <span className="text-gray-400">No experience added</span>
                            )}
                        </div>

                        {/* Education */}
                        <div className="flex flex-col gap-1 w-full">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-900 dark:text-white"><strong>Education:</strong></span>
                                <button 
                                    onClick={() => handleEdit('educations')}
                                    className="hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded transition-all"
                                    title="Edit education"
                                >
                                    <Pencil className="w-4 h-4 text-gray-500" />
                                </button>
                            </div>
                            {profileData?.educations && profileData.educations.length > 0 ? (
                                <div className="flex flex-col gap-2">
                                    {profileData.educations.map((edu) => (
                                        <div key={edu.id} className="flex flex-col gap-0.5 border-l-2 border-gray-300 dark:border-gray-600 pl-2">
                                            <span className="text-gray-800 dark:text-gray-200 font-medium text-sm">{edu.degree}</span>
                                            <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 text-sm">{edu.school}</span>
                                            <span className="text-gray-400 dark:text-gray-500 dark:text-gray-400 text-xs">
                                                {new Date(edu.startDate).getFullYear()} - {edu.isCurrent ? 'Present' : new Date(edu.endDate!).getFullYear()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <span className="text-gray-400">No education added</span>
                            )}
                        </div>

                        {/* Skills */}
                        <div className="flex flex-col gap-1 w-full">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-900 dark:text-white"><strong>Skills:</strong></span>
                                <button 
                                    onClick={() => handleEdit('skills')}
                                    className="hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded transition-all"
                                    title="Edit skills"
                                >
                                    <Pencil className="w-4 h-4 text-gray-500" />
                                </button>
                            </div>
                            {profileData?.skills && profileData.skills.length > 0 ? (
                                <div className="flex flex-col gap-0.5">
                                    {profileData.skills.map((skill) => (
                                        <div key={skill.id} className="flex justify-between items-center">
                                            <span className="text-gray-600">{skill.name}</span>
                                            <span className="text-gray-400 dark:text-gray-500 dark:text-gray-400 text-sm">{skill.proficiency || 'N/A'}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <span className="text-gray-400">No skills added</span>
                            )}
                        </div>

                        {/* Languages */}
                        <div className="flex flex-col gap-1 w-full">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-900 dark:text-white"><strong>Languages:</strong></span>
                                <button 
                                    onClick={() => handleEdit('languages')}
                                    className="hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded transition-all"
                                    title="Edit languages"
                                >
                                    <Pencil className="w-4 h-4 text-gray-500" />
                                </button>
                            </div>
                            {profileData?.languages && profileData.languages.length > 0 ? (
                                <div className="flex flex-col gap-0.5">
                                    {profileData.languages.map((lang) => (
                                        <div key={lang.id} className="flex justify-between items-center">
                                            <span className="text-gray-600">{lang.language}</span>
                                            <span className="text-gray-400 dark:text-gray-500 dark:text-gray-400 text-sm">{lang.proficiency}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <span className="text-gray-400">No languages added</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
    )
}

