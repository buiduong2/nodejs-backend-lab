# 3 — Foundations of Express

## 3.1 — Middleware

### 3.1.1 — Hello World with Express

- Express laf abstraction layer trên HTTP server của Nodejs
- express() tạo application có thể đóng vai trò HTTP request listener
- http.createServer(app) kết nối Express với NodeHTTP server
- app.listen(port) là shorthand của http.createServer(app).listen(port)
- app.use() đăng kí middleware xử lý request
- res.end() kết thúc response middleware này k gọi next()

### 3.1.2 — How middleware works at a high level

- *Khi nào request tiếp tục qua `next()` khi nào dừng lại, và vì sao thứ tự middelware ảnh hưởng đến kết quả xử lý*

- Express chia request proccessing thành nhiều middelware
- Middleware được xét theo thứ tự đăng kí
- middelware có thể đọc/ thay đổi `req` hoặc `res`
- có thể chuyển tiếp hoặc kết thúc bằng response
- không response và chuyển tiếp -> request có thể bị treo
- VD logging -> AUthorization -> Response
- Gần với Servlet Filter Chain, nhưng `next()` không giống hoàn toàn `chain.doFilter()`

### 3.1.3 — Middleware code that's passive

- *Middleware chỉ thực hiện một công việc phụ rồi chuyển request cho middleware tiếp theo *
```js
function myFunMiddleware(request, response, next) {
  // Thực hiện một công việc nào đó
  next();
}
```

- Passive middleware thực hiện công việc phụ, chẳng hạn logging rồi chuyển tiếp
- middleware thường có chữ kixys (req,rés,next)
- next(): chuyển quyền xử lý sang middleware tiếp theo
- app.use(): đăng ký middleware theo thứ tự
- Express giữ các API HTTP của NodeJS và bổ xung coenvenience methods
- next() ko chờ toàn bộ xử lý bất đồng bộ phía sau hoàn tất

### 3.1.4 — Middleware code that changes the request and response

- *Middleware có khả năng quyết định luồng xử lý request*

- Middleware có thể thay đổi request/response không chỉ ghi log
- `next()`: chuyển request sang middleware tiếp theo
- middleware có thể trả response ngay để chặn request
- VD Logging -> AUthentication -> Protected Response
- Khi bị từ chối -> trả `403` và không gọi `next()`
- `res.send()`: kết thúc response , `return` kết thúc function
- Có thể bổ sung dữ liệu vào `req` cho handler phía sau

### 3.1.5 — Third-party middleware libraries

- *Express hỗ trợ middleware tự viết và middleware từ thư viện bên thứ 3, cùng tham gia vào request processing pipeline*

- Third party middleware được cài từ npm và đăng kí qua `app.use()`
- `morgan`: HTTP request logging , `morgan('dev')` trả về middleware function
- `express.static(root)` phục vụ HTML, CSS hình ảnh và các static files
- Không tìm thấy file `express.static()` mặc định chuyển tiếp
- `path.resolve() from 'node:path'`: hỗ trợ xử lý đường dẫn, ESM không có sẵn `__dirname` như CommonJS
- Sách còn giới thiệu Helmet, cookie-parse, response-time và rate limiting
- Thứ tự đăng kí middleware vẫn quan trọng

## 3.2 — Routing

- *Làm thế nào dể thực thi một handler khi có request HTTP method và URL phù hợp, thay vì mọi Request đều đi qua một middleware chung*

- Routing ánh xạ HTTP method + URL tới handler
- `app.get`, `app.post` ... đăng kí các HTTP routes
- Route Handlers tham gia vào request processing pipeline
- `:param` định nghĩa tham số đường dẫn, đọc qua `req.params`
- VD /tasks/:taskId -> req.params.táskId
- fallback 404 thường đặt sau các routes
- Thứ tự khai báo quan trọng: Express 5 có thay đổi về cú pháp route Matching


### Cơ chế lookup so với Java Spring

- Cấu trúc Routing: 
  - Spring MVC: handlerMapping với Registry và cơ chế lookup
  - Express: stack các layers/routes
- Rout tĩnh: 
  - Spring: có tối ưu trả cứu mapping trực tiếp
  - Express : Duyệt và kiểm tra các layers phù hợp
- Route động: 
  - Sprign: Pattern Matching: 
  - Express: Pattern Matching
- Thứ tự đăng kí: 
  - Sprign: thường không dùng để quyết định ưu tiên route
  - Express: có ý nghĩa quan trọng
- Trùng lặp RouteL: 
  - Spring: cso thể gây loloix ambigous mapping
  - Express: Có thể khai báo nhiều Handler cùng route
- Cách chuyển tiếp: 
  - Spring : dispatcher và handler Chain
  - express:  next, next('route') 

## 3.3 — Extending request and response

- *Express giữ lại khả năng vốn có của Node.js HTTP request/Response và bổ xung nhiều convenience APIS để giảm boilerplate*

- Express mở rộng `INcommingMesage` và `ServerResponse` của Nodejs
- `res.redirect(url)`: HTTP redirect , mặc định 302
- `res.sendFile(path)`: Gửi file qua http
- `req.ip` : IP client; chịu ảnh hưởng của `trust proxy`
- `req.get(name)`: Lấy request header
- `res.status(code)`: thiết lập status, res.send(body): gửi response
- Không cần thuộc mọi API; hiểu cơ chế và tra document khi cần

## 3.4 — Views

- *Server cần gửi trả về một trang HTML có nội dung khác nhau theo người dùng*
- View tạo HTML động thông qua template engine
- app.set('views', path) chỉ định thư mục template
- app.set('view engine', 'ejs'): Chọn EJS
- res.render('index', data): render template rồi gửi HTML

## 3.5 — Example

- *Thấy middleware , routing , request body parsing, views, và HTTP redirect phối hợp với nhau như thế nào*

### 3.5.1 — Getting set up

- *Thiết lập ban đầu*

- Một ứng dụng ví dụ kết hợp middleware, routing, views, và HTTP POST
- `package.json` có thể khai báo các npm scripts
- `npm start` chạy `scripts.start`
- sách sử dụng Express, Morgan, body-parser và EJS
- `body-parser`: xử lý HTTP request body
- Express hiện đại có `express.json()` và `express.urlencoded()`
- `req.body`  cần được validate trước khi sử dụng

### 3.5.2 — The main app code

- APp kết hợp Views, middleware , GET , POST routes và redirect
- `app.locals`: dữ liệu phạm vi ứng dụng, dùng chung cho templates
- `express.urlencoded()`: parse form body vào `req.body`
- body parser phải được đăng ký trước những routes cần sử dụng
- POST: Validate -> lưu dữ liệu -> redirect
- Post/Redirect/ GET phù hợp HTML forms; REST API thường trả JSON 201
- 404 fallback middleware đặt cuối danh sách routes

## 3.6 — Summary

