## cấu trúc sourcode

```
05-hono-ticket-booking/
├── src/
│   ├── index.ts
│   ├── app.ts
│   │
│   ├── db/
│   │   ├── index.ts
│   │   └── schema/
│   │       ├── users.ts
│   │       ├── events.ts
│   │       ├── ticket-types.ts
│   │       ├── orders.ts
│   │       ├── order-items.ts
│   │       └── index.ts
│   │
│   ├── modules/
│   │   ├── auth/
│   │   ├── events/
│   │   ├── tickets/
│   │   └── orders/
│   │
│   └── middlewares/
│
├── drizzle/
│   └── ...generated migrations
├── drizzle.config.ts
├── .env
├── package.json
├── pnpm-lock.yaml
└── tsconfig.json
```