import { z } from 'zod';

import { uuidv7 } from './core.js';

export const PostIdSchema = z.object({
    postId: uuidv7()
});
export type PostIdDTO = z.infer<typeof PostIdSchema>;
