### @Module trong NestJS là gì ?

- NestJS yêu cầu ta tổ chức các thành phần thành Module . Và khai báo rõ các thành phần đó

```js
@Module({
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
```

- Controller: các controller thuộc module
- Providers: các thành phần NestJS quản lý và có thẻ inject thường là Service
- imports: các module khác mà module hiện tại cần sử dụng
- exports: Những provider mà module hiện tại cho phép module khác sử dụng


### forRôt() là gì ?

```js
imports: [UsersModule]

imports: [ConfigModule.forRoot({ isGlobal: true })]
```

- Cái thứ 2 là gọi một phương thức để tạo cấu hình module 

### NestJS có 2 kiểu 

- Stgatic Module 

```js
@Module({
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
```

- Dynamic module 

```js
import { DynamicModule, Module } from '@nestjs/common';

@Module({})
export class ExampleModule {
  static forRoot(name: string): DynamicModule {
    return {
      module: ExampleModule,
      providers: [
        {
          provide: 'APP_NAME',
          useValue: name,
        },
      ],
      exports: ['APP_NAME'],
    };
  }
}
```

- Khi sử dụng 

```js
@Module({
  imports: [ExampleModule.forRoot('Task Management')],
})
export class AppModule {}
```

- `forRoot()` chỉ là một static method của Typescript . Trả về cấu hình `dynamic module` 


### Phân biệt `forRoot()` , `forFeature()`, `forRootAsync()`

Phương thức	Ý nghĩa
forRoot()	Cấu hình chung cho module, thường dùng ở root application
forFeature()	Đăng ký các thành phần dành riêng cho một feature module
forRootAsync()	Cấu hình module thông qua factory, có thể sử dụng DI và async



### Để validate cần thêm 2 package

- NestJS đã cung cấp sẵn `ValidationPipe`


```sh
npm install class-validator class-transformer
```

- Vai trò của từng package

    - Class-validator: cung cấp validator như `@IsString()` , `@IsNotEmpty()` , `@MaxLength`
    - class-transofrmer: Hỗ trợ chuyển đổi object sang DTO class
    - VAlidation Pipe: Thành phần có sẵn của NestJS thực hiện validation trong request lifecyle


### Tiến hành thêm Decorator validator

- Sử udnjg isVAlidSort(sortFields[])
sort?:string;


- Ta sẽ kiểm tra 

## Bài tập 

- Bổ sung: 1. Middleware — `RequestTrackingMiddleware`
- 2. Guard — `ApiKeyGuard`
  - Implmenet canACtive
  - Ddojc x-api-key
  - So sánh với giá trị cấu hình trong `.env` VD `DEMO_API_KEY`.
  - Thiếu hoặc sai key -> `UnauthronizedExcpetion`
  - Đúng API key -> cho phép request
- 3. Interceptor - `RequestLoggingInterceptor`
  - Before Controller: 
    - in log Interceptor BEFORE
    - Lấy `requestId` do middleware đã gắn vào request
    - Ghi nhận thời điểm bắt đầu xử lý
  - After Controller: 
    - Đo thời gian xử lý: 
    - in log `Interceptor AFTER`
    - Bổ xung `requestId` vào response

```json
{
  "data": {
    "id": 1,
    "title": "Learn NestJS",
    "createdBy": {
      "username": "testuser"
    },
    "checklistItems": []
  },
  "requestId": "abc-123"
}
```

## 

- Nghiệp vụ 
  - Bussiness: Merchant
    - NebyhL
    - Đọc menus; 
      - Options groups có các cấp như
      - Item, optionm=,.optoins_grpuips: của Gorup khác và  của merchant và store khác nhau như nào và giống nhau như nào.
      - Luồng Order: 
        - order develery và order pickup khác nhau cốt lỗi 
- NestJS : 