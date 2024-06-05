import moment from "moment";
import { DATE_MILESTONES } from "../../../constants/constants";
import { ChartFilter } from "./CombinationChart/CombinationChart";

export const DATE_DIMENSION = "date";

export const TouchpointsChartKey = "Touchpoints";
export const ListCharts = [
  { key: TouchpointsChartKey, label: "Touchpoints" },
  { key: "click_to_install", label: "Click-to-install rate" },
];

export const EXTRA_FOOTER = [
  { value: DATE_MILESTONES.last3Days, label: "Last 3 days" },
  { value: DATE_MILESTONES.last7Days, label: "Last 7 days" },
  { value: DATE_MILESTONES.last14Days, label: "Last 14 days" },
  { value: DATE_MILESTONES.thisWeek, label: "This Week" },
  { value: DATE_MILESTONES.lastWeek, label: "Last Week" },
  { value: DATE_MILESTONES.thisMonth, label: "This Month" },
  { value: DATE_MILESTONES.lastMonth, label: "Last Month" },
];

export const ChartActions = {
  clone: "clone",
  delete: "delete",
};

export const organicInstall = "organicInstall";
export const nonOrganicInstall = "nonOrganicInstall";
export const clicks = "clicks";
export const impressions = "impressions";
export const clickToInstall = "clickToInstall";
const organicRevenue = "organicRevenue";
const nonOrganicRevenue = "nonOrganicRevenue";

export const listAttributeFields = [
  organicInstall,
  organicRevenue,
  nonOrganicRevenue,
];

export const StatInfos = [
  { name: "Cost", field: "cost", prefix: "$" },
  { name: "Non-organic installs", field: nonOrganicInstall },
  // { name: "Total installs", field: "totalInstall" },
  { name: "eCPI", field: "eCpi", prefix: "$" },
  { name: "Organic installs", field: organicInstall },
  // {
  //   name: "Click-to-install rate",
  //   field: clickToInstall,
  //   suffix: "%",
  //   isHideDaily: true,
  // },
  { name: "Clicks", field: clicks },
  { name: "Impressions", field: impressions },
  { name: "Non-organic revenue", field: nonOrganicRevenue, prefix: "$" },
  { name: "Organic revenue", field: organicRevenue, prefix: "$" },
  // { name: "Total revenue", field: "totalRevenue", prefix: "$" },
  // { name: "Re-engagements", field: "reEngagements" },
  // { name: "Re-attributions", field: "reAttributions" },
  // { name: "Total retargeting", field: "totalRetargeting" },
  // {
  //   name: "Re-attributions revenue",
  //   field: "reAttributionsRevenue",
  //   prefix: "$",
  // },
  // {
  //   name: "Re-engagements revenue",
  //   field: "reEngagementsRevenue",
  //   prefix: "$",
  // },
];

export const getListDateStr = (dates, field = "date") => {
  if (!dates?.length) return [];

  return dates.map((el) => moment(el[field])?.format("DD-MM_YYYY"));
};

export interface ConfigCharts {
  chartId: number;
  layout?: any;
  chartFilter?: ChartFilter;
  isClone?: boolean;
  initLayout?: boolean;
}

export interface TableState {
  filter?: string;
  subFilter?: string;
  top?: number;
}
