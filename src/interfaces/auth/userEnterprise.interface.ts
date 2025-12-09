export interface UserEnterprise {
  id: string;
  userId: string;
  enterpriseId: string;
  isOwner: boolean;
  joinedAt: string;           // DateTime ISO
}

export interface EnterprisePermission {
  id: string;
  enterpriseId: string;
  permissionId: string;
  grantedBy: string;
  grantedAt: string;          // DateTime ISO
  expiresAt: string | null;   // DateTime ISO
}

export interface UserEnterpriseResponse {
  id: string;
  email: string;
  password: string;           // hash
  phone: string | null;
  isActive: boolean;
  isVerified: boolean;
  lastLogin: string | null;   // DateTime ISO
  createdAt: string;          // DateTime ISO
  updatedAt: string;          // DateTime ISO
  enterprises: UserEnterprise[];
  enterprisePermissions: EnterprisePermission[];
}
