import { IsNotEmptyObject, IsObject, ValidateNested } from "class-validator";
import { TaskData } from "./create-task.dto";
import { Type } from "class-transformer";

export class UpdateTaskDto {
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => TaskData) // Chuyển kiểu dữ liệu
  task: TaskData;
}
