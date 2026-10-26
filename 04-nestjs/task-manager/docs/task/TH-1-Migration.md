## 1. Kiểm tả hiện trạng

- Xác định các Key hiện tại
- Xác định các Foregin Key

- Xác định SỐ lượng các Key

- `Tổng kết`
| Bảng            | Primary Key          | Foreign Key        |
| :-------------- | :------------------- | :----------------- |
| users           | id INTEGER, Sequence | —                  |
| tasks           | id INTEGER, Sequence | created_by INTEGER |
| checklist_items | id INTEGER, Sequence | task_id INTEGER    |

- Số bản ghi
  - users: 1
  - tasks: 1
  - checklistitems: 

## 2. Tạo backup database 

- Suwr sử dụng `pg_dump`

```sh
docker exec express-postgres \
  pg_dump \
  -U postgres \
  -d task_management_nestjs \
  -F c \
  --no-owner \
  --no-acl \
  > task_management_before_uuid.dump
```


## 3. Lộ trình migration UUID 

- Expand Schema: 
  - thêm các cột UUID mới, giữ nguyên toàn bộ ID số hiện tại
- Backfill UUID: 
  - Sinh UUID v4 cho 30 bản ghi và tạo ánh xạ ID cũ -> UUID mới
- Migrate foregin keys
  - Chuyển tasks.created_by và checklist_items.task_id sang tham chiếu UUID.
- Vakudate dữ liệu
  -  Kiểm tra UUID duy nhất, không NULL, mọi quan hệ PK/FK chính xác.
-  Switch Schema
   -  Đổi khóa chính, khóa ngoại, tên cột và cấu hình tự sinh UUID.
-  Refactỏ nestJS
   -  Đổi Entity, DTO, Controller, Service và Validation sang string UUID.
-  Regression Test
   -  Kiểm tra dữ liệu cũ, CRUD và toàn vẹn quan hệ; hoàn tất migration.
-  


### đặc điểm

- PostgreSQL 
  - Hỗ trợ transaction trong cả các câu lệnh DDL