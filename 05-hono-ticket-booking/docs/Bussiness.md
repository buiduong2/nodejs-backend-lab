## 1. Chốt nghiệp vụ dự án 

- Dự án có 2 vai trò chính: 
  - `ADMIN`: Quản lý sự kiện, loại vé, số lượng vé, theo dõi đơn hàng
  - `CUSTOMER`: xem sự kiện, chọn loại vé, xem đơn hàng và hủy đơn chưa thanh toán

Một số quy tắc ban đầu:
    - 1. Một sự kiện có nhiều loại vé (VIP, Standard...).
    - 2. Một khách hàng có thể tạo nhiều đơn hàng.
    - 3. Một đơn hàng chỉ thuộc về một sự kiện.
    - 4. Một đơn hàng có thể chứa nhiều loại vé của sự kiện đó.
    - 5. Giá vé tại thời điểm mua phải được lưu lại trong đơn hàng.
    - 6. Không được bán vượt số lượng vé cho phép.
    - 7. Thanh toán chỉ là giả lập, chưa tích hợp cổng thanh toán.

## 2. Luồng CUstomer

```
flowchart TD
    A([Customer]) --> B[Đăng ký / Đăng nhập]
    B --> C[Xem danh sách sự kiện]
    C --> D[Xem chi tiết sự kiện]
    D --> E[Chọn loại vé và số lượng]
    E --> F[Gửi yêu cầu đặt vé]
    F --> G{Còn đủ vé?}
    G -- Không --> H[Thông báo hết vé]
    G -- Có --> I[Tạo Order PENDING]
    I --> J[Giữ số lượng vé]
    J --> K{Thanh toán giả lập}
    K -- Thành công --> L[Order PAID]
    K -- Hủy / Thất bại --> M[Order CANCELLED]
    M --> N[Hoàn lại vé đã giữ]
    L --> O[Xem lịch sử đơn hàng]
```

## 2. Luồng admin


```
flowchart TD
    A([Admin]) --> B[Đăng nhập]
    B --> C{Chọn chức năng}
    C --> D[Quản lý sự kiện]
    C --> E[Quản lý loại vé]
    C --> F[Quản lý đơn hàng]

    D --> D1[Tạo / Sửa sự kiện]
    D1 --> D2[Publish hoặc Cancel]

    E --> E1[Tạo loại vé VIP / Standard]
    E1 --> E2[Thiết lập giá và số lượng]

    F --> F1[Xem danh sách đơn hàng]
    F1 --> F2[Lọc theo trạng thái]
    F2 --> F3[Xem chi tiết đơn hàng]
```

## 3. Table


```
erDiagram
    USERS ||--o{ ORDERS : places
    EVENTS ||--o{ TICKET_TYPES : offers
    EVENTS ||--o{ ORDERS : receives
    ORDERS ||--|{ ORDER_ITEMS : contains
    TICKET_TYPES ||--o{ ORDER_ITEMS : purchased_as

    USERS {
        bigint id PK
        varchar email UK
        varchar password_hash
        varchar name
        enum role
        timestamptz created_at
        timestamptz updated_at
    }

    EVENTS {
        bigint id PK
        varchar title
        text description
        varchar location
        timestamptz start_time
        enum status
        timestamptz created_at
        timestamptz updated_at
    }

    TICKET_TYPES {
        bigint id PK
        bigint event_id FK
        varchar name
        integer price
        integer quantity
        integer reserved_quantity
        integer sold_quantity
        timestamptz created_at
        timestamptz updated_at
    }

    ORDERS {
        bigint id PK
        bigint user_id FK
        bigint event_id FK
        enum status
        bigint total_amount
        timestamptz created_at
        timestamptz updated_at
    }

    ORDER_ITEMS {
        bigint id PK
        bigint order_id FK
        bigint ticket_type_id FK
        integer quantity
        integer unit_price
    }
```