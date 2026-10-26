import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { TaskBaseEntity } from './TaskBaseEntity';
import { User } from '../../users/entities/user.entity';
import { ChecklistItem } from './checklist-item.entity';

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

@Entity('tasks')
export class Task extends TaskBaseEntity {
  @Column({ type: 'varchar', length: 150 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.TODO,
  })
  status: TaskStatus;

  @ManyToOne(() => User, (user) => user.tasks, {
    nullable: false,
  })
  @JoinColumn({
    name: 'created_by',
    foreignKeyConstraintName: 'fk_tasks_created_by',
  })
  createdBy: User;

  @OneToMany(() => Task, (task) => task.parent)
  children?: Task[];

  @ManyToOne(() => Task, (task) => task.children, {
    nullable: true,
  })
  @JoinColumn({
    name: 'parent_id',
    foreignKeyConstraintName: 'fk_tasks_parent',
  })
  parent?: Task;
}
