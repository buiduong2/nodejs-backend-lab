
## Hiên tại

- `Hiện trạng`

```js
  @PrimaryGeneratedColumn()
  id: number;
```

- Tương đương: `SEQUENCE`
- Nhưng tự gọi `nextVal` và `RETURNING`


- `Mong muốn`
  
```js
@PrimaryGeneratedColumn('uuid')
id: string; // Không phải number
```

- PostgreSQL là nơi thực sự sinh UUID
- sau khi insert thì `RETURN id`



```js
// Application tự quản lý UUID
export abstract class TaskBaseEntity {
  @PrimaryColumn('uuid') 
  id: string;
}


// Khai báo default một function cụ thể để sinh ID
@PrimaryColumn('uuid', {
  default: () => 'gen_random_uuid()',
})
id: string;
```

## DB cần thay đổi

### UUID khác BIGINT ở điểm nào


- Kích thước
  - UUID lớn hơn
- Giá trị: 
- Có thể đoán giá trị: 
  - BIGINT dễ đoán
- Index: 
  -  BIGINT hiệu quả hơn
-  Sắp xếp: 
   -  BIGINT tốt
   -  Nhưng UUID cũng hỗ trợ

### UUID được tọa ở NodeJS hay TypeORM hay ProgresSQL

### Dữ liệu sẵn có làm thế nào ?

