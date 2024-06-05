import { ConditionGroup } from "./interface";

export const getMetricGroup = (groups, id, allMetrics: string[]) => {
  let results = allMetrics || [];

  groups.forEach((group: ConditionGroup) => {
    const gMetric = group.metric;

    if (!gMetric || group.id === id) return;
    results = results.filter((el) => el !== gMetric);
  });
  return results;
};
