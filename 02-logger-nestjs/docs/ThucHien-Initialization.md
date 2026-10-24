## 1. Tạo npm workspace


```sh
npm init -y
```

### Cài các dependency cần thiết

-Typescript


```sh
npm install -D typescript @types/node
```

- Cài các package NestJS cần thiết

```sh
npm install -D @nestjs/common @nestjs/core reflect-metadata rxjs
```

- Khai báo `peerdepdencies` sau


### Cấu hình typescirpt

- `tsconfig.json`

```ts
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "moduleResolution": "Node",
    "lib": ["ES2022"],
    "declaration": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["dist", "node_modules"]
}
```



## tạo Cấu trúc sourcode ban đầu 

```sh 
mkdir -p src/core src/context src/sinks

touch src/index.ts
touch src/core/log-entry.ts
touch src/core/log-level.ts
touch src/sinks/log-sink.interface.ts
```


```
nest-logging/
│
├── src/                              # Source code của thư viện
│   │
│   ├── core/                         # Các thành phần cốt lõi của logging
│   │   ├── app-logger.ts             # Logger API: info(), warn(), error(), debug()
│   │   ├── log-entry.ts              # Interface mô tả một log event
│   │   ├── log-level.ts              # Định nghĩa LogLevel và quy tắc lọc level
│   │   └── log-dispatcher.ts         # Phân phối LogEntry đến nhiều LogSink
│   │
│   ├── context/                      # Quản lý execution context (MDC)
│   │   ├── log-context.ts            # AsyncLocalStorage: lưu và truy xuất MDC
│   │   └── request-context.middleware.ts
│   │                                  # Khởi tạo requestId cho HTTP request
│   │
│   ├── sinks/                        # Các implementation ghi log
│   │   ├── log-sink.interface.ts     # Hợp đồng write(LogEntry)
│   │   ├── console.sink.ts           # Ghi log ra stdout
│   │   └── mongo.sink.ts             # Ghi log xuống MongoDB
│   │
│   ├── constants/                    # Injection token và hằng số dùng chung
│   │   └── logging.tokens.ts         # Ví dụ: LOG_SINKS, LOG_OPTIONS
│   │
│   ├── interfaces/                   # Các kiểu dữ liệu cấu hình thư viện
│   │   └── logging-options.ts        # Options cho LoggingModule.forRoot()
│   │
│   ├── logging.module.ts             # Dynamic Module đăng ký các providers
│   └── index.ts                      # Public API: export những gì người dùng được import
│
├── test/                             # Unit test / Integration test
│   ├── app-logger.spec.ts            # Test level filtering, loggerName, LogEntry
│   ├── log-context.spec.ts           # Test MDC giữa các async execution context
│   └── log-dispatcher.spec.ts        # Test multiple Sink và xử lý lỗi
│
├── playground/                       # NestJS app nhỏ để thử nghiệm thư viện
│   └── src/
│       ├── main.ts                   # Bootstrap HTTP application
│       ├── app.module.ts             # Import LoggingModule và cấu hình Sink
│       ├── app.controller.ts         # Tạo API thử nghiệm logging
│       └── app.service.ts            # Test AppLogger, INQUIRER và MDC
│
├── package.json                      # Package metadata, dependencies, scripts
├── tsconfig.json                     # Cấu hình TypeScript của thư viện
├── tsconfig.build.json               # Build source library, loại trừ test/playground
├── .gitignore                        # Bỏ qua node_modules, dist, .env...
└── README.md                         # Hướng dẫn cài đặt và sử dụng thư viện
```


## Thực hiện

- Constract first -> Core implentation -> nestJS intergration -> infrastructure



