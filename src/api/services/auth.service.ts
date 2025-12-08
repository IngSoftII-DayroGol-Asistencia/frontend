import { apiClient } from "../client";
import type { UserLoginInput, UserLoginResponse, UserRegistrationInput, UserRegistrationResponse } from "../../interfaces/auth";
import { ENDPOINTS } from "../endpoints";
import { register } from "module";

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
    }

    
}