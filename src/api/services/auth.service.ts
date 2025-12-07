import { apiClient } from "../client";
import type { UserRegistrationInput, UserRegistrationResponse } from "../../interfaces/auth";
import { ENDPOINTS } from "../endpoints";

export const authService ={
    async registerUser(userData: UserRegistrationInput): Promise<UserRegistrationResponse> {
        const response = await apiClient.post<UserRegistrationResponse>(ENDPOINTS.auth.auth.signup().url, userData);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return response;
    }
}