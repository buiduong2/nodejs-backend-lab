# Node.js Backend Lab

Repository thực hành phát triển Backend với Node.js, tập trung vào hai framework **ExpressJS** và **NestJS**.

## Mục tiêu

- Hiểu cách xây dựng và vận hành REST API với Node.js.
- Nắm vững routing, middleware, xử lý lỗi và luồng request/response.
- Thực hành kết nối và thao tác với cơ sở dữ liệu SQL và NoSQL.
- Rèn luyện kỹ năng tổ chức source code, debugging và testing.
- So sánh cách phát triển Backend giữa ExpressJS và NestJS.

## Cấu trúc dự án

| Thư mục       | Mô tả                                                                                                                                               |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `01-express/` | Xây dựng Task Management REST API bằng ExpressJS, TypeScript và PostgreSQL. Bắt đầu với SQL thuần thông qua pg, sau đó chuyển đổi sang Prisma ORM.. |
| `02-nestjs/`  | Xây dựng lại nghiệp vụ tương tự bằng NestJS, TypeScript và MongoDB.                                                                                 |
| `docs/`       | Lộ trình thực hành, ghi chú kiến thức và các quyết định kỹ thuật.                                                                                   |

## Dự án thực hành

**Task Management REST API**

Xây dựng hệ thống quản lý công việc với cùng nghiệp vụ trên hai framework, nhằm thực hành và so sánh cách phát triển Backend với cơ sở dữ liệu SQL và NoSQL.

### 1. ExpressJS + PostgreSQL

- Quản lý công việc (CRUD Task).
- Quản lý người dùng và xác thực bằng JWT.
- Phân quyền theo vai trò (`ADMIN`, `USER`).
- Thiết lập quan hệ One-to-Many giữa User và Task.
- Quản lý công việc theo quyền sở hữu.
- Quản lý Checklist của Task với quan hệ One-to-Many.
- Tìm kiếm, lọc và phân trang.
- Kiểm tra dữ liệu đầu vào và xử lý lỗi.
- Thực hành truy cập dữ liệu bằng `pg`, sau đó chuyển sang Prisma ORM.
- Kiểm thử API.

### 2. NestJS + MongoDB

- Xây dựng lại các chức năng quản lý User, Task và Checklist bằng NestJS.
- Tổ chức ứng dụng theo Module, Controller và Provider.
- Xác thực JWT và phân quyền bằng Guard.
- Thiết kế quan hệ User–Task bằng Document References.
- Sử dụng Embedded Documents để lưu Checklist trong Task.
- Thực hành MongoDB CRUD và truy vấn dữ liệu với Mongoose.
- Tìm kiếm, lọc và phân trang.
- Validation bằng DTO và ValidationPipe.
- Xử lý lỗi bằng Exception Filter.
- Kiểm thử API.

### 3. Mục tiêu so sánh

- ExpressJS và NestJS trong tổ chức và xử lý HTTP request.
- Truy cập PostgreSQL bằng SQL thuần và Prisma ORM.
- Thiết kế dữ liệu quan hệ và dữ liệu dạng document.
- SQL JOIN, Foreign Key so với References và Embedded Documents.
- Middleware trong ExpressJS so với Middleware, Guard, Pipe và Interceptor trong NestJS.

## Lộ trình

Chi tiết tại [docs/roadmap.md](docs/roadmap.md).

Dự án được phát triển theo từng giai đoạn, từ các chức năng đơn giản đến việc hoàn thiện một ứng dụng Backend có kết nối cơ sở dữ liệu.