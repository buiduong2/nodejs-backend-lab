##  23/10/2026

### Project

- [ ] Chuyển hết ID của các entity sang UUID
- [x] Cần Ghi log vào DB thay vì chỉ stdout
- [x] So sánh Mapping giữa Select projection. Và Mapping bằng DTO sau khi full select
- [ ] Sử dụng Task dạng tự SELF JOIN thay vì tạo ra một Checkitem

### Lý thuyết 

### 1. Các Cách mapping 

- `Trả entity trực tiếp cho client`
- `Mapping thủ công bằng Code`
- `Class transformer`
  - Sử dụng plainToInstanec() ,. `@Expose()` , và `@Exclude()`
- `Serialization Interceptor`: 
  - Sử dụng ClassSerializerInterceptor của NestJS
- Entity Projection
  - Dùng `select/addSelect` + `getOne/getMany()` để lấy Entity với các field được chọn
- Raw Query Projection
  - select + getRawOne/getRawMany()
- Automated Mapping
  - dụng thư viện như @automapper/core, @automapper/classes

### 2. ý nghĩa của DTO

- Che dấu dữ liệu 
- DTO  được thiết kế theo usecase của  tầng Controller  với client không phụ thuộc voaf Schema
- Entity không nhất thiết có cùng kiến trúc với Response
- Giảm độ ràng buộc giữa Schema và database


### 3. So sánh ưu nhược điểm của `Entity Manual Mapping` vs `QUery Projection + DTO`


| Tiêu chí                     | entity + mapper                                                             | Raw Projectino + DTO                 |
| :--------------------------- | :-------------------------------------------------------------------------- | :----------------------------------- |
| Dữ liệu query                | Có thể lấy toàn bộ hoặc chọn field                                          | Chủ động chọn field cần thiết        |
| Hydrate Entity               | Có                                                                          | Không                                |
| Mapping tại Application      | Tường minh                                                                  | ít không cần                         |
| Hiệu suất                    | Có thêm chi phí hydrate và map (select nhiều và tạo thêm ENtity trung gian) | Thường lợi hơn chi chỉ đọc ít field  |
| Nested Object                | dễ xử lý                                                                    | Phức tạp hơn                         |
| Quan hệ One-to-many          | Thuận tiện                                                                  | Dễ bị lặp hàng, phải group           |
| Bảo trì khi thay đổi Entity  | Mapper giúp tách biệt                                                       | Alias SQL có thể cần sửa             |
| Type safety                  | Tốt                                                                         | Phụ thuộc vào query trả lias và kiểu |
| Độ dài                       | Thêm Mapper                                                                 | Ngắn hơn                             |
| Tai sử dụng logic chuyển đổi | TỐt                                                                         | THường gắn với từng Entity           |




## Dùng add SELECT tối ưu hơn như thế nào so với map response bằng code.

- `Tối ưu hơn`
    - Tối ưu hóa Network Payload: giảm băng thông mạng
    - Tối ưu hóa Bộ nhớ (Memory Footprint) trên Node.js Server
    - Tận dụng sức mạnh xử lý của Database Engine
    - code ngắn gọn hơn

- `Không tối ưu hơn`
  - Ít tường minh
  - Map = code ->  Có thể  tái sử dụng
  - Map = code -> Type safety 