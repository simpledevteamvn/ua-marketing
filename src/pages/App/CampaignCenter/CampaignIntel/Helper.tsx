import React from "react";
import moment from "moment";
import {
  BATCH_UPDATE_STATUS,
  COST_DECIMAL,
  EDITABLE_STAT_IDS,
  LTV_DECIMAL,
  NETWORK_CODES,
  NOT_A_NUMBER,
  RETENTION_DECIMAL,
  TABLE_COLUMN_COLOR,
} from "../../../../constants/constants";
import {
  getAndSetRecordData,
  getBidData,
  getBudgetData,
} from "../../../../partials/common/Table/EditNumberCell";
import {
  canBeConvertedToNumber,
  checkNumberValue,
  findFirstDigitIndex,
  getDay,
  getDecimalCount,
  getShadeColor,
  getTableCellBg,
  roundNumber,
  sortNumberWithNullable,
} from "../../../../utils/Helpers";
import { COL_IDS, LTV_BASE, REVENUE_BASE, SESSION_BASE } from "./constants";
import {
  getTableTitleWithTooltip,
  getTitleWith2Lines,
} from "../../../../partials/common/Table/Header";
import searchMaxMinValue from "../../../../partials/common/Table/SearchMaxMinValue";
import classNames from "classnames";
import { numberWithCommas } from "../../../../utils/Utils";
import { DATE_DIMENSION } from "../../overview/constant";
// @ts-ignore
import partialIcon from "../../../../images/common/partial-day.svg";

export const getDataObj = (record, fieldName) => {
  if (fieldName === EDITABLE_STAT_IDS.bid) {
    return getBidData(record);
  }
  return getBudgetData(record);
};

const getDataWithFlags = (data, stat, bidFlag, budgetFlag) => {
  if (stat === EDITABLE_STAT_IDS.bid) {
    return { ...data, bidFlag };
  }
  return { ...data, budgetFlag };
};

const getStatus = (record, stat) => {
  if (stat === EDITABLE_STAT_IDS.bid) {
    return getBidData(record)?.status;
  }
  return getBudgetData(record)?.status;
};

const updateAllLevelFlags = (
  record,
  stat,
  listBidFlags: any[] = [],
  listBudgetFlags: any[] = []
) => {
  const status = getStatus(record, stat);

  if (status && status !== BATCH_UPDATE_STATUS.none) {
    let listLevelFlags = listBidFlags;

    if (stat === EDITABLE_STAT_IDS.budget) {
      listLevelFlags = listBudgetFlags;
    }

    listLevelFlags.forEach((lvFlags) => {
      if (!lvFlags.includes(status)) {
        lvFlags.push(status);
      }
    });
  }
};

