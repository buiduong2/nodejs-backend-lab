# ExpressJS Roadmap

Lộ trình xây dựng **Task Management REST API** bằng Node.js, ExpressJS, TypeScript và PostgreSQL.

Dự án được phát triển theo từng phase, từ HTTP server đơn giản đến ứng dụng Backend có cơ sở dữ liệu, xác thực, phân quyền và kiểm thử.

## Phase 01 — Bootstrap & Hello World

**Features**
- [x] Khởi tạo ứng dụng ExpressJS với TypeScript.
- [x] Xây dựng API `GET /` trả về `Hello World!`.
- [x] Khởi động và kiểm tra HTTP server.
- [x] Thiết lập npm scripts để chạy ứng dụng.

**Learning**
- [ ] Node.js runtime và npm.
- [ ] `package.json` và `package-lock.json`.
- [ ] ES Modules và CommonJS.
- [ ] TypeScript configuration (`tsconfig.json`).
- [ ] Chạy TypeScript trực tiếp và biên dịch bằng `tsc`.
- [ ] Express application và `express()`.
- [ ] Routing với `app.get()`.
- [ ] Request và Response.
- [ ] `res.send()` và `res.json()`.
- [ ] `app.listen()` và HTTP server.
- [ ] Luồng xử lý HTTP request trong ExpressJS.
- [ ] Debug ứng dụng bằng Node.js Inspector hoặc VS Code.

**Git tag:** `express/phase-01-bootstrap`

---

## Phase 02 — Task CRUD In-Memory

**Features**
- [ ] Định nghĩa cấu trúc dữ liệu Task.
- [ ] `POST /tasks` — Tạo Task.
- [ ] `GET /tasks` — Lấy danh sách Task.
- [ ] `GET /tasks/:id` — Lấy Task theo ID.
- [ ] `PATCH /tasks/:id` — Cập nhật Task.
- [ ] `DELETE /tasks/:id` — Xóa Task.
- [ ] Lưu trữ Task tạm thời bằng Array trong bộ nhớ.

**Learning**
- [ ] HTTP methods và REST API conventions.
- [ ] Route parameters (`req.params`).
- [ ] Query parameters (`req.query`).
- [ ] Request body (`req.body`).
- [ ] JSON parsing với `express.json()`.
- [ ] HTTP status codes.
- [ ] `res.status()`, `res.json()` và `res.send()`.
- [ ] TypeScript Interface và Type Alias.
- [ ] Thao tác dữ liệu bằng Array/Object.
- [ ] Tách Router, Controller và Service.
- [ ] Tổ chức cấu trúc thư mục ExpressJS.

**Git tag:** `express/phase-02-in-memory-crud`

---

## Phase 03 — Middleware & Error Handling

**Features**
- [ ] Xây dựng middleware ghi log HTTP request.
- [ ] Kiểm tra dữ liệu đầu vào khi tạo và cập nhật Task.
- [ ] Xử lý trường hợp Task không tồn tại.
- [ ] Xây dựng error-handling middleware tập trung.
- [ ] Chuẩn hóa JSON error response.
- [ ] Xử lý route không tồn tại.

**Learning**
- [ ] Middleware trong ExpressJS.
- [ ] `app.use()` và `router.use()`.
- [ ] Middleware execution order.
- [ ] Hàm `next()`.
- [ ] Error-handling middleware.
- [ ] Custom Error Class.
- [ ] Synchronous và Asynchronous Error Handling.
- [ ] Promise rejection và async/await.
- [ ] HTTP error codes: 400, 404, 500.
- [ ] Request lifecycle và middleware chain.

**Git tag:** `express/phase-03-middleware-error-handling`

---

## Phase 04 — PostgreSQL Integration with pg

