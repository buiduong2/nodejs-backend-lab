## 1 . cài đặt depdencies

```sh
npm install mongodb
```


## 2. Kiến trúc source code

```
Nest Application
      |
      v
 MongoModule
      |
      +---- MongoClient     <-- 1 instance dùng suốt vòng đời app
      |
      +---- Db
      |
      +---- Collection<ApplicationLog>
                    |
                    v
              LogsService
                    |
                    v
              LogsController
```

## 3. Kiến trúc HTTP web

```
Application start
       |
       v
MongoClient.connect()
       |
       v
HTTP request
HTTP request
HTTP request
HTTP request
       |
       |  dùng chung client
       v
Application shutdown
       |
       v
MongoClient.close()
```

```
src/
├── app.module.ts
│
├── database/
│   ├── mongo.module.ts
│   └── mongo.constants.ts
│
└── logs/
    ├── logs.module.ts
    ├── logs.controller.ts
    └── logs.service.ts
```

## 2. Tạo MongoDB module

- trách nhiệm: 
  - Tạo provider cung cấp một instance MongoClient (singleton).
  - Export provider `MongoClient` để các module khác có thể inject.
  - Khởi tạo kết nối khi NestJS khởi tạo provider
  - Đóng kết nối MongoDB khi application shutdown thông qua lifecycle hook `OnApplicationShutdown`.

### Lifecycle

```
NestJS khởi động
    ↓
Khởi tạo MongoModule
    ↓
Khởi tạo MongoClient provider
    ↓
await client.connect()
    ↓
Kết nối thành công → Provider sẵn sàng
    ↓
Application hoạt động
    ↓
Application shutdown
    ↓
await client.close()
```