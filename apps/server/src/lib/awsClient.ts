import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { CardRarity, RarityWeights, RarityMultipliers } from '@phyt/types';
import { config } from 'dotenv';

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
        return `https://${process.env.AWS_IMAGES_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/runners/${runnerId}/${rarity}.jpg`;
    },

    // deleteMetadata: async (tokenId: number): Promise<void> => {
    //     try {
    //         await s3Client.send(new DeleteObjectCommand({
    //             Bucket: process.env.AWS_METADATA_BUCKET!,
    //             Key: `${tokenId}`
    //         }));
    //     } catch (error) {
    //         console.error('Error deleting metadata:', error);
    //         throw new Error('Failed to delete metadata from S3');
    //     }
    // }
};