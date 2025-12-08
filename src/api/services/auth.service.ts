import { apiClient } from "../client";
import type { UserLoginInput, UserLoginResponse, UserRegistrationInput, UserRegistrationResponse } from "../../interfaces/auth";
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
        const response = await apiClient.post<void>(ENDPOINTS.auth.auth.logout().url);
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
        console.warn('Current User:', response);
        return response;
    }
}