### Insert many

- [ ] Insert toàn bộ 10 logs bằng một thao tác.

```js
use log_cli
db.logs.insertMany({...})
{
  acknowledged: true,
  insertedIds: {
    '0': ObjectId('6addcf3a5d92f4738a8b08e3'),
    '1': ObjectId('6addcf3a5d92f4738a8b08e4'),
    '2': ObjectId('6addcf3a5d92f4738a8b08e5'),
    '3': ObjectId('6addcf3a5d92f4738a8b08e6'),
    '4': ObjectId('6addcf3a5d92f4738a8b08e7'),
    '5': ObjectId('6addcf3a5d92f4738a8b08e8'),
    '6': ObjectId('6addcf3a5d92f4738a8b08e9'),
    '7': ObjectId('6addcf3a5d92f4738a8b08ea'),
    '8': ObjectId('6addcf3a5d92f4738a8b08eb'),
    '9': ObjectId('6addcf3a5d92f4738a8b08ec')
  }
}

```
- [ ] In số document được insert.

```js
log_cli> db.logs.find()
[
  ...
]

```

- [ ] In danh sách ID vừa được tạo.
```js
log_cli> db.logs.find({},{_id: true})
[
  { _id: ObjectId('6addcf3a5d92f4738a8b08e3') },
  { _id: ObjectId('6addcf3a5d92f4738a8b08e4') },
  { _id: ObjectId('6addcf3a5d92f4738a8b08e5') },
  { _id: ObjectId('6addcf3a5d92f4738a8b08e6') },
  { _id: ObjectId('6addcf3a5d92f4738a8b08e7') },
  { _id: ObjectId('6addcf3a5d92f4738a8b08e8') },
  { _id: ObjectId('6addcf3a5d92f4738a8b08e9') },
  { _id: ObjectId('6addcf3a5d92f4738a8b08ea') },
  { _id: ObjectId('6addcf3a5d92f4738a8b08eb') },
  { _id: ObjectId('6addcf3a5d92f4738a8b08ec') }
]
```
- [ ] Kiểm tra tổng số document trong collection.

```js
log_cli> db.logs.countDocuments()
10
```


## Bài 2 — Query, Sort và Projection

- `Mục tiêu`: Thực hành truy vấn dữ liệu theo điều kiện, sắp xếp, giới hạn số lượng kết quả và lựa chọn các trường cần trả về.

- [ ] 1. Filter: Tìm tất cả logs có level = "error".
- [ ] 2. Sort: Sắp xếp các logs theo timestamp giảm dần (mới nhất trước).
- [ ] 3. Limit: Chỉ lấy tối đa 5 logs mới nhất.
- [x] 4. Projection: Chỉ trả về các trường timestamp, level, message, service và không trả về _id.

- Kết hợp cả 4 thao tác trong một truy vấn duy nhất


```js
log_cli> db.logs.find({level: 'error'},{timestamp: 1, level: 1, message: 1, _id: 0, service: 1}).sort({timestamp: -1 }).limit(5)
[
  {
    timestamp: ISODate('2026-10-25T08:16:00.000Z'),
    level: 'error',
    message: 'Inventory service unavailable',
    service: 'order-service'
  },
  {
    timestamp: ISODate('2026-10-25T08:08:00.000Z'),
    level: 'error',
    message: 'Payment gateway timeout',
    service: 'order-service'
  },
  {
    timestamp: ISODate('2026-10-25T08:02:00.000Z'),
    level: 'error',
    message: 'Order creation failed',
    service: 'order-service'
  }
]

```


## Bài 3 — Query với nhiều điều kiện

- `Mục tiêu`: Thực hành kết hợp nhiều điều kiện lọc và toán tử so sánh.
- Collection: log_cli.logs

- `Yêu cầu`

- [ ] Tìm logs thuộc môi trường production.
- [ ] Chỉ lấy logs có level là warn hoặc error.
- [ ] Chỉ lấy logs có timestamp trong khoảng 08:00:00 đến 08:15:00 UTC, ngày 25/10/2026 (bao gồm hai đầu mốc).
- [ ] Sắp xếp kết quả theo timestamp giảm dần.


