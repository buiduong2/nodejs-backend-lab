## Cài đặt Dizzle

```sh
pnpm add drizzle-orm pg dotenv
pnpm add -D drizzle-kit @types/pg
```


### Dizzle.config.ts


```js
import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```