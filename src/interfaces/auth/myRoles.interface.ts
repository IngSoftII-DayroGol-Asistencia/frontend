type PermissionAction = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'MANAGE';
type ResourceType =
  | 'USERS'
  | 'ROLES'
  | 'PERMISSIONS'
  | 'AUDIT_LOGS'
  | 'SETTINGS'
  | 'ENTERPRISE'
  | 'USER_RELATIONSHIPS';

interface RolePermission {
  id: string;
  name: string;
  description: string | null;
  action: PermissionAction;
  resource: ResourceType;
  createdAt: string;  // ISO datetime
  updatedAt: string;  // ISO datetime
}

export interface UserRole {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  isCustom: boolean;
  enterpriseId: string;
  createdAt: string;  // ISO datetime
  updatedAt: string;  // ISO datetime
  permissions: RolePermission[];
}

export interface GetMyRolesResponse {
  id: string;        // user id
  email: string;
  roles: UserRole[];
  isOwner: boolean;
}