```js
db.logs.find({
  environment: 'production',
  level: { $in: ['warn', 'error'] },
  timestamp: {
    $gte: ISODate('2026-10-25T08:00:00Z'),
    $lte: ISODate('2026-10-25T08:15:00Z')
  }
}).sort({ timestamp: -1 })

[
  {
    _id: ObjectId('6addcf3a5d92f4738a8b08e9'),
    timestamp: ISODate('2026-10-25T08:12:00.000Z'),
    level: 'warn',
    loggerName: 'AuthGuard',
    message: 'Unauthorized access attempt',
    service: 'auth-service',
    environment: 'production',
    mdc: { requestId: 'req-006', traceId: 'trace-F' },
    attributes: {
      http: { method: 'GET', path: '/admin', statusCode: 401, durationMs: 15 },
      tags: [ 'auth', 'security' ]
    }
  },
  {
    _id: ObjectId('6addcf3a5d92f4738a8b08e7'),
    timestamp: ISODate('2026-10-25T08:08:00.000Z'),
    level: 'error',
    loggerName: 'PaymentClient',
    message: 'Payment gateway timeout',
    service: 'order-service',
    environment: 'production',
    mdc: { requestId: 'req-002', traceId: 'trace-B', userId: 'u-102' },
    attributes: {
      http: {
        method: 'POST',
        path: '/payments',
        statusCode: 504,
        durationMs: 5000
      },
      error: { code: 'PAYMENT_TIMEOUT', type: 'TimeoutException', retryable: true },
      tags: [ 'payment', 'timeout', 'critical' ]
    }
  },
  {
    _id: ObjectId('6addcf3a5d92f4738a8b08e4'),
    timestamp: ISODate('2026-10-25T08:02:00.000Z'),
    level: 'error',
    loggerName: 'OrderService',
    message: 'Order creation failed',
    service: 'order-service',
    environment: 'production',
    mdc: { requestId: 'req-002', traceId: 'trace-B', userId: 'u-102' },
    attributes: {
      http: { method: 'POST', path: '/orders', statusCode: 500, durationMs: 850 },
      error: { code: 'ORDER_FAILED', type: 'BusinessException', retryable: false },
      tags: [ 'order', 'critical' ]
    }
  }
]


```

## Bài 4 — Find One và ObjectId

`Mục tiêu`: Hiểu cách tìm một document dựa trên _id, phân biệt `findOne()` và `find()`.

`Collection`: log_cli.logs
Yêu cầu
- [x] 1. Lấy _id của log có message = "Payment gateway timeout".
- [x] 2. Sử dụng _id vừa lấy để tìm lại document bằng findOne().
- [x] 3. Tìm một log thuộc order-service bằng findOne().
- [ ] 4. Thử sử dụng find() với cùng điều kiện và quan sát sự khác biệt.

```js

log_cli> db.logs.find({message: 'Payment gateway timeout'})
[
  {
    _id: ObjectId('6addcf3a5d92f4738a8b08e7'),
    ...
  }
]

log_cli> db.logs.findOne({_id: ObjectId('6addcf3a5d92f4738a8b08e7')})
{
  _id: ObjectId('6addcf3a5d92f4738a8b08e7'),
  ...
}
log_cli> db.logs.findOne({service: 'order-service'})
{
  _id: ObjectId('6addcf3a5d92f4738a8b08e4'),
  ...
}
log_cli> db.logs.find({service: 'order-service'})
[
  {...},
  {...},
]

```


## Bài 5 — Nested Document Query
Mục tiêu: Thực hành truy vấn các field nằm bên trong embedded documents bằng dot notation.

Collection: log_cli.logs
Yêu cầu
- [X] 1. Tìm tất cả logs có mdc.requestId = 'req-002'.
- [X] 2. Tìm logs có attributes.http.statusCode >= 500.
- [X] 3. Tìm logs có attributes.http.durationMs > 1000.
- [X] 4. Tìm logs có mdc.userId = 'u-101'.



```JS
log_cli> db.logs.find({'mdc.requestId': 'req-002'})
[
 ....
]
log_cli> db.logs.find({
|   mdc: { requestId: 'req-002' }
| })

log_cli> db.logs.find({'attributes.http.statusCode': {$gte: 500}})
[
  {
   ...
  },
  {
    _id: ObjectId('6addcf3a5d92f4738a8b08e7'),
    ...
  },
  {
    _id: ObjectId('6addcf3a5d92f4738a8b08eb'),
    ...
  }
]
log_cli> db.logs.find({'attributes.http.durationMs': {$gt: 500}})
[
  {
    _id: ObjectId('6addcf3a5d92f4738a8b08e4'),
    ...
  },
  {
    _id: ObjectId('6addcf3a5d92f4738a8b08e7'),
   ...
  },
  {
    _id: ObjectId('6addcf3a5d92f4738a8b08eb'),
    ...
  }
]
log_cli> db.logs.find({'mdc.userId': 'u-101'})
[
  {
   ...
  },
  {
    ...
  },
  {
   ...
  }
]
```


