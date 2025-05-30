import {
    UserDTO,
    CreateUserDTO,
    UpdateUserDTO,
    TransactionsPageDTO
} from '@phyt/dto';

import { api } from '@/lib/api';

export const USER_QUERY_KEY = 'user';
export const TRANSACTIONS_QUERY_KEY = 'transactions';
export const getUserQueryKey = (privyId: string) => [USER_QUERY_KEY, privyId];

export async function getUser(privyId: string): Promise<UserDTO> {
    const response = await api.get<UserDTO>(`/users/${privyId}`);
    return response.data;
}

export async function getUserTransactions(
    privyId: string
): Promise<TransactionsPageDTO> {
    const response = await api.get<TransactionsPageDTO>(
        `/users/transactions/${privyId}`
    );
    return response.data;
}

export async function createUser(userData: CreateUserDTO): Promise<UserDTO> {
    const response = await api.post<UserDTO>(`/users/create`, userData);
    return response.data;
}

// Expand later
export async function updateUser(userData: UpdateUserDTO): Promise<UserDTO> {
    const response = await api.put<UserDTO>(`/users/update`, userData);
    return response.data;
}

// export async function getUserCards(
//     privyId: string,
//     token: string
// ): Promise<CardWithMetadata[]> {
//     const response = await api.get<CardWithMetadata[]>(
//         `/users/cards/${privyId}`,
//         {
//             headers: { Authorization: `Bearer ${token}` }
//         }
//     );
//     return response.data;
// }
