// Enums tomados del schema.prisma
type PermissionAction = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'MANAGE';
type ResourceType =
  | 'USERS'
  | 'ROLES'
  | 'PERMISSIONS'
  | 'AUDIT_LOGS'
  | 'SETTINGS'
  | 'ENTERPRISE'
  | 'USER_RELATIONSHIPS';

export interface CreateRoleInput {
  name: string;
  description?: string;       
  permissionIds: string[];    
}

export interface AssignRoleInput {
  userId: string;
  roleId: string;
}

export interface PermissionResponse {
  id: string;
  name: string;
  description: string | null;
  action: PermissionAction;
  resource: ResourceType;
  createdAt: string;          
  updatedAt: string;          
}

export interface CreateRoleResponse {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  isCustom: boolean;
  enterpriseId: string;
  createdAt: string;          
  updatedAt: string;          
  permissions: PermissionResponse[];
}

interface RoleUsersCount {
  users: number;
}

interface CreateRoleWithCountResponse extends CreateRoleResponse {
  _count: RoleUsersCount;
}

export type GetRolesResponse = CreateRoleWithCountResponse[];
