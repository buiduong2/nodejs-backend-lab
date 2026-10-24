## Bước 3 — LogDispatcher

- `Output`: 
  - Phân phối một `LogEntry` đến nhiều `LogSink`
  - KHÔNG ảnh hưởng đến luồng nghiệp vụ.
    - Ghi log thành công hay thất bại ko thay đổi kết quả xử lý nghiệp vụ chính (ko gây `ERRROR 500` cho cả Request)

- Có một log độc lập việc ghi log lỗi

  
- Đặc điểm: 
  - Best-effort: khi log thất bại ko làm thất bại nghiệp vụ
  - Fire and Forget: caller ko cần chờ ghi log hoàn tất
  - non-blocking tuyệt đối



### Cấu trúc

```
AppLogger (triển khai sau)
       │
       ▼
  LogDispatcher
       │
       ├── ConsoleSink
       ├── MongoSink (sau này)
       └── CustomSink
```