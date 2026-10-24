### Nền tảng IoC/DI trong NestJS

- `IoC` (inversion Of Control) : là nguyên tắc : object không tự quản lý toàn bộ việc tạo và liên kết các dependency của mình, mà giao quyền điều phối đó cho framework/container

- `DI`: Dependency Injection: Là một cách thực hiện IoC: depdency được cung cấp từ bên ngoài



### So sánh với Spring

| SpringBoot           | nestJS                            |
| :------------------- | :-------------------------------- |
| ApplicationContext   | NestJs IoC Container              |
| @Component, @Service | @Injectable()                     |
| @Configuration       | @Module()                         |
| @Bean                | Custom Provider                   |
| @Autowired           | Constructor Injection             |
| @Qualifier           | @Inject(TOKEN)                    |
| singleton            | Scope.DEFAULT                     |
| prototype            | Scope.TRANSIENT (gần tương đương) |


- `@Injectable()` không tự động đăng kí class vào toàn bộ ứng dụng: 
  - provider vẫn cần nằm trong `providers` của một module hoặc module khác export cho nơi sử dụng

### Provider

- `Token`: Dùng để tìm Dependency
- `Provider Definition` : quy định cách tạo hoặc lấy dependency
- `Instance`: object thực tế được inject


- Các cú pháp: 

```ts
providers: [LogContext]
```

- Tương đương

```
providers: [
    {
        provide: LogContext,
        useClass: LogContext
    }
]
```


### Các kiểu Provider quan trọng

| Kiểu        | Ý nghĩa                               |
| :---------- | :------------------------------------ |
| useClass    | Container tạo instance từ Class       |
| useValue    | Container cung cấp giá trị có sẵn     |
| useFactory  | Container gọi Function để tạo giá trị |
| useExisting | Token khasc trỏ đến provider đã có    |


### Value 

```ts
{
    provider: LOG_MIN_LEVEL
    useValue: 'info'
}
```

- Gần giống

```java
@Bean
public LogLevel minimumLevel() {
    return LogLevel.INFO
}
```

### Value Injection (tương đương Spring @Value)

- NestJS không có sẵn @Value tương đương Spring.

- ConfigService: đọc configuration/environment.

- useValue: đăng ký một giá trị có sẵn vào DI Container.

- `@Inject(TOKEN)`: yêu cầu NestJS inject giá trị thông qua token.
```js
{
  provide: LOG_MIN_LEVEL,
  useValue: 'info',
}

@Inject(LOG_MIN_LEVEL)
private readonly minLevel: LogLevel
```
### UseFactory


```ts
{
    provide: ConsoleSink,
    useFactory: () => new ConsoleSink(textFormatter)
}
```

- Tương tự

```java
@Bean
public ConsoleSink consoleSink() {
    return new ConsoleSink(textFormmater)
}
```


#### Factory vẫn có thể cung cấp DI


```ts
{
    provide: LogDispatcher,
    useFactory: (sinks: LogSink[]) => {
        return new LogDispatcher(sinks);
    },
    inject: [Log_Sink]
}
```

### 5. Module quản lý phạm vi nhìn thấy của Provider

```ts
@Module({
  providers: [LogContext],
  exports: [LogContext],
})
export class LoggingModule {}
```

- `providers`: Những dependency được đăng kí trong module
- `exports`: những provider mà module khác được phép sử dụng
- `imports`: Những module khác mà module hiện tại muốn sử dụng provider đã export chúng


### 6. Dynmaic Module 

- Static Module: metadata cố định trong @Module().

- Dynamic Module: static method như forRoot() trả về metadata có thể được xây dựng từ cấu hình.

- Metadata động được kết hợp với metadata của @Module().

- forRoot() không phải constructor và không tạo provider mỗi request.

```ts
@Module({})
export class LoggingModule {
  static forRoot(level: LogLevel): DynamicModule {
    return {
      module: LoggingModule,
      providers: [
        {
          provide: LOG_MIN_LEVEL,
          useValue: level,
        },
      ],
      exports: [LOG_MIN_LEVEL],
    };
  }
}
```


### 7. SCope và INQUIRER

- INQUIRER: Injection token cho phép lấy thông tin consumer đang yêu cầu provider.

