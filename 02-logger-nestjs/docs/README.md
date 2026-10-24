## Kiến trúc của SPring 

- `SLF4J` : API / Facade giúp code gọi logger và không phụ thuộc implemenation
- `LogBack`: Logging framework thực hiện lọc , định dạng và Ghi Log
- `SpringBOot` tự động cấu hình và tích hợp hệ thống Logging

### Các thực thể quan trọng trong LogBack

- `Logger`: điểm nhận các lệnh `info()` , `wanr()`, `error()`
- `LoggerContext`: quản lý hệ thống các Logger
- `ILoggingEvent`: Đại diện cho một sự kiện log
- `Appender`: ghi Log đến đích như console hoặc file
- `Encoder`: chuyển log event thành dữ liệu đàu ra 
- `Layout` quyết định các trình bày log
- `Filter`: Chấp nhận , từ chối hoặc bỏ qua quyết đinh jveef một event
- `AsyncAppender`: Đưa event vào Queueue để xử lý bất đồng bộ
- `MDC` I Giữ metadata theo ngữ cảnh thực thi,. VD reqeustId


#### Logback thực sự làm gì 

- `1. Lấy Logger tương ứng: `
  - `LoggerFactory.getLogger(TaskService.class)`
    - Quản lý bởi `LoggerContext`
- `2. Kiểm tra level và Filter`
  - Nếu cấu hình `INFO` mà ta gọi `debug()`, Logback có thể loại bỏ ngay ko cần tạo event hay ghi log
- `3. tạo LoggingEvent`
  - Đóng gói timestamp, level, message, exception, tên logger và dữ liệu MDC
- `Chuyển event đến Appender`
  - Logback gọi các Appender áp dụng cho Logger đó, bao gồm cả Appender được kế thừa theo heirachy
- `5. Encodner và Output`
  - Định dạng nếu cần vấu đó thực hiện ghi ra consosle, file hoặc ddichws khác

### MDC

- MDC trong Logback chủ yếu dựa trên ngữ cảnh thread.


### mini

- Ta sẽ tạo ra một `LogContext`


### So sánh ThreadLocal và AsyncLocalStorage

- Phạm vi dữ liệu: 
  - Java Thread: 
  - Node: Theo aysnchorounous execution Context
- Cách ly dữ liệu: 
  - Giữa các thread
  - Giữa các async Context
- Cơ chế: 
  - gắn dữ liệu với thread
  - Theo dõi chuỗi thực thi async
- Qua await
  - Không áp dụng trực tiếp
  - Tự động duy trì context
- Cleanup
  - Thường giọ `remove()`
  - `Run()` tự quản lý phạm vi context 

```js
storage.run({ requestId: 'req-123' }, async () => {
  await service.createTask();
});
```

- Giọ trong một callback. 
- Trong NestJS ta sẽ thiếp lập context ở một điểm đầu vào: 
  - `middleware`

### Trển khai MDC với middleware - AsyncLocalStorage

```js
const middlewares = [
  middleware1,
  middleware2,
  middleware3,
];

let index = 0;

function next() {
  const middleware = middlewares[index++];

  if (middleware) {
    middleware(req, res, next);
  }
}
```


### Triển khai Inject kèm class context:   - Scope.TRANSIENT + INQUIRER

- `Scope.TRANSIENT` + `INQUIRER`

```js
@Injectable({ scope: Scope.TRANSIENT })
export class AppLogger {
  private readonly context: string;

  constructor(
    @Inject(INQUIRER)
    parent: object | undefined,
  ) {
    this.context = parent?.constructor.name ?? 'Application';
  }

  info(message: string) {
    console.log(`[${this.context}] ${message}`);
  }
}
```


### Thông tin `LogEntry`

- `LogEntry` nên là một cấu trúc log tổng quát. Không nên được thiết kế riêng cho `HTTP request`

```ts 
type LogLevel =
  | 'debug'
  | 'info'
  | 'warn'
  | 'error';

interface LogEntry {
  timestamp: Date;

  level: LogLevel;

  message: string;

  context: string;

  mdc: Record<string, unknown>;

  attributes?: Record<string, unknown>;

  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}
```


```json
{
  "timestamp": "2026-10-24T08:00:00.000Z",
  "level": "info",
  "loggerName": "TaskService",
  "message": "Task created",
  "mdc": {
    "requestId": "abc-123",
    "userId": "user-42"
  },
  "attributes": {
    "taskId": 10
  }
}
```


### LogSink / Appender

- Định nghĩa hợp đồng ghi log. `ConsoleSink`, `MongoSink` sẽ triển khai hợp đồng này.

- LogSink sử dụng Class triển khai Interface
- Vì nó cần Lifecyle

```ts
export class ConsoleSink implements LogSink {
  write(entry: LogEntry): void {
    console.log(JSON.stringify(entry));
  }
}
```

### Log Dispatcher

```ts
export interface ILogDispatcher {
  dispatch(entry: LogEntry): Promise<void>;
}
```

- implemntation minh họa

```ts
@Injectable()
export class LogDispatcher implements ILogDispatcher {
  constructor(
    private readonly sinks: LogSink[],
  ) {}

  async dispatch(entry: LogEntry): Promise<void> {
    const results = await Promise.allSettled(
      this.sinks.map((sink) => sink.write(entry)),
    );

    // TODO: Xử lý các Sink thất bại.
  }
}

```

- Fire and forget
- Nếu có lỗi xảy ra: 
  - không sử dụng mini frmaeowkr. mà sử dụng độc lập. `Tránh vòng lặp logging vô hạn`
  - console.error là đủ


- Nhược điểm: 
  - khôn miễn phí. Vì gọi liên tục. Có thể tăng quá tải

### LoggingModule và cơ chế DI nhiều LogSink

- Một Injection Token đại diện cho `LogSink[]`

-    {
        provide: LOG_SINKS,
        useFactory: (...sinks: LogSink[]) => sinks,
        inject: options.sinks,
      },


### LEvel Filtering 

- Khi cấu hình level: 'warn', hệ thống có bỏ qua debug và info không?

- Tôi đề xuất lọc ngay tại AppLogger, trước khi tạo LogEntry, để tránh những xử lý không cần thiết. V1 chỉ cần một mức log tối thiểu toàn cục.

```ts
export enum LogLevel {
  DEBUG = 10,
  INFO = 20,
  WARN = 30,
  ERROR = 40,
}

function isLevelEnabled(
  level: LogLevel,
  minimumLevel: LogLevel,
): boolean {
  return level >= minimumLevel;
}
```

### Các thành phần kiến trúc 

- `LogEntry:  ` - Entity: một bản ghi log có cấu trúc
- `AppLogger`: API ghi log dành cho business code
- `LogProcesscor` : xử lý và biến đổi dữ liệu log
- `LogDispatcher`: quyết định cách phân phối log trực tiếp hoặc qua Queue
- `LogSink` : đích Log
- `LogFormatter` : serilize dữ liệu Log
- `LogQueryService` tra cứu log đã lưu


### kiến trúc


```
               HTTP Request
                    │
                    ▼
          RequestContextMiddleware
                    │
                    ▼
          LogContext (MDC)
          AsyncLocalStorage
                    │
                    │
TaskService         │
    │               │
    ▼               │
AppLogger           │
(TRANSIENT)         │
    │               │
    ├── loggerName  │
    └── đọc MDC ◄───┘
    │
    ▼
  LogEntry
    │
    ▼
LogDispatcher
    │
    ├───────────────┐
    ▼               ▼
ConsoleSink      MongoSink
    │               │
    ▼               ▼
  stdout          MongoDB
```