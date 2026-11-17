### Mô tả 

- ứng dụng học Kafka cơ bản 
- Sử dụng Luồng Order để học microservice
- Không service Discovery , gateway 

### Saga 

- Orchestraion

- entity Kafka 
  - Chỉ lưu current Step
  - Update currentStep sau mỗi step

### Phase 

## Phase 1: Basic Saga Orchestration [x]
- [x] Order → Inventory → Payment
- [x] Saga state persistence
- [x] Compensation flow

## Phase 2: Reliability
- [x] Business idempotency (basic)
- [x] Transactional Outbox
- [x] Outbox retry, lease & recovery
- [ ] Consumer retry & failure handling
- [ ] Inbox pattern
- [ ] Dead Letter Queue (DLQ)
- [ ] Message ordering
- [ ] Integration & failure testing

###  Luồng thực thi


```mermaid
sequenceDiagram
    autonumber
    actor User
    participant OS as Order Service
    participant DB1 as Order DB
    participant K as Kafka
    participant IS as Inventory Service
    participant DB2 as Inventory DB
    participant PS as Payment Service
    participant DB3 as Payment DB

    User->>OS: POST /orders
    activate OS
    OS->>DB1: Create Order + Saga (Transaction)
    DB1-->>OS: Order ID, Saga ID
    OS->>K: ReserveInventoryCommand
    OS-->>User: Order Created (RESERVING_STOCK)
    deactivate OS

    K-->>IS: ReserveInventoryCommand
    activate IS
    IS->>DB2: Lock Products + Check Stock

    alt Inventory available
        IS->>DB2: Increase reservedQuantity + Create Reservation
        DB2-->>IS: Reservation ID
        IS->>K: InventoryReservedEvent
    else Out of stock / Product not found
        DB2-->>IS: Reservation Failed
        IS->>K: InventoryReserveFailedEvent
    end
    deactivate IS

    alt Inventory reservation failed
        K-->>OS: InventoryReserveFailedEvent
        OS->>DB1: Order REJECTED, Saga COMPENSATED
        OS->>K: OrderCompensatedEvent
    else Inventory reserved
        K-->>OS: InventoryReservedEvent
        OS->>DB1: Order PAYMENT_PENDING, Step CHARGE_PAYMENT
        OS->>K: ChargePaymentCommand

        K-->>PS: ChargePaymentCommand
        activate PS
        PS->>DB3: Create Payment (PENDING)
        DB3-->>PS: Payment ID
        deactivate PS

        Note over User,PS: Payment is waiting for user action

        alt User pays
            User->>PS: POST /order/:id/charge-payment (pay)
            PS->>DB3: Payment PENDING to SUCCESS
            PS->>K: PaymentSucceededEvent

            K-->>OS: PaymentSucceededEvent
            OS->>DB1: Order CONFIRMED, Saga COMPLETED
            OS->>K: OrderConfirmedEvent

        else User rejects payment
            User->>PS: POST /order/:id/charge-payment (reject)
            PS->>DB3: Payment PENDING to FAILED
            PS->>K: PaymentFailedEvent

            K-->>OS: PaymentFailedEvent
            OS->>DB1: Saga COMPENSATING, Step RELEASE_INVENTORY
            OS->>K: ReleaseInventoryCommand

            K-->>IS: ReleaseInventoryCommand
            activate IS
            IS->>DB2: Lock Reservation + Products
            IS->>DB2: Decrease reservedQuantity, Reservation RELEASED
            IS->>K: InventoryReleasedEvent
            deactivate IS

            K-->>OS: InventoryReleasedEvent
            OS->>DB1: Order REJECTED, Saga COMPENSATED
            OS->>K: OrderCompensatedEvent
        end
    end
```

### Transactional Outbox

- Mô hình: polling Publisher: Worker định kì truy vấn Outbox và Publish Message
- Bảng Outbox lưu toàn bộ Event message mà cần service publishj một cách đáng tin cậy
- Mỗi service nên quản lý outbox trong database mà nó sở hữu `outbox_messages`
- Sử dụng lưu trữ full payload để chuẩn bị gửi luôn
- 
### Các trường 

- `id` -> định danh outbox
- `topic` -> Kafka topic cần publish
- `message_key` -> Kafka key thương là orderId
- payload: Toàn bộ message dưới dạng JSONB
- status: 
- attempts
- createdAt
- publishedAt
- next_retry_at


### Các trường hợp cần cân nhắc

- Extractly-once delivery
- tránh giữ database transaction quá lâu
- thứ tự message cần được cân nhắc riêng