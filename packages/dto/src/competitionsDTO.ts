import { UUIDv7 } from '@phyt/types';

import { z } from 'zod';


import { PaginationSchema, uuidv7 } from './core.js';

/* ---------- Inbound DTOs ---------- */
export const CompetitionIdSchema = z.object({
    competitionId: uuidv7()
});
export type CompetitionIdDTO = z.infer<typeof CompetitionIdSchema> & UUIDv7;