export const updateListFromData = (
  listData: any[] = [],
  data: any = {},
  stat = "bid",
  emailName = "",
  name = "",
  isPushHistory = true
) => {
  if (!data) return listData;

  const {
    rawCampaignId,
    id,
    rawTargetingKeywordId,
    rawAdGroupId,
    sourceAppId,
    bid,
    dailyBudget,
    status,
  } = data;

  const isSetData = !!rawCampaignId;
  const isCampLv =
    rawCampaignId &&
    !id &&
    !rawTargetingKeywordId &&
    !rawAdGroupId &&
    !sourceAppId;
  const isAdGroupLv = rawAdGroupId && !rawTargetingKeywordId && !sourceAppId;
  const newValue = stat === EDITABLE_STAT_IDS.bid ? bid : dailyBudget;

  const setValue = (record) =>
    getAndSetRecordData({
      recordData: record,
      value: newValue,
      status,
      fieldName: stat,
      isSetData: true,
      historyField: `${stat}History`,
      emailName,
      name,
      isPushHistory,
    });

  const newList = listData.map((networkObj) => {
    let networkBidFlags = [BATCH_UPDATE_STATUS.none];
    let networkBudgetFlags = [BATCH_UPDATE_STATUS.none];
    const getNetwork = (data) =>
      getDataWithFlags(data, stat, networkBidFlags, networkBudgetFlags);

    const networkChildren = networkObj.children.map((networkApp) => {
      let appBidFlags = [BATCH_UPDATE_STATUS.none];
      let appBudgetFlags = [BATCH_UPDATE_STATUS.none];
      const getApp = (data) =>
        getDataWithFlags(data, stat, appBidFlags, appBudgetFlags);

      if (!networkApp?.children?.length) {
        return getApp(networkApp);
      }

      const newCampaigns = networkApp.children.map((campaignObj) => {
        let campBidF = [BATCH_UPDATE_STATUS.none];
        let campBudgetF = [BATCH_UPDATE_STATUS.none];
        const getCampaign = (d) =>
          getDataWithFlags(d, stat, campBidF, campBudgetF);
        const updateFlag = () =>
          updateAllLevelFlags(
            campaignObj,
            stat,
            [networkBidFlags, appBidFlags, campBidF],
            [networkBudgetFlags, appBudgetFlags, campBudgetF]
          );

        if (
          isSetData &&
          isCampLv &&
          campaignObj.campaign?.rawCampaignId === rawCampaignId
        ) {
          setValue(campaignObj);
          updateFlag();
          return getCampaign(campaignObj);
        }
        updateFlag();

        if (!campaignObj.locations?.length && !campaignObj.adGroups?.length) {
          return getCampaign(campaignObj);
        }

        if (campaignObj.locations?.length) {
          const locationLevel = campaignObj.children.map((locationObj) => {
            let locationBidF = [BATCH_UPDATE_STATUS.none];
            let locationBudgetF = [BATCH_UPDATE_STATUS.none];
            const getLocation = (d) =>
              getDataWithFlags(d, stat, locationBidF, locationBudgetF);
            const updateFlag = () =>
              updateAllLevelFlags(
                locationObj,
                stat,
                [networkBidFlags, appBidFlags, campBidF, locationBidF],
                [
                  networkBudgetFlags,
                  appBudgetFlags,
                  campBudgetF,
                  locationBudgetF,
                ]
              );

            if (
              isSetData &&
              id &&
              (locationObj.bid?.id === id || locationObj.budget?.id === id)
            ) {
              setValue(locationObj);
              updateFlag();
              return getLocation(locationObj);
            }
            updateFlag();

            if (
              !locationObj.dates?.length &&
              !locationObj.siteIds?.length &&
              !locationObj.adGroups?.length
            ) {
              return getLocation(locationObj);
            }

            if (locationObj.siteIds?.length) {
              // có "Site Ids" level ở giữa
              const listSites = locationObj.children[0].children?.map(
                (siteObj) => {
                  let siteBidF = [BATCH_UPDATE_STATUS.none];
                  let siteBudgetF = [BATCH_UPDATE_STATUS.none];
                  const getSite = (d) =>
                    getDataWithFlags(d, stat, siteBidF, siteBudgetF);
                  const updateFlag = () =>
                    updateAllLevelFlags(
                      siteObj,
                      stat,
                      [
                        networkBidFlags,
                        appBidFlags,
                        campBidF,
                        locationBidF,
                        siteBidF,
                      ],
                      [
                        networkBudgetFlags,
                        appBudgetFlags,
                        campBudgetF,
                        locationBudgetF,
                        siteBudgetF,
                      ]
                    );

                  if (
                    isSetData &&
                    id &&
                    (siteObj.bid?.id === id || siteObj.budget?.id === id)
                  ) {
                    setValue(siteObj);
                    updateFlag();
                    return getSite(siteObj);
                  }
                  updateFlag();
                  return getSite(siteObj);
                }
              );
              const dataObj = locationObj.children;
              dataObj[0].children = listSites;

              return getLocation({ ...locationObj, children: dataObj });
            }

            if (locationObj.adGroups?.length) {
              const adGroupLevel = locationObj.children.map((adGroupObj) => {
                let adGroupBidF = [BATCH_UPDATE_STATUS.none];
                let adGroupBudgetF = [BATCH_UPDATE_STATUS.none];
                const getAdGroup = (d) =>
                  getDataWithFlags(d, stat, adGroupBidF, adGroupBudgetF);
                const updateFlag = () =>
                  updateAllLevelFlags(
                    adGroupObj,
                    stat,
                    [
                      networkBidFlags,
                      appBidFlags,
                      campBidF,
                      locationBidF,
                      adGroupBidF,
                    ],
                    [
                      networkBudgetFlags,
                      appBudgetFlags,
                      campBudgetF,
                      locationBudgetF,
                      adGroupBudgetF,
                    ]
                  );

                if (
                  isSetData &&
                  isAdGroupLv &&
                  adGroupObj.adGroup?.rawAdGroupId === rawAdGroupId
                ) {
                  setValue(adGroupObj);
                  updateFlag();
                  return getAdGroup(adGroupObj);
                }

                updateFlag();

                // Note: dates level don't update
                if (!adGroupObj.keywords?.length) {
                  // && !adGroupObj.dates?.length
                  return getAdGroup(adGroupObj);
                }

                const keywordLevel = adGroupObj.children.map((keywordObj) => {
                  let keywordBidF = [BATCH_UPDATE_STATUS.none];
                  let keywordBudgetF = [BATCH_UPDATE_STATUS.none];
                  const getKeyword = (d) =>
                    getDataWithFlags(d, stat, keywordBidF, keywordBudgetF);
                  const updateFlag = () =>
                    updateAllLevelFlags(
                      keywordObj,
                      stat,
                      [
                        networkBidFlags,
                        appBidFlags,
                        campBidF,
                        locationBidF,
                        adGroupBidF,
                        keywordBidF,
                      ],
                      [
                        networkBudgetFlags,
                        appBudgetFlags,
                        campBudgetF,
                        locationBudgetF,
                        adGroupBudgetF,
                        keywordBudgetF,
                      ]
                    );

                  if (
                    isSetData &&
                    rawTargetingKeywordId &&
                    keywordObj.keyword?.rawTargetingKeywordId ===
                      rawTargetingKeywordId
                  ) {
                    setValue(keywordObj);
                    updateFlag();
                    return getKeyword(keywordObj);
                  }

                  updateFlag();
                  return getKeyword(keywordObj);
                });

                return getAdGroup({ ...adGroupObj, children: keywordLevel });
              });

              return getLocation({ ...locationObj, children: adGroupLevel });
            }

            // Note: dates level don't update
            return getLocation(locationObj);
          });

          return getCampaign({ ...campaignObj, children: locationLevel });
        }

        if (campaignObj.adGroups?.length) {
          const adGroupLevel = campaignObj.children.map((adGroupObj) => {
            let adGroupBidF = [BATCH_UPDATE_STATUS.none];
            let adGroupBudgetF = [BATCH_UPDATE_STATUS.none];
            const getAdGroup = (d) =>
              getDataWithFlags(d, stat, adGroupBidF, adGroupBudgetF);
            const updateFlag = () =>
              updateAllLevelFlags(
                adGroupObj,
                stat,
                [networkBidFlags, appBidFlags, campBidF, adGroupBidF],
                [
                  networkBudgetFlags,
                  appBudgetFlags,
                  campBudgetF,
                  adGroupBudgetF,
                ]
              );

            if (
              isSetData &&
              isAdGroupLv &&
              adGroupObj.adGroup?.rawAdGroupId === rawAdGroupId
            ) {
              setValue(adGroupObj);
              updateFlag();
              return getAdGroup(adGroupObj);
            }
            updateFlag();

            if (!adGroupObj.keywords?.length && !adGroupObj.locations?.length) {
              return getAdGroup(adGroupObj);
            }

            if (adGroupObj.keywords?.length) {
              const keywordLevel = adGroupObj.children.map((keywordObj) => {
                let keywordBidF = [BATCH_UPDATE_STATUS.none];
                let keywordBudgetF = [BATCH_UPDATE_STATUS.none];
                const getKeyword = (d) =>
                  getDataWithFlags(d, stat, keywordBidF, keywordBudgetF);
                const updateFlag = () =>
                  updateAllLevelFlags(
                    keywordObj,
                    stat,
                    [
                      networkBidFlags,
                      appBidFlags,
                      campBidF,
                      adGroupBidF,
                      keywordBidF,
                    ],
                    [
                      networkBudgetFlags,
                      appBudgetFlags,
                      campBudgetF,
                      adGroupBudgetF,
                      keywordBudgetF,
                    ]
                  );

                if (
                  isSetData &&
                  rawTargetingKeywordId &&
                  keywordObj.keyword?.rawTargetingKeywordId ===
                    rawTargetingKeywordId
                ) {
                  setValue(keywordObj);
                  updateFlag();
                  return getKeyword(keywordObj);
                }
                updateFlag();
                return getKeyword(keywordObj);
              });
              return getAdGroup({ ...adGroupObj, children: keywordLevel });
            }

            if (adGroupObj.locations?.length) {
              const locationLevel = adGroupObj.children.map((locationObj) => {
                let locationBidF = [BATCH_UPDATE_STATUS.none];
                let locationBudgetF = [BATCH_UPDATE_STATUS.none];
                const getLocation = (d) =>
                  getDataWithFlags(d, stat, locationBidF, locationBudgetF);
                const updateFlag = () =>
                  updateAllLevelFlags(
                    locationObj,
                    stat,
                    [
                      networkBidFlags,
                      appBidFlags,
                      campBidF,
                      adGroupBidF,
                      locationBidF,
                    ],
                    [
                      networkBudgetFlags,
                      appBudgetFlags,
                      campBudgetF,
                      adGroupBudgetF,
                      locationBudgetF,
                    ]
                  );

                if (
                  isSetData &&
                  id &&
                  (locationObj.bid?.id === id || locationObj.budget?.id === id)
                ) {
                  setValue(locationObj);
                  updateFlag();
                  return getLocation(locationObj);
                }
                updateFlag();
                return getLocation(locationObj);
              });
              return getAdGroup({ ...adGroupObj, children: locationLevel });
            }

            return getAdGroup(adGroupObj);
          });
          return getCampaign({ ...campaignObj, children: adGroupLevel });
        }

        return getCampaign(campaignObj);
      });
      return getApp({ ...networkApp, children: [...newCampaigns] });
    });

    return getNetwork({ ...networkObj, children: networkChildren });
  });

  return newList;
};

