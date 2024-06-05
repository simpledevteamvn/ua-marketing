export const MESSAGE_DURATION = 5;

export const SIDEBAR_EXPANDED = "sidebar-expanded";
export const REMEMBER_PASSWORD = "remember-password";
export const ORGANIZATION_PATH = "/organizations";
export const APP_PATH = "/apps";

export const NOT_A_NUMBER = "N/A";
export const USD = "USD";

export const ALL_APP_OPTION = "all-apps";
export const ALL_COUNTRIES_OPTION = "ALL";
export const ALL_NETWORK_OPTION = "All Networks";
export const ALL_CAMPAIGNS_OPTION = "All Campaigns";
export const ALL_AD_GROUP_OPTION = "all-ad-groups";
export const ALL_KEYWORD_OPTION = "all-keywords";
export const ALL_SITE_ID_OPTION = "all-site-Ids";

export const IMPORTING_DATA = "Importing data";

export const ECPI_DECIMAL = 3;
export const ECPC_DECIMAL = 5;
export const LTV_DECIMAL = 4;
export const RETENTION_DECIMAL = 2;
export const ARPDAU_DECIMAL = 4;
export const COST_DECIMAL = 2;

export const MAXIMUM_INC_PERCENTAGE = 30;
export const OFFSET_TABLE_HEADER = 63;

export const FAKED = "faked";

export const ASCEND = "ascend";
export const DESCEND = "descend";

export const ACTIVE_STATUS = "ACTIVE"; // Creative...

export const ROLES = {
  admin: "ADMIN",
  user: "USER",
};

export const DEFAULT_GROUPS = [{ id: 0 }];
export const DEFAULT_GROUP_ID = [DEFAULT_GROUPS[0].id];

export const PLATFORMS = {
  ios: "ios",
  android: "android",
};

export const EDITABLE_STAT_IDS = {
  all: "all",
  bid: "bid",
  budget: "budget",
};

export const DEFAULT_BID_STEP = 0.01;
export const DEFAULT_BID = 0.01;
export const DEFAULT_BUDGET_STEP = 1;
export const DEFAULT_BUDGET = 100;
export const DEFAULT_GOAL = 10;

export const EDITABLE_STATS = [
  {
    name: "Bid",
    value: EDITABLE_STAT_IDS.bid,
    step: DEFAULT_BID_STEP,
    defaultValue: DEFAULT_BID,
  },
  {
    name: "Budget",
    value: EDITABLE_STAT_IDS.budget,
    step: DEFAULT_BUDGET_STEP,
    defaultValue: DEFAULT_BUDGET,
  },
];

export const STORE = {
  apple: {
    name: "apple",
    platform: PLATFORMS.ios,
  },
  google: {
    name: "google",
    platform: PLATFORMS.android,
  },
};

export const PLATFORMS_FILTER = [
  {
    text: "iOS",
    value: "ios",
  },
  {
    text: "Android",
    value: "android",
  },
];

export const CONNECTOR_STATUS_FILTER = [
  {
    text: "Linked",
    value: "LINKED",
  },
  {
    text: "Ready",
    value: "READY",
  },
];

export const ASSET_TYPES = ["IMAGE", "VIDEO", , "PLAYABLE"];

export const CREATIVE_TYPES = {
  playable: "PLAYABLE",
  video: "VIDEO",
  endCard: "END_CARD",
  image: "IMAGE",
  unknown: "UNKNOWN",
};

export const IMPORTING_APP = "Importing";

export const PRIVATE_KEY = "privateKey";
export const PUBLIC_KEY = "publicKey";

export const AD_NETWORK_TYPE = "AdNetwork";

export const NETWORK_CODES = {
  applovin: "applovin",
  google: "google-ads",
  appleSearchAds: "apple-search-ads",
  ironSource: "iron-source-ads",
  mintegral: "mintegral",
  facebook: "facebook-ads",
  tiktok: "tiktok-ads",
  unity: "unity-ads",
  vungle: "vungle",
  moloco: "moloco",
  adjoe: "adjoe",
  entravision: "entravision",
  aura: "aura",
  adjust: "adjust",
};

export const LIST_CAMPAIGN_STATUS = {
  all: { label: "All", value: "" },
  running: { label: "Running", value: "RUNNING" },
  paused: { label: "Paused", value: "PAUSED" },
};
export const CAMPAIGN_SEGMENTED = [
  LIST_CAMPAIGN_STATUS.all.label,
  LIST_CAMPAIGN_STATUS.running.label,
  LIST_CAMPAIGN_STATUS.paused.label,
];

