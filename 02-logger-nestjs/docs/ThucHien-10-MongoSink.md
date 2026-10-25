### MongoSink

- Mục tiêu: 
  - chứng minh Longging framework có thể mở rộng sang một hệ thống lưu trữ thực tế mà ko cần sửa core


### 

```
TaskService
    │
    ▼
NestLogger → AppLogger
                 │
                 ▼
            LogDispatcher
                 │
          ┌──────┴──────┐
          ▼             ▼
     ConsoleSink     MongoSink
          │             │
        stdout        MongoDB
```


### Thành phần cần triển khai

- `MongoSink`: implement `LogSink`, ghi `LogEntry` vào MongoDB
- `MongoClient` quản lý kết nối mongoDB
- nestJS `provider` : inject MongoDB colleciton / clietn vào MongoSink
- playground : kiểm tra log thực sự được lưu


### Thiết kế MongoSink

- implmenet LogSink
- có depdencneis của Mongo liên quan kết nối liên quan
- Quản lý mongoClient: 
  - ko tạo thêm MongoCLient mới mỗi lần ghi log
  - Cho phép inject một mongoClient custom
- MongoSink nhận Collection đã được khởi tạo thông qua constructor
- Một instance MongoSink được dùng lại cho nhiều log events
- Két nối MongoDB được đóng khi ứng dụng shutdown (MongoClient sẽ làm việc này)