const networkWithMoreAcc = [
  NETWORK_CODES.google,
  NETWORK_CODES.applovin,
  NETWORK_CODES.mintegral,
  NETWORK_CODES.ironSource,
  NETWORK_CODES.facebook,
];

const getRoas = (revenueDay, cohortCost) => {
  return roundNumber((revenueDay * 100) / cohortCost);
};

const getRoi = (revenueDay, cohortCost) => {
  return roundNumber(((revenueDay - cohortCost) * 100) / cohortCost);
};

const getSigmaRetention = (data, num) => {
  const { users } = data;
  let sigmaRetention = 0;
  for (let dayNum = 0; dayNum <= num; dayNum++) {
    let session = data[`${SESSION_BASE}${dayNum}`];
    if (!dayNum) {
      // sessionD0 không có trong api, phải dùng qua data.users
      session = users;
    }
    sigmaRetention += session / users;
  }
  return sigmaRetention;
};

const getLTV = (data, num) => {
  const { rev, dau, users } = data;

  if (!dau || !users) {
    const isEmpty = (value) => value === "" || value === null;
    if (isEmpty(dau) || isEmpty(users)) {
      return NOT_A_NUMBER;
    }
    return 0;
  }

  const ARPDAU = rev / dau;
  const sigmaRetention = getSigmaRetention(data, num);
  return roundNumber(ARPDAU * sigmaRetention, true, LTV_DECIMAL);
};

