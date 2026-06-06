import type { UserCreateRequest } from "../types/user";
import { apiClient } from "./client";

export const login = async (email: string, password: string) => {
    const response = await apiClient.post("/auth/login", { email, password });
    return response.data;
};

export const logout = async () => {
    apiClient.post("/auth/logout", {
        "refresh_token": localStorage.getItem("refreshToken"),
    }, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
    }). then((data) => {
        console.log('Logout successful' + data);
        // Clear tokens from localStorage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        window.location.href = '/login';
    }).catch((error) => {
        console.error('Logout failed:', error);
    });
};

export const register = async (user: UserCreateRequest) => {
    const response = await apiClient.post("/auth/register", user);
    return response.data;
};

export const getCurrentUser = async () => {
    const response = await apiClient.get("/auth/me", {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
    });
    return response.data;
}

export const updateProfile = async (user: Partial<UserCreateRequest>) => {
    const response = await apiClient.post("/auth/update-profile", user, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
    });
    return response.data;
}

export const resetPassword = async (oldPassword: string, newPassword: string) => {
    const response = await apiClient.post("/auth/reset-password", { "current_password": oldPassword, "new_password": newPassword }, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
    });
    return response.data;
}