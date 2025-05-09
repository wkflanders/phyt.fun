import { z } from 'zod';

import { RunnerStatus } from '@phyt/models';

import { uuidv7, DTOSchema, PaginationSchema } from './primitives.js';

export const RunnerStatusSchema = z.enum(['pending', 'active', 'inactive']);