**Features**
- [ ] Khởi tạo PostgreSQL database.
- [ ] Thiết kế bảng `users`, `tasks` và `checklist_items`.
- [ ] Thiết lập quan hệ One-to-Many giữa User và Task.
- [ ] Thiết lập quan hệ One-to-Many giữa Task và ChecklistItem.
- [ ] Kết nối PostgreSQL thông qua thư viện `pg`.
- [ ] Chuyển Task CRUD từ In-Memory sang PostgreSQL.
- [ ] Xây dựng CRUD cho ChecklistItem.
- [ ] Tạo dữ liệu mẫu (seed data).
- [ ] Thực hành transaction với nhiều thao tác dữ liệu.

**Learning**
- [ ] PostgreSQL connection configuration.
- [ ] Environment variables và `.env`.
- [ ] Thư viện `pg` (node-postgres).
- [ ] Connection Pool.
- [ ] SQL Queries và Parameterized Queries.
- [ ] SQL JOIN.
- [ ] Primary Key và Foreign Key.
- [ ] Quan hệ One-to-Many.
- [ ] Constraints và Indexes.
- [ ] Transaction với `BEGIN`, `COMMIT`, `ROLLBACK`.
- [ ] Async database operations.
- [ ] Repository/Data Access Layer.
- [ ] Xử lý lỗi từ database.

**Git tag:** `express/phase-04-postgresql-pg`

---

## Phase 05 — Migration to Prisma ORM

**Features**
- [ ] Cài đặt và cấu hình Prisma.
- [ ] Khai báo User, Task và ChecklistItem trong Prisma Schema.
- [ ] Mapping quan hệ giữa các model.
- [ ] Quản lý database schema bằng Prisma Migrate.
- [ ] Chuyển repository từ `pg` sang Prisma Client.
- [ ] Triển khai lại các thao tác CRUD bằng Prisma.
- [ ] Triển khai truy vấn dữ liệu có quan hệ.
- [ ] Chuyển transaction từ SQL thuần sang Prisma.
- [ ] Kiểm tra API hoạt động tương đương trước và sau chuyển đổi.

**Learning**
- [ ] ORM và Query Builder.
- [ ] Prisma Architecture.
- [ ] Prisma Schema và Data Models.
- [ ] Prisma Client.
- [ ] Prisma Migrate và Migration History.
- [ ] Model Relations.
- [ ] CRUD với Prisma Client.
- [ ] Relation Queries và Nested Writes.
- [ ] Prisma Transactions.
- [ ] Prisma Error Handling.
- [ ] So sánh SQL thuần (`pg`) và Prisma ORM.

**Git tag:** `express/phase-05-prisma-migration`

---

## Phase 06 — Authentication & Authorization

**Features**
- [ ] `POST /auth/register` — Đăng ký tài khoản.
- [ ] `POST /auth/login` — Đăng nhập.
- [ ] Mã hóa mật khẩu trước khi lưu database.
- [ ] Cấp JWT Access Token khi đăng nhập thành công.
- [ ] Xây dựng Authentication Middleware.
- [ ] Phân quyền theo vai trò `ADMIN` và `USER`.
- [ ] Tạo tài khoản ADMIN bằng seed data.
- [ ] User chỉ xem và thao tác trên Task của chính mình.
- [ ] ADMIN có quyền xem và quản lý tất cả Task.
- [ ] Bảo vệ các API yêu cầu xác thực.

**Learning**
- [ ] Authentication và Authorization.
- [ ] Password Hashing.
- [ ] JWT Structure và Signing.
- [ ] JWT Verification và Expiration.
- [ ] Bearer Token.
- [ ] Authentication Middleware.
- [ ] Role-Based Access Control (RBAC).
- [ ] Resource Ownership Authorization.
- [ ] HTTP 401 và 403.
- [ ] TypeScript Declaration Merging để mở rộng `Request`.
- [ ] Phân biệt xác thực người dùng và kiểm tra quyền sở hữu tài nguyên.

**Git tag:** `express/phase-06-authentication`

---

## Phase 07 — Filtering, Pagination & Validation

