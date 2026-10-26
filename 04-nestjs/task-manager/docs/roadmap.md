
# NestJS + TypeORM + Kafka Roadmap

Lộ trình xây dựng **Task Management REST API** bằng NestJS, TypeScript, TypeORM, PostgreSQL và Kafka.

**Mục tiêu:** Nhanh chóng làm quen với stack công ty, có khả năng đọc hiểu, chỉnh sửa và debug code production.

**Phương pháp:** Just-in-Time Learning — học đến đâu, thực hành đến đó. Không đào sâu những kiến thức chưa cần thiết.

**Tech Stack**
- NestJS + TypeScript
- TypeORM + PostgreSQL
- Kafka
- Docker Compose
- JWT Authentication

---

## Phase 01 — NestJS Fundamentals

### Features

- [X] Khởi tạo NestJS project bằng Nest CLI.
- [x] Cấu hình `.env` với `@nestjs/config`.
- [x] Tạo TasksModule, TasksController, TasksService.
- [x] Xây dựng `GET /tasks` trả về danh sách rỗng.
- [x] Tạo DTO cho Task.
- [x] Thiết lập global ValidationPipe.
- [x] Kiểm tra API bằng Postman hoặc curl.

### Learning

- [ ] `main.ts` và `NestFactory.create()`.
- [ ] `@Module()`, imports, providers, controllers, exports.
- [ ] `@Controller()` và HTTP Method Decorators.
- [ ] `@Injectable()` và Constructor Injection.
- [ ] `@Body()`, `@Param()`, `@Query()`.
- [ ] DTO, class-validator, class-transformer.
- [ ] So sánh NestJS với Spring Boot.

**Git tag:** `nestjs/phase-01-fundamentals`

---

## Phase 02 — PostgreSQL & TypeORM

### 2.1 Database & Entity

#### Features

- [x] Khởi tạo PostgreSQL bằng Docker Compose.
- [x] Cấu hình `TypeOrmModule.forRootAsync()`.
- [X] Tạo User, Task, ChecklistItem Entities.
- [x] Thiết lập quan hệ User–Task (One-to-Many).
- [x] Thiết lập quan hệ Task–ChecklistItem (One-to-Many).
- [x] Tạo migration để khởi tạo database.

#### Learning

- [x] `@Entity()`, `@Column()`, `@PrimaryGeneratedColumn()`.
- [x] `@CreateDateColumn()`, `@UpdateDateColumn()`.
- [x] `@ManyToOne()`, `@OneToMany()`, `@JoinColumn()`.
- [x] `TypeOrmModule.forFeature()`.
- [x] Migration và `synchronize: false`.
- [x] So sánh TypeORM Entity với JPA Entity.

### 2.2 Repository & CRUD

#### Features

- [x] `POST /tasks` — Tạo Task.
- [x] `GET /tasks` — Lấy danh sách Task.
- [x] `GET /tasks/:id` — Lấy chi tiết Task.
- [x] `PATCH /tasks/:id` — Cập nhật Task.
- [x] `DELETE /tasks/:id` — Xóa Task.
- [x] `POST /tasks/:id/checklists` — Thêm ChecklistItem.
- [x] `PATCH /tasks/:id/checklists/:itemId` — Cập nhật ChecklistItem.

#### Learning

- [ ] `@InjectRepository()`.
- [ ] `Repository<Entity>`.
- [ ] `create()`, `save()`, `find()`, `findOneBy()`.
- [ ] `update()`, `delete()`, `remove()`.
- [ ] FindOptions và relations.
- [ ] `NotFoundException`.
- [ ] So sánh TypeORM Repository với Spring Data JPA.

### 2.3 QueryBuilder & Advanced Queries

#### Features

- [ ] Lọc Task theo trạng thái.
- [ ] Tìm kiếm Task theo tiêu đề.
- [ ] Phân trang với page, limit.
- [ ] Sắp xếp theo createdAt.
- [ ] JOIN Task với User.
- [ ] JOIN Task với ChecklistItem.
- [ ] Kết hợp filtering, sorting và pagination.
- [ ] Viết transaction cập nhật nhiều bảng.

#### Learning

- [ ] `createQueryBuilder('task')`.
- [ ] `select()`, `addSelect()`.
- [ ] `where()`, `andWhere()`, `orWhere()`.
- [ ] `leftJoin()`, `leftJoinAndSelect()`.
- [ ] `orderBy()`, `skip()`, `take()`.
- [ ] `getOne()`, `getMany()`, `getManyAndCount()`.
- [ ] `getRawMany()`, `getRawOne()`.
- [ ] Query parameters và SQL Injection.
- [ ] `DataSource.transaction()`.
- [ ] Debug SQL với `getSql()` và `getQueryAndParameters()`.

**Git tag:** `nestjs/phase-02-typeorm`

---

## Phase 03 — Authentication & Request Lifecycle

### 3.1 Authentication & Authorization

#### Features

- [ ] Tạo AuthModule.
- [ ] `POST /auth/login`.
- [ ] Hash mật khẩu User.
- [ ] Cấp JWT Access Token.
- [ ] Xây dựng JWT Authentication Guard.
- [ ] Bảo vệ Task API bằng Guard.
- [ ] Chỉ cho phép User sửa Task của mình.
- [ ] Tạo custom decorator `@CurrentUser()`.

#### Learning

- [ ] `@nestjs/jwt`.
- [ ] `CanActivate` và `ExecutionContext`.
- [ ] `@UseGuards()`.
- [ ] Custom Decorators.
- [ ] HTTP 401 và 403.
- [ ] So sánh NestJS Guard với Spring Security.