export const reCalculateData = (listData: any = []) => {
  const reCalc = (element, isAppLv = false) => {
    if (isAppLv && !Object.keys(element.data || {}).length) return;

    const data = isAppLv ? element.data : element;
    const {
      click,
      install,
      impression,
      cost,
      networkCode,
      attributeCost,
      attributeInstall,
      skanCost,
      skanInstall,
      cohortCost,
      cohortRevenueD0,
      cohortRevenueD1,
      cohortRevenueD3,
      cohortRevenueD7,
      cohortRevenueD14,
      cohortRevenueD30,
      cohortRevenueD60,
      cohortRevenueD90,
      cohortRevenueD180,
      users,
      billableCost,
      billableInstall,
    } = data;

    const nCode = isAppLv ? element.networkCode : networkCode;
    const ecpiDecimal = networkWithMoreAcc.includes(nCode) ? 3 : 2;

    // Important: Reference - TableColumns.tsx page
    // eCPI = Cost / Installs
    data.eCpi = install ? roundNumber(cost / install, false, ecpiDecimal) : 0;
    data.attributeECpi = attributeInstall
      ? roundNumber(attributeCost / attributeInstall, false, ecpiDecimal)
      : 0;
    data.skanECpi = skanInstall
      ? roundNumber(skanCost / skanInstall, false, ecpiDecimal)
      : 0;
    data.billableECpi = billableInstall
      ? roundNumber(billableCost / billableInstall, false, ecpiDecimal)
      : 0;
    // CTR = Clicks * 100 / Impressions
    data.ctr = impression ? roundNumber((click * 100) / impression) : 0;
    // CVR = Installs * 100 / Clicks
    data.cvr = click ? roundNumber((install * 100) / click) : 0;
    // eCPC = Cost / Clicks
    data.eCpc = click ? roundNumber(cost / click, false, 5) : 0;
    // eCPM = Cost / 1000 Impressions
    data.eCpm = impression ? roundNumber((cost * 1000) / impression) : 0;
    // oCVR = Installs / 1000 Impressions
    data.oCvr = impression ? roundNumber((install * 1000) / impression) : 0;

    data.cohortROASD0 = getRoas(cohortRevenueD0, cohortCost);
    data.cohortROASD1 = getRoas(cohortRevenueD1, cohortCost);
    data.cohortROASD3 = getRoas(cohortRevenueD3, cohortCost);
    data.cohortROASD7 = getRoas(cohortRevenueD7, cohortCost);
    data.cohortROASD14 = getRoas(cohortRevenueD14, cohortCost);
    data.cohortROASD30 = getRoas(cohortRevenueD30, cohortCost);
    data.cohortROASD60 = getRoas(cohortRevenueD60, cohortCost);
    data.cohortROASD90 = getRoas(cohortRevenueD90, cohortCost);
    data.cohortROASD180 = getRoas(cohortRevenueD180, cohortCost);

    data.cohortEcpi = users
      ? roundNumber(cohortCost / users, false, ecpiDecimal)
      : 0;

    [1, 3, 7, 14, 30].forEach((num) => {
      data[`${LTV_BASE}${num}`] = getLTV(data, num);
    });
  };

  if (typeof listData === "object" && listData !== null) {
    // Tính lại data ở level campaign
    return reCalc(listData);
  }

  if (!listData?.length) return;

  // Tính lại data ở level app
  listData.forEach((element) => reCalc(element, true));
};

