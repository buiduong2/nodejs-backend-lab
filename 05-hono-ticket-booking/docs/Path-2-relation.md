
### Path 2:  Thêm Eror Handler 

-  Triển khai theo cấu trúc

```
src/
├── app.ts
├── common/
│   └── errors/
│       └── error-handler.ts
└── modules/
    └── events/
        ├── events.route.ts
        └── events.service.ts
```

- 

## Path 2: 	TicketType CRUD + Event Detail - Relations, JOIN, nested response

### Các API 

API	Yêu cầu
- `POST /events/:eventId/ticket-types`	Tạo loại vé cho Event
- `GET /events/:eventId/ticket-types`	Liệt kê loại vé của Event
- `GET /events/:id (mở rộng)`	Trả Event kèm danh sách loại vé
