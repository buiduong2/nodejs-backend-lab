
## 3 API tiếp theo

| Thứ tự | API                 | Kiến thức cần học                                  |
| ------ | ------------------- | -------------------------------------------------- |
| 1 x    | `GET /events`       | Drizzle SELECT, filtering, pagination              |
| 2 x    | `GET /events/:id`   | Path params, Zod coercion, `eq()`                  |
| 3      | `PATCH /events/:id` | Partial validation, Drizzle UPDATE, `.returning()` |

### 1. GET /events — Lấy danh sách sự kiện

Yêu cầu: Trả về danh sách Event, hỗ trợ lọc theo `status` và phân trang.

Ví dụ:

```
GET /events?page=1&limit=10&status=PUBLISHED
```

Kiến thức:

- `c.req.query()` trong Hono.
- `z.coerce.number()` và validate query parameters.
- Drizzle `.select()`, `.where()`, `.limit()`, `.offset()`.
- Sử dụng `count()` để tính tổng bản ghi.

Đây cũng là dịp học cách xử lý query parameters, vì các giá trị từ URL ban đầu đều là chuỗi.

### 2. GET /events/:id — Lấy chi tiết sự kiện

Ví dụ:

```
GET /events/1
```

Kiến thức:

- `zValidator('param', schema)`.
- Chuyển `id` từ `string` sang `number`.
- Drizzle `eq(eventsTable.id, id)`.
- Xử lý HTTP 404 khi không tìm thấy.

Yêu cầu response trả về một Event, không phải array.

### 3. PATCH /events/:id — Cập nhật sự kiện

Ví dụ:

```
PATCH /events/1
Content-Type: application/json
```

```
{
  "title": "Hanoi Music Festival 2026 - Updated",
  "location": "Hanoi"
}
```

Kiến thức:

- Zod `.partial()` để cho phép cập nhật một phần dữ liệu.
- Drizzle `.update().set().where().returning()`.
- Xử lý `updatedAt`.
- Phân biệt `undefined` và `null` khi update.

### Path 1 : 

- Đã thực hành được: 
  - Hono: Router, Route chaining , Context, ZVAlidator, path params, queryr params
  - Zod : validation, coerce, transform, optional, refind, type inference
  - Dizzle: insert, select , update, where , eq , returning , $count, pagination
  - Kiến trúc: tashc Router -> service. Database không cần áp dụng nguyên cấu trúc NestJS