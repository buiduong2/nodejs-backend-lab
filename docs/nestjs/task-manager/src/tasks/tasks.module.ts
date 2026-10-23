import { Module } from '@nestjs/common';
import { TasksController } from './controllers/tasks.controller';
import { TasksService } from './services/tasks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/tasks.entity';
import { TaskMapper } from './mapper/tasks.mapper';
import { ChecklistItem } from './entities/checklist-item.entity';
import { ChecklistItemService } from './services/checklist-item.services';
import { ChecklistItemController } from './controllers/checklist-item.controller';

@Module({
  controllers: [TasksController, ChecklistItemController],
  imports: [TypeOrmModule.forFeature([Task, ChecklistItem])],
  providers: [TasksService, ChecklistItemService],
})
export class TasksModule {}
