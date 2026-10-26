## Thay đổi model của Task

- Hiện tại

```
User
 └── Task
      ├── ChecklistItem A
      ├── ChecklistItem B
      └── ChecklistItem C
```

- sau khi thay đổi

```
User
 └── Task A
      ├── Task A.1
      │    └── Task A.1.1
      └── Task A.2

Task B
 └── Task B.1
```

## làm gì với `checklistItems`


- Giữ TABLE
- ngừng sử dụng ChecklistItem trong code
- chuyển sang ON DELETE CASCADE

## 4. Lộ trình thực hiện
- `1 Entity`
- Thêm parent và children vào Task, chưa xóa ChecklistItem.

- `2 Migration`
- Tạo migration chỉ thêm parent_id UUID nullable và FK self-reference vào tasks.
- `3 Service`
- Hỗ trợ tạo Task con bằng parentId, kiểm tra parent tồn tại.

- `4 Query`
- Lấy Task kèm children; trước tiên chỉ truy vấn một cấp.

- `5 Validation nghiệp vụ`
- Không cho Task làm parent của chính nó; kiểm tra vòng lặp khi đổi parent.

- `6 Test và commit`
- Kiểm thử Task gốc, Task con, xóa parent và dữ liệu cũ.