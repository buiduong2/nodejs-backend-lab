## Thiết lập type ORM 


```sh 
npm install @nestjs/typeorm typeorm pg
```

- Cài đặt `@nestjs/typeorm` -> Tích hợp ORM và NestJS
- `typeorm` -> ORM xử lý Entity Query Builder
- `pg`: Progress Driver

## một số điểm khác biệt đáng chú ý giữa `typeORM` và `hibernate`

### 3. Khác biệt về Transaction
```js
@Transactional
public void createTask() {
    taskRepository.save(task);
    checklistRepository.save(checklist);
}
```

```js
await this.dataSource.transaction(async (manager) => {
  await manager.save(Task, task);
  await manager.save(ChecklistItem, checklist);
});
```

### 4. Lazy Loading 


- lazy relation sử dụng Promise
- Mặc định typeORM chỉ có lazy loading
- Nếu muốn eager thì phải khai báo rõ
```js
@OneToMany(() => ChecklistItem, item => item.task)
items: Promise<ChecklistItem[]>;

@OneToMany(() => Price, (price) => price.merchant)
prices: Price[];
```

- mặc định `eager: false` với mọi loại relation


### 6. `save` và `update`


- Ko tương thích hoàn toàn
- `save`
  - insert hoặc update tùy trạng thái định danh của entity
- `update`
  - thực hiện cập nhật trực tiếp theo điều kiện
  - ko cần tải entity trước


## config Typescript

forRoot() + process.env	forRootAsync() + ConfigService
Viết nhanh	Có	Dài hơn
Sử dụng DI	Không	Có
Dễ mock khi test	Kém linh hoạt hơn	Linh hoạt hơn
Cấu hình tập trung	Có thể	Thuận tiện hơn
Phù hợp demo	Có	Có
Khuyến nghị cho project	Dùng được	Nên ưu tiên



- `synchronize: true`
  - tự động thay đổi schema database khi ứng dụng khởi động. Chỉ nên dùng để thử nghiệm databas có thể xóa. 
  - 