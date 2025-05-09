import { z } from 'zod';

import { uuidv7 } from './primitives.js';

export const PostIdSchema = z.object({
    postId: uuidv7({ required_error: 'Post postId is required' })
});
export type PostIdDTO = z.infer<typeof PostIdSchema>;
