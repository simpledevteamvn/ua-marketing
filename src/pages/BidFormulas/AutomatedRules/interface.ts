export interface ConditionGroup {
  id: number;
  metric?: string;
  operator?: string;
  compareObj?: string;
  dates?: number[];
  value?: number;
}

export interface ScheduleGroup {
  id: number;
}
