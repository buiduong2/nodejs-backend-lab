## Mục tiêu

- Cài đặt và sử dụng `nest-logging`
- `LoggingModule.forRoot({})` sử dụng ConsoleSink mặc định
- `NestLogger` lấy đúng tên TaskService qua `INQUIRER`
- HTTP Middleware tự tạo MDC chứa requestId
- Hai HTTP request đồng thời không bị lẫn MDC
- Custom Sink và LogFallback hoạt động đúng

### Chuẩn bị public API của thư viện

- thực hiện `export` tại `index.ts`

### Thêm PeerDepedency

- Khia boas từ dev Depenedencies -> peerDepdendency

### Thêm fiole tsconfig.build.json

- Loại bỏ các playgrouned nested project

### Build dự án để tạo root thư viện

### Cài đặt playground

```
import 'nest-logging'
        │
        ▼
node_modules/nest-logging
        │
        ▼
package.json
        │
        ├── main  → dist/index.js
        └── types → dist/index.d.ts
```

### Test 1: thử import 


```ts
import { LoggingModule } from 'nest-logging';

console.log(LoggingModule);

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

```

### Test 2: Kiểm thử NestLogger và INQUIRE chưa cần HTTP + HTTP Context = true

- Đăng kí logging module
- Tạo 2 service + 2 entry point test: INQUIRE + NESTLOGGER

- Két quả: 

```sh
[2026-10-25T03:52:47.027Z] [INFO]  [3675b757-af52-4a4d-8282-4da9869857dc] [TaskService] Task executed
[2026-10-25T03:52:47.027Z] [WARN]  [3675b757-af52-4a4d-8282-4da9869857dc] [UserService] User executed
```


### Test 3:     Async Context Isolation
   
- MDC được giữ nguyên trước và sau await.
- Mỗi HTTP request có requestId riêng.
- Các request đồng thời không bị lẫn MDC.

- cách thực hiện
  - tạo ra một sleep ở một funciton. Log trước và sau

### Test 4: Multi-sink  Và Custom fallback

- tạo ra thêm 2 sink giả
- Cấu hình trong AppMOdule

- Mong muốn: 
  - Các Sink cung cấp thêm đã hoạt động
  - Có thể cung cấp cả sink được cung cấp bởi hệ thống.\
  - providers đăng ký các Sink thành công.
  - LogDispatcher phân phối log tới tất cả Sink
  - ConsoleSink tùy chỉnh hoạt động qua useFactory

### Test 4: Custom Fallback

- Tạo 1 sink sẽ thất bại
- Và một fallback
- Cấu hình

- Mong muốn: 
  - fallback log hoạt động
  - failing sink ko làm ảnh hưởng đến business chính
  - Exception từ Sink không truyền ngược lên Controller hoặc Service.
  - Nghiệp vụ vẫn trả về response bình thường
  - `best-effort logging`