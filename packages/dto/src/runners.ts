import { z } from 'zod';

import { RunnerStatus } from '@phyt/models';

import { uuidv7, PaginationSchema } from './core.js';

export const RunnerStatusSchema = z.enum(['pending', 'active', 'inactive']);