## Bài 6 — Optional Fields
`Mục tiêu`: Truy vấn các trường không bắt buộc trong nested documents.

`Collection`: log_cli.logs
Yêu cầu
- [ ] 1. Tìm tất cả logs có tồn tại field attributes.error, bất kể giá trị của nó.
- [ ] 2. Tìm tất cả logs không tồn tại field attributes.http.
- [ ] 3. Tìm tất cả logs không tồn tại field mdc.traceId.
- [ ] 4. Tìm tất cả logs có attributes.error.retryable = true.
Yêu cầu bổ sung
- [ ] 5. Tìm logs có mdc.traceId tồn tại và khác null, không sử dụng $exists.


```js
log_cli> db.logs.find({'attributes.error': {$exists: true}})
log_cli> db.logs.find({'attributes.http': {$exists: false}})
log_cli> db.logs.find({'mdc.traceId': {$exists: false}})
log_cli> db.logs.find({'attributes.error.retryable': true})
log_cli> db.logs.find({'mdc.traceId': {$ne: null }})

```


## Bài 7 — Array Query
`Mục tiêu`: Thực hành truy vấn các phần tử bên trong array attributes.tags.

`Collection`: log_cli.logs
Yêu cầu
- [ ] 1. Tìm logs có attributes.tags chứa phần tử "critical".
  - `path: {value}`
- [ ] 2. Tìm logs có ít nhất một trong hai tags "auth" hoặc "payment".
  - `$in`
- [ ] 3. Tìm logs chứa đồng thời cả hai tags "order" và "critical".
  - `$all`
- [ ] 4. Tìm logs có chính xác 2 phần tử trong array attributes.tags.
    - `$size`
```js
log_cli> db.logs.find({'attributes.tags': 'critical'})
log_cli> db.logs.find({'attributes.tags': {$in: ['auth', 'payment']}})
log_cli> db.logs.find({'attributes.tags': {$all: ['order', 'critical']}})
log_cli> db.logs.find({'attributes.tags': {$size:2 }})

```


## Bài 8 — Update One

`Mục tiêu`: Hiểu cách cập nhật một document mà không làm mất các field còn lại.

`Collection`: log_cli.logs
Yêu cầu
- [ ] 1. Tìm log có mdc.requestId = 'req-004'.
- [ ] 2. Cập nhật message thành "Inventory stock is critically low".
  - `$set`
- [ ] 3. Cập nhật level thành "error" trong cùng thao tác update.
  - `$set multiple`
- [ ] 4. Truy vấn lại document để kiểm tra kết quả.
  - 
- [ ] 5. Quan sát matchedCount và modifiedCount trả về từ thao tác update.
  - 
```js
log_cli> db.logs.find({'mdc.requestId': 'req-004'})
log_cli> db.logs.updateOne({'mdc.requestId': 'req-004'},{$set: {message: 'Inventory stock is critically low', level: 'error'}})

```


## Bài 9 — Nested Update
Bài này sẽ tiếp tục với $set, nhưng lần này là cập nhật embedded document.

`Mục tiêu`: Thay đổi một field bên trong nested object mà không làm mất các field còn lại.

`Collection`: log_cli.logs
Yêu cầu
- [ ] 1. Tìm log có attributes.error.code = 'PAYMENT_TIMEOUT'.
- [ ] 2. Cập nhật attributes.error.retryable thành false.

- [ ] 3. Thêm field mới attributes.error.resolved = true.
- [ ] 4. Thực hiện hai thay đổi trên trong cùng một updateOne().
- [ ] 5. Kiểm tra các field code và type ban đầu vẫn được giữ nguyên.

- *$set không tự động thay thế cả object. `Nó thay thế giá trị tại đường dẫn field mà bạn chỉ định`*

```js
log_cli> db.logs.find({'attributes.error.code': 'PAYMENT_TIMEOUT'})
log_cli> db.logs.updateOne(
  { 'attributes.error.code': 'PAYMENT_TIMEOUT' },
  {
    $set: {
      'attributes.error.retryable': false,
      'attributes.error.resolved': true
    }
  }
)
{
  acknowledged: true,
  insertedId: null,
  matchedCount: 1,
  modifiedCount: 1,
  upsertedCount: 0
}
log_cli> db.logs.find({'attributes.error.code': 'PAYMENT_TIMEOUT'})


```

## Bài 10 — Update Many và Array Operators
Mục tiêu: Thực hành cập nhật nhiều documents cùng lúc và thêm phần tử vào array mà không tạo dữ liệu trùng lặp.

