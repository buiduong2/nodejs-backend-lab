import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../share/dto/pagination-query.dto';
import { TaskStatus } from '../entities/tasks.entity';

export class TaskQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;
}
