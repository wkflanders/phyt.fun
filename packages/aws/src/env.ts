import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
    server: {
        AWS_ACCESS_KEY: z.string().min(1),
        AWS_SECRET_ACCESS_KEY: z.string().min(1),
        AWS_REGION: z.string().min(1),
        AWS_METADATA_BUCKET: z.string().min(1),
        AWS_IMAGES_BUCKET: z.string().min(1).optional(),
        AWS_AVATAR_URL_BUCKET: z.string().min(1),
        AWS_CLOUDFRONT_IMAGES_URL: z.string().url().optional(),
        AWS_CLOUDFRONT_METADATA_URL: z.string().url().optional(),
        AWS_CLOUDFRONT_AVATAR_URL: z.string().url(),
        AWS_CLOUDFRONT_AVATAR_URL_KEY_ID: z.string().min(1).optional(),
        AWS_CLOUDFRONT_AVATAR_URL_PRIVATE_KEY: z.string().min(1).optional(),
        NODE_ENV: z.enum(['development', 'production', 'test'])
    },
    runtimeEnv: {
        AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY,
        AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
        AWS_REGION: process.env.AWS_REGION,
        AWS_METADATA_BUCKET: process.env.AWS_METADATA_BUCKET,
        AWS_IMAGES_BUCKET: process.env.AWS_IMAGES_BUCKET,
        AWS_AVATAR_URL_BUCKET: process.env.AWS_AVATAR_URL_BUCKET,
        AWS_CLOUDFRONT_IMAGES_URL: process.env.AWS_CLOUDFRONT_IMAGES_URL,
        AWS_CLOUDFRONT_METADATA_URL: process.env.AWS_CLOUDFRONT_METADATA_URL,
        AWS_CLOUDFRONT_AVATAR_URL: process.env.AWS_CLOUDFRONT_AVATAR_URL,
        AWS_CLOUDFRONT_AVATAR_URL_KEY_ID:
            process.env.AWS_CLOUDFRONT_AVATAR_URL_KEY_ID,
        AWS_CLOUDFRONT_AVATAR_URL_PRIVATE_KEY:
            process.env.AWS_CLOUDFRONT_AVATAR_URL_PRIVATE_KEY,
        NODE_ENV: process.env.NODE_ENV
    }
});