Collection: log_cli.logs
Yêu cầu
- [ ] 1. Tìm tất cả logs có level = 'error'.
- [ ] 2. Thêm tag 'reviewed' vào attributes.tags của tất cả logs trên.
  - `$push`: thêm một phần tử vào array
- [ ] 3. Đảm bảo khi chạy lại thao tác update, tag 'reviewed' không bị thêm trùng.
  - `$addToSet`: thêm một phần tử vào array nếu chưa tồn tại
- [ ] 4. Trong cùng thao tác update, thêm field reviewedAt có kiểu BSON Date, mang thời điểm thực hiện cập nhật.
  - `{$set: {}, $addToSet: {} }`
- [ ] 5. In và giải thích matchedCount, modifiedCount.

## Bài 11 — Delete Many
Mục tiêu: Thực hành xóa nhiều documents và kiểm tra kết quả.

Collection: log_cli.logs
Yêu cầu
- [ ] 1. Đếm số logs có level = 'debug' trước khi xóa.
- [ ] 2. Xóa tất cả logs có level = 'debug'.
- [ ] 3. In số documents đã xóa thông qua deletedCount.
- [ ] 4. Kiểm tra collection không còn log có level debug.
- [x] 5. Kiểm tra tổng số documents còn lại.

- Chốt
  - `deleteMany()`: dùng để xóa nhiều document
  - `countDocuments()` dùng để đếm documents

```js
log_cli> db.logs.countDocuments({level: 'debug'})
2
log_cli> db.logs.deleteMany({level: 'debug'})
{ acknowledged: true, deletedCount: 2 }
log_cli> db.logs.countDocuments({level: 'debug'})
0
log_cli> db.logs.countDocuments()
8

```

## Bài 12 — Cursor và Pagination
Chúng ta đã hoàn thành phần CRUD. Bây giờ chuyển sang một phần khá quan trọng khi sử dụng MongoDB Native Driver.

Mục tiêu: Hiểu Cursor, phân trang với skip() và limit(), cũng như cách xử lý kết quả trong Node.js.

Collection: log_cli.logs (hiện có 8 documents).
Yêu cầu
- [ ] 1. Truy vấn toàn bộ logs, sắp xếp timestamp giảm dần.
  - `sort()`
- [ ] 2. Lấy trang đầu tiên với page = 1, limit = 3.
  - `skip()` `limit`
- [ ] 3. Lấy trang thứ hai với page = 2, limit = 3.
- [ ] 4. Tính toán giá trị skip dựa trên page và limit.
- [ ] 5. Thử chuyển kết quả cursor thành array bằng toArray().
  - 
- [ ] 6. Khi chuyển sang Node.js Native Driver, duyệt cursor bằng for await...of.

- `Cursor`
  - Cursor giúp truy vấn dữ liệu từng phần mà không cần tải toàn bộ kết quả vào RAM ngay lập tức
- `toArray()`
  - Tiêu thụ cursor và gom tất cả documents còn lại vào một array
- `for await(const log of cursor)`
  - Xử lý từng document không cần giữ tất cả trong một mảng
  - Driver vẫn có thể nhận dữ liệu theo Batch

## for await ... of
- Là một cú pháp của javascript dùng để duyệt các phần tử của một `async iterable` (đối tượng có khả năng lặp bất đồng bộ)


```js
const sleep = (ms) =>
  new Promise(resolve => setTimeout(resolve, ms));

async function* generateNumbers() {
  for (let i = 1; i <= 3; i++) {
    await sleep(1000);
    yield i;
  }
}

async function main() {
  for await (const number of generateNumbers()) {
    console.log(number, new Date().toISOString());
  }
}

main();
```

- Một loại funciton có khả năng tạo ra các giá trị lần lượt và bất đồng bộ
  - `yield` có nghĩa là phát ra một giá trị rồi tạm dừng generator.


## Bài 13 — Aggregation cơ bản
`Mục tiêu`: Làm quen với Aggregation Pipeline của MongoDB, đặc biệt là các thao tác tương tự GROUP BY, COUNT, AVG, MAX trong SQL.

`Database:` log_cli
`Collection`: logs (hiện có 8 documents).
`Yêu cầu`
- [ ] 1. Đếm số lượng logs theo từng level (info, warn, error).
- [ ] 2. Đếm số lượng logs theo từng service.
- [ ] 3. Tính thời gian xử lý HTTP trung bình (attributes.http.durationMs) của tất cả logs có thông tin HTTP.
- [ ] 4. Tìm log có thời gian xử lý HTTP lâu nhất, trả về service, message, attributes.http.durationMs.


- `Tư duy`
- MongoDB sử dụng aggregation pipeline . lần lượt đi qua các stage
```js
db.logs.aggregate([
  // Các pipeline stages
])
```

