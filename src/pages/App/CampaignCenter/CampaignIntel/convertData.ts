import moment from "moment";
import { ChildrenCampaigns } from "./Interface";
import { SITE_ID_LABEL } from "./ReportTable";
import { reCalculateData } from "./Helper";
import { getDecimalCount, roundNumber } from "../../../../utils/Helpers";

export const convertData = (list) => {
  const listDataByNetwork: any = [];

  list.forEach((el: any) => {
    const activedIdx = listDataByNetwork.findIndex(
      (network) => el.networkCode === network.networkCode
    );
    if (activedIdx === -1) {
      listDataByNetwork.push({
        children: [el],
        networkCode: el.networkCode,
        name: el.application?.networkConnector?.name,
        imageUrl: el.application?.networkConnector?.network?.imageUrl,
        data: Object.keys(el.data || {}).length ? { ...el.data } : {},
      });
    } else {
      listDataByNetwork[activedIdx].children.push(el);
      if (Object.keys(el.data || {}).length) {
        Object.keys(el.data || {}).forEach((field) => {
          const currentData =
            Number(listDataByNetwork[activedIdx].data[field]) || 0;
          const newValue = Number(el.data[field]);

          const d1 = getDecimalCount(currentData);
          const d2 = getDecimalCount(newValue);

          listDataByNetwork[activedIdx].data[field] = roundNumber(
            currentData + newValue,
            false,
            Math.max(d1, d2)
          );
        });
      }
    }
  });
  reCalculateData(listDataByNetwork);

  let hasAdGroup = false;
  let hasKeyword = false;
  let hasSiteId = false;
  const newListData = listDataByNetwork.map((networkObj, lvl0Id) => {
    const networkChildren = networkObj.children.map((networkApp, lvl1Id) => {
      if (networkApp?.data?.empty || !networkApp?.campaigns?.length) {
        return { ...networkApp, ...getTableId([lvl0Id, lvl1Id]) };
      }

      // Copy network data (+ tableId) to each children (campaign and country)
      const networkData = networkApp.application?.networkConnector?.network;

      const campaignLevel: ChildrenCampaigns[] = networkApp.campaigns.map(
        (campaignObj, lvl2Id) => {
          if (!campaignObj.locations?.length && !campaignObj.adGroups?.length) {
            return {
              ...campaignObj,
              network: networkData,
              ...getTableId([lvl0Id, lvl1Id, lvl2Id]),
            };
          }

          if (campaignObj.locations?.length) {
            const locationLevel = campaignObj.locations.map(
              (locationObj, lvl3Id) => {
                if (
                  !locationObj.dates?.length &&
                  !locationObj.siteIds?.length &&
                  !locationObj.adGroups?.length
                ) {
                  return {
                    ...locationObj,
                    network: networkData,
                    ...getTableId([lvl0Id, lvl1Id, lvl2Id, lvl3Id]),
                  };
                }

                if (locationObj.siteIds?.length) {
                  hasSiteId = true;
                  const siteLevel = locationObj.siteIds.map(
                    (siteObj, lvl4Id) => {
                      return {
                        ...siteObj,
                        network: networkData,
                        ...getTableId([
                          lvl0Id,
                          lvl1Id,
                          lvl2Id,
                          lvl3Id,
                          0,
                          lvl4Id,
                        ]),
                      };
                    }
                  );

                  let dateData = [];
                  if (locationObj.dates?.length) {
                    dateData = getDateLevel(
                      locationObj,
                      networkData,
                      [lvl0Id, lvl1Id, lvl2Id, lvl3Id],
                      true
                    );
                  }
                  const siteChild = {
                    siteId: SITE_ID_LABEL,
                    network: networkData,
                    children: [...siteLevel],
                    ...getTableId([lvl0Id, lvl1Id, lvl2Id, lvl3Id, 0]),
                  };
                  const newChildren = dateData?.length
                    ? [siteChild, ...dateData]
                    : [siteChild];

                  return {
                    ...locationObj,
                    network: networkData,
                    children: newChildren,
                    ...getTableId([lvl0Id, lvl1Id, lvl2Id, lvl3Id]),
                  };
                }

                if (locationObj.adGroups?.length) {
                  // networks: "apple-search-ads",
                  hasAdGroup = true;
                  const adGroupLevel = locationObj.adGroups.map(
                    (adGroupObj, lvl4Id) => {
                      if (!adGroupObj?.keywords?.length) {
                        return {
                          ...adGroupObj,
                          network: networkData,
                          ...getTableId([
                            lvl0Id,
                            lvl1Id,
                            lvl2Id,
                            lvl3Id,
                            lvl4Id,
                          ]),
                        };
                      }
                      const keyWordLv = adGroupObj.keywords.map(
                        (keywordObj, lvl5Id) => {
                          if (!keywordObj.dates?.length) {
                            return {
                              ...keywordObj,
                              network: networkData,
                              ...getTableId([
                                lvl0Id,
                                lvl1Id,
                                lvl2Id,
                                lvl3Id,
                                lvl4Id,
                                lvl5Id,
                              ]),
                            };
                          }
                          return getDateLevel(keywordObj, networkData, [
                            lvl0Id,
                            lvl1Id,
                            lvl2Id,
                            lvl3Id,
                            lvl4Id,
                            lvl5Id,
                          ]);
                        }
                      );

                      return {
                        ...adGroupObj,
                        network: networkData,
                        children: [...keyWordLv],
                        ...getTableId([lvl0Id, lvl1Id, lvl2Id, lvl3Id, lvl4Id]),
                      };
                    }
                  );

                  return {
                    ...locationObj,
                    network: networkData,
                    children: [...adGroupLevel],
                    ...getTableId([lvl0Id, lvl1Id, lvl2Id, lvl3Id]),
                  };
                }

                if (locationObj.dates?.length) {
                  return getDateLevel(locationObj, networkData, [
                    lvl0Id,
                    lvl1Id,
                    lvl2Id,
                    lvl3Id,
                  ]);
                }
              }
            );
            return {
              ...campaignObj,
              network: networkData,
              children: [...locationLevel],
              ...getTableId([lvl0Id, lvl1Id, lvl2Id]),
            };
          }

          if (campaignObj.adGroups?.length) {
            hasAdGroup = true;
            const adGroupLevel = campaignObj.adGroups.map(
              (adGroupObj, lvl3Id) => {
                if (
                  !adGroupObj.keywords?.length &&
                  !adGroupObj.locations?.length
                ) {
                  return {
                    ...adGroupObj,
                    network: networkData,
                    ...getTableId([lvl0Id, lvl1Id, lvl2Id, lvl3Id]),
                  };
                }

                if (adGroupObj.keywords?.length) {
                  hasKeyword = true;
                  const keywordLevel = adGroupObj.keywords.map(
                    (keywordObj, lvl4Id) => {
                      if (!keywordObj.dates?.length) {
                        return Object.assign({}, keywordObj, {
                          network: networkData,
                          ...getTableId([
                            lvl0Id,
                            lvl1Id,
                            lvl2Id,
                            lvl3Id,
                            lvl4Id,
                          ]),
                        });
                      }

                      return getDateLevel(keywordObj, networkData, [
                        lvl0Id,
                        lvl1Id,
                        lvl2Id,
                        lvl3Id,
                        lvl4Id,
                      ]);
                    }
                  );
                  return {
                    ...adGroupObj,
                    network: networkData,
                    children: [...keywordLevel],
                    ...getTableId([lvl0Id, lvl1Id, lvl2Id, lvl3Id]),
                  };
                }

                if (adGroupObj.locations?.length) {
                  const locationLevel = adGroupObj.locations.map(
                    (locationObj, lvl4Id) => {
                      if (!locationObj.dates?.length) {
                        return Object.assign({}, locationObj, {
                          network: networkData,
                          ...getTableId([
                            lvl0Id,
                            lvl1Id,
                            lvl2Id,
                            lvl3Id,
                            lvl4Id,
                          ]),
                        });
                      }

                      return getDateLevel(locationObj, networkData, [
                        lvl0Id,
                        lvl1Id,
                        lvl2Id,
                        lvl3Id,
                        lvl4Id,
                      ]);
                    }
                  );
                  return {
                    ...adGroupObj,
                    network: networkData,
                    children: [...locationLevel],
                    ...getTableId([lvl0Id, lvl1Id, lvl2Id, lvl3Id]),
                  };
                }
              }
            );
            return {
              ...campaignObj,
              network: networkData,
              children: [...adGroupLevel],
              ...getTableId([lvl0Id, lvl1Id, lvl2Id]),
            };
          }
        }
      );

      return {
        ...networkApp,
        children: [...campaignLevel],
        ...getTableId([lvl0Id, lvl1Id]),
      };
    });

    return { ...networkObj, children: networkChildren, tableId: lvl0Id };
  });

  return {
    hasAdGroup,
    hasKeyword,
    hasSiteId,
    newListData,
  };
};

const getDateLevel = (
  dataObj,
  networkData,
  startArr: any = [],
  onlyDate = false
) => {
  const dateLevel = dataObj.dates.map((el) => {
    const date = el.date ? moment(el.date)?.format("YYYY-MM-DD") : "";
    return Object.assign({}, el, {
      network: networkData,
      tableId: startArr?.join() + "," + date,
    });
  });

  if (onlyDate) return dateLevel;

  return {
    ...dataObj,
    network: networkData,
    tableId: startArr?.join(),
    children: [...dateLevel],
  };
};

const getTableId = (listLvlId: any = []) => {
  return { tableId: listLvlId.join() };
};
