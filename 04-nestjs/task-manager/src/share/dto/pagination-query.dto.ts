import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { IsValidSort } from '../decorators/is-valid-sort.decorators';

export class PaginationQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;



  @IsString()
  @IsOptional()
  @MinLength(1)
  search?: string;

  @Transform(({ value }) =>
    value == null ? undefined : Array.isArray(value) ? value : [value],
  )
  @IsOptional()
  @IsValidSort()
  sort?: string[];
}
