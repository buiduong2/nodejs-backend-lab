import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { TaskStatus } from '../entities/tasks.entity';



export class TaskData {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(TaskStatus)
  status: TaskStatus;
}

// TODO: Task Đệ quy 
// SELF JOIN 
// Task 
export class CreateTaskData extends TaskData {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTaskData)
  children?: CreateTaskData[];
}

class ChecklistItemData {
  @IsString()
  content: string;

  @IsBoolean()
  @IsOptional()
  isCompleted: boolean;
}

export class CreateTaskDto {
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => CreateTaskData) // Chuyển kiểu dữ liệu
  task: CreateTaskData;
}
