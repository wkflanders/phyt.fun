// import { Router } from 'express';

// import { controller } from '@/container.js'; // Assuming metadata controller is added to container
// // import { adminRequired } from '@/middleware/auth.js'; // Example if admin auth is needed

// const router: Router = Router();

// // Get metadata for a specific token
// router.get(
//     '/:tokenId',
//     ...controller.metadata.getTokenMetadata // Using asyncHandler for consistency
// );

// // Generate metadata for a single token (example, might be POST or admin-only)
// router.post(
//     '/generate/:tokenId',
//     // adminRequired, // Example
//     ...controller.metadata.generateTokenMetadata
// );

// // Generate metadata with specific rarity
// router.post(
//     '/generate-with-rarity',
//     // adminRequired, // Example
//     ...controller.metadata.generateTokenMetadataWithRarity
// );

// // Generate metadata for a pack
// router.post(
//     '/generate-pack',
//     // adminRequired, // Example
//     ...controller.metadata.generatePackMetadata
// );

// export { router as metadataRouter };
