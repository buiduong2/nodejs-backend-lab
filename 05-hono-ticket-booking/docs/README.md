### khởi tạo dự án Hono


```sh

pnpm create hono@latest 

✔ Which template do you want to use? nodejs
✔ Do you want to install project dependencies? Yes
✔ Which package manager do you want to use? pnpm
```

## các lựa chọn đã chọn


### cách để chạy dự án

```sh
pnpm install

pnpm dev
```
### Truy cập Docker DB

```sh
docker exec -it ticket-booking-postgres \
  psql -U ticket_user -d ticket_booking


## Kiểm tra các table
\dt  
```

