export interface Experience {
  id: string;
  profileId: string;
  companyName: string;
  jobTitle: string;
  description: string | null;
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'FREELANCE' | 'INTERN';
  experienceLevel: 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD' | 'PRINCIPAL' | null;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  location: string | null;
  skills: string[];
  achievements: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Education {
  id: string;
  profileId: string;
  school: string;
  degree: string;
  fieldOfStudy: string;
  grade: string | null;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  description: string | null;
  skills: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Skill {
  id: string;
  profileId: string;
  name: string;
  proficiency: 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD' | 'PRINCIPAL' | null;
  yearsOfExperience: number | null;
  endorsements: number;
  createdAt: string;
  updatedAt: string;
}

export interface Certification {
  id: string;
  profileId: string;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expirationDate: string | null;
  certificateUrl: string | null;
  certificateId: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LanguageProficiency {
  id: string;
  profileId: string;
  language: string;
  proficiency: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileResponse {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  jobTitle?: string | null;
  department?: string | null;
  bio?: string | null;
  profilePhotoUrl?: string | null;
  profilePhotoKey?: string | null;
  phone?: string | null;
  emergencyContact?: string | null;
  emergencyPhone?: string | null;
  country?: string | null;
  city?: string | null;
  address?: string | null;
  postalCode?: string | null;
  timezone?: string | null;
  language?: string | null;
  createdAt: string;
  updatedAt: string;
  experiences?: Experience[];
  educations?: Education[];
  skills?: Skill[];
  certifications?: Certification[];
  languages?: LanguageProficiency[];
}
