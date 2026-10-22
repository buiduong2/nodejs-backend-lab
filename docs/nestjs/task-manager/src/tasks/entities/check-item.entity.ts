import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { TaskBaseEntity } from './TaskBaseEntity';
import { Task } from './tasks.entity';

@Entity('checklist_items')
export class ChecklistItem extends TaskBaseEntity {
  @Column()
  content: string;

  @Column({ default: false, name: 'is_completed' })
  isCompleted: boolean;

  @ManyToOne(() => Task, (task) => task.checklistItems, {
    nullable: false,
  })
  @JoinColumn({ name: 'task_id' })
  task: Task;
}
