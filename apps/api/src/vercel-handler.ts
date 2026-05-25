import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import serverless from 'serverless-http';

const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

import { createApp } from './bootstrap-app';

let cachedHandler: ReturnType<typeof serverless>;

export const handler = async (event: any, context: any) => {
  if (!cachedHandler) {
    const app = await createApp();
    await app.init();
    cachedHandler = serverless(app.getHttpAdapter().getInstance());
  }
  return cachedHandler(event, context);
};
