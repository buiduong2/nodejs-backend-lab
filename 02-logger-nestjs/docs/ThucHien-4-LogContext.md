## Bước 4 — LogContext (MDC).

- Triển khai một cơ chế tương tự `MDC`
- Sử dụng `ASyncLocalStorage`


## Mục tiêu

- Lưu metadata theo asynchrounous execution Context
- Các hàm được gọi trong cùng context có thể truy cập metdata mà ko cần truyền tham số
- Các request hoặc async exectuin context độc lập ko được làm lẫn dữ liệu của nhau
