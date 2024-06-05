export const DYN_METRIC = "dynamicMetric";
export const DYN_OPERATOR = "dynamicOperator";
export const DYN_COMPARISON_OBJ = "dynamicComparisionObject";
export const DYN_VALUE = "dynamicValue";

export const DYN_HOUR = "dynamicHour";
export const DYN_DATE = "dynamicDate";
export const DYN_DAY_IN_WEEK = "dynamicDayInWeek";
export const DYN_DAY_IN_MONTH = "dynamicDayInMonth";
export const DYN_CUSTOM_DAY = "dynamicCustomDay";

export const CONDITION_FORM = "conditionForm";
export const SCHEDULE_FORM = "scheduleForm";

export const RULE_STATUS = {
  active: "ACTIVE",
  inactive: "INACTIVE",
  draft: "DRAFT",
};

export const TARGET_TYPE_IDS = {
  apps: "Apps",
  campaigns: "Campaigns",
  geo: "Geo",
  adgroup: "Ad Group",
  sourceAndSite: "Source/Site ID",
};

export const ACTION_IDS = {
  noti: "NOTIFICATION",
  editBid: "EDIT_BID",
  editBudget: "EDIT_BUDGET",
  run: "RUN",
  pause: "PAUSE",
};
export const ACTIONS = [
  { label: "Notification", value: ACTION_IDS.noti, preventClick: true },
  { label: "Run", value: ACTION_IDS.run },
  { label: "Pause", value: ACTION_IDS.pause },
  { label: "Edit bid", value: ACTION_IDS.editBid },
  { label: "Edit budget", value: ACTION_IDS.editBudget },
];

const COMPARATOR_IDS = {
  greater: "GREATER_THAN",
};
export const COMPARATOR = [
  { label: ">", value: "GREATER_THAN" },
  { label: ">=", value: "GREATER_THAN_OR_EQUAL_TO" },
  { label: "<", value: "LESS_THAN" },
  { label: "<=", value: "LESS_THAN_OR_EQUAL_TO" },
  { label: "=", value: "EQUAL_TO" },
];

export const COMPARISON_IDS = {
  value: "VALUE",
  selfCompare: "SELF_COMPARE",
};
export const COMPARISON_OPTS = [
  { label: "Value", value: COMPARISON_IDS.value },
];

const DEFAULT_METRIC_VALUE = 0;
const DEFAULT_DATES = [-1, -1];
export const DEFAULT_CONDITION_GROUPS = [
  {
    id: 0,
    operator: COMPARATOR_IDS.greater,
    compareObj: COMPARISON_IDS.value,
    dates: DEFAULT_DATES,
    value: DEFAULT_METRIC_VALUE,
  },
];
export const DEFAULT_CONDITION_GROUP_ID = [DEFAULT_CONDITION_GROUPS[0].id];

export const FREQUENCY_IDS = {
  hourly: "HOURLY",
  daily: "DAILY",
  weekly: "WEEKLY",
  monthly: "MONTHLY",
  custom: "SPECIFIC_TIME",
};
export const FREQUENCIES = [
  { label: "Hourly", value: FREQUENCY_IDS.hourly },
  { label: "Daily", value: FREQUENCY_IDS.daily },
  { label: "Weekly", value: FREQUENCY_IDS.weekly },
  { label: "Monthly", value: FREQUENCY_IDS.monthly },
  { label: "Custom", value: FREQUENCY_IDS.custom },
];

export const LIST_DAYS_IN_MONTH = [
  { label: "1st", value: 1 },
  { label: "2nd", value: 2 },
  { label: "3rd", value: 3 },
  { label: "4th", value: 4 },
  { label: "5th", value: 5 },
  { label: "6th", value: 6 },
  { label: "7th", value: 7 },
  { label: "8th", value: 8 },
  { label: "9th", value: 9 },
  { label: "10th", value: 10 },
  { label: "11th", value: 11 },
  { label: "12th", value: 12 },
  { label: "13th", value: 13 },
  { label: "14th", value: 14 },
  { label: "15th", value: 15 },
  { label: "16th", value: 16 },
  { label: "17th", value: 17 },
  { label: "18th", value: 18 },
  { label: "19th", value: 19 },
  { label: "20th", value: 20 },
  { label: "21st", value: 21 },
  { label: "22nd", value: 22 },
  { label: "23rd", value: 23 },
  { label: "24th", value: 24 },
  { label: "25th", value: 25 },
  { label: "26th", value: 26 },
  { label: "27th", value: 27 },
  { label: "28th", value: 28 },
  { label: "29th", value: 29 },
  { label: "30th", value: 30 },
  { label: "31st", value: 31 },
];
