### Bước 8 — Chuẩn hóa npm package

- Mục tiêu: 
  - ko phải publish thư viện npm ngay
  - Người dùng chỉ cần `npm install` là sử dụng được thư viện
  - Không phải tự build Typescript
  - package không chứa `/playground/` `/docs`, source test, hoặc build cache
  - `NestJs` dependencies không bị đóng gói trùng lặp không cần thiết
  - Typescript nhận diện đầy đủ Publish API


### Sửa file package.json

- Thêm các sciprt 
- `clean`
- `prepack`

#### `build` và `prepack` khác nhau thế nào ?

- khi chạy `npm pack`

- npm tự kích hoạt lifecycle `prepac`

```
npm pack
    │
    ├── prepack
    │      └── npm run build
    │               └── tsc -p tsconfig.build.json
    │
    └── Đóng gói các file vào .tgz
```

- `prepack` là một `lifecyle hook` để đảm bảo package được build trước khi đóng gói

### 2. Phân biệt các cơ chế cấu hình

- `tscnofig.build.json` - quyết định typescript biên dịch những source file nào
- `package.json -> files` : quyết định những file nào được đóng gói vào npm packages
- `package.json -> prepack` tự đông jchayj build trước khi đóng gói


### 3. kiểm thử package giống khi phát hành thật


```sh
npm run build
npm pack --dry-run
```

- kiểm tra chỉ nhấn các file cần thiết

```sh
npm pack 
``` 

- Tạo ra một file `.tgz` là artifact gần với package mà người khác tải từ npm registry

### Cơ chế mặc định của npm khi đóng gói

- Có thể đóng gói nhiều file trong thư mục dự án tùy theo `.npmignore`, `.gitignore` và cấu hình pacakge

- `files vs .gitingore`
  - files quản lý bởi `npm`
  - Không đưa file thừa vào packages
  - Và ta cần đóng gói file đã build chứ ko phải ignore như git

## prepbuild

```
npm run build
     │
     ├── prebuild
     │     └── npm run clean
     │
     └── build
           └── tsc -p tsconfig.build.json
```

- Khi chạy `npm pack`

```
npm pack
   │
   └── prepack
         └── npm run build
               ├── prebuild → clean
               └── build → tsc
```


### Người dùng cái đặt

```sh
npm install nest-logging
```

```
npm Registry
    │
    ▼
Tải package tarball (.tgz)
    │
    ▼
Giải nén vào node_modules/nest-logging/
    │
    ├── dist/
    │   ├── index.js
    │   └── index.d.ts
    │
    └── package.json
```

- prepack không được chạy lại.
- prebuild không tự động chạy.
- clean không tự động chạy.
- build không tự động chạy.