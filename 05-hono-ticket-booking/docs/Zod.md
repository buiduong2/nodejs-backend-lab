### cài đặt thư viện Zod


```sh
pnpm add zod @hono/zod-validator
```

```ts
import { z } from 'zod';

export const createEventSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().optional(),
  location: z.string().optional(),
});
```

- `parse()` — Kiểm tra dữ liệu, hợp lệ thì trả về dữ liệu đã parse, không hợp lệ thì throw ZodError
- `safeParse()` — Không throw; trả về đối tượng thể hiện thành công hoặc thất bại.
- `z.infer<>` — Suy luận TypeScript type từ Zod Schema


### 4. kết hợp hono với zod

- Hono cung cấp middleware `zValidator()`

```ts
app.post(
  '/events',
  zValidator('json', createEventSchema),
  async (c) => {
    const body = c.req.valid('json');

    return c.json(body, 201);
  },
);
```

- `zValidator('json', createEventSchema)`: kiểm tra JSON body trước khi handler được chạy
- `c.req.valid('json')`: Trả dữ liệu đã validaet và được typesript suy luận kiểu tương ứng


### Các bước thực thi theo thứ tự khai báo 
-
 