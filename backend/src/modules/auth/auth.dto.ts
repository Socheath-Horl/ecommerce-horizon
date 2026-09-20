import { z } from 'zod';

// GET /auth/config response data
export const auth_config_data_schema = z.object({
  issuer: z.string(),
  client_id: z.string(),
  redirect_uri: z.string(),
  scopes: z.array(z.string()),
  end_session_uri: z.string(),
});