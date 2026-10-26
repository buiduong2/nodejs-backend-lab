# 4 — Middleware

- Làm thế nào để chia quá trình xử lý HTTP request thành nhuwgnx function nhỏ, độc lập và phối hợp chùng theo 1 thứ tự xác định

- CHương bao gồm: 
  - viết middleware với 3 tham số `(req,res,next)`
  - Viết và sử dụng error-handling middleware với 4 tham số `(err,req,res, next)`
  - SỬ dụng middelware có sẵn như `morgan` và `express.static`

## 4.1 — Middleware and the middleware stack

- *Một HTTP request đi qua Express như thế nào, và `next()` thực sự đóng vai trò gì trong quá trình đó*

- Nodejs HTTP sử dụng request handler `(req,res)`
- Express tổ chức request processing thành middleware stack
- Middleware thông thường có signature (req,res,next)
- `next()` chuyển quyền xử lý sang middleware tiếp theo
- Middleware có thể trả response hoặc chuyển tiếp
- Response chỉ được kết thúc một lần; thiếu cả response và chuyển tiếp có thể gây treo request
- Tương tự servlet Filter Chain, nhưng `next()` không phải `await` downstream

## 4.2 — Example app: a static file server

- *Bài toán: xây dựng HTTP server có khản ăng phục vụ các file nằm trong thư mục `static`*

### 4.2.1 — Getting set up

- *Cần tổ chức và khởi tạo một Expres Application như thế nào trước khi xây dựng middleware stack ?*

- Static file server: logger -> static file Sender -> 404 Handler
- Mỗi middelware đảm nhận một trách nhiệm và có thể chuyển tiếp hoặc kết thúc response
- Npm start chạy script `start` trong `package.json`
- Middleware độc lập giúp dễ thay thế và tái sử dụng

### 4.2.2 — Writing your first middleware function: the logger

- *điều gì xảy ra khi một middleware không kết thúc response và cũng không chuyển tiếp request*

- Middelware Logger ghi lại thông tin request
- middelware function return không đồng nghĩa response hoàn thành
- không gửi response và không gọi `next()` có thể gây treo request
- `next()` chuyển quyền xử lý sang middelware/route tiếp theo
- Không còn handler phù hợp -> express trả 404
- Response chỉ được kết thúc 1 lần
- `req.url` là URL không phải clientIP

### 4.2.3 — The static file server middleware

- *tìm file tương ứng với URL mà client yêu cầu, gửi file nếu tìm thấy hoặc chuyển request sang middleware tiếp theo nếu không tìm thấy.*
- 3 bước: 
  - kiểm tra file được yêu cầu có tòn tại trong thư mục static hay không
  - nếu file tồn tại, sử dụng res.sendFile() để trả nội dung
  - nếu không tồn tại. gọi next() để chueyern tiếp

```js
import express from 'express';
import path from 'node:path';
import fs from 'node:fs';

const app = express();

// Middleware #1: Logger
app.use((req, res, next) => {
  console.log('Request URL:', req.url);
  console.log('Request date:', new Date());

  next();
});

// Middleware #2: Static file sender
app.use((req, res, next) => {
  const filePath = path.join(
    process.cwd(),
    'static',
    req.url
  );

  fs.stat(filePath, (err, fileInfo) => {
    if (err) {
      next();
      return;
    }

    if (fileInfo.isFile()) {
      res.sendFile(filePath);
    } else {
      next();
    }
  });
});

app.listen(3000);
```

- Static file middleware kiểm tra file, gửi file hoặc gọi `next()`
- `path.join`: tạo đường dẫn; `fs.stat()` lấy metadata, `isFile()` xác định regular file
- Middelware function có thể return trước khi asynchronous IO hoàn thành
- next() giúp express biết khi nào cần tiếp tục xử lý
- Tự động chuyển tiếp khi function return có thể gây sai thứ tự xử lý bất đồng bộ
- Production cần phân biệt lỗi ko tìm thấy file với các lỗi IO khác
- Không dùng trực tiếp URL làm đường dẫn file khi chưa kiểm soát đầu vào

### 4.2.4 — 404 handler middleware

