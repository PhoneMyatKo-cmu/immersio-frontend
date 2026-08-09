import type { Role } from "../types/user";
import type {
    Paginated,
    UserAdminRead,
    UserListParams,
    UserStats,
} from "../types/admin";
import { apiClient } from "./client";

export const adminUsersApi = {
    stats: () => apiClient.get<UserStats>("/admin/users/stats"),

    list: (params: UserListParams = {}) =>
        apiClient.get<Paginated<UserAdminRead>>("/admin/users/", { params }),

    get: (user_id: number) =>
        apiClient.get<UserAdminRead>(`/admin/users/${user_id}`),

    changeRole: (user_id: number, role: Role) =>
        apiClient.patch<UserAdminRead>(`/admin/users/${user_id}/role`, { role }),

    // Soft delete — deactivates the account (blocks login + token use).
    deactivate: (user_id: number) =>
        apiClient.delete<{ detail: string }>(`/admin/users/${user_id}`),
};