```
Collection
    ↓
Stage 1
    ↓
Stage 2
    ↓
Stage 3
    ↓
Kết quả
```


```js
log_cli> db.logs.aggregate([ { $group: { _id: '$level', countLevel: { $sum: 1 } } }] )
[
  { _id: 'error', countLevel: 4 },
  { _id: 'info', countLevel: 3 },
  { _id: 'warn', countLevel: 1 }
]


log_cli> db.logs.aggregate([{$group: {_id: '$service', count: {$sum: 1} }   }])
[
  { _id: 'inventory-service', count: 1 },
  { _id: 'auth-service', count: 2 },
  { _id: 'order-service', count: 4 },
  { _id: 'product-service', count: 1 }
]
log_cli> db.logs.aggregate([ {$group: {_id: 'avgDuration_ID', avgDuration: {$avg: '$attributes.http.durationMs'}}}   ])
[ { _id: 'avgDuration_ID', avgDuration: 1345 } ]


log_cli> db.logs.aggregate([
  { $sort: { 'attributes.http.durationMs': -1 } },
  { $limit: 1 },
  {
    $project: {
      service: 1,
      message: 1,
      'attributes.http.durationMs': 1
    }
  }
])
[
  {
    _id: ObjectId('6addcf3a5d92f4738a8b08e7'),
    message: 'Payment gateway timeout',
    service: 'order-service',
    attributes: { http: { durationMs: 5000 } }
  }
]


```


## Bài 14 — Aggregation nâng cao theo Request ID
Bài này gần với nghiệp vụ logging thực tế hơn: gom các logs thuộc cùng một request để theo dõi quá trình xử lý.

`Database`: log_cli
`Collection`: logs — hiện có 8 documents.
`Yêu cầu`
- [ ] 1. Group logs theo mdc.requestId.
- [ ] 2. Đếm số logs trong mỗi request.
- [ ] 3. Tạo một array chứa tên các service xuất hiện trong từng request, không trùng lặp.
- [ ] 4. Chỉ lấy những request có nhiều hơn 1 log.
- [ ] 5. Sắp xếp theo số logs giảm dần.

```js
log_cli> db.logs.aggregate([{ $group: {_id: '$mdc.requestId' , countRequest: {$sum: 1}}  }])
[
  { _id: 'req-005', countRequest: 1 },
  { _id: 'req-004', countRequest: 1 },
  { _id: 'req-001', countRequest: 1 },
  { _id: 'req-002', countRequest: 2 },
  { _id: 'req-006', countRequest: 1 },
  { _id: 'req-008', countRequest: 1 },
  { _id: 'req-009', countRequest: 1 }
]

log_cli> db.logs.aggregate([{ $group: {_id: '$mdc.requestId' , countRequest: {$sum: 1} , services:{$addToSet: '$service' }  }  }])
[
  { _id: 'req-006', countRequest: 1, services: [ 'auth-service' ] },
  { _id: 'req-004', countRequest: 1, services: [ 'inventory-service' ] },
  { _id: 'req-001', countRequest: 1, services: [ 'auth-service' ] },
  { _id: 'req-002', countRequest: 2, services: [ 'order-service' ] },
  { _id: 'req-008', countRequest: 1, services: [ 'order-service' ] },
  { _id: 'req-009', countRequest: 1, services: [ 'order-service' ] },
  { _id: 'req-005', countRequest: 1, services: [ 'product-service' ] }
]


log_cli> db.logs.aggregate([{ $group: {_id: '$mdc.requestId' , countRequest: {$sum: 1} , services:{$addToSet: '$service' }  }} , {$match: { 'countRequest': {$gt: 1 } }  }  ])

[ { _id: 'req-002', countRequest: 2, services: [ 'order-service' ] } ]


log_cli> db.logs.aggregate([{ $group: {_id: '$mdc.requestId' , countRequest: {$sum: 1} , services:{$addToSet: '$service' }  }} ,  {$sort: {'countRequest': -1}}  ])
[
  { _id: 'req-002', countRequest: 2, services: [ 'order-service' ] },
  { _id: 'req-009', countRequest: 1, services: [ 'order-service' ] },
  { _id: 'req-004', countRequest: 1, services: [ 'inventory-service' ] },
  { _id: 'req-001', countRequest: 1, services: [ 'auth-service' ] },
  { _id: 'req-006', countRequest: 1, services: [ 'auth-service' ] },
  { _id: 'req-008', countRequest: 1, services: [ 'order-service' ] },
  { _id: 'req-005', countRequest: 1, services: [ 'product-service' ] }
]

```