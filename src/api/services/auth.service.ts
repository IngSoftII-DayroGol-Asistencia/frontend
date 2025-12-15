import { apiClient } from "../client";
import type { CreateEnterpriseInput, EnterpriseCreationResponse, EnterpriseJoinRequestResponse, 
    HandleEnterpriseJoinRequestOutput, JoinRequestStatus, UserEnterpriseResponse, UserLoginInput, 
    UserLoginResponse, UserRegistrationInput, UserRegistrationResponse, PermissionResponse, 
    CreateRoleInput,
    CreateRoleResponse,
    GetRolesResponse, AssignRoleInput,
    GetMyEnterpriseResponse,
    GetMyRolesResponse} from "../../interfaces/auth";
import { ENDPOINTS } from "../endpoints";
import type { UserProfileResponse } from "../../interfaces/user";

export const authService ={
    async assignRoleToUser(data: AssignRoleInput): Promise<void> {
        const response = await apiClient.post<void>(ENDPOINTS.auth.roles.assignRoleToUser().url, data);
        return response;
    },

    async registerUser(userData: UserRegistrationInput): Promise<UserRegistrationResponse> {
        const response = await apiClient.post<UserRegistrationResponse>(ENDPOINTS.auth.auth.signup().url, userData);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return response;
    },

    async loginUser(userData: UserLoginInput){
        const response = await apiClient.post<UserLoginResponse>(ENDPOINTS.auth.auth.login().url, userData);
        localStorage.setItem('token', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        return response;
    },

    async logoutUser(){
        const response = await apiClient.post<void>(ENDPOINTS.auth.auth.logout().url).catch((error) => {
            console.error("Logout error:", error);
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('currentUser');
            localStorage.removeItem('myRoles');
            return;
        });
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('myRoles');
        return response;
    },

    async refreshToken(){
        const response = await apiClient.post<UserLoginResponse>(ENDPOINTS.auth.auth.refresh().url, {refreshToken: localStorage.getItem('refreshToken')});
        localStorage.setItem('token', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        return response;
    },

    async getCurrentUser(){
        const response = await apiClient.get<UserProfileResponse>(ENDPOINTS.auth.profile.getMyProfile().url);
        localStorage.setItem('currentUser', JSON.stringify(response));
        return response;
    },

    async updateMyUser(userData: UserProfileResponse){
        const response = await apiClient.patch<UserProfileResponse>(ENDPOINTS.auth.profile.updateMyProfile().url, userData);
        localStorage.setItem('currentUser', JSON.stringify(response));
        return response;
    },

    async getUserRelationEnterprise(enterpriseId: string){
        const response = await apiClient.get<UserEnterpriseResponse>(ENDPOINTS.auth.users.getId(enterpriseId).url);
        localStorage.setItem('userRelationEnterprise', JSON.stringify(response));
        return response;
    },

    async createEnterprise(data: CreateEnterpriseInput): Promise<EnterpriseCreationResponse> {
        const response = await apiClient.post<EnterpriseCreationResponse>(ENDPOINTS.auth.enterprise.create().url, data);
        return response;
    },
    
    async joinEnterprise(enterpriseId: string): Promise<UserEnterpriseResponse> {
        const response = await apiClient.post<UserEnterpriseResponse>(ENDPOINTS.auth.enterprise.joinEnterprise().url, { enterpriseId });
        return response;
    }, 

    async getEnterprise(enterpriseId: string): Promise<EnterpriseCreationResponse> {
        const response = await apiClient.get<EnterpriseCreationResponse>(ENDPOINTS.auth.enterprise.getById(enterpriseId).url);
        localStorage.setItem('currentEnterprise', JSON.stringify(response));
        return response;
    },

    async getPendingJoinRequests(enterpriseId: string): Promise<EnterpriseJoinRequestResponse[]> {
        const response = await apiClient.get<EnterpriseJoinRequestResponse[]>(ENDPOINTS.auth.enterprise.joinRequestEnterprise(enterpriseId).url);
        return response;
    },

    async processJoinRequest(requestId: string, approve: boolean): Promise<HandleEnterpriseJoinRequestOutput> {
        const action: JoinRequestStatus = approve ? 'APPROVE' : 'REJECT';
        const response = await apiClient.post<HandleEnterpriseJoinRequestOutput>(ENDPOINTS.auth.enterprise.handleJoinEnterprise().url, {
            requestId,
            action
        });
        return response;
    },

    async getUserProfile(userId: string): Promise<UserProfileResponse> {
        const response = await apiClient.get<UserProfileResponse>(ENDPOINTS.auth.profile.getUserById(userId).url);
        return response;
    },

    async revokeEnterprisePermission(permissionId: string): Promise<void> {
        const response = await apiClient.delete<void>(ENDPOINTS.auth.enterprisePermissions.revoke(permissionId).url);
        return response;
    },

    async seedEnterprisePermissions(): Promise<{message: string, count: number}> {
        const response = await apiClient.post<{message: string, count: number}>(ENDPOINTS.auth.enterprisePermissions.seedDefaults().url);
        return response;
    },

    async getEnterprisePermissionsForUsers(): Promise<PermissionResponse[]> {
        const response = await apiClient.get<PermissionResponse[]>(ENDPOINTS.auth.roles.getRolesPermissions().url);
        return response;
    },

    async createRolesEnterprise(data: CreateRoleInput): Promise<CreateRoleResponse> {
        const response = await apiClient.post<CreateRoleResponse>(ENDPOINTS.auth.roles.create().url, data);
        return response;
    },  

    async getRolesEnterprise(): Promise<GetRolesResponse> {
        const response = await apiClient.get<GetRolesResponse>(ENDPOINTS.auth.roles.getAll().url);
        return response;
    },

    async getMyEnterprise(): Promise<GetMyEnterpriseResponse> {
        const response = await apiClient.get<GetMyEnterpriseResponse>(ENDPOINTS.auth.enterprise.getActual().url);
        localStorage.setItem('myEnterprise', JSON.stringify(response));
        return response;
    },

    async getMyRoles(): Promise<GetMyRolesResponse> {
        const response = await apiClient.get<GetMyRolesResponse>(ENDPOINTS.auth.roles.getMine().url);
        localStorage.setItem('myRoles', JSON.stringify(response));
        return response;
    },

    async getRolesUser(id: string): Promise<GetRolesResponse> {
        const response = await apiClient.get<GetRolesResponse>(ENDPOINTS.auth.roles.getUserRoles(id).url);
        return response;
    },

    async deleteRole(roleId: string): Promise<{message: string}> {
        const response = await apiClient.delete<{message: string}>(ENDPOINTS.auth.roles.deleteRole(roleId).url);
        return response;
    },

    async deletePersonRole(roleId: string, userId: string): Promise<{message: string}> {
        const response = await apiClient.post<{message: string}>(ENDPOINTS.auth.roles.removeRolesFromUser().url, {data: {roleId, userId}});
        return response;
    },

    async deleteMemberEnterprise(userId: string): Promise<{message: string}> {
        const response = await apiClient.delete<{message: string}>(ENDPOINTS.auth.enterprise.deleteEnterpriseMember(userId).url);
        return response;
    },

    async leaveEnterprise(): Promise<{message: string}> {
        const response = await apiClient.post<{message: string}>(ENDPOINTS.auth.enterprise.leaveEnterprise().url);
        return response;
    },

    async trasnferEnterpriseOwner(userId: string): Promise<{message: string}> {
        const response = await apiClient.post<{message: string}>(ENDPOINTS.auth.enterprise.transferEnterpriseOwnership(userId).url);
        return response;
    },

}
