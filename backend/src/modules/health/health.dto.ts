import { z } from 'zod';

// GET /health response data
export const health_data_schema = z.object({
  status: z.string(),
});