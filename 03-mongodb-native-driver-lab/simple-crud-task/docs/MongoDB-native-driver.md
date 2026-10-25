## So sánh JDBC, Hibernate và MongoDB Driver

| Khái niệm                            | JDBC                          | hibernate JPA                 | MongoDB nodejs driver        |
| :----------------------------------- | :---------------------------- | :---------------------------- | :--------------------------- |
| ĐỐi tượng khởi đầu                   | DataSource                    | EntityManagerFactory          | MongoClient                  |
| Quản lý Connection Pool              | THường qua HikariCP           | Qua JDBC datasource           | Tích hopw jtrong MongoClient |
| Đơn vị thao tác dữ liệu              | Connection, preparedStatement | Qua JDBC dataSource           | Tích hợp trong MongoClient   |
| SessionAPI riêng                     | Không                         | Có                            | Có nhưng khác Hibernate      |
| Query đơn giản cần Sesion tường minh | Không                         | Thường do persistenct Context | Không                        |
| Transaction                          | JDBC connection               | EntityManager /Session        | Clietn Session               |

- `MongoDB Native Driver gần với JDBC hơn HIbernate`
- MongoDB Driver  k phải ORM

### 3. Phân biệt JDBC MongoDB

| Tiêu chí           | JDBC                                    | MongoDB Nodejs Driver                            |
| :----------------- | :-------------------------------------- | ------------------------------------------------ |
| Mức abstraction    | Dtaabase Driver API                     | database Driver API                              |
| Conneciton Pool    | Thường dùng thư viện ngoài như HikariCP | Tích hợp sẵn trong MongoClient                   |
| Quản lý Connection | Thường tự lấy/trả `connection`          | Driver thực hiện quản lý khi thực hiện operation |
| Truy vấn           | SQL                                     | Mnongo QUery API                                 |
| Mapping dữ liệu    | ResultSet -> Object                     | BSON document -> JS object                       |
| ORM features       | Không                                   | Không                                            |
| Transasction       | Qua `Connection`                        | Qua `ClientSesion`                               |



## 3. MongoDB Native Driver hoạt động như nào ?

- Thành phần trung tâm là `MongoClient`

```js
import { MongoClient } from 'mongodb';

const client = new MongoClient('mongodb://localhost:27017');

await client.connect();
```

- MongoClient là entry point để giao tiếp với MongoDB
- MongoClient: tự quản lý Connection Pool, lựa chọn server, và gửi database operations
- Thông thường mỗi ứng dụng chỉ cần một instance `MongoClient`


## 4. Luồng thực thi thực tế


```
Node.js Application
        │
        ▼
MongoClient (Singleton)
        │
        ├── Connection Pool
        │     ├── Connection 1
        │     ├── Connection 2
        │     └── Connection 3
        │
        ▼
Db: logging_lab
        │
        ▼
Collection: logs
        │
        ▼
collection.insertOne(document)
        │
        ▼
Driver tự mượn connection từ pool
        │
        ▼
MongoDB Server
        │
        ▼
Driver trả connection về pool
```

### Client Session nằm ở đâu

- MongoDriver có thể sử dụng `implicit session` ở bên trong nếu gọi thao tác nhỏ

```js
await collection.insertOne({
  message: 'Task created',
});
```
-  khi cần thực hiện nhiều thao tác trong transasction
-  

```js
const session = client.startSession(); // ta chủ động tạo session

try {
  await session.withTransaction(async () => {
    await orders.insertOne(order, { session });

    await inventory.updateOne(
      { productId: 10 },
      { $inc: { quantity: -1 } },
      { session },
    );
  });
} finally {
  await session.endSession();
}
```


### Vòng đời kết nối ứng dụng thực tế

- `1. Application Startup`: tạo `MongoClient` thiết lập kết nối
- `2. Application running` : các service và sink chia sẻ client hoặc COllection, thực hiện các database operations
- `3. Application Shutdown`: đúng `MongoClient` để giải phóng Connection pool




## Hệ sinh thái ORM

| Vai trò                 | Java                                                  | Nodejs                |
| :---------------------- | :---------------------------------------------------- | :-------------------- |
| driver cấp thấp         | MongoDB java driver                                   | MongoDB nodejs driver |
| ODM cho MongoDB         | Spring data MongoDB (thông qua mapping layer) Morphia | Mongoose              |
| ORM da database         | Hibernate / JPA chủ yếu cho relational DB             | TypeỎM, Mikro ORM     |
| QUery MongoDB trực tiếp | MongoConnection                                       | COllection            |

### Mongoose

```js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

const user = await User.findOne({
  username: 'duong',
});
```

- Cung cấp schema, 
  - Định nghĩa cấu trúc và hanh vi ở application
- validation
  - Validate ở phía application
-   middleware / hooks
    -   Xử lý trước và sau các operation của mongoose
-   model
    -   Tạo type để compile
    -   Runtime constructuror 
    -   query API
-   documetn methods,
    - population 
      - Fetch thêm document được tham chiếu
      - populate() không phải cú pháp viết tắt của `$lookup`. Chúng cùng phục vụ nhu cầu lấy dữ liệu tham chiếu, nhưng cách thực thi khác nhau