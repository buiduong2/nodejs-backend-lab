import { PageMeta, SortOrder } from "../dto/page.dto";

export function buildPageMeta(
  page: number,
  limit: number,
  total: number,
  sort: SortOrder[],
): PageMeta {
  const totalPages = Math.ceil(total / limit);

  return {
    totalItems: total,
    totalPages,
    page,
    itemsPerPage: limit,
    hasNext: page < totalPages,
    hasPrevious: page > 1,
    sort,
  };
}