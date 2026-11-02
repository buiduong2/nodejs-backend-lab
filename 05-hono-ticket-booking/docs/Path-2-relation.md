## Path 2: 	TicketType CRUD + Event Detail - Relations, JOIN, nested response

### Các API 

API	Yêu cầu
- `POST /events/:eventId/ticket-types`	Tạo loại vé cho Event
- `GET /events/:eventId/ticket-types`	Liệt kê loại vé của Event
- `GET /events/:id (mở rộng)`	Trả Event kèm danh sách loại vé

### Thêm Eror Handler 

- 