# Mini Logging Library — Architecture V1

## 1. Mục tiêu

Xây dựng thư viện logging cho NestJS, lấy cảm hứng từ SLF4J/Logback trong Spring Boot.

- Inject Logger tự động, xác định tên class đang sử dụng.
- Quản lý MDC theo asynchronous execution context.
- Hỗ trợ log level filtering.
- Hỗ trợ nhiều Sink: Console, MongoDB hoặc custom Sink.
- Logging theo hướng **Fire-and-Forget + Best-Effort**.
- Không triển khai Queue, LogProcessor hay LogSanitizer phức tạp trong V1.

## 2. Kiến trúc tổng thể

```text
             HTTP Request
                  |
                  v
      RequestContextMiddleware
                  |
                  v
      LogContext (AsyncLocalStorage)
                  |
                  | Đọc MDC khi ghi log
                  |
TaskService ------+ 
    |
    v
AppLogger (TRANSIENT + INQUIRER)
    |
    v
Log Level Filtering
    |
    | Nếu level hợp lệ
    v
Create LogEntry
    |
    v
LogDispatcher
    |
    +--------------------+
    |                    |
    v                    v
ConsoleSink           MongoSink
    |                    |
    v                    v
  stdout               MongoDB
```

Các Sink sử dụng cùng một LogEntry. LogDispatcher không phụ thuộc vào implementation cụ thể của Sink.

## 3. Các thành phần chính

| Thành phần | Trách nhiệm | Lifecycle |
|---|---|---|
| `LogContext` | Quản lý MDC qua AsyncLocalStorage | Singleton |
| `RequestContextMiddleware` | Khởi tạo requestId và HTTP context | Middleware |
| `AppLogger` | Nhận lệnh log, lọc level, tạo LogEntry | Transient |
| `LogEntry` | Cấu trúc dữ liệu một log event | Interface |
| `LogDispatcher` | Phân phối log tới nhiều Sink | Singleton |
| `LogSink` | Hợp đồng ghi log | Interface |
| `ConsoleSink` | Ghi stdout | Singleton |
| `MongoSink` | Ghi MongoDB | Singleton |
| `LoggingModule` | Đăng ký và cấu hình providers/Sinks | Global Dynamic Module |

## 4. MDC — Execution Context

- Sử dụng `AsyncLocalStorage` thay vì ThreadLocal của Java.
- `RequestContextMiddleware` khởi tạo hoặc xác định `requestId`.
- `LogContext` duy trì metadata trong async execution context.
- Các AppLogger cùng đọc được MDC trong cùng luồng xử lý.
- Mỗi LogEntry lưu **snapshot MDC** tại thời điểm phát sinh log.

MDC không phải database hay nơi lưu log.

## 5. Logger Injection

- `AppLogger` sử dụng `Scope.TRANSIENT`.
- `INQUIRER` xác định provider đang inject Logger.
- Mỗi consumer nhận Logger với `loggerName` riêng.
- Không cần `LoggerFactory`, `forFeature()` hoặc đăng ký Logger riêng cho mỗi Service.
- Các Logger chia sẻ LogContext và LogDispatcher singleton.

Ví dụ API:

```ts
@Injectable()
export class TaskService {
  constructor(
    private readonly logger: AppLogger,
  ) {}

  createTask() {
    this.logger.info('Task created', {
      taskId: 10,
    });
  }
}
```

## 6. LogEntry

```ts
export type LogLevel =
  | 'debug'
  | 'info'
  | 'warn'
  | 'error';

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  loggerName: string;
  message: string;

  mdc: Record<string, unknown>;
  attributes: Record<string, unknown>;

  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}
```

| Field | Nguồn dữ liệu |
|---|---|
| `timestamp` | AppLogger tạo |
| `level` | Method debug/info/warn/error |
| `loggerName` | INQUIRER xác định khi inject |
| `message` | Developer truyền vào |
| `mdc` | LogContext cung cấp |
| `attributes` | Metadata riêng của từng lời gọi log |
| `error` | Developer/Logger chuẩn hóa từ exception |

**Phân biệt ba loại context:**

- `loggerName`: tên class/provider, cố định theo Logger instance.
- `mdc`: metadata theo async execution context, ví dụ requestId.
- `attributes`: metadata riêng của từng log event, ví dụ taskId, method, statusCode.

Không lưu trực tiếp Express Request/Response.

## 7. Log Level Filtering

Thứ tự mức độ:

```text
DEBUG < INFO < WARN < ERROR
```

Kiểm tra minimum level ngay tại AppLogger, **trước khi tạo LogEntry**.

Ví dụ cấu hình `warn` thì chỉ ghi `warn` và `error`.

V1 chỉ sử dụng một global minimum level, chưa có Filter/Processor riêng.

## 8. LogSink & LogDispatcher

Hợp đồng của Sink:

```ts
export interface LogSink {
  write(entry: LogEntry): void | Promise<void>;
}
```

Các Sink là class implement interface và tự inject dependency cần thiết thông qua NestJS DI.

`LogDispatcher`:

- Nhận `LogEntry`.
- Phân phối đến toàn bộ Sink đã đăng ký.
- Không chờ Promise ghi log ở phía business caller.
- Một Sink thất bại không ngăn các Sink khác ghi.
- Lỗi nội bộ được báo qua stderr, tránh gọi ngược vào AppLogger gây vòng lặp.

V1 chưa có Queue, retry, batching và backpressure. Các giới hạn này được chấp nhận cho mục tiêu học tập.

## 9. LoggingModule & MongoDB

API cấu hình dự kiến:

```ts
LoggingModule.forRoot({
  level: 'info',
  sinks: [ConsoleSink, MongoSink],
});
```

- `LoggingModule` đăng ký các Sink provider bằng NestJS DI.
- Provider `LOG_SINKS` tập hợp những Sink đã được resolve.
- `LogDispatcher` inject `LOG_SINKS`, không cần biết từng implementation.
- Mỗi Sink tự quản lý dependency.
- `MongoSink` chỉ thực hiện ghi; việc truy vấn được thực hiện riêng bằng mongosh, Compass hoặc CLI.
- MongoDB connection do Sink hoặc provider chuyên trách sở hữu và đóng khi shutdown.
- Chưa chốt chính sách xử lý MongoDB không sẵn sàng lúc startup.

## 10. Quy tắc và giới hạn V1

- Chỉ truyền attributes đơn giản, có thể chuyển thành JSON.
- Không chủ động ghi password, token, dữ liệu nhạy cảm.
- Không triển khai LogSanitizer tổng quát.
- Không có Queue hay bảo đảm lưu log thành công.
- Logging không được làm thất bại business request do lỗi ghi Sink.
- Fire-and-forget vẫn có thể tiêu thụ tài nguyên nếu có quá nhiều tác vụ ghi đang chờ.

## 11. Thứ tự triển khai

1. `LogLevel` + `LogEntry` + `LogSink`.
2. `ConsoleSink` + `LogDispatcher`.
3. `LogContext` bằng AsyncLocalStorage.
4. `AppLogger` bằng TRANSIENT + INQUIRER.
5. `LoggingModule` + cấu hình Sink.
6. `RequestContextMiddleware` + HTTP logging.
7. `MongoSink` + quản lý MongoDB connection.
8. Unit test, kiểm thử multiple Sink và failure handling.

**Nguyên tắc thiết kế:** Tách biệt việc tạo log, duy trì execution context, phân phối log và ghi log. Không bổ sung abstraction khi V1 chưa có nhu cầu thực tế.