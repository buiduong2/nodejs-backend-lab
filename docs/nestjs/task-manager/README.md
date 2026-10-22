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