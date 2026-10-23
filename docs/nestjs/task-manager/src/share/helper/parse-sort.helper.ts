import { BadRequestException } from '@nestjs/common';
import { SortOrder } from '../dto/page.dto';

/**
 * Parses validated sort query parameters into SortOrder objects.
 *
 * Điều kiện tiên quyết:
 * - `sorts` Đã được validate bởi {@PaginationQueryDto.}
 * - Each element is guaranteed to be a string.
 *
 * This function validates allowed fields and sort directions.
 * Throws BadRequestException for invalid sort expressions.
 */
export function parseSort(
  sorts: string[] | undefined,
  allowedFields: readonly string[],
): SortOrder[]  {
  if (sorts === undefined) {
    return [];
  }

  const sortOrders = sorts.map((sort): SortOrder => {
    const [field, direction] = sort.split(',');

    return {
      field,
      direction: direction?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC',
    };
  });

  const invalidField = sortOrders
    .map((sort) => sort.field)
    .find((field) => !allowedFields.includes(field));

  if (invalidField !== undefined) {
    throw new BadRequestException(`Invalid sort field: ${invalidField}`);
  }

  return sortOrders;
}