**Features**
- [ ] Tìm kiếm Task theo tiêu đề.
- [ ] Lọc Task theo trạng thái.
- [ ] Sắp xếp Task theo ngày tạo.
- [ ] Phân trang danh sách Task.
- [ ] Kết hợp tìm kiếm, lọc, sắp xếp và phân trang.
- [ ] Validation dữ liệu đăng ký và đăng nhập.
- [ ] Validation dữ liệu Task và ChecklistItem.
- [ ] Chuẩn hóa validation error response.

**Learning**
- [ ] Query Parameters.
- [ ] Filtering và Sorting.
- [ ] Offset-Based Pagination.
- [ ] Prisma Filtering và Ordering.
- [ ] Pagination Metadata.
- [ ] Schema Validation với Zod.
- [ ] Type Inference từ Validation Schema.
- [ ] Middleware Validation.
- [ ] HTTP 400 và 422.
- [ ] Phân biệt TypeScript Type Checking và Runtime Validation.

**Git tag:** `express/phase-07-filter-pagination-validation`

---

## Phase 08 — Automated Testing & Debugging

**Features**
- [ ] Thiết lập môi trường kiểm thử.
- [ ] Viết test cho Task CRUD.
- [ ] Viết test cho Checklist CRUD.
- [ ] Viết test cho Authentication.
- [ ] Kiểm thử Authorization theo Role và Ownership.
- [ ] Kiểm thử Validation và Error Handling.
- [ ] Kiểm thử các API sử dụng PostgreSQL.
- [ ] Thiết lập script chạy test.
- [ ] Debug các tình huống lỗi thực tế.

**Learning**
- [ ] Unit Testing và Integration Testing.
- [ ] Node.js Test Runner hoặc Vitest.
- [ ] Supertest cho HTTP API Testing.
- [ ] Test Setup và Teardown.
- [ ] Test Database và Test Isolation.
- [ ] Mocking và Dependency Injection cơ bản.
- [ ] Testing Async Functions.
- [ ] Happy Path và Error Cases.
- [ ] Debugging với Breakpoints.
- [ ] Node.js Inspector.
- [ ] Test Coverage cơ bản.

**Git tag:** `express/phase-08-testing`

---

## Phase 09 — Refactoring & Final Review

**Features**
- [ ] Review cấu trúc thư mục dự án.
- [ ] Refactor các đoạn code trùng lặp.
- [ ] Tách cấu hình ứng dụng và HTTP server khi cần.
- [ ] Chuẩn hóa API response và error handling.
- [ ] Rà soát xử lý bất đồng bộ và database connections.
- [ ] Rà soát authentication và authorization.
- [ ] Hoàn thiện README hướng dẫn chạy ứng dụng.
- [ ] Hoàn thiện tài liệu API.
- [ ] Chạy lại toàn bộ automated tests.

**Learning**
- [ ] Separation of Concerns.
- [ ] Express Application Architecture.
- [ ] Dependency Management.
- [ ] Configuration Management.
- [ ] Graceful Shutdown cơ bản.
- [ ] Logging và Error Handling Best Practices.
- [ ] API Documentation với OpenAPI/Swagger.
- [ ] Code Review và Refactoring.
- [ ] So sánh kiến trúc ExpressJS với Spring Boot.

**Git tag:** `express/phase-09-final`

---

## Completion Criteria

Một phase được coi là hoàn thành khi:

- Tất cả checklist Features đã hoàn thành.
- Các nội dung Learning đã được thực hành và hiểu cơ chế cơ bản.
- Chức năng được kiểm tra và hoạt động đúng.
- Source code đã được commit vào Git.
- Git tag tương ứng đã được tạo.

Sau khi hoàn thành ExpressJS Roadmap, tiếp tục triển khai cùng nghiệp vụ bằng **NestJS + MongoDB** để so sánh framework, kiến trúc ứng dụng và mô hình lưu trữ dữ liệu.