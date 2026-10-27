### Authentication

- `Phase Auth 1 — Login & JWT`
Tạo AuthModule, AuthService, POST /auth/login, kiểm tra password và sinh access token.

- `Phase Auth 2 — JWT Guard`
Viết JwtAuthGuard để đọc Bearer token, verify chữ ký, kiểm tra hạn và gắn authenticated user vào request.

- `Phase Auth 3 — CurrentUser Decorator`
Tự tạo @CurrentUser() và sử dụng trong TasksController, thay thế cách lấy userId cố định hiện tại.

- `Phase Auth 4 — Authorization`

Viết @Roles() + RolesGuard, sau đó kiểm tra ownership để user không thể sửa hoặc xóa Task của người khác.

### Tạo Decorator Authorization

- `SetMetadata()`
  - thực chất là một hàm tạo Decorator, dùng để gắn thông tin bổ xung vào class hoặc method

- `SetMetadata() lưu cái gì ?`

```ts
export const Roles = (...roles: string[]) =>
  SetMetadata('roles', roles);

@Roles('ADMIN', 'USER')
@Get()
findAll() {}
```

- NestJS gắn metadata vào method `findAll`

- `Reflector`

```ts
const roles = this.reflector.get<string[]>(
  'roles',
  context.getHandler(),
);
```

- Lấy metadata có key `roles` đã được gắn vào method Controller đang xử lý request

### Passport 

#### Cài thư viện

```sh
npm install @nestjs/passport passport passport-local @nestjs/jwt
npm install -D @types/passport-local
```
#### Các thành phần tham gia

- Logic Nghiệp vụ ta tự viết: Tìm user trong PostgreSQL, so sánh password, xác định thông tin User và tạo JWT
- Logic bảo mật do thư viện đảm nhiệm: 
  - Xác thực username/password thông qua Passport strategy, hash/verify password bằng thư viện, ký JWT bằng `@nestjs/jwt`

#### Luồng 

```
POST /auth/login
Body: { username, password }
          │
          ▼
    AuthGuard('local')
          │
          ▼
     LocalStrategy
          │
          ▼
 AuthService.validateUser()
          │
          ├── Tìm User trong PostgreSQL
          ├── So sánh password hash
          └── Trả về AuthUser
          │
          ▼
       request.user
          │
          ▼
 AuthController.login()
          │
          ▼
 AuthService.login()
          │
          ▼
  JwtService.signAsync()
          │
          ▼
 { accessToken: "eyJ..." }
```

- Các công việc: 
    - Authenticaiton: Kiểm tra tài khoản và mật khẩu có đúng không. Passport Local thực hiện **trước Controller**
    - Token Issuance: Tạo access Token cho user đã xác thực. **Controller gọi Auth Service thực hiện**

#### Passport Strategy 

- Các loại strategy
  - `local` : xác thực bằng username/password
  - `jwt` : xác thực bằng JWT
  - `google` : Xác thực thông qua OAuth

### Thứ tự chạy Guard trong NestJS

```
HTTP Request
    ↓
JwtAuthGuard.canActivate()
    │
    ├── Xác thực JWT
    └── Gắn request.user
    ↓
RolesGuard.canActivate()
    │
    ├── Đọc @Roles()
    └── Kiểm tra request.user.role
    ↓
TasksController.findAll()
```


### createParamDecrator

= 