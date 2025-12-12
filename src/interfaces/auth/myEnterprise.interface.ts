// Enums según tu schema.prisma
type JoinRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
type ResourceType =
  | 'USERS'
  | 'ROLES'
  | 'PERMISSIONS'
  | 'AUDIT_LOGS'
  | 'SETTINGS'
  | 'ENTERPRISE'
  | 'USER_RELATIONSHIPS';

export interface EnterpriseUserProfilePreview {
  firstName: string;
  lastName: string;
  profilePhotoUrl: string | null;
  jobTitle: string | null;
}

export interface EnterpriseUserBasic {
  id: string;       
  email: string;    
  profile: EnterpriseUserProfilePreview | null;
}

export interface EnterpriseUserMembership {
  id: string;              
  userId: string;
  enterpriseId: string;
  isOwner: boolean;
  joinedAt: string;         
  user: EnterpriseUserBasic;
}

export interface EnterpriseUsersCount {
  users: number;
}

export interface EnterpriseWithUsers {
  id: string;
  name: string;
  description: string | null;
  logo: string | null;
  website: string | null;
  isActive: boolean;
  createdAt: string;       
  updatedAt: string;       
  users: EnterpriseUserMembership[];
  _count: EnterpriseUsersCount;
}

export interface GetMyEnterpriseResponse {
  hasEnterprise: boolean;
  isOwner: boolean;
  enterprise: EnterpriseWithUsers | null;
  joinedAt: string | null;  
}
