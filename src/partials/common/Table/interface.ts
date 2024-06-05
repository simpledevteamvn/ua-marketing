export interface SortData {
  sortType?: "ascend" | "descend";
  sorter?: any;
}

export interface SortMap {
  title: string;
  sorter: any;
  field?: string; // You can sort with "field" if "title" field don't unique
}
