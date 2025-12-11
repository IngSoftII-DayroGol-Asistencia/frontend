import { apiClient } from "../client";
import type { CreateEnterpriseInput, EnterpriseCreationResponse, EnterpriseJoinRequestResponse, HandleEnterpriseJoinRequestOutput, JoinRequestStatus, UserEnterpriseResponse, UserLoginInput, UserLoginResponse, UserRegistrationInput, UserRegistrationResponse } from "../../interfaces/auth";
import { ENDPOINTS } from "../endpoints";
import type { UserProfileResponse } from "../../interfaces/user";

export const authService ={
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
            return;
        });
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('currentUser');
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
        const response = await apiClient.post<UserEnterpriseResponse>(ENDPOINTS.auth.enterprise.joinEnterprise().url, enterpriseId);
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
    }
    
}