- *Hoàn thiện static file server bằng middleware cuối cùng trả 404 NOT FOUND*

```js
app.use((req, res) => {
  res.status(404).send('File not found!');
});
```

- 404 Handler là fallback middleware thường đặt cuối
- res.status(404).send(...) gửi response 404
- Không cần next nếu middleware chỉ kết thúc response
- Middleware ordering quyết định những handler nào được thực thi
- đặt 404 handler lên đầu sẽ chặn các middleware phía sau
- 404 fallback khác error-handling middleware bốn tham số

### 4.2.5 — Switching your logger to an open source one: Morgan

- *Don't reinvent the wheel*

- Morgan là third-party HTTP request logging middleware
- `morgan('short')` là một middleware factory
- factory nhận cấu hình và trả về middleware function
- có các format như `tiny`, `short` , `combined`
- Cùng middleware interface giúp dễ thay thế implementation
- HTTP access logging khác application Logging
  - Logback: Appender : xuất đi đâu
  - Morgan: Ai đã gửi HTTP request nào, vào lúc nào, và server phản hồi như thế nào?
  - SLF4J: ghi log tạo log một cách ra lệnh

### 4.2.6 — Switching to Express’s built-in static file middleware

```js
import express from 'express';
import path from 'node:path';

const app = express();

const staticPath = path.resolve('static');

app.use(express.static(staticPath));
```

- Static cung cấp : 
  - bảo mật
  - caching
  - chức năng khác ...

- Cơ chế cũ: 
  - tồn tại -> phục vụ
  - không tồn tại -> chuyển tiếp `next()`

- `express.static(root)` là built-in middleware factory
- Phục vụ static files từ thư mục được cấu hình
- Không tìm thấy file -> mặc định chuyển tiếp
- Hỗ trợ caching và xử lý các vấn đề bảo mật/ hiệu năng khi phục vụ file
- Middleware stack: morgan -> express.static() -> 404 handler
- Middelware có thể thay thế mà ko thay đổi trực tiếp kiến trúc stack


## 4.3 — Error-handling middleware

- *Express còn có một luồng xử lý riêng dành cho lỗi.*

- Giả sử có nhiều middleware và request lỗi: 
  - chúng ta muốn: 
    - không tiếp tục ghi các bước nghiệp vụ bình thường khi xảy ra lỗi
    - ghi log để lập trình viên điều tra
    - Trả http  error response phù hợp cho client

- Tìm regular middleware/ bỏ qua regurlar middleware tìm error-handling

- Regular middelware (req,res,next) : error middleware (err,req,res,next)
- Express nhận diện error handler bằng 4 tham số
- next(err) chuyển sang error flow, bỏ qua regurlar middelware
- next(err) tiếp tục error flow , `next()` quay lại normal flow sau vị trí hiện tại
- Error Handlers thường đặt cuối middleware stack
- Có thể tách logging và response handling
- Express 5 xử lý rejected Promise từ async handlers. callback độc lập cần xử lý riêng
- Tương tự @RestControllerAdvice mục tiêu; nhưng khác cơ chế nội bộ

## 4.4 — Other useful middleware

- *Ngoài những middleware đã tự viết, hệ sinh thái Express còn cung cấp những thành phần nào để xây dựng ứng dụng thực tế*

- Mỗi ứng dụng Express có thể sử dụng middleware stack khác nhau.
- body-parser: Request body parsing; Express hiện đại có built-in alternatives.
- cookie-parser: Parse cookies, không tự quản lý sessions.
- compression: Nén HTTP responses.
- helmet: Thiết lập security headers.
- connect-assets: Frontend asset processing theo bối cảnh sách cũ.
- Cần chủ động lựa chọn và đăng ký middleware phù hợp.

## 4.5 — Summary

- Middleware stack: express xử lý Request theo thứ tự các middleware đã dăng kỹ ; trừ khi quá trình bị ngắt bởi một response hoặc lỗi
- Middleware Function : middleware nhận `req`, `res` và thường có `next` để chuyển quyền xử lý
- third-party middleware : express có hệ sinh thái middleware phong phú , bao gồm nhiều package được duy trì bởi các lập trình viên express

