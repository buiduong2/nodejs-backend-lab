## Mô tả 

- ứng dụng học Kafka cơ bản 
- Sử dụng Luồng Order để học microservice
- Không service Discovery , gateway 


### Saga 

- Orchestraion

- entity Kafka 
  - Chỉ lưu current Step
  - Update currentStep sau mỗi step

### Phase 

- Giai đoạn 1 :
  - Chỉ tạo orchestraion cơ bản 
  - Saga Entity lưu trạng thái Step

- Giai Đoạn 2: 
  - idempotentcy
  - Outbox pattern
  - DLQ, reliability
