import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Order } from '@phyt/types';
import { encodeAbiParameters, keccak256, concat } from 'viem';
import { EXCHANGE_DOMAIN, ORDER_TYPE } from '@phyt/types';

import { ApiError } from "@phyt/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const handleApiError = async (response: Response): Promise<ApiError> => {
  const errorData = await response.json();
  return {
    error: errorData.error || 'An unexpected error has occurred',
    status: response.status
  };
};


export function generateOrderHash(order: Order): `0x${string}` {
  // Encode the domain separator
  const domainSeparator = keccak256(
    encodeAbiParameters(
      [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' }
      ],
      [
        EXCHANGE_DOMAIN.name,
        EXCHANGE_DOMAIN.version,
        BigInt(EXCHANGE_DOMAIN.chainId),
        EXCHANGE_DOMAIN.verifyingContract as `0x${string}`
      ]
    )
  );

  // Encode the order struct
  const orderHash = keccak256(
    encodeAbiParameters(
      ORDER_TYPE.Order,
      [
        order.trader,
        order.side,
        order.collection,
        order.token_id,
        order.payment_token,
        order.price,
        order.expiration_time,
        order.merkle_root,
        order.salt,
      ]
    )
  );

  // Compute the final hash according to EIP-712
  return keccak256(
    concat([
      '0x1901',
      domainSeparator,
      orderHash
    ])
  );
}