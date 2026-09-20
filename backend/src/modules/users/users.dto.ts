import { z } from 'zod';

// GET /users/me response data
export const user_profile_data_schema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  role: z.string(),
  created_at: z.string().nullable(),
  avatar: z.string().nullable(),
  addresses: z.array(z.unknown()),
});