import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { CardRarity, RarityWeights, RarityMultipliers } from '@phyt/types';
import { config } from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

config();

const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    }
});

export const s3Service = {
    uploadMetadata: async (tokenId: number, metadata: any): Promise<void> => {
        try {
            await s3Client.send(new PutObjectCommand({
                Bucket: process.env.AWS_METADATA_BUCKET!,
                Key: `${tokenId}`,
                Body: JSON.stringify(metadata),
                ContentType: 'application/json'
            }));
        } catch (error) {
            console.error('Error uploading metadata:', error);
            throw new Error('Failed to upload metadata to S3');
        }
    },

    getMetadata: async (tokenId: number): Promise<any> => {
        try {
            const response = await s3Client.send(new GetObjectCommand({
                Bucket: process.env.AWS_METADATA_BUCKET!,
                Key: `${tokenId}`
            }));

            const metadata = await response.Body?.transformToString();
            if (!metadata) throw new Error('No metadata found');

            return JSON.parse(metadata);
        } catch (error) {
            console.error('Error getting metadata:', error);
            throw new Error('Failed to get metadata from S3');
        }
    },
    getImageUrl: (runnerId: number, rarity: CardRarity): string => {
        return `https://d1o7ihod05ar3g.cloudfront.net/runners/${runnerId}/${rarity}.png`;
    },
    uploadAvatar: async (file: Buffer) => {
        const bucketName = process.env.AWS_AVATAR_URL_BUCKET;
        const fileKey = `${uuidv4()}.png`;

        try {
            await s3Client.send(new PutObjectCommand({
                Bucket: bucketName,
                Key: fileKey,
                Body: file,
                ContentType: "image/png",
            }));

            return fileKey;
        } catch (error) {
            console.error("Error uploading avatar:", error);
            throw new Error("Failed to upload avatar to S3");
        }
    },

    generateAvatarUrl: (fileKey: string): string => {
        const baseUrl = process.env.AWS_CLOUDFRONT_AVATAR_URL;

        return `${baseUrl}/${fileKey}`;
    }
};