export const getRoundedValue = (record, value, decimal = 2) => {
  const { network, networkCode } = record;
  const code = networkCode || network.code;

  if (!code) return value;
  if (!networkWithMoreAcc.includes(code)) {
    return roundNumber(value, true, decimal);
  }

  return value;
};

export const getChildrenCheckbox = (recordData) => {
  const listIds: any = [];
  const pushTableId = (record) => {
    if (checkNumberValue(record.tableId) && !listIds.includes(record.tableId)) {
      listIds.push(record.tableId);
    }
    if (record.children?.length) {
      record.children.forEach((child) => {
        pushTableId(child);
      });
    }
  };

  pushTableId(recordData);

  return listIds;
};

export const getDynamicDays = (data, dateRange) => {
  const totalDay = moment().diff(moment(dateRange?.[0]), "days");

  let results = {};
  Object.keys(data || {}).forEach((el) => {
    const idx = findFirstDigitIndex(el);
    if (idx > -1) {
      const day = el.slice(idx);
      if (canBeConvertedToNumber(day) && Number(day) > totalDay) {
        results[el] = false;
      }
    }
  });

  return results;
};

export const getFieldByString = (field, base = REVENUE_BASE) => {
  const idx = findFirstDigitIndex(field);
  if (idx > -1) {
    const day = field.slice(idx);
    if (canBeConvertedToNumber(day)) {
      return base + day;
    }
  }
  return "";
};

const isNumber = (input) =>
  !input?.split("")?.some((char) => !"0123456789".includes(char));

export const getMax = (field, listData) =>
  Math.max(...listData?.map((el: any) => el.data?.[field] || 0));

export const getSummaryData = (list) => {
  const resultObj: any = {};

  list.forEach((el) => {
    if (!Object.keys(el.data || {}).length) return;
    Object.keys(el.data).forEach((field) => {
      const currentData = Number(resultObj[field]) || 0;
      // Khi cộng các chữ số thập phân có thể ra kết quả với số chữ thập phân không chính xác
      // Keywords: Floating-Point Numbers
      const value = el.data[field];
      const decimal1 = getDecimalCount(currentData);
      const decimal2 = getDecimalCount(value);
      resultObj[field] = roundNumber(
        currentData + Number(value),
        false,
        Math.max(decimal1, decimal2)
      );
    });
  });

  return resultObj;
};

const getCellNumber = (dataValue, suffixStr = "%", preffix = "") => {
  const dataStr = numberWithCommas(dataValue);

  if (dataValue === "0" || dataValue === 0) {
    return (
      <>
        {preffix}0{suffixStr}
      </>
    );
  }

  return (
    <>
      {dataValue && (
        <>
          {preffix}
          {dataStr}
          {suffixStr}
        </>
      )}
    </>
  );
};

