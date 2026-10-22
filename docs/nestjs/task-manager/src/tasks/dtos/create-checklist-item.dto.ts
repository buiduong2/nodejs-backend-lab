import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNotEmptyObject,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class ChecklistItemData {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  content: string;
}

export class CreateChecklistItemDto {
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => ChecklistItemData)
  data: ChecklistItemData;
}