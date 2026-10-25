# MongoDB Native Driver — Logging Lab

## Mục tiêu

- Thực hành CRUD bằng MongoDB Native Driver.
- Truy vấn nested documents, arrays và optional fields.
- Sử dụng các operator: $eq, $in, $gte, $lte, $exists, $set, $unset, $push.
- Thực hành cursor, sort, pagination, aggregation.
- Tìm hiểu schema validation và enum.

**Database:** `logging_lab`
**Collection:** `application_logs`

## 1. Data Model

```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

type Environment = 'development' | 'staging' | 'production';

interface ApplicationLog {
  timestamp: Date;
  level: LogLevel;
  loggerName: string;
  message: string;
  service: string;
  environment: Environment;
  mdc: {
    requestId: string;
    traceId?: string;
    userId?: string;
  };
  attributes: {
    http?: {
      method: string;
      path: string;
      statusCode: number;
      durationMs: number;
    };
    error?: {
      code: string;
      type: string;
      retryable: boolean;
    };
    tags?: string[];
  };
}
```

## 2. Dữ liệu mẫu

Đây là JavaScript chạy trực tiếp trong mongosh. `new Date()` tạo BSON Date, không phải JSON thuần.

```javascript
const logs = [
  {
    timestamp: new Date("2026-10-25T08:00:00Z"),
    level: "info",
    loggerName: "AuthController",
    message: "Login successful",
    service: "auth-service",
    environment: "production",
    mdc: { requestId: "req-001", traceId: "trace-A", userId: "u-101" },
    attributes: {
      http: { method: "POST", path: "/auth/login", statusCode: 200, durationMs: 120 },
      tags: ["auth", "login"]
    }
  },
  {
    timestamp: new Date("2026-10-25T08:02:00Z"),
    level: "error",
    loggerName: "OrderService",
    message: "Order creation failed",
    service: "order-service",
    environment: "production",
    mdc: { requestId: "req-002", traceId: "trace-B", userId: "u-102" },
    attributes: {
      http: { method: "POST", path: "/orders", statusCode: 500, durationMs: 850 },
      error: { code: "ORDER_FAILED", type: "BusinessException", retryable: false },
      tags: ["order", "critical"]
    }
  },
  {
    timestamp: new Date("2026-10-25T08:04:00Z"),
    level: "debug",
    loggerName: "ProductRepository",
    message: "Product query executed",
    service: "product-service",
    environment: "development",
    mdc: { requestId: "req-003", traceId: "trace-C" },
    attributes: {
      http: { method: "GET", path: "/products", statusCode: 200, durationMs: 45 },
      tags: ["database", "product"]
    }
  },
  {
    timestamp: new Date("2026-10-25T08:06:00Z"),
    level: "warn",
    loggerName: "InventoryService",
    message: "Low stock detected",
    service: "inventory-service",
    environment: "staging",
    mdc: { requestId: "req-004", traceId: "trace-D" },
    attributes: { tags: ["inventory", "stock"] }
  },
  {
    timestamp: new Date("2026-10-25T08:08:00Z"),
    level: "error",
    loggerName: "PaymentClient",
    message: "Payment gateway timeout",
    service: "order-service",
    environment: "production",
    mdc: { requestId: "req-002", traceId: "trace-B", userId: "u-102" },
    attributes: {
      http: { method: "POST", path: "/payments", statusCode: 504, durationMs: 5000 },
      error: { code: "PAYMENT_TIMEOUT", type: "TimeoutException", retryable: true },
      tags: ["payment", "timeout", "critical"]
    }
  },
  {
    timestamp: new Date("2026-10-25T08:10:00Z"),
    level: "info",
    loggerName: "ProductController",
    message: "Product details fetched",
    service: "product-service",
    environment: "production",
    mdc: { requestId: "req-005", traceId: "trace-E", userId: "u-101" },
    attributes: {
      http: { method: "GET", path: "/products/123", statusCode: 200, durationMs: 80 },
      tags: ["product", "cache"]
    }
  },
  {
    timestamp: new Date("2026-10-25T08:12:00Z"),
    level: "warn",
    loggerName: "AuthGuard",
    message: "Unauthorized access attempt",
    service: "auth-service",
    environment: "production",
    mdc: { requestId: "req-006", traceId: "trace-F" },
    attributes: {
      http: { method: "GET", path: "/admin", statusCode: 401, durationMs: 15 },
      tags: ["auth", "security"]
    }
  },
  {
    timestamp: new Date("2026-10-25T08:14:00Z"),
    level: "debug",
    loggerName: "CacheService",
    message: "Cache miss",
    service: "product-service",
    environment: "development",
    mdc: { requestId: "req-007" },
    attributes: {
      tags: ["redis", "cache"]
    }
  },
  {
    timestamp: new Date("2026-10-25T08:16:00Z"),
    level: "error",
    loggerName: "InventoryClient",
    message: "Inventory service unavailable",
    service: "order-service",
    environment: "production",
    mdc: { requestId: "req-008", traceId: "trace-G", userId: "u-103" },
    attributes: {
      http: { method: "POST", path: "/orders", statusCode: 503, durationMs: 3000 },
      error: { code: "SERVICE_UNAVAILABLE", type: "NetworkException", retryable: true },
      tags: ["inventory", "network"]
    }
  },
  {
    timestamp: new Date("2026-10-25T08:18:00Z"),
    level: "info",
    loggerName: "OrderService",
    message: "Order created successfully",
    service: "order-service",
    environment: "production",
    mdc: { requestId: "req-009", traceId: "trace-H", userId: "u-101" },
    attributes: {
      http: { method: "POST", path: "/orders", statusCode: 201, durationMs: 350 },
      tags: ["order", "success"]
    }
  }
];
```

