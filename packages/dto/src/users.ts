import { z } from 'zod';

import { uuidv7 } from './primitives.js';

export const UserIdSchema = z.object({
    userId: uuidv7()
});
export type UserIdDTO = z.infer<typeof UserIdSchema>;
