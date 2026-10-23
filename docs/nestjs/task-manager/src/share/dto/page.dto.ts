export interface Page<T> {
  data: T[];
  meta: PageMeta;
}

export interface PageMeta {
  totalItems: number;
  totalPages: number;
  page: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
  sort: SortOrder[];
}

export type SortOrder = {
  field: string;
  direction: 'ASC' | 'DESC';
};
