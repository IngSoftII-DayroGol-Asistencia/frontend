type PermissionAction = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'MANAGE';
type ResourceType =
  | 'USERS'
  | 'ROLES'
  | 'PERMISSIONS'
  | 'AUDIT_LOGS'
  | 'SETTINGS'
  | 'ENTERPRISE'
  | 'USER_RELATIONSHIPS';

export interface PermissionResponse {
  id: string;
  name: string;
  description: string | null;
  action: PermissionAction;
  resource: ResourceType;
  createdAt: string; // ISO DateTime
  updatedAt: string; // ISO DateTime
}
