import { AWSPutError, AWSGetError, AWSDeleteError } from '@phyt/models';

import {
    PutObjectCommand,
    DeleteObjectCommand,
    S3Client
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

import type { AvatarConfig } from '@phyt/types';

export type AvatarAWSOps = ReturnType<typeof makeAvatarAWSOps>;

export const makeAvatarAWSOps = ({
    awsClient,
    avatarConfig
}: {
    awsClient: S3Client;
    avatarConfig: AvatarConfig;
}) => {
    const uploadAvatar = async (file: Buffer): Promise<string> => {
        const bucketName = avatarConfig.bucketName;
        if (!bucketName) {
            throw new AWSPutError(
                'Avatar bucket name not found in configuration'
            );
        }

        const fileKey = `${uuidv4()}.png`;

        try {
            await awsClient.send(
                new PutObjectCommand({
                    Bucket: bucketName,
                    Key: fileKey,
                    Body: file,
                    ContentType: 'image/png',
                    CacheControl: 'public, max-age=31536000'
                })
            );

            return fileKey;
        } catch (error) {
            console.error('Error uploading avatar:', error);
            throw new AWSPutError('Failed to upload avatar to S3');
        }
    };

    const generateAvatarUrl = (fileKey: string): string => {
        const baseUrl = avatarConfig.cloudFrontUrl;
        if (!baseUrl) {
            throw new AWSGetError('CloudFront URL not found in configuration');
        }

        return `${baseUrl}/${fileKey}`;
    };

    const deleteAvatar = async (fileKey: string): Promise<void> => {
        const bucketName = avatarConfig.bucketName;
        if (!bucketName) {
            throw new AWSDeleteError(
                'Avatar bucket name not found in configuration'
            );
        }

        try {
            await awsClient.send(
                new DeleteObjectCommand({
                    Bucket: bucketName,
                    Key: fileKey
                })
            );
        } catch (error) {
            console.error('Error deleting avatar:', error);
            throw new AWSDeleteError('Failed to delete avatar from S3');
        }
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
        uploadAvatar,
        generateAvatarUrl,
        deleteAvatar,
        extractFileKeyFromUrl
    };
};
