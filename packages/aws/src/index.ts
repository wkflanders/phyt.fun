import { makeUserAWSOps } from './ops/userAWSOps.js';
import { awsClient, avatarConfig, metadataConfig } from './client.js';

// Export the initialized client
export { awsClient, avatarConfig, metadataConfig };

// Export operations maker
export { makeUserAWSOps };

// Export type
export type { UserAWSOps } from './ops/userAWSOps.js';
