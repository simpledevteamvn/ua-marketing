export const LIST_FILTER_KEY = {
  adNetwork: "adNetwork",
  country: "country",
  campaign: "campaign",
  adGroup: "adGroup",
  keyword: "keyword",
  campaignType: "campaignType",
  siteId: "siteId",
  type: "type",
  email: "email",
};

export const LIST_DIMENSION = {
  adNetwork: "0",
  country: "1",
  campaign: "2",
  adGroup: "3",
  keyword: "4",
  campaignType: "5",
  siteId: "6",
  adGroupStatus: "7",
  ltvDate: "8",
};

export const RUNNING = "RUNNING";
export const PAUSED = "PAUSED";
export const ADGROUP_STATUS = [RUNNING, PAUSED];

export const DIMENSION_OPTIONS = [
  { value: LIST_DIMENSION.adNetwork, name: "Ad Network" },
  { value: LIST_DIMENSION.campaign, name: "Campaign" },
  { value: LIST_DIMENSION.adGroup, name: "Ad Group" },
  { value: LIST_DIMENSION.adGroupStatus, name: "Ad Group Status" },
  { value: LIST_DIMENSION.keyword, name: "Keyword" },
  { value: LIST_DIMENSION.country, name: "Country" },
  { value: LIST_DIMENSION.campaignType, name: "Campaign Type" },
  { value: LIST_DIMENSION.siteId, name: "Site Id" },
  { value: LIST_DIMENSION.ltvDate, name: "ARPDAU's time range" },
];

export const LIST_HISTORY = {
  email: "0",
  adNetwork: "1",
  campaign: "2",
  country: "3",
};

export const HISTORY_OPTIONS = [
  { value: LIST_HISTORY.email, name: "Updated by" },
  { value: LIST_HISTORY.adNetwork, name: "Ad Network" },
  { value: LIST_HISTORY.campaign, name: "Campaign" },
  { value: LIST_HISTORY.country, name: "Country" },
];

export const LIST_BATCH_HISTORY = {
  email: "0",
  adNetwork: "1",
  type: "2",
  country: "3",
  campaign: "4",
};

export const BATCH_HISTORY_OPTIONS = [
  { value: LIST_BATCH_HISTORY.email, name: "Updated by" },
  { value: LIST_BATCH_HISTORY.adNetwork, name: "Ad Network" },
  { value: LIST_BATCH_HISTORY.campaign, name: "Campaign" },
  { value: LIST_BATCH_HISTORY.type, name: "Type" },
  { value: LIST_BATCH_HISTORY.country, name: "Country" },
];

export const CSV_HISTORY_OPTIONS = [
  { value: LIST_FILTER_KEY.email, name: "Updated by" },
  { value: LIST_FILTER_KEY.adNetwork, name: "Ad Network" },
];
