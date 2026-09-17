import 'dotenv/config';
import app, { app_info } from '@/app';

const port = Number(process.env.PORT ?? 3000);

app.listen(port, () => {
  console.log(`API listening on :${port}${app_info.api_prefix}`);
});