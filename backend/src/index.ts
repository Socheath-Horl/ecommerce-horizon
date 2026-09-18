import 'dotenv/config';
import app, { app_info } from '@/app';
import { env } from '@/config/env';

app.listen(env.port, () => {
  console.log(`API listening on :${env.port}${app_info.api_prefix}`);
});