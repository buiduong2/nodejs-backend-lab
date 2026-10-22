import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { TaskBaseEntity } from '../../tasks/entities/TaskBaseEntity';
import { Task } from '../../tasks/entities/tasks.entity';

export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

@Entity('users')
export class User extends TaskBaseEntity {
  @Column({ unique: true, length: 100 })
  username: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @OneToMany(() => Task, (task) => task.createdBy)
  tasks: Task[];
}
