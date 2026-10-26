import 'dotenv/config';
import { DataSource } from 'typeorm';

import { Task } from '../tasks/entities/tasks.entity';
import { ChecklistItem } from '../tasks/entities/checklist-item.entity';
import { User } from '../users/entities/user.entity';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  // Entity cần so sánh metdata với chema trong PostgreSQL
  entities: [User, Task, ChecklistItem],
  // Thư mục chứa migration mà CLI sẽ tim fkhi chạy bằng typescript
  migrations: ['src/database/migrations/*.ts'],

  // Không tự cập nhật schema khi khởi tạo datasource
  synchronize: false,
  logging: ['query', 'error'], // Chỉ định hiển thị câu lệnh SQL và lỗi (hoặc để 'true' để hiện tất cả)
  logger: 'advanced-console',
});
