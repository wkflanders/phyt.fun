import { isUUIDv7 } from '@phyt/models';

import { WalletAddress } from '@phyt/types';

import { getAddress, isAddress } from 'viem';
import { z } from 'zod';

export const PaginationSchema = z
    .object({
        page: z.number().int().nonnegative(),
        limit: z.number().int().positive(),
        total: z.number().int().nonnegative(),
        totalPages: z.number().int().nonnegative()
    })
    .strict();

export const uuidv7 = () =>
    z
        .string()
        .refine(isUUIDv7, { message: 'Invalid UUIDv7' })
        .transform((s) => s);

export const PrivyIdValueSchema = z.string().transform((val) => val);
export const PrivyIdSchema = z.object({
    privyId: PrivyIdValueSchema
});
export type PrivyIdDTO = z.infer<typeof PrivyIdValueSchema>;

export const WalletAddressValueSchema = z
    .string()
    .refine(isAddress, {
        message: 'Not a valid address'
    })
    .transform((val) => getAddress(val) as WalletAddress);

export const WalletAddressSchema = z.object({
    walletAddress: WalletAddressValueSchema
});
export type WalletAddressDTO = z.infer<typeof WalletAddressValueSchema>;
