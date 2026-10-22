## Tại sao Team lại tách nested : Phân biệt TaskData và CreateTaskDto

- Tái sử dụng dữ liệu giữa các DTO
- Thống nhất request envelope


## Pipeline validation: whilelist = true

-Fielld thừa sẽ bị loại bỏ
- nên khai báo `transform : true`: để nhận đúng plain object đã được validate