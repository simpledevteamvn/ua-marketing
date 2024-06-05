export interface FilterStates {
  dimension: Dimension[];
  metric: Metric[];
}
export interface Dimension {
  dimensionOpts: any[];
  activedDimension: string | undefined;
  dimensionSuffix?: string;
  filterOpts: any;
  activedFilters: any;
  filterValue?: string;
  filterLabel?: string;
}

interface Metric {
  activedMetric: string | undefined;
  metricSuffix: string;
  minValue: number | undefined;
  maxValue: number | undefined;
}

export interface EditedRecordState {
  [recordId: string]: EditedRecord;
}

interface EditedRecord {
  bid?: number | null;
  budget?: number | null;
}
