# 1 - What is Express?
## 1.1 What is this Node.js business?

- *NodeJs thực chất là gì ?*
- *Tại sao lựa chọn NodeJs để phát triển BE khi đã có Java... và nhiều ngôn ngữ khác ?*

- NOdejs là javascript runtime dựa trên V8, cho phép javascript chạy ngoài trình dueyuejt
- nodeJS hỗ trợ asynchronous I/O giúp xử lý nhiều tác vụ I/O mà ko cần chờ tuần tự
- Concurrentcy không đồng nghĩa với parallelism
  - cocurrency: 
    - quản lý nhiều công việc đang tiến triển trong cùng một khoảng thời gian
    - 1 CPU core chạy nhiều task partial
  - parallelism: xử lý song song
    - thực sự thực thi cùng một thời điểm
    - CPU Core 1 và CPU Core 2 thực thi khác nhau
- Asynchronous programming là một cách giúp tổ chức concurrency
- NodeJS vẫn có thể tận dụng nhiều CORE thông qua Worker Threads
- NodeJs không mặc nhiên nhanh hơn các runtime khác trong mọi trường hợp
- 
- Lợi ích lớn là khả năng dùng Javascript ở cả FE và BE

##  1.2. What is Express?

- *NodejS đã có khả năng xây dựng HTTP server, tại sao chúng ta cần ExpressJS*

- NoteJs cung cấp hTTP server và request handler thông qua module `http`
- Request Handler nhận `req` và `res` để xử lý HTTP request/response
- Express là web framework tối giải xây dựng trên HTTP module của nodejs
- Express bổ sung các tiện ích xử lý Request/Response
- Express giúp chia request handler thành các function nhỏ thông qua Routing và middleware
- Express không thay thế HTTP server của Node.js mà đơn giản hóa việc xây dựng Web application

## 1.3. Express's minimal philosophy

- *Tại sao Express không cung cấp một câu trúc ứng dụng hoàn chỉnh như SPringboot*

- Express là một minimalist và unipoionated framework
  - minimalist: tối giản
  - unipoionated: không áp đặt quá nhiều quy ước
- Không áp đặt cấu trúc project hoặc kiến trúc ứng dụng chặt chẽ
- Có thể mở rộng bằng các thư viện bên thứ 3
- Ưu điẻm: linh hoatj, gọn nhẹ, tránh thành phần không cần thiết
- Nhược điểm: phải tự quyết định kiến trúc và lựa chọn thư viện
- Mỗi cách đều có trade-off

## 1.4 — The core parts of Express

- *Express cung cấp những thành phần cốt lõi nào để xây dựng một web application*

### 1.4.1. Middleware

- *Request đến handler sẽ trải qua nhiều công việc trước. Cần chia nhỏ*

- Middleware chia quá trình xử lý HTTP request thành nhiều function nhỏ. Có thể tái sử dụng
- Các middleware được tổ chức code thành một chuỗi xử lý (middleware stack)
- Middelware có thể thực hiện logging, autheitncation, xử lý headers hoặc trả về response
- `next()` chuyển quyền xử lý sang middleware/handler tiếp theo
- `res.send()`: hoặc `res.json()` gửi và kết thúc HTTP response
- middelware có thể chặn request bằng cách trả response mà ko gọi `next()`

### 1.4.2. Routing

- *Routing giải quyết bài toán xác định function nào cần được thực thi dựa trên HTTP method và URL của request*

- Routing xác định request handler dựa trên HTTP method và URL Path
- Express định nghĩa routes qua `app.get()` , `app.post()` , `app.put()`, `app.delete()`
- Middleware thường xử lý logic dùng chung, Routing xử lý endpoint cụ thể
- Middleware và Routing phối trong cùng request process pipeline

### 1.4.3. Subapplications

- *Chia một Express Application lớn thành những phần nhỏ hơn, được tổ chức độc lập về mặt code*
- Subapplicaiton giups chia exxpression Application thành nhiều thành phần nhỏ'
- Express sử dụng `Router` để nhóm các routes và middelware liên quan
- Tạo router bằng `express.Router()` hoặc `Router()`
- Dùng `app.use('/prefix', router)` để mount Router vào ứng dụng
- Router có thể chứa các Router khác (nested Routers)

### 1.4.4. Conveniences

- *Những phương thức và thuộc tính tiện ích mà Express cung cấp để đơn giản hóa những thao tấc này*

- Express cung cấp các tiện ích đơn giản hóa HTTP request /response handling 
- res.sendFile() giúp gửi file về client
- req.ip cung cấp địa chỉ IP được xác định cho request
- `res.status()`, `res.send()` , `res.json()` giúp xây dựng HTTP response thuận tiện
- conveniences không thay đổi kiến trúc ứng dụng mà chủ yếu giúp giảm code xử lý HTTP cấp thấp

## 1.5 — The ecosystem surrounding Express

- *Express không phải một framework hoạt động độc lập. Nó nằm trong hệ sinh thái NodeJS và có thể kết hợp nhiều thư viện khác*

### 1.5.1. Express vs. other web application frameworks

- Express là minimalist web framework thuộc hệ sinh thái NodeJS
- Các framework nhỏ như flaskm sinatra có triết lý gần với Express
- Các framework lớn thường cung cấp nhiều chức năng và quy ước hơn
- Kraken và sails.js là ví dụ về việc mở rộng Express
- Express linh hoạt nhưng yêu cầu lập trình viên tự quyết định nhiều vấn đề kiến trúc
- Lựa chọn phụ thuộc trade-off

### 1.5.2. What Express is used for

- Express có thể dùng để xây dựng nhiều loại web applications
- Fullstack JS cho phép dùng chia sẻ js giữa Frontend và Backend
- MEAN stack: MongoDB + Express + Angular + NodeJS
- Express phù hợp để xây dựng REST APIs và phục vụ tài nguyên cho SPA
- Express có thể kết hợp các công nghệ real-time như WebSocket/ WEbRTC
- Express không bắt buộc sử dụng MongoDB hay FE framework cụ thể nào

### 1.5.3 — Third-party modules for Node.js and Express

- *Vậy khi cần kết nối database, quản lý session, bảo mật hay kiểm thử, chúng ta sẽ làm thế nào?*

- Express thường kết hợp với Third-party modules để bổ sung chức năng
- modules có thể dành riêng cho Express hoặc NodeJs nói chung
- Express không tích hợp database hoặc template engine mặc định
- Có thể kết hợp với SQL, noSQL security libraries và testing tools
- Không có loại module riêng tên và Express module; Express cũng là một Nodejs package
- npm được sử dụng để cài đặt và quản lý packages


## 1.6 — The obligatory Hello World

- *Ứng dụng thực tế đơn giản*

```js
var express = require("express");

var app = express();

app.get("/", function(request, response) {
  response.send("Hello, world!");
});

app.listen(3000, function() {
  console.log("Express app started on port 3000.");
});
```

- `express()` tạo express application
- `app.get(path,handler)` đăng kí route xử lý HTTP GET
- `res.send()` gửi dữ liệu và kết thúc response
- `app.listener(port)`: khởi động HTTP server
- Route Handler chỉ được thực thi khi có request phù hợp

## 1.7. Summary

- Express là một framework tối giản; linh hoạt và ít áp đặt quy ước
- middleware chia quá trình xử lý request thành nhiều function
- Routing xác định handler phù hợp với request
- Routers cho phép tổ chức các ứng dụng lớn thành những thành phần nhỏ
- Conveniences giúp viết request handlers ngắn gọn hơn 