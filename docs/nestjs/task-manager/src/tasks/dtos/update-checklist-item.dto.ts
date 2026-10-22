import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNotEmptyObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class UpdateChecklistItemData {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  content?: string;

  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}

export class UpdateChecklistItemDto {
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => UpdateChecklistItemData)
  data: UpdateChecklistItemData;
}
