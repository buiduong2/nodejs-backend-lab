## Datasource để làm gì ??

- file này chỉ phục vụ `TypeORM CLI` ko cần khai boas module

### Thêm script trong `package.json`


```json
{
  "scripts": {
    "typeorm": "typeorm-ts-node-commonjs",
    "migration:generate": "npm run typeorm -- migration:generate",
    "migration:run": "npm run typeorm -- migration:run -d src/database/data-source.ts",
    "migration:revert": "npm run typeorm -- migration:revert -d src/database/data-source.ts"
  }
}
```

- Cài thêm ts-node

```sh
npm install -D ts-node
```

- Hỗ trợ chạy CLI với typsescript thông qua `typeorm-ts-node-commonjs`

### Chạy thử

```sh
npm run migration:generate -- \
  src/database/migrations/InitialSchema \
  -d src/database/data-source.ts
```


## generate Migration và Run Migration

- `Cách 1 — Tự động generate từ Entity (chúng ta đang sử dụng)`

```sh
npm run migration:generate -- \
  src/database/migrations/InitialSchema \
  -d src/database/data-source.ts
```

- Đọc metadata của các Entity.
- Kết nối PostgreSQL và kiểm tra cấu trúc database hiện tại.
- So sánh Entity metadata với database.
- Sinh file Migration chứa các câu SQL cần thực hiện.

- File được sinh
```js
export class InitialSchema1792670000000
  implements MigrationInterface {

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "tasks" (
        "id" SERIAL PRIMARY KEY,
        "title" varchar NOT NULL,
        "description" varchar NOT NULL
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "tasks"`);
  }
}
```


## cách 2 tự viết migration 

- Tự tạo file migration rỗng

```sh
npm run typeorm -- migration:create \
  src/database/migrations/InitialSchema
```


- Rồi tự viết
```js
async up(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(`
    CREATE TABLE tasks (
      id SERIAL PRIMARY KEY,
      title VARCHAR(150) NOT NULL
    )
  `);
}
```


### 4. Điểm quan trọng

- Migration generate. `Không so sánh Entity với các file migration cũ`

- mà so sánh

```
Entity metadata hiện tại
           VS
Schema thực tế trong PostgreSQL
```


### Quy trình đúng 

- Sửa Entity → Generate Migration → Review SQL → Run Migration → Commit code.

### kiểm tra lịch sử 

```sql
SELECT * FROM migrations;
```