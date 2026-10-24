## 2. Trách nhiệm của AppLogger

```
TaskService
    │
    ▼
logger.info('Task created', { taskId: 10 })
    │
    ▼
AppLogger
    │
    ├── Kiểm tra LogLevel
    │
    ├── Lấy loggerName từ INQUIRER
    │
    ├── Đọc MDC từ LogContext
    │
    ├── Tạo LogEntry
    │
    ▼
LogDispatcher
    │
    ▼
LogSink[]
```

## 3. Đặc điểm của AppLogger

- Có thể từ cài đặt log level mà quyết định một Log có thể được ghi hay không
- Nhận biets được ngữ cảnh hiện tại đang bị gọi bởi class nào
- Có thể lấy các thông tin toàn cục
- Tạo LogEntry