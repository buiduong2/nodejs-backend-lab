## Tạo MÔi trường mongoDB

- Database và collection ko cần tạo tường minh - có thể lazy tạo khi lần đầu thêm `document`

## tạo mongo DB Docker Container

```sh
docker run -d \
  --name mongodb-lab \
  -p 127.0.0.1:27018:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=admin123 \
  -e GLIBC_TUNABLES=glibc.pthread.rseq=1 \
  mongo:8
```

## Chuẩn bị env

```
MONGO_URI=mongodb://admin:admin123@localhost:27018/?authSource=admin
MONGO_DB=logging_lab
```

## Truy cập vào mongosh

```sh
docker exec -it mongodb-lab  mongosh
```

##  Đăng nhập tài khoản

```sh
use admin
db.auth('admin','admin123')
```

```
MongoDB Server
│
├── admin
│   └── User: admin
│       └── Role: root (quyền trên toàn server)
│
├── logging_lab
│   └── application_logs
│
└── ecommerce
    ├── users
    └── orders
```

- user `admin` được tạo trong database `admin`
- User có quyền truy cập các database khác nhờ role `root`
- Không cần tạo user cho từng database


### Test một vài câu lệnh tạo DB và collection document

- DB và Colleciton là lazy create - Vẫn có thể tạo tường minh

- `chọn database`

```
use logging_lab
```

- `truy cập collection`

```js
// Cách 1: Dot notation
db.application_logs

// Cách 2: getCollection()
db.getCollection("application_logs")
```

- `insert thao tác trong collection`

```js
db.application_logs.insertOne({
  timestamp: new Date(),
  level: "info",
  loggerName: "AppService",
  message: "Application started"
})
```

- `Tìm kiếm`

```js
db.application_logs.findMany({
  level: "info"
})
```