import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand
} from '@aws-sdk/client-s3';
import { CardRarity, TokenURIMetadata, UUIDv7 } from '@phyt/models';
import { config } from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

import { env } from '@/env.js';

config();

if (!env.AWS_ACCESS_KEY || !env.AWS_SECRET_ACCESS_KEY) {
    throw new Error('AWS credentials not found in environment variables');
}

const s3Client = new S3Client({
    region: env.AWS_REGION,
    credentials: {
        accessKeyId: env.AWS_ACCESS_KEY,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY
    }
});

export const s3Service = {
    uploadMetadata: async (
        tokenId: number,
        metadata: TokenURIMetadata
    ): Promise<void> => {
        try {
            await s3Client.send(
                new PutObjectCommand({
                    Bucket: env.AWS_METADATA_BUCKET,
                    Key: tokenId.toString(),
                    Body: JSON.stringify(metadata),
                    ContentType: 'application/json'
                })
            );
        } catch (error) {
            console.error('Error uploading metadata:', error);
            throw new Error('Failed to upload metadata to S3');
        }
    },

    getMetadata: async (tokenId: number): Promise<TokenURIMetadata> => {
        if (!env.AWS_METADATA_BUCKET) {
            throw new Error(
                'AWS_METADATA_BUCKET not found in environment variables'
            );
        }

        try {
            const response = await s3Client.send(
                new GetObjectCommand({
                    Bucket: env.AWS_METADATA_BUCKET,
                    Key: tokenId.toString()
                })
            );

            const metadata = await response.Body?.transformToString();
            if (!metadata) throw new Error('No metadata found');

            return JSON.parse(metadata) as TokenURIMetadata;
        } catch (error) {
            console.error('Error getting metadata:', error);
            throw new Error('Failed to get metadata from S3');
        }
    },

    getImageUrl: (runnerId: UUIDv7, rarity: CardRarity): string => {
        return `https://d5mhfgomyfg7p.cloudfront.net/runners/${String(runnerId)}/${String(rarity)}.png`;
    },

    uploadAvatar: async (file: Buffer): Promise<string> => {
        const bucketName = env.AWS_AVATAR_URL_BUCKET;

        const fileKey = `${uuidv4()}.png`;

        try {
            await s3Client.send(
                new PutObjectCommand({
                    Bucket: bucketName,
                    Key: fileKey,
                    Body: file,
                    ContentType: 'image/png'
                })
            );

            return fileKey;
        } catch (error) {
            console.error('Error uploading avatar:', error);
            throw new Error('Failed to upload avatar to S3');
        }
    },

    generateAvatarUrl: (fileKey: string): string => {
        const baseUrl = env.AWS_CLOUDFRONT_AVATAR_URL;

        return `${baseUrl}/${fileKey}`;
    }
};