### 3.2 Request Lifecycle

#### Features

- [ ] Thêm Middleware log HTTP request.
- [ ] Áp dụng global ValidationPipe.
- [ ] Xử lý exception thống nhất.
- [ ] Thử Response Interceptor.
- [ ] Debug request từ Controller đến Repository.

#### Learning

- [ ] Middleware.
- [ ] Guards.
- [ ] Pipes.
- [ ] Interceptors.
- [ ] Exception Filters.
- [ ] NestJS Request Lifecycle.
- [ ] Module imports/exports và chia sẻ Provider.

**Git tag:** `nestjs/phase-03-auth-lifecycle`

---

## Phase 04 — Kafka Integration

### 4.1 Kafka Fundamentals

#### Features

- [ ] Khởi chạy Kafka bằng Docker Compose.
- [ ] Tạo topic `task.created`.
- [ ] Cấu hình Kafka Client trong NestJS.
- [ ] Publish event sau khi tạo Task thành công.
- [ ] Xây dựng Consumer nhận event `task.created`.
- [ ] Log thông tin Task từ Consumer.
- [ ] Kiểm tra event từ Producer đến Consumer.

#### Learning

- [ ] Broker, Topic, Partition.
- [ ] Producer và Consumer.
- [ ] Consumer Group và Offset.
- [ ] `ClientsModule.register()` hoặc `registerAsync()`.
- [ ] `ClientKafka`.
- [ ] `emit()` và `@EventPattern()`.
- [ ] Phân biệt `emit()` và `send()`.
- [ ] REST synchronous và Kafka asynchronous.

### 4.2 Kafka Production Awareness

#### Features

- [ ] Quan sát hành vi khi Consumer ngừng hoạt động.
- [ ] Thử xử lý event trùng lặp bằng idempotency.
- [ ] Thử xử lý lỗi trong Consumer.
- [ ] Kiểm tra hành vi khi Kafka không hoạt động.

#### Learning

- [ ] At-least-once delivery.
- [ ] Retry và duplicate events.
- [ ] Idempotency.
- [ ] Offset commit cơ bản.
- [ ] Eventual Consistency.
- [ ] Dual-write problem giữa PostgreSQL và Kafka.
- [ ] Transactional Outbox — chỉ tìm hiểu khái niệm.

**Git tag:** `nestjs/phase-04-kafka`

---

## Phase 05 — Production Code Reading & Debugging

### Features

- [ ] Đọc flow Controller → Service → Repository.
- [ ] Truy vết một QueryBuilder phức tạp.
- [ ] Xác định vị trí DTO validation và transformation.
- [ ] Xác định Guard bảo vệ endpoint.
- [ ] Xác định Module cung cấp Provider.
- [ ] Debug bằng breakpoint.
- [ ] Viết Unit Test cho Service bằng mock Repository.
- [ ] Viết E2E Test cho Task API.
- [ ] Hoàn thiện README hướng dẫn chạy project.

### Learning

- [ ] Debugger và Node.js Inspector.
- [ ] NestJS Dependency Injection errors.
- [ ] TypeORM query logging.
- [ ] TestingModule và mock Provider.
- [ ] Đọc stack trace trong NestJS.
- [ ] Đọc utility/helper functions của codebase.

**Git tag:** `nestjs/phase-05-review`

---

## Deferred — Just-in-Time Learning

Không bắt buộc hoàn thành trước khi tham gia dự án thực tế.

- [ ] MongoDB + Mongoose — khi làm project MongoDB.
- [ ] Advanced NestJS DI — khi gặp Dynamic Modules hoặc Provider Scopes.
- [ ] Advanced Kafka — khi gặp vấn đề Consumer Lag, Retry, Offset.
- [ ] Advanced TypeORM — khi gặp vấn đề Query Performance.
- [ ] Swagger/OpenAPI — khi cần tài liệu API.
- [ ] Advanced Testing — khi cần kiểm thử nghiệp vụ thực tế.
- [ ] Redis/Caching — khi project sử dụng.
- [ ] CI/CD — khi tham gia build hoặc deployment.

---

## Completion Criteria

Một phase được coi là hoàn thành khi:

- [ ] Chức năng chính chạy thành công.
- [ ] Hiểu và giải thích được request/data flow.
- [ ] Biết cách debug lỗi liên quan.
- [ ] Source code đã được commit.
- [ ] Git tag tương ứng đã được tạo.

Không cần ghi nhớ toàn bộ API hoặc cú pháp thư viện. Ưu tiên khả năng tra cứu tài liệu, đọc code và giải quyết vấn đề.

---

## Learning Priorities

| Topic                     | Priority | Time Allocation |
| ------------------------- | -------- | --------------- |
| TypeORM + QueryBuilder    | Critical | 45%             |
| NestJS + Lifecycle + Auth | High     | 30%             |
| Kafka                     | Medium   | 15%             |
| Testing + Debugging       | Medium   | 10%             |
| MongoDB + Mongoose        | Deferred | Just-in-Time    |

## Final Goal

- [ ] Hiểu cấu trúc ứng dụng NestJS.
- [ ] Xây dựng REST API với PostgreSQL và TypeORM.
- [ ] Đọc hiểu và chỉnh sửa TypeORM QueryBuilder.
- [ ] Hiểu Authentication và Request Lifecycle.
- [ ] Tích hợp Kafka Producer và Consumer cơ bản.
- [ ] Debug và bảo trì các API NestJS hiện có.
- [ ] Có khả năng tham gia phát triển dự án thực tế mà không cần học hết framework trước.