## 3. Bài tập

### Phần A — CRUD cơ bản

#### Bài 1. Insert Many
- [ ] Insert toàn bộ 10 logs bằng một thao tác.
- [ ] In số document được insert.
- [ ] In danh sách ID vừa được tạo.
- [ ] Kiểm tra tổng số document trong collection.

#### Bài 2. Query và Sort
- [ ] Tìm tất cả logs có level = error.
- [ ] Sắp xếp timestamp giảm dần.
- [ ] Chỉ trả về 5 logs mới nhất.
- [ ] Chỉ lấy các trường timestamp, level, message, service; không lấy _id.

#### Bài 3. Query theo nhiều điều kiện
- [ ] Tìm log thuộc production.
- [ ] Level là warn hoặc error.
- [ ] Timestamp trong khoảng 08:00–08:15 UTC ngày 25/10/2026.
- [ ] Sắp xếp từ mới đến cũ.

#### Bài 4. Find One
- [ ] Lấy _id của một log.
- [ ] Tìm lại bằng _id.
- [ ] Tìm log đầu tiên thuộc order-service.
- [ ] Phân biệt findOne và find.

### Phần B — Nested Documents và Arrays

#### Bài 5. Nested Query
- [ ] Tìm logs có mdc.requestId = req-002.
- [ ] Tìm logs có attributes.http.statusCode >= 500.
- [ ] Tìm logs có attributes.http.durationMs > 1000.
- [ ] Tìm logs có mdc.userId = u-101.

#### Bài 6. Optional Fields
- [ ] Tìm logs có attributes.error.
- [ ] Tìm logs không có attributes.http.
- [ ] Tìm logs không có mdc.traceId.
- [ ] Tìm logs có attributes.error.retryable = true.

#### Bài 7. Array Query
- [ ] Tìm logs chứa tag critical.
- [ ] Tìm logs chứa ít nhất một trong các tag auth, payment.
- [ ] Tìm logs chứa đồng thời order và critical.
- [ ] Tìm logs có đúng 2 phần tử tags.

### Phần C — Update và Delete

#### Bài 8. Update One
- [ ] Tìm log có requestId = req-004.
- [ ] Đổi message thành "Inventory stock is critically low".
- [ ] Đổi level thành error.
- [ ] Đọc lại document.

#### Bài 9. Nested Update
- [ ] Tìm log có error.code = PAYMENT_TIMEOUT.
- [ ] Đổi retryable thành false.
- [ ] Thêm attributes.error.resolved = true.
- [ ] Không thay thế toàn bộ attributes.

#### Bài 10. Update Many và Arrays
- [ ] Thêm tag reviewed vào mọi log có level = error.
- [ ] Đảm bảo không thêm tag trùng khi chạy lại.
- [ ] Thêm trường reviewedAt kiểu Date.
- [ ] In matchedCount và modifiedCount.

#### Bài 11. Delete
- [ ] Xóa tất cả logs có level = debug.
- [ ] In deletedCount.
- [ ] Kiểm tra lại số log còn lại.

### Phần D — Cursor và Aggregation

#### Bài 12. Cursor và Pagination
- [ ] Truy vấn toàn bộ log theo timestamp giảm dần.
- [ ] Chia dữ liệu theo page = 1, limit = 3.
- [ ] Thử page = 2, limit = 3.
- [ ] Duyệt cursor bằng for await...of trong Node.js.
- [ ] So sánh với toArray().

#### Bài 13. Aggregation cơ bản
- [ ] Đếm số log theo từng level.
- [ ] Đếm số log theo từng service.
- [ ] Tính durationMs trung bình của các log có HTTP request.
- [ ] Tìm request chậm nhất.

#### Bài 14. Aggregation nâng cao
- [ ] Nhóm logs theo mdc.requestId.
- [ ] Đếm số logs trong mỗi request.
- [ ] Liệt kê các service xuất hiện trong từng request.
- [ ] Chỉ lấy request có nhiều hơn 1 log.

### Phần E — Schema Validation

#### Bài 15. Enum và Validation
- [ ] Tìm hiểu $jsonSchema.
- [ ] Giới hạn level chỉ nhận debug, info, warn, error.
- [ ] Bắt buộc các trường timestamp, level, loggerName, message.
- [ ] Kiểm tra trường timestamp phải là BSON Date.
- [ ] Thử insert một log có level = fatal.
- [ ] Quan sát lỗi validation.

## 4. Quy tắc thực hành

1. Làm bài 1–7 trực tiếp bằng mongosh.
2. Làm bài 8–15 bằng mongosh hoặc Native Driver.
3. Sau đó chuyển CRUD sang NestJS LogsService.
4. Không sử dụng Mongoose.
5. Không reset dữ liệu giữa các bài, trừ khi muốn làm lại toàn bộ lab.

**Lưu ý:** Bài 8–11 thay đổi hoặc xóa dữ liệu nên kết quả aggregation về sau sẽ dựa trên dữ liệu còn lại.
