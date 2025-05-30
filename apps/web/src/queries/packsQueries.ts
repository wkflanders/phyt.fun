// import {
//     PackDetails,
//     PackPurchaseNotif,
//     PackPurchaseResponse
// } from '@phyt/types';

// import { api } from '@/lib/api';

// export async function fetchPackDetails(
//     wallet_address: `0x${string}`,
//     packType: string,
//     token: string
// ): Promise<PackDetails> {
//     const response = await api.get<PackDetails>(
//         `/packs/init/${wallet_address}`,
//         {
//             params: { packType },
//             headers: { Authorization: `Bearer ${token}` }
//         }
//     );
//     return response.data;
// }

// export async function notifyServerPackTxn(
//     packData: PackPurchaseNotif,
//     token: string
// ): Promise<PackPurchaseResponse> {
//     const response = await api.post<PackPurchaseResponse>(
//         '/packs/purchase',
//         packData,
//         {
//             headers: { Authorization: `Bearer ${token}` }
//         }
//     );
//     return response.data;
// }
