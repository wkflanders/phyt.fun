import { S3Client } from '@aws-sdk/client-s3';
import { config } from 'dotenv';
import { env } from './env.js';

config({ path: '.env' });

export const awsClient = new S3Client({
    region: env.AWS_REGION,
    credentials: {
        accessKeyId: env.AWS_ACCESS_KEY,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY
    }
});

export const avatarConfig = {
    bucketName: env.AWS_AVATAR_URL_BUCKET,
    cloudFrontUrl: env.AWS_CLOUDFRONT_AVATAR_URL
};

export const metadataConfig = {
    bucketName: env.AWS_METADATA_BUCKET,
    cloudFrontUrl: env.AWS_CLOUDFRONT_METADATA_URL
};

export const imagesConfig = {
    bucketName: env.AWS_IMAGES_BUCKET,
    cloudFrontURL: env.AWS_CLOUDFRONT_IMAGES_URL
};
