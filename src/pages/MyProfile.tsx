import type { ChangeEvent } from "react";
import { useEffect, useState } from "react";
import { AppNavbar } from "../components/AppNavbar";
import { authService } from "../api/services/auth.service";
import { AppSidebar } from "../components/AppSidebar";
import type { Education, Experience, LanguageProficiency, Skill, UserProfileResponse } from "../interfaces/user";
import { Calendar, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Post } from "../contents/FeedContent";
import { Card, CardHeader, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

interface InlineInputProps {
    name: string;
    value: string | undefined | null;
    placeholder: string;
    isEditing: boolean;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    className?: string;
}

const InlineInput = ({ name, value, placeholder, isEditing, onChange, className = "" }: InlineInputProps) => {
    if (!isEditing) {
        return <span className={`text-gray-400 truncate ${className}`}>{value || 'N/A'}</span>;
    }
    return (
        <input
            className={`bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-0.5 text-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 ${className}`}
            name={name}
            placeholder={placeholder}
            type="text"
            value={value || ''}
            onChange={onChange}
        />
    );
};

const formatDateForInput = (isoDate: string | null | undefined): string => {
    if (!isoDate) { return ""; }
    return isoDate.split("T")[0];
};

export function MyProfile() {
    const [darkMode, setDarkMode] = useState<boolean>(() => {
        try {
            return localStorage.getItem('darkMode') === 'true';
        } catch (e) {
            return false;
        }
    });
    const [activeSection, setActiveSection] = useState('feed');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    const [profileData, setProfileData] = useState<UserProfileResponse | null>(null);
    const [formData, setFormData] = useState<UserProfileResponse | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    const [newSkillName, setNewSkillName] = useState("");
    const [newLangName, setNewLangName] = useState("");
    const [newLangProf, setNewLangProf] = useState("Intermediate");

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
        const data: string = localStorage.getItem('currentUser') ?? '';
        if (data) {
            try {
                const parsedData: UserProfileResponse = JSON.parse(data) as UserProfileResponse;
                console.warn(parsedData);
                setProfileData(parsedData);
                setFormData(parsedData);
            } catch (error) {
                console.error("Error parsing user data", error);
            }
        }
    }, []);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (formData) {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleEdit = () => {
        setFormData(JSON.parse(JSON.stringify(profileData)));
        setIsEditing(true);
    };

    const handleCancel = () => {
        setFormData(profileData);
        setIsEditing(false);
        setNewSkillName("");
        setNewLangName("");
    };

    const handleSave = async () => {
        if (formData) {
            setProfileData(formData);
            setIsEditing(false);
            await authService.updateMyUser(formData)
            localStorage.setItem('currentUser', JSON.stringify(formData));
        }
    };

    const handleExperienceChange = (index: number, field: keyof Experience, value: string | boolean | null) => {
        if (!formData?.experiences) { return; }
        const newExperiences = [...formData.experiences];

        if (field === 'isCurrent' && value === true) {
            newExperiences[index] = { ...newExperiences[index], isCurrent: true, endDate: null };
        } else {
            newExperiences[index] = { ...newExperiences[index], [field]: value };
        }

        setFormData({ ...formData, experiences: newExperiences });
    };

    const handleAddExperience = () => {
        if (!formData) { return; }
        const newExp: Experience = {
            id: Date.now().toString(),
            profileId: formData.id,
            jobTitle: "New Position",
            companyName: "Company Name",
            description: "",
            employmentType: "FULL_TIME",
            experienceLevel: "MID",
            startDate: new Date().toISOString(),
            endDate: null,
            isCurrent: true,
            location: "",
            skills: [],
            achievements: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        setFormData({ ...formData, experiences: [...(formData.experiences || []), newExp] });
    };

    const handleRemoveExperience = (index: number) => {
        if (!formData?.experiences) { return; }
        const newExp = formData.experiences.filter((_, i) => i !== index);
        setFormData({ ...formData, experiences: newExp });
    };

    const handleEducationChange = (index: number, field: keyof Education, value: string | boolean | null) => {
        if (!formData?.educations) { return; }
        const newEdu = [...formData.educations];

        if (field === 'isCurrent' && value === true) {
            newEdu[index] = { ...newEdu[index], isCurrent: true, endDate: null };
        } else {
            newEdu[index] = { ...newEdu[index], [field]: value };
        }

        setFormData({ ...formData, educations: newEdu });
    };

    const handleAddEducation = () => {
        if (!formData) { return; }
        const newEdu: Education = {
            id: Date.now().toString(),
            profileId: formData.id,
            school: "University Name",
            degree: "Degree Name",
            fieldOfStudy: "Field",
            grade: null,
            startDate: new Date().toISOString(),
            endDate: null,
            isCurrent: false,
            description: null,
            skills: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        setFormData({ ...formData, educations: [...(formData.educations || []), newEdu] });
    };

    const handleRemoveEducation = (index: number) => {
        if (!formData?.educations) { return; }
        const newEdu = formData.educations.filter((_, i) => i !== index);
        setFormData({ ...formData, educations: newEdu });
    };

    const handleRemoveSkill = (indexToRemove: number) => {
        if (!formData) { return; }
        const updatedSkills = formData.skills ? formData.skills.filter((_, index) => index !== indexToRemove) : [];
        setFormData({ ...formData, skills: updatedSkills });
    };

    const handleAddSkill = () => {
        if (!formData || !newSkillName.trim()) { return; }
        const newSkillObj: Skill = {
            id: Date.now().toString(),
            profileId: formData.id,
            name: newSkillName,
            proficiency: "JUNIOR",
            yearsOfExperience: 1,
            endorsements: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        setFormData({ ...formData, skills: [...(formData.skills || []), newSkillObj] });
        setNewSkillName("");
    };

    const handleRemoveLang = (indexToRemove: number) => {
        if (!formData) { return; }
        const updatedLangs = formData.languages ? formData.languages.filter((_, index) => index !== indexToRemove) : [];
        setFormData({ ...formData, languages: updatedLangs });
    };

    const handleAddLang = () => {
        if (!formData || !newLangName.trim()) { return; }
        const newLangObj: LanguageProficiency = {
            id: Date.now().toString(),
            profileId: formData.id,
            language: newLangName,
            proficiency: newLangProf,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        setFormData({ ...formData, languages: [...(formData.languages || []), newLangObj] });
        setNewLangName("");
    };

    const mockPosts: Post[] = [
        {
            id: 101,
            author: profileData ? `${profileData.firstName} ${profileData.lastName}` : "Me",
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
            author: profileData ? `${profileData.firstName} ${profileData.lastName}` : "Me",
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
                <div className={`hidden md:block relative z-10 md:self-start transition-all duration-300 border-r border-white/20 dark:border-gray-700/50 ${sidebarCollapsed ? 'w-16' : 'w-64'} shrink-0`}>
                    <AppSidebar
                        activeSection={activeSection}
                        collapsed={sidebarCollapsed}
                        onSectionChange={handleSidebarNavigation}
                        onToggleCollapse={toggleSidebarCollapse}
                    />
                </div>

                {/* Main Content area */}
                <div className="flex-1 flex flex-col items-center justify-center py-2 relative overflow-y-auto pb-20">

                    {/* BOTONES FLOTANTES */}
                    {isEditing && (
                        <div className="fixed top-20 right-4 z-[60] flex gap-2 animate-fade-in-down">
                            <button className="flex items-center gap-1 px-4 py-2 bg-white dark:bg-gray-800 text-red-500 border border-red-200 dark:border-red-900 rounded-full shadow-lg hover:bg-red-50 transition-all" onClick={handleCancel}>
                                <X size={18} /> <span className="font-medium">Cancel</span>
                            </button>
                            <button className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-black rounded-full shadow-lg hover:bg-blue-700 transition-all" onClick={handleSave}>
                                <Save size={18} /> <span className="font-medium">Save</span>
                            </button>
                        </div>
                    )}

                    {/* Profile Photo */}
                    <div className="mb-1 relative group mt-16">
                        <img
                            alt="Profile"
                            className="border-4 border-gray-300 dark:border-gray-600"
                            src={profileData?.profilePhotoUrl ?? 'https://www.diariodemexico.com/sites/default/files/styles/max_width_770px/public/2024-02/ye.jpg?itok=vVaQ0qoK'}
                            style={{ width: '300px', height: '300px', objectFit: 'cover', borderRadius: '50%' }}
                        />
                        {!isEditing && (
                            <button className="absolute bottom-2 right-2 bg-white dark:bg-gray-800 hover:bg-gray-100 p-2 rounded-full shadow-lg transition-all" onClick={handleEdit}>
                                <Pencil className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                            </button>
                        )}
                    </div>

                    <h1 className="text-gray-900 dark:text-white text-2xl mt-2">
                        <strong>{profileData?.firstName ?? 'John'} {profileData?.lastName ?? 'Doe'}</strong>
                    </h1>

                    <div className="flex items-center gap-2 mt-1 h-8 mb-6">
                        {isEditing ? (
                            <input
                                className="text-center bg-transparent border-b border-gray-400 focus:outline-none dark:text-gray-300 placeholder-gray-400"
                                name="jobTitle"
                                placeholder="Job Title"
                                value={formData?.jobTitle ?? ''}
                                onChange={handleChange}
                            />
                        ) : (
                            <span className="text-gray-600 dark:text-gray-400 text-lg">
                                {profileData?.jobTitle ?? 'No job title'}
                            </span>
                        )}
                    </div>

                    <div className="w-full max-w-4xl px-4">
                        <Tabs defaultValue="profile" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-6">
                                <TabsTrigger value="profile">Profile</TabsTrigger>
                                <TabsTrigger value="posts">Posts</TabsTrigger>
                            </TabsList>

                            <TabsContent value="profile">
                                <div className="flex flex-col md:flex-row w-full gap-4 justify-center bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-lg shadow-lg p-6 border border-white/20 dark:border-gray-700/50">

                                    {/* COLUMNA IZQUIERDA */}
                                    <div className="w-full md:w-1/2 flex flex-col gap-6">
                                        {/* Contact Info */}
                                        <div className="flex flex-col gap-2 w-full">
                                            <span className="text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-1"><strong>Contact Information:</strong></span>
                                            <div className="flex flex-col gap-2">
                                                <div className="flex justify-between gap-1.5 items-center h-8">
                                                    <span className="text-gray-600 dark:text-gray-300">Phone:</span>
                                                    <InlineInput className="text-right w-40" isEditing={isEditing} name="phone" placeholder="N/A" value={formData?.phone} onChange={handleChange} />
                                                </div>
                                                <div className="flex justify-between gap-1.5 items-center h-8">
                                                    <span className="text-gray-600 dark:text-gray-300">Country:</span>
                                                    <InlineInput className="text-right w-40" isEditing={isEditing} name="country" placeholder="N/A" value={formData?.country} onChange={handleChange} />
                                                </div>
                                                <div className="flex justify-between gap-1.5 items-center h-8">
                                                    <span className="text-gray-600 dark:text-gray-300">City:</span>
                                                    <InlineInput className="text-right w-40" isEditing={isEditing} name="city" placeholder="N/A" value={formData?.city} onChange={handleChange} />
                                                </div>
                                                <div className="flex justify-between gap-1.5 items-center h-8">
                                                    <span className="text-gray-600 dark:text-gray-300">Address:</span>
                                                    <InlineInput className="text-right w-40" isEditing={isEditing} name="address" placeholder="N/A" value={formData?.address} onChange={handleChange} />
                                                </div>
                                                <div className="flex justify-between gap-1.5 items-center h-8">
                                                    <span className="text-gray-600 dark:text-gray-300">Postal Code:</span>
                                                    <InlineInput className="text-right w-40" isEditing={isEditing} name="postalCode" placeholder="N/A" value={formData?.postalCode} onChange={handleChange} />
                                                </div>
                                            </div>
                                        </div>

            fle                         {/* Emergency Contact */}
                                        <div className="flex flex-col gap-2 w-full">
                                            <span className="text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-1"><strong>Emergency Contact:</strong></span>
                                            <div className="flex flex-col gap-2">
                                                <div className="flex justify-between gap-1.5 items-center h-8">
                                                    <span className="text-gray-600 dark:text-gray-300">Name:</span>
                                                    <InlineInput className="text-right w-40" isEditing={isEditing} name="emergencyContact" placeholder="N/A" value={formData?.emergencyContact} onChange={handleChange} />
                                                </div>
                                                <div className="flex justify-between gap-1.5 items-center h-8">
                                                    <span className="text-gray-600 dark:text-gray-300">Phone:</span>
                                                    <InlineInput className="text-right w-40" isEditing={isEditing} name="emergencyPhone" placeholder="N/A" value={formData?.emergencyPhone} onChange={handleChange} />
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
                                                {isEditing ? (
                                                    <textarea
                                                        className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded p-2 text-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                                                        name="bio"
                                                        placeholder="Tell us about yourself..."
                                                        rows={4}
                                                        value={formData?.bio ?? ''}
                                                        onChange={handleChange}
                                                    />
                                                ) : (
                                                    <span className="text-gray-400 text-sm italic">{profileData?.bio || 'No bio yet'}</span>
                                                )}
                                            </div>
                                            <div className="flex justify-between gap-1.5 items-center h-8 border-t border-gray-200 dark:border-gray-700 pt-2">
                                                <span className="text-gray-900 dark:text-white"><strong>Department:</strong></span>
                                                <InlineInput className="text-right w-40" isEditing={isEditing} name="department" placeholder="N/A" value={formData?.department} onChange={handleChange} />
                                            </div>
                                        </div>

                                        {/* --- EXPERIENCE EDITABLE CON FECHAS --- */}
                                        <div className="flex flex-col gap-2 w-full">
                                            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-1">
                                                <span className="text-gray-900 dark:text-white"><strong>Experience:</strong></span>
                                            </div>

                                            <div className="flex flex-col gap-4">
                                                {(isEditing ? formData?.experiences : profileData?.experiences)?.map((exp, index) => (
                                                    <div key={exp.id || index} className="flex flex-col gap-1 border-l-2 border-blue-300 dark:border-blue-600 pl-3 relative group">
                                                        {isEditing ? (
                                                            <>
                                                                <button className="absolute -right-2 top-0 text-red-400 hover:text-red-600" onClick={() => handleRemoveExperience(index)}>
                                                                    <Trash2 size={14} />
                                                                </button>

                                                                <input
                                                                    className="font-semibold text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-1 w-full mb-1"
                                                                    placeholder="Job Title"
                                                                    value={exp.jobTitle}
                                                                    onChange={(e) => handleExperienceChange(index, 'jobTitle', e.target.value)}
                                                                />
                                                                <input
                                                                    className="text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-1 w-full mb-1"
                                                                    placeholder="Company"
                                                                    value={exp.companyName}
                                                                    onChange={(e) => handleExperienceChange(index, 'companyName', e.target.value)}
                                                                />

                                                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                                                    <div className="flex items-center gap-1">
                                                                        <span className="text-xs text-gray-500">Start:</span>
                                                                        <input
                                                                            className="text-xs bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-1"
                                                                            type="date"
                                                                            value={formatDateForInput(exp.startDate)}
                                                                            onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
                                                                        />
                                                                    </div>

                                                                    <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 cursor-pointer select-none">
                                                                        <input
                                                                            checked={exp.isCurrent}
                                                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                                            type="checkbox"
                                                                            onChange={(e) => handleExperienceChange(index, 'isCurrent', e.target.checked)}
                                                                        />
                                                                        Present
                                                                    </label>

                                                                    {!exp.isCurrent && (
                                                                        <div className="flex items-center gap-1">
                                                                            <span className="text-xs text-gray-500">End:</span>
                                                                            <input
                                                                                className="text-xs bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-1"
                                                                                type="date"
                                                                                value={formatDateForInput(exp.endDate)}
                                                                                onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span className="text-gray-800 dark:text-gray-200 font-semibold text-sm">{exp.jobTitle}</span>
                                                                <span className="text-gray-600 dark:text-gray-400 text-sm">{exp.companyName}</span>
                                                                <span className="text-gray-400 dark:text-gray-500 text-xs flex items-center gap-1">
                                                                    <Calendar size={12} />
                                                                    {new Date(exp.startDate).getFullYear()} - {exp.isCurrent ? 'Present' : (exp.endDate ? new Date(exp.endDate).getFullYear() : '')}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                ))}
                                                {isEditing && (
                                                    <button className="text-blue-500 text-sm flex items-center gap-1 hover:underline mt-1" onClick={handleAddExperience}>
                                                        <Plus size={14} /> Add Position
                                                    </button>
                                                )}
                                                {!isEditing && (!profileData?.experiences || profileData.experiences.length === 0) && (
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
                                                {(isEditing ? formData?.educations : profileData?.educations)?.map((edu, index) => (
                                                    <div key={edu.id || index} className="flex flex-col gap-1 border-l-2 border-green-300 dark:border-green-600 pl-3 relative">
                                                        {isEditing ? (
                                                            <>
                                                                <button className="absolute -right-2 top-0 text-red-400 hover:text-red-600" onClick={() => handleRemoveEducation(index)}>
                                                                    <Trash2 size={14} />
                                                                </button>

                                                                <input
                                                                    className="font-semibold text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-1 w-full mb-1"
                                                                    placeholder="Degree"
                                                                    value={edu.degree}
                                                                    onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                                                                />
                                                                <input
                                                                    className="text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-1 w-full mb-1"
                                                                    placeholder="School"
                                                                    value={edu.school}
                                                                    onChange={(e) => handleEducationChange(index, 'school', e.target.value)}
                                                                />

                                                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                                                    <div className="flex items-center gap-1">
                                                                        <span className="text-xs text-gray-500">Start:</span>
                                                                        <input
                                                                            className="text-xs bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-1"
                                                                            type="date"
                                                                            value={formatDateForInput(edu.startDate)}
                                                                            onChange={(e) => handleEducationChange(index, 'startDate', e.target.value)}
                                                                        />
                                                                    </div>

                                                                    <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 cursor-pointer select-none">
                                                                        <input
                                                                            checked={edu.isCurrent}
                                                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                                            type="checkbox"
                                                                            onChange={(e) => handleEducationChange(index, 'isCurrent', e.target.checked)}
                                                                        />
                                                                        Present
                                                                    </label>

                                                                    {!edu.isCurrent && (
                                                                        <div className="flex items-center gap-1">
                                                                            <span className="text-xs text-gray-500">End:</span>
                                                                            <input
                                                                                className="text-xs bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-1"
                                                                                type="date"
                                                                                value={formatDateForInput(edu.endDate)}
                                                                                onChange={(e) => handleEducationChange(index, 'endDate', e.target.value)}
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span className="text-gray-800 dark:text-gray-200 font-semibold text-sm">{edu.degree}</span>
                                                                <span className="text-gray-600 dark:text-gray-400 text-sm">{edu.school}</span>
                                                                <span className="text-gray-400 dark:text-gray-500 text-xs flex items-center gap-1">
                                                                    <Calendar size={12} />
                                                                    {new Date(edu.startDate).getFullYear()} - {edu.isCurrent ? 'Present' : (edu.endDate ? new Date(edu.endDate).getFullYear() : '')}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                ))}
                                                {isEditing && (
                                                    <button className="text-blue-500 text-sm flex items-center gap-1 hover:underline mt-1" onClick={handleAddEducation}>
                                                        <Plus size={14} /> Add Education
                                                    </button>
                                                )}
                                                {!isEditing && (!profileData?.educations || profileData.educations.length === 0) && (
                                                    <span className="text-gray-400 text-sm">No education added</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* --- SKILLS EDITABLES --- */}
                                        <div className="flex flex-col gap-2 w-full">
                                            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-1">
                                                <span className="text-gray-900 dark:text-white"><strong>Skills:</strong></span>
                                            </div>

                                            <div className="flex flex-col gap-1">
                                                {(isEditing ? formData?.skills : profileData?.skills)?.map((skill, index) => (
                                                    <div key={skill.id || index} className="flex justify-between items-center group">
                                                        <span className="text-gray-600 dark:text-gray-300">{skill.name}</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-gray-400 dark:text-gray-500 text-sm">{skill.proficiency || 'N/A'}</span>
                                                            {isEditing && (
                                                                <button className="text-red-400 hover:text-red-600 p-1 rounded" onClick={() => handleRemoveSkill(index)}>
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}

                                                {isEditing && (
                                                    <div className="mt-2 flex gap-2 items-center">
                                                        <input
                                                            className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 outline-none dark:text-white"
                                                            placeholder="New Skill..."
                                                            type="text"
                                                            value={newSkillName}
                                                            onChange={(e) => setNewSkillName(e.target.value)}
                                                            onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                                                        />
                                                        <button className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-1.5 rounded transition disabled:opacity-50" disabled={!newSkillName} onClick={handleAddSkill}>
                                                            <Plus size={16} />
                                                        </button>
                                                    </div>
                                                )}

                                                {!isEditing && (!profileData?.skills || profileData.skills.length === 0) && (
                                                    <span className="text-gray-400 text-sm">No skills added</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* --- IDIOMAS EDITABLES --- */}
                                        <div className="flex flex-col gap-2 w-full">
                                            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-1">
                                                <span className="text-gray-900 dark:text-white"><strong>Languages:</strong></span>
                                            </div>

                                            <div className="flex flex-col gap-1">
                                                {(isEditing ? formData?.languages : profileData?.languages)?.map((lang, index) => (
                                                    <div key={lang.id || index} className="flex justify-between items-center">
                                                        <span className="text-gray-600 dark:text-gray-300">{lang.language}</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-gray-400 dark:text-gray-500 text-sm">{lang.proficiency}</span>
                                                            {isEditing && (
                                                                <button className="text-red-400 hover:text-red-600 p-1 rounded" onClick={() => handleRemoveLang(index)}>
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}

                                                {isEditing && (
                                                    <div className="mt-2 flex gap-2 items-center">
                                                        <input
                                                            className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 outline-none dark:text-white"
                                                            placeholder="Language..."
                                                            type="text"
                                                            value={newLangName}
                                                            onChange={(e) => setNewLangName(e.target.value)}
                                                        />
                                                        <select
                                                            className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 outline-none dark:text-white w-24"
                                                            value={newLangProf}
                                                            onChange={(e) => setNewLangProf(e.target.value)}
                                                        >
                                                            <option value="Basic">Basic</option>
                                                            <option value="Intermediate">Intermediate</option>
                                                            <option value="Advanced">Advanced</option>
                                                            <option value="Native">Native</option>
                                                        </select>
                                                        <button className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-1.5 rounded transition disabled:opacity-50" disabled={!newLangName} onClick={handleAddLang}>
                                                            <Plus size={16} />
                                                        </button>
                                                    </div>
                                                )}

                                                {!isEditing && (!profileData?.languages || profileData.languages.length === 0) && (
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
                                                                    <Badge variant="secondary" className="gap-1 shrink-0">
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
                                                        <Badge key={tag} variant="outline" className="backdrop-blur-sm bg-blue-500/10 border-blue-500/20 text-xs">
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