export const EDITABLE_STATUS = {
  none: "NONE",
  readOnly: "READ_ONLY",
  readWrite: "READ_WRITE",
};

// Types of campaign level: "CPI", "RETENTION", "ROAS"
// Types of CPI: "CPI" + "SOURCE"
export const BID_CPI_TYPE = "CPI";
export const BID_SOURCE_TYPE = "SOURCE"; // Country

export const BID_ROAS_TYPE = "ROAS"; // Country, Campaign
export const BID_RETENSION_TYPE = "RETENTION"; // Country
export const BID_RETENTION_GOAL_TYPE = "RETENTION_GOAL"; // Adgroup

export const BATCH_UPDATE_STATUS = {
  updating: "UPDATING",
  none: "NONE",
  updateFailure: "UPDATE_FAILURE",
};

export const NOTIFICATION_TYPES = {
  error: "ERROR",
  success: "SUCCESS",
  warning: "WARNING",
};

export const MEASUREMENT_OPTIONS = [
  {
    label: "Cost",
    key: "0",
  },
  {
    label: "Installs",
    key: "1",
  },
  {
    label: "eCPI",
    key: "2",
  },
  {
    label: "eCPM",
    key: "3",
  },
];

export const TABLE_SORT_KEYS = {
  sortByValue: "1",
  sortByChange: "2",
};
export const TABLE_SORT_OPTIONS = [
  {
    label: "Sort by value",
    key: TABLE_SORT_KEYS.sortByValue,
  },
  {
    label: "Sort by change",
    key: TABLE_SORT_KEYS.sortByChange,
  },
];

export const EDIT_NUMBER_MODE = {
  value: "value",
  percentage: "percentage",
};

export const DATE_MILESTONES = {
  last3Days: "last3Days",
  last7Days: "last7Days",
  last14Days: "last14Days",
  last30Days: "last30Days",
  thisWeek: "thisWeek",
  thisMonth: "thisMonth",
  lastWeek: "lastWeek",
  lastMonth: "lastMonth",
};

export const EXTRA_FOOTER = [
  { value: DATE_MILESTONES.thisWeek, label: "This Week" },
  { value: DATE_MILESTONES.lastWeek, label: "Last Week" },
  { value: DATE_MILESTONES.thisMonth, label: "This Month" },
  { value: DATE_MILESTONES.lastMonth, label: "Last Month" },
  { value: DATE_MILESTONES.last7Days, label: "Last 7 days" },
  { value: DATE_MILESTONES.last30Days, label: "Last 30 days" },
];

export const EXPECTED_SIZES = [
  "512x512",
  "768x1024",
  "640x120",
  "728x90",
  "720x1280",
  "1200x627",
  "320x50",
  "600x600",
  "320x210",
  "450x300",
  "210x210",
  "1080x2160",
  "750x1334",
];

export const HIGHLIGHT_STYLE = { backgroundColor: "#ffc069", padding: 0 };

export const TABLE_COLUMN_COLOR = [
  "rgb(130, 200, 213)", // #82C8D5
  "rgb(111, 216, 189", // #6FD8BD
  "rgb(134, 172, 57)",
  "rgb(61, 132, 194)",
  "rgb(72, 93, 199)",
];

// <div>
//   {colors.map((el) => (
//     <div
//       className={`w-6 h-6 bg-[${el}]`}
//       style={{ backgroundColor: el }}
//       key={el}
//     ></div>
//   ))}
// </div>;

export const CHART_COLORS = [
  "#60a5fa",
  "#66d9e8",
  "#22aa99",
  "#8e67f9",
  "#fcc419",
  "#da77f2",
  "#ffa94d",
  "#845ef7",
  "#15aabf",
  "#a6a6aa",

  // "#5476fd",
  // "#84d210",
  // "#5ef78e",
  // "#316395",
  // "#b04fbd",
  // "#b65b82",
  // "#5c3f72",
  // "#245c1c",
  // "#b9ea5e",
];

export const CHART_OTHERS = "Others";

export const UPLOAD_PROGRESS_CONFIGS = {
  strokeColor: {
    "0%": "#bae6fd",
    "100%": "#0284c7",
  },
  strokeWidth: 3,
  format: (percent) => percent && `${parseFloat(percent.toFixed(2))}%`,
};
