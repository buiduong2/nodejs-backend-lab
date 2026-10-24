## Bước 6 — LoggingModule (NestJS Integration)

### 1. Mục tiêu

Xây dựng `LoggingModule` dưới dạng Dynamic Module để tích hợp Logging Core với NestJS DI Container.

- Core Logging độc lập với NestJS.
- `NestLogger` là adapter giữa NestJS và `AppLogger`.
- Người dùng có thể đăng ký Sink trong `LoggingModule` hoặc module riêng.
- `LoggingModule` resolve các Sink thông qua injection token và cung cấp cho `LogDispatcher`.
- Hỗ trợ ConsoleSink mặc định, mức log tối thiểu và custom fallback.

**Ví dụ cấu hình:**

```ts
@Module({
  imports: [
    LoggingModule.forRoot({
      level: 'info',
      providers: [
        {
          provide: ConsoleSink,
          useFactory: () => new ConsoleSink(textFormatter),
        },
      ],
      sinks: [ConsoleSink],
    }),
  ],
})
export class AppModule {}
```

**Sử dụng trong Service:**

```ts
@Injectable()
export class TaskService {
  constructor(
    private readonly logger: NestLogger,
  ) {}

  createTask() {
    this.logger.info('Creating task', {
      taskId: 10,
    });
  }
}
```

**Kết quả kỳ vọng:**

```text
[2026-10-24T...] [info] [TaskService] Creating task
```

### 2. Các Provider

| Provider / Token | Cách đăng ký | Scope / Trách nhiệm |
|---|---|---|
| `NestLogger` | Class Provider | Transient, xác định consumer bằng `INQUIRER` |
| `LogContext` | Class Provider | Singleton, quản lý MDC |
| `LogDispatcher` | `useFactory` | Singleton, phân phối log đến các Sink |
| `LOG_SINKS_TOKEN` | `useFactory` | Cung cấp `LogSink[]` |
| `LOG_MIN_LEVEL` | `useValue` | Mức log tối thiểu, mặc định `info` |
| `LOG_FALLBACK_TOKEN` | `useExisting` / `useValue` | Custom fallback hoặc fallback mặc định |

`AppLogger`, `LogDispatcher`, `LogContext` và các Sink thuộc Core, không phụ thuộc NestJS.

### 3. Thiết kế LoggingOptions

```ts
export interface LoggingOptions {
  imports?: ModuleMetadata['imports'];
  providers?: Provider[];
  sinks?: InjectionToken[];
  level?: LogLevel;
  sinkErrorLog?: InjectionToken;
}
```

- `imports`: Các module cung cấp Sink hoặc dependency liên quan.
- `providers`: Các provider được đăng ký trực tiếp trong LoggingModule.
- `sinks`: Danh sách token của các Sink mà Dispatcher sử dụng.
- `level`: Mức log tối thiểu, mặc định `info`.
- `sinkErrorLog`: Token của bộ xử lý lỗi tùy chỉnh.

**Hành vi của `sinks`:**

| Cấu hình | Kết quả |
|---|---|
| Không khai báo | Sử dụng `ConsoleSink` mặc định |
| `sinks: []` | Không ghi log đến Sink nào |
| `sinks: [ConsoleSink, MongoSink]` | Sử dụng các Sink được chỉ định |

### 4. Quy tắc đăng ký Sink

**Trường hợp A — Đăng ký trực tiếp trong LoggingModule**

```ts
LoggingModule.forRoot({
  providers: [ConsoleSink],
  sinks: [ConsoleSink],
});
```

**Trường hợp B — Sink thuộc module khác**

```ts
@Module({
  providers: [DatabaseSink],
  exports: [DatabaseSink],
})
export class DatabaseSinkModule {}
```

```ts
LoggingModule.forRoot({
  imports: [DatabaseSinkModule],
  sinks: [DatabaseSink],
});
```

**Trường hợp C — Sink có dependency từ module khác**

```ts
LoggingModule.forRoot({
  imports: [DatabaseModule],
  providers: [DatabaseSink],
  sinks: [DatabaseSink],
});
```

Dependency cần được export từ module cung cấp nó.

**Nguyên tắc:** `providers` quyết định cách đăng ký dependency; `imports` cho phép sử dụng dependency từ module khác; `sinks` xác định những Sink được đưa vào Dispatcher.

### 5. Các bước triển khai

1. Tách `AppLogger` thành Core Logger thuần TypeScript và tạo `NestLogger` kế thừa `AppLogger`.
2. Định nghĩa `LoggingOptions` và các injection token.
3. Tạo provider `LOG_SINKS_TOKEN`, resolve các Sink từ danh sách token; nếu không cấu hình thì tạo ConsoleSink mặc định.
4. Tạo `LOG_FALLBACK_TOKEN`, sử dụng `useExisting` với custom fallback hoặc `useValue` với fallback mặc định.
5. Đăng ký `LogDispatcher` bằng `useFactory`, inject `LOG_SINKS_TOKEN` và `LOG_FALLBACK_TOKEN`.
6. Đăng ký `NestLogger`, `LogContext` và `LOG_MIN_LEVEL`.
7. Truyền `imports` và `providers` từ cấu hình vào DynamicModule.
8. Export `NestLogger` và `LogContext`, cấu hình module global.

### 6. Kiến trúc

```text
Application (TaskService, UserService)
             |
             v
NestJS Integration
  - LoggingModule
  - NestLogger (TRANSIENT + INQUIRER)
  - Injection Tokens
             |
             v
Logging Core (framework-independent)
  - AppLogger
  - LogContext
  - LogDispatcher
  - LogEntry
             |
             v
LogSink[]
  - ConsoleSink
  - MongoSink
```

`NestLogger` lấy tên consumer qua `INQUIRER`. Mỗi consumer nhận một Logger instance riêng, trong khi `LogContext` và `LogDispatcher` được chia sẻ dưới dạng Singleton.

### 7. Trạng thái

- [x] Hoàn thiện Logging Core.
- [x] Tách NestJS Integration.
- [x] Thiết kế `LoggingOptions`.
- [x] Triển khai `LoggingModule.forRoot()`.
- [x] Hỗ trợ custom Sink và LogFallback qua injection token.
- [x] Hỗ trợ ConsoleSink mặc định.
- [ ] Kiểm thử DI thực tế trong NestJS playground.
- [ ] Kiểm thử `INQUIRER` và nhiều Sink đồng thời.