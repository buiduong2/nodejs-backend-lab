## 1. Thứ tự triển khai đề xuất
1 Models & Contracts
- log-level.ts, log-entry.ts, log-sink.interface.ts
- Định nghĩa dữ liệu và hợp đồng write(). Chưa cần NestJS DI.



2 ConsoleSink
- console.sink.ts
- Implementation đầu tiên của LogSink. Chỉ cần ghi LogEntry ra stdout.



3 LogDispatcher

- log-dispatcher.ts

- Nhận LogSink[], fan-out log, xử lý lỗi độc lập theo best-effort.



4 LogContext (MDC)

- log-context.ts

- Dùng AsyncLocalStorage, kiểm tra context được duy trì qua await và cách ly giữa các async flow.



5 AppLogger

- app-logger.ts

- Kiểm tra minimum level, lấy loggerName và MDC, tạo LogEntry, gọi Dispatcher.



6 - LoggingModule

- logging.module.ts, logging-options.ts

- Đăng ký provider, cấu hình Sink, tích hợp TRANSIENT + INQUIRER.



7 HTTP Integration

- request-context.middleware.ts, playground/

- Tự sinh requestId và thử nghiệm luồng Controller → Service → Logger.



8 MongoSink

- mongo.sink.ts
- Ghi MongoDB, cấu hình kết nối và kiểm tra lifecycle.