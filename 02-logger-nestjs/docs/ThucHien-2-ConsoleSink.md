## ConssoleSink

- `Output` : Ghi `LogEntry` ra Stdout
- `Formatting` : cho phép người dùng lựa chọn định dạng log
- `leveling`: KO hộ trợ lọc level ở internal của console sẽ quyết định ở `LogDispatcher`. Hoặc chỉ ở tầng `AppLogger`
  - 

### LogFormatter

- `LogFormatter`  ko tuwj ghi stdout
- `LogFormatter` ko kết nối MongoDB
- `LogFormatter` ko thay đổi  `LogEntry` đầu vào


- Quyết định cách hiển thị 
  -  bao gồm format
  -  màu sắc

### Quyết định

- Cho người dùng tự do truyền callback
  - Thay vì tạo file giống java

###  Kiến trúc


```
          LogEntry
              │
              ▼
         ConsoleSink
              │
              ▼
         LogFormatter
              │
              ▼
          string
              │
              ▼
        process.stdout
```

- Cho người dùng tự do 