export const getSummaryByField = (listData, field) => {
  if (!listData?.length) return "";

  const toalRevenueDx = listData.reduce((preValue, rd) => {
    let crrValue = rd.data?.[field];
    if (!crrValue || crrValue === NOT_A_NUMBER) {
      crrValue = 0;
    }
    return roundNumber(preValue + Number(crrValue));
  }, 0);

  return toalRevenueDx;
};

const getSummaryRoas = (listData, field) => {
  const day = getDay(field);
  if (day === -1 || !listData?.length) return "";

  const revenueDx = REVENUE_BASE + day;
  const totalRevenueDx = getSummaryByField(listData, revenueDx);
  const totalCost = getSummaryByField(listData, COL_IDS.cohortCost);
  return getRoas(totalRevenueDx, totalCost);
};

const getSummaryLTV = (listData, field) => {
  const day = getDay(field);
  if (day === -1 || !listData?.length) return "";

  const dataObj = getSummaryData(listData);
  return getLTV(dataObj, day);
};

const getSummaryRoi = (listData, field) => {
  const day = getDay(field);
  if (day === -1 || !listData?.length) return "";

  const revenueDx = REVENUE_BASE + day;
  const totalRevenueDx = getSummaryByField(listData, revenueDx);
  const totalCost = getSummaryByField(listData, COL_IDS.cohortCost);
  return getRoi(totalRevenueDx, totalCost);
};

const getSummaryRetention = (listData, field) => {
  const day = getDay(field);
  if (day === -1 || !listData?.length) return "";
  const totalSession = getSummaryByField(listData, SESSION_BASE + day);
  const users = getSummaryByField(listData, COL_IDS.users);
  return users
    ? roundNumber((totalSession * 100) / users, false, RETENTION_DECIMAL)
    : 0;
};

const getSummarySigmaRetention = (listData, field) => {
  const day = getDay(field);
  if (day === -1 || !listData?.length) return "";

  const dataObj = getSummaryData(listData);
  return roundNumber(getSigmaRetention(dataObj, day), true);
};

