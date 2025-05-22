import {
    PutObjectCommand,
    S3Client,
    GetObjectCommand
} from '@aws-sdk/client-s3';

import { AWSPutError, AWSGetError } from '@phyt/models';

import type {
    TokenURIMetadata,
    CardRarity,
    UUIDv7,
    AvatarConfig,
    MetadataConfig
} from '@phyt/types';

export type MetadataAWSOps = ReturnType<typeof makeMetadataAWSOps>;

export const makeMetadataAWSOps = (
    s3Client: S3Client,
    avatarConfig: AvatarConfig,
    metadataConfig: MetadataConfig
) => {
    const uploadMetadata = async (
        tokenId: number,
        metadata: TokenURIMetadata
    ): Promise<void> => {
        try {
            await s3Client.send(
                new PutObjectCommand({
                    Bucket: metadataConfig.bucketName,
                    Key: tokenId.toString(),
                    Body: JSON.stringify(metadata),
                    ContentType: 'application/json'
                })
            );
        } catch (error) {
            console.error('Error uploading metadata:', error);
            throw new AWSPutError('Failed to upload metadata to S3');
        }
    };

    const getMetadata = async (tokenId: number): Promise<TokenURIMetadata> => {
        if (!metadataConfig.bucketName) {
            throw new AWSGetError(
                'Metadata bucket name not found in configuration'
            );
        }

        try {
            const response = await s3Client.send(
                new GetObjectCommand({
                    Bucket: metadataConfig.bucketName,
                    Key: tokenId.toString()
                })
            );

            const bodyContents = await response.Body?.transformToString();
            if (!bodyContents) {
                throw new AWSGetError(
                    `No content found for token ID ${tokenId}`
                );
            }

            return JSON.parse(bodyContents) as TokenURIMetadata;
        } catch (error) {
            console.error('Error getting metadata:', error);
            throw new AWSGetError('Failed to get metadata from S3');
        }
    };

    const getCardImageUrl = (runnerId: UUIDv7, rarity: CardRarity): string => {
        return `https://d5mhfgomyfg7p.cloudfront.net/runners/${String(
            runnerId
        )}/${String(rarity)}.png`;
    };

    const extractFileKeyFromUrl = (url: string): string | null => {
        const baseUrl = avatarConfig.cloudFrontUrl;
        if (!url.startsWith(baseUrl)) {
            return null;
        }

        // Remove the base URL to get the key
        return url.substring(baseUrl.length + 1); // +1 for the trailing slash
    };

    return {
        uploadMetadata,
        getMetadata,
        getCardImageUrl,
        extractFileKeyFromUrl
    };
};
