import { Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsNotEmptyObject, IsObject, IsOptional, IsString, MaxLength, ValidateNested } from "class-validator";

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

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

export class CreateTaskDto {
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => TaskData) // Chuyển kiểu dữ liệu
  task: TaskData;
}
