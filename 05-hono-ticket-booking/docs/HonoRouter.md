### So sánh NestJS và Hono + Zod

| NestJS              | Hono + Zod            |
| :------------------ | :-------------------- |
| @Post()             | app.post()            |
| @Body()             | c.req.valid('json')   |
| ValidationPipe      | zValidator()          |
| Class-validator DTO | Zod Schema            |
| TypeORM Repository  | Drizzle Query Builder |
| @HttpCode(201)      | c.json(data, 201)     |


###  Kiến thức hono cơ bản

- VD: 

```ts
import { Hono } from 'hono';

const app = new Hono();

app.post('/events', async (c) => {
  const body = await c.req.json();

  return c.json({
    message: 'Event received',
    data: body,
  }, 201);
});
```

- c là `Context`: chứa request và những chức năng phục vụ response
- `c.req.json()` đọc JSON request body
- `c.json(data,201)` 

### Zod 

- thư viện schema validation
- có khả năng suy luận typescript từ schema