export const getCol = (props) => {
  const {
    listData,
    field,
    label = "",
    width = 160,
    calculate = null,
    borderDashed = false,
    // Khi chọn "date" trong SummaryTable thì cần tính lại THEO record để hiển thị border dashed (borderDashed ko dùng được)
    filter = "",
    subFilter = "",
    totalPartialDay = 1,
    sorterTooltip = "",
    settingDecimal,
    hiddenSummary = false,
    sumValue,
    suff = "",
    preff = "",
    summaryPreff,
    onFilterTable,
  } = props;

  const showSorterTooltip = sorterTooltip
    ? { title: sorterTooltip }
    : undefined;
  let title = label || field;
  let settingName;
  let columnId = field;
  let suffixStr = suff;
  let preffix = preff;
  let summaryPrefix = summaryPreff;
  let calc;
  let isRetention = false;
  let decimal: any = settingDecimal;
  let isSummaryEmpty = hiddenSummary;
  let summaryValue;
  const titleClass = borderDashed ? "custom-table-header" : undefined;
  const isRoas = field.startsWith("cohortROAS");
  const isRoi = field.startsWith("cohortROI");

  if (field.startsWith("cohort")) {
    let title2 = field;
    const clean1 = field.split("cohort")?.[1];
    const clean2 = clean1?.split("D");
    const dayCount = clean2?.[1];
    let questionIcon = false;

    if (dayCount && isNumber(dayCount)) {
      title2 = clean2[0] + " D" + dayCount;
    }
    if (field === COL_IDS.cohortCost) {
      title2 = "Cost";
      preffix = "$";
      summaryPrefix = "$";
      decimal = COST_DECIMAL;
    } else if (field.startsWith("cohortRevenue")) {
      preffix = "$";
      summaryPrefix = "$";
      decimal = COST_DECIMAL;
    } else {
      if (isRoas || isRoi) {
        suffixStr = "%";
      }
      if (isRoas) {
        questionIcon = true;
        summaryValue = getCellNumber(getSummaryRoas(listData, field));
      }
      if (isRoi) {
        isSummaryEmpty = true;
        // summaryValue = getCellNumber(getSummaryRoi(listData, field));
      }
    }

    title = getTitleWith2Lines("Cohort", title2, questionIcon, titleClass);
    settingName = title2 + " (Cohort)";
  }

  if (field.startsWith("retentionZ")) {
    let title2 = "";
    const clean1 = field.split("retentionZ")?.[1];
    const dayCount = clean1?.length ? clean1.slice(1) : "";

    if (dayCount && isNumber(dayCount)) {
      title2 = "Σ RR D" + dayCount;
    }
    title = getTitleWith2Lines("MMP", title2, true, titleClass);
    settingName = title2 + " (MMP)";
    summaryValue = getCellNumber(getSummarySigmaRetention(listData, field), "");
  } else if (field.startsWith("retention")) {
    let title2 = "";
    const clean1 = field.split("retention")?.[1];
    const dayCount = clean1?.length ? clean1.slice(1) : "";

    if (dayCount && isNumber(dayCount)) {
      title2 = "Retention D" + dayCount;
    }
    isRetention = true;
    title = getTitleWith2Lines("MMP", title2, true, titleClass);
    settingName = title2 + " (MMP)";
    suffixStr = "%";
    summaryValue = getCellNumber(getSummaryRetention(listData, field));
  }

  if (field.startsWith(LTV_BASE)) {
    const day = getDay(field);
    summaryValue = getCellNumber(getSummaryLTV(listData, field), "");
    if (day > -1) {
      settingName = "LTV D" + day;
      title = getTableTitleWithTooltip(settingName, "", titleClass);
    }
  }
  const hasSummaryValue = sumValue === 0 || !!sumValue;

  return {
    title,
    settingName,
    width,
    columnId,
    showSorterTooltip,
    getSummaryField: (record) => record.data?.[field],
    summaryPrefix,
    isSummaryEmpty,
    summaryValue: hasSummaryValue ? sumValue : summaryValue,
    decimal,
    calc: calculate || calc,
    ...searchMaxMinValue({
      getField: (r) => r.data?.[field],
      dataIndex: field,
      placeholderSuffix: " ",
      onFilterTable,
    }),
    sorter: (a, b) => sortNumberWithNullable(a, b, (el) => el.data?.[field]),
    render: (record) => (
      <div className={classNames(isRoas || isRoi ? "" : "table-cell-padding")}>
        <div>{getCellNumber(record.data?.[field], suffixStr, preffix)}</div>
        {isRetention && (
          <div className="text-xs">
            {record.data?.[getFieldByString(field, SESSION_BASE)]}
          </div>
        )}
      </div>
    ),
    onCell: (record) => {
      const isWrapperLv = record.children?.length;
      let showBorder = true;
      if (
        filter === DATE_DIMENSION ||
        (subFilter === DATE_DIMENSION && !isWrapperLv)
      ) {
        let crrDate = record.id;
        if (filter === DATE_DIMENSION && !isWrapperLv) {
          crrDate = record.parentId;
        }
        if (moment(crrDate)?.isValid()) {
          const day = getDay(field);
          const maxDay = moment().diff(crrDate, "days") - totalPartialDay + 1;
          // day >= maxDay thì cột này data chưa đủ => showBorder = true
          showBorder = day >= maxDay;
        }
      }

      if (isRoas || isRoi) {
        return {
          className: classNames(
            "custom-td-bg",
            showBorder && borderDashed && "custom-dashed"
          ),
          ["style"]: {
            backgroundColor: getShadeColor(
              record.data?.[field],
              getMax(field, listData),
              TABLE_COLUMN_COLOR[3]
            ),
          },
        };
      }
      return getTableCellBg(
        record,
        "",
        getMax(field, listData),
        (el) => el.data?.[field],
        showBorder && borderDashed
      );
    },
  };
};

export const isBorderDashed = (dateRange, field, totalPartialDay = 1) => {
  const day = getDay(field);
  let isBorder = false;

  if (day > -1) {
    const startDateDistance = moment().diff(moment(dateRange?.[0]), "days");
    const endDateDistance = moment().diff(moment(dateRange?.[1]), "days");
    const minPartialDay = endDateDistance - totalPartialDay + 1;
    const maxPartialDay = startDateDistance;

    isBorder = true;
    if (day < minPartialDay) {
      isBorder = false;
    }
  }

  return isBorder;
};

export const getPartialNote = () => {
  return (
    <span>
      - <img src={partialIcon} alt=" " className="inline-block mb-0.5" />{" "}
      Partial data
    </span>
  );
};
