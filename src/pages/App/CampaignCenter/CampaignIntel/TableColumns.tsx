import Tooltip from "antd/lib/tooltip";
import React from "react";
import Highlighter from "react-highlight-words";

import {
  NO_BUDGET,
  NO_BIDDING,
  CTR,
  CVR,
  eCPC,
  eCPM,
  oCVR,
  eCPI,
  ATTRIBUTE_INSTALLS,
  ATTRIBUTE_ECPI,
  ATTRIBUTE_COST,
  ATTRIBUTE_REVENUE,
  LTV,
  ROAS,
  ACTIVITY_ROI,
} from "../../../../constants/tooltip";

import getColumnSearchProps from "../../../../partials/common/Table/CustomSearch";
import EditNumberCell from "../../../../partials/common/Table/EditNumberCell";
import searchMaxMinValue from "../../../../partials/common/Table/SearchMaxMinValue";
import {
  getShadeColor,
  getCountryNameFromCode,
  getTableCellBg,
  getTotalChildrenStr,
  sortByString,
  sortNumberWithNullable,
  getColumnNumber,
} from "../../../../utils/Helpers";
import service from "../../../../partials/services/axios.config";
import {
  COST_DECIMAL,
  ECPC_DECIMAL,
  ECPI_DECIMAL,
  HIGHLIGHT_STYLE,
  LIST_CAMPAIGN_STATUS,
  TABLE_COLUMN_COLOR,
} from "../../../../constants/constants";
import { numberWithCommas } from "../../../../utils/Utils";
import moment from "moment";
import {
  getTableTitleWithTooltip,
  getTitleWith2Lines,
} from "../../../../partials/common/Table/Header";
import classNames from "classnames";
import {
  getCol,
  getMax,
  getPartialNote,
  getRoundedValue,
  isBorderDashed,
} from "./Helper";
import { RUNNING } from "../../../../constants/dropdowns";
import { BiLinkExternal } from "@react-icons/all-files/bi/BiLinkExternal";
import { COL_IDS, PARTIAL_DAY_2 } from "./constants";

export const getTableColumns = (props) => {
  const {
    baseUrl,
    listData = [],
    searchText,
    onSearchText,
    onClickName,
    onEditSpecifyBid,
    onEditCell,
    getRowKey,
    setIsLoading,
    firstColName,
    onUpdateCountry,
    hasFixedCol,
    currenciesConfigs,
    dateRange,
    dateRange2,
    onFilterTable,
  } = props;

  const maxAtrrECPI = Math.max(
    ...listData?.map((el: any) => el.data?.attributeECpi || 0)
  );

  const maxCost = Math.max(...listData?.map((el: any) => el.data?.cost || 0));
  const maxInstall = Math.max(
    ...listData?.map((el: any) => el.data?.install || 0)
  );
  const maxCTR = Math.max(...listData?.map((el: any) => el.data?.ctr || 0));
  const maxCVR = Math.max(...listData?.map((el: any) => el.data?.cvr || 0));
  const maxECPC = Math.max(...listData?.map((el: any) => el.data?.eCpc || 0));
  const maxECPI = Math.max(...listData?.map((el: any) => el.data?.eCpi || 0));
  const maxECPM = Math.max(...listData?.map((el: any) => el.data?.eCpm || 0));
  const maxOCVR = Math.max(...listData?.map((el: any) => el.data?.oCvr || 0));
  const maxSkanCost = Math.max(
    ...listData?.map((el: any) => el.data?.skanCost || 0)
  );
  const maxSkanInstall = Math.max(
    ...listData?.map((el: any) => el.data?.skanInstall || 0)
  );
  const maxSkanECpi = Math.max(
    ...listData?.map((el: any) => el.data?.skanECpi || 0)
  );

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

  const onConfirmUpdateFailure = (dataObj, field) => {
    setIsLoading(true);
    service.put(`/${field}/status/disable`, dataObj).then(
      (res: any) => {
        const isBidFiled = field === "bid";

        setIsLoading(false);
        onUpdateCountry(res.results, isBidFiled);
      },
      () => setIsLoading(false)
    );
  };

  const numberColWidth = 140;

  const getColData = (
    field,
    label: any = "",
    width: any = undefined,
    totalPartialDay = 1,
    sorterTooltip: any = "",
    settingDecimal: any = undefined
  ) => {
    const borderDashed = isBorderDashed(dateRange, field, totalPartialDay);
    return getCol({
      listData,
      field,
      label,
      width,
      borderDashed,
      sorterTooltip,
      onFilterTable,
      settingDecimal,
    });
  };

  const getRevCol = (field, label, width: any = undefined) => {
    return getCol({
      listData,
      field,
      label,
      preff: "$",
      width,
      summaryPreff: "$",
      onFilterTable,
      settingDecimal: COST_DECIMAL,
    });
  };

  const getCohortRev = (field, label = "", width: any = undefined) => {
    const borderDashed = isBorderDashed(dateRange, field);
    const sorterTooltip = borderDashed ? (
      <div>{getPartialNote()}</div>
    ) : undefined;

    return getCol({
      listData,
      field,
      label,
      width,
      borderDashed,
      sorterTooltip,
      onFilterTable,
    });
  };

  const getLTV = (id) => {
    let timeEl = "";
    if (dateRange2?.length === 2) {
      const startTime = moment(dateRange2[0]).format("DD/MM");
      const endTime = moment(dateRange2[1]).format("DD/MM");
      timeEl =
        "- ARPDAU is calculated for the period from " +
        startTime +
        " to " +
        endTime;
    }
    const borderDashed = isBorderDashed(dateRange, id, PARTIAL_DAY_2);

    const tooltipEl = (
      <div>
        {borderDashed && getPartialNote()}
        <div>- {LTV}</div>
        {timeEl && <div>{timeEl}</div>}
      </div>
    );
    return getColData(id, "", undefined, PARTIAL_DAY_2, tooltipEl);
  };

  const getRoas = (id) => {
    const borderDashed = isBorderDashed(dateRange, id, PARTIAL_DAY_2);
    const tooltip = (
      <div>
        {borderDashed && getPartialNote()}
        <div>
          {borderDashed && "- "}
          {ROAS}
        </div>
      </div>
    );
    return getColData(id, "", undefined, PARTIAL_DAY_2, tooltip);
  };

  const activityROICol = {
    title: getTableTitleWithTooltip("Activity ROI"),
    columnId: COL_IDS.activityROI,
    showSorterTooltip: { title: ACTIVITY_ROI },
    width: 140,
    ...searchMaxMinValue({
      getField: (el) => el.data?.activityROI,
      dataIndex: "activityROI",
      placeholderSuffix: " ",
      onFilterTable,
    }),
    render: (record) => getColumnNumber(record.data?.activityROI, "", "%"),
    sorter: (a, b) =>
      sortNumberWithNullable(a, b, (el) => el.data?.activityROI),
    onCell: (record) => {
      return {
        className: "custom-td-bg",
        ["style"]: {
          backgroundColor: getShadeColor(
            record.data?.activityROI,
            getMax(COL_IDS.activityROI, listData),
            TABLE_COLUMN_COLOR[1]
          ),
        },
      };
    },
  };
  const cohortECPI = {
    title: getTitleWith2Lines("Cohort", "eCPI"),
    columnId: COL_IDS.cohortEcpi,
    width: 140,
    summaryPrefix: "$",
    calc: {
      numerator: COL_IDS.cohortCost,
      denominator: COL_IDS.users,
      preffix: "$",
      maxDecimal: ECPI_DECIMAL,
    },
    getSummaryField: (record) => record.data?.cohortEcpi,
    ...searchMaxMinValue({
      preText: "$",
      getField: (r) => r.data?.cohortEcpi,
      dataIndex: "cohortEcpi",
      placeholderSuffix: " ",
      onFilterTable,
    }),
    sorter: (a, b) => sortNumberWithNullable(a, b, (el) => el.data?.cohortEcpi),
    render: (record) => (
      <div className="px-2">
        {getCellNumber(record.data?.cohortEcpi, "", "$")}
      </div>
    ),
    onCell: (record) =>
      getTableCellBg(
        record,
        "",
        getMax(COL_IDS.cohortEcpi, listData),
        (el) => el.data?.cohortEcpi
      ),
  };
  const billableECpiCol = {
    title: getTitleWith2Lines("Billable", "eCPI"),
    columnId: COL_IDS.billableECpi,
    width: 140,
    summaryPrefix: "$",
    calc: {
      numerator: COL_IDS.billableCost,
      denominator: COL_IDS.billableInstall,
      preffix: "$",
      maxDecimal: ECPI_DECIMAL,
    },
    getSummaryField: (record) => record.data?.billableECpi,
    ...searchMaxMinValue({
      preText: "$",
      getField: (r) => r.data?.billableECpi,
      dataIndex: "billableECpi",
      placeholderSuffix: " ",
      onFilterTable,
    }),
    sorter: (a, b) =>
      sortNumberWithNullable(a, b, (el) => el.data?.billableECpi),
    render: (record) => (
      <div className="px-2">
        {getCellNumber(record.data?.billableECpi, "", "$")}
      </div>
    ),
    onCell: (record) =>
      getTableCellBg(
        record,
        "",
        getMax(COL_IDS.billableECpi, listData),
        (el) => el.data?.billableECpi
      ),
  };

  const colums = [
    {
      columnId: COL_IDS.name,
      title: firstColName,
      width: 350,
      minWidth: 140,
      maxWidth: 600,
      fixed: hasFixedCol ? "left" : undefined,
      sorter: sortByString("name"),
      ...getColumnSearchProps({
        dataIndex: "campaign",
        callback: onSearchText,
        customFilter: () => true,
      }),
      render: (record) => {
        const {
          application,
          campaign,
          location,
          adGroup,
          keyword,
          keywordId,
          date,
          siteId,
          name,
          imageUrl,
        } = record;
        const recordLength = record.children?.length;
        const totalChildren = getTotalChildrenStr(record);
        const handleClick = (e) => recordLength && onClickName(record, e);

        if (application?.id) {
          const { networkConnector } = application;
          const { network } = networkConnector;
          if (!network) return;

          const networkCampaignName = application.name + totalChildren;

          return (
            <Tooltip title={networkCampaignName}>
              <div
                className={classNames(
                  "truncate",
                  recordLength && "cursor-pointer"
                )}
                onClick={handleClick}
                onContextMenu={handleClick}
              >
                {networkCampaignName}
              </div>
            </Tooltip>
          );
        }

        if (campaign?.id) {
          const campaignName = campaign.name + totalChildren;

          const isRunning =
            campaign.status === LIST_CAMPAIGN_STATUS.running.value;
          const runningDotEl = <span className="actived-dot" />;
          const detailCampLink = baseUrl + "/campaign-control/" + campaign.id;

          return (
            <Tooltip
              title={
                <div>
                  <div>{campaignName}</div>
                  <div className="inline-block">
                    <a
                      className="flex items-center text-antPrimary"
                      href={detailCampLink}
                      target="_blank"
                    >
                      <span>View detail:</span>
                      <BiLinkExternal className="text-base shrink-0 ml-2" />
                    </a>
                  </div>
                </div>
              }
            >
              <div
                className={classNames(
                  "flex justify-between items-center",
                  recordLength && "cursor-pointer"
                )}
                onClick={handleClick}
                onContextMenu={handleClick}
              >
                <div className="truncate flex-1">
                  <Highlighter
                    highlightStyle={HIGHLIGHT_STYLE}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={campaignName}
                  />
                </div>

                {isRunning && runningDotEl}
              </div>
            </Tooltip>
          );
        }

        if (location) {
          const countryName = getCountryNameFromCode(location);
          return (
            <div
              className={classNames(
                "flex items-center space-x-1 text-sm truncate",
                recordLength && "cursor-pointer"
              )}
              onClick={handleClick}
              onContextMenu={handleClick}
            >
              <span
                className={`fi fi-${location.toLowerCase()} w-5.5 h-3.5 mr-0.5`}
              />
              <span>{countryName}</span>
              <span>({location})</span>
            </div>
          );
        }

        if (adGroup?.id) {
          const adGroupName = adGroup.name + totalChildren;
          const isRunning = adGroup.status === RUNNING;
          const runningDotEl = (
            <span className="bg-lime-400 w-1 h-1 rounded-full ml-1 flex-shrink-0" />
          );

          return (
            <Tooltip title={adGroupName}>
              <div
                className={classNames(
                  "flex justify-between items-center truncate",
                  recordLength && "cursor-pointer"
                )}
                onClick={handleClick}
                onContextMenu={handleClick}
              >
                <div className="truncate">{adGroupName}</div>
                {isRunning && runningDotEl}
              </div>
            </Tooltip>
          );
        }

        if (keywordId) {
          const keywordName = keyword?.text + totalChildren;
          return (
            <Tooltip title={keywordName}>
              <div
                className={classNames(
                  "truncate",
                  recordLength && "cursor-pointer"
                )}
                onClick={handleClick}
                onContextMenu={handleClick}
              >
                {keywordName}
              </div>
            </Tooltip>
          );
        }

        if (date) {
          const dateValue = moment(date)?.format("YYYY-MM-DD (ddd)");
          return (
            <Tooltip title={dateValue}>
              <div
                className={classNames(
                  "truncate",
                  recordLength && "cursor-pointer"
                )}
                onClick={handleClick}
                onContextMenu={handleClick}
              >
                {dateValue}
              </div>
            </Tooltip>
          );
        }

        if (siteId) {
          return (
            <Tooltip title={siteId}>
              <div
                className={classNames(
                  "truncate",
                  recordLength && "cursor-pointer"
                )}
                onClick={handleClick}
                onContextMenu={handleClick}
              >
                {siteId}
              </div>
            </Tooltip>
          );
        }

        const networkName = name + totalChildren;
        return (
          <Tooltip title={networkName}>
            <div
              className="flex items-center truncate cursor-pointer"
              onClick={handleClick}
              onContextMenu={handleClick}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt=" "
                  className="w-6 h-6 rounded-sm mr-1"
                />
              ) : (
                <span className="w-7"></span>
              )}
              <span className="truncate">{networkName}</span>
            </div>
          </Tooltip>
        );
      },
    },
    {
      columnId: COL_IDS.bid,
      title: "Bid",
      width: 150,
      fixed: hasFixedCol ? "left" : undefined,
      isSummaryEmpty: true,
      render: (record) => {
        return (
          <EditNumberCell
            record={record}
            fieldName="bid"
            NATooltip={NO_BIDDING}
            historyField="bidHistory"
            onEditCell={onEditCell}
            getRowKey={getRowKey}
            onConfirmUpdateFailure={onConfirmUpdateFailure}
            onEditSpecifyBid={onEditSpecifyBid}
            currenciesConfigs={currenciesConfigs}
          />
        );
      },
    },
    {
      columnId: COL_IDS.budget,
      title: "Daily Budget",
      width: 150,
      fixed: hasFixedCol ? "left" : undefined,
      isSummaryEmpty: true,
      render: (record) => (
        <EditNumberCell
          record={record}
          fieldName="budget"
          NATooltip={NO_BUDGET}
          historyField="budgetHistory"
          onEditCell={onEditCell}
          getRowKey={getRowKey}
          onConfirmUpdateFailure={onConfirmUpdateFailure}
          currenciesConfigs={currenciesConfigs}
        />
      ),
    },
    {
      title: getTitleWith2Lines("Ad Network", "Cost"),
      columnId: COL_IDS.cost,
      width: 180,
      getSummaryField: (record) => record.data?.cost,
      summaryPrefix: "$",
      decimal: COST_DECIMAL,
      ...searchMaxMinValue({
        preText: "$",
        getField: (r) => r.data?.cost,
        dataIndex: "cost",
        placeholderSuffix: " ",
        onFilterTable,
      }),
      sorter: (a, b) => sortNumberWithNullable(a, b, (el) => el.data?.cost),
      render: (record) => (
        <div className="px-2">{getCellNumber(record.data?.cost, "", "$")}</div>
      ),
      onCell: (record) =>
        getTableCellBg(record, "cost", maxCost, (el) => el.data?.cost),
    },
    {
      title: getTitleWith2Lines("MMP", "Cost"),
      columnId: COL_IDS.attributeCost,
      width: 180,
      showSorterTooltip: { title: ATTRIBUTE_COST },
      getSummaryField: (record) => record.data?.attributeCost,
      summaryPrefix: "$",
      decimal: COST_DECIMAL,
      ...searchMaxMinValue({
        preText: "$",
        getField: (r) => r.data?.attributeCost,
        dataIndex: "attributeCost",
        placeholderSuffix: " ",
        onFilterTable,
      }),
      sorter: (a, b) =>
        sortNumberWithNullable(a, b, (el) => el.data?.attributeCost),
      render: (record) => (
        <div className="px-2">
          {getCellNumber(record.data?.attributeCost, "", "$")}
        </div>
      ),
      onCell: (record) =>
        getTableCellBg(
          record,
          "",
          getMax(COL_IDS.attributeCost, listData),
          (el) => el.data?.attributeCost
        ),
    },
    {
      title: getTitleWith2Lines("SKAN", "Cost"),
      columnId: COL_IDS.skanCost,
      width: 160,
      getSummaryField: (record) => record.data?.skanCost,
      summaryPrefix: "$",
      decimal: COST_DECIMAL,
      ...searchMaxMinValue({
        preText: "$",
        getField: (r) => r.data?.skanCost,
        dataIndex: "skanCost",
        placeholderSuffix: " ",
        onFilterTable,
      }),
      sorter: (a, b) => sortNumberWithNullable(a, b, (el) => el.data?.skanCost),
      render: (record) => (
        <div className="px-2">
          {getCellNumber(record.data?.skanCost, "", "$")}
        </div>
      ),
      onCell: (record) =>
        getTableCellBg(record, "", maxSkanCost, (el) => el.data?.skanCost),
    },
    {
      title: getTitleWith2Lines("Ad Network", "Installs"),
      columnId: COL_IDS.install,
      width: 180,
      getSummaryField: (record) => record.data?.install,
      ...searchMaxMinValue({
        getField: (r) => r.data?.install,
        dataIndex: "install",
        placeholderSuffix: " ",
        onFilterTable,
      }),
      sorter: (a, b) => sortNumberWithNullable(a, b, (el) => el.data?.install),
      render: (record) => (
        <div className="flex items-center justify-between px-2">
          <div className="truncate">
            {getCellNumber(record.data?.install, "")}
          </div>
        </div>
      ),
      onCell: (record) =>
        getTableCellBg(record, "install", maxInstall, (el) => el.data?.install),
    },
    getColData(COL_IDS.attributeInstall, getTitleWith2Lines("MMP", "Installs")),
    {
      title: getTitleWith2Lines("SKAN", "Installs"),
      columnId: COL_IDS.skanInstall,
      width: 160,
      getSummaryField: (record) => record.data?.skanInstall,
      ...searchMaxMinValue({
        getField: (r) => r.data?.skanInstall,
        dataIndex: "skanInstall",
        placeholderSuffix: " ",
        onFilterTable,
      }),
      sorter: (a, b) =>
        sortNumberWithNullable(a, b, (el) => el.data?.skanInstall),
      render: (record) => (
        <div className="px-2">
          {getCellNumber(record.data?.skanInstall, "")}
        </div>
      ),
      onCell: (record) =>
        getTableCellBg(
          record,
          "",
          maxSkanInstall,
          (el) => el.data?.skanInstall
        ),
    },
    {
      columnId: COL_IDS.ecpi,
      title: getTitleWith2Lines("Ad Network", "eCPI", true),
      // Effective cost per installs = Cost / Installs
      calc: {
        numerator: COL_IDS.cost,
        denominator: COL_IDS.install,
        preffix: "$",
        maxDecimal: ECPI_DECIMAL,
      },
      width: numberColWidth,
      showSorterTooltip: { title: eCPI },
      ...searchMaxMinValue({
        preText: "$",
        getField: (r) => r.data?.eCpi,
        dataIndex: "eCpi",
        placeholderSuffix: " ",
        onFilterTable,
      }),
      sorter: (a, b) => sortNumberWithNullable(a, b, (el) => el.data?.eCpi),
      getSummaryField: (record) => record.data?.eCpi,
      render: (record) => {
        const recordValue = getRoundedValue(
          record,
          record.data?.eCpi,
          ECPI_DECIMAL
        );
        return getCellNumber(recordValue, "", "$");
      },
      onCell: (record) => {
        return {
          className: "custom-td-bg",
          ["style"]: {
            backgroundColor: getShadeColor(
              record.data?.eCpi,
              maxECPI,
              TABLE_COLUMN_COLOR[1]
            ),
          },
        };
      },
    },
    {
      columnId: COL_IDS.attributeECpi,
      title: getTitleWith2Lines("MMP", "eCPI"),
      calc: {
        numerator: COL_IDS.attributeCost,
        denominator: COL_IDS.attributeInstall,
        preffix: "$",
        maxDecimal: ECPI_DECIMAL,
      },
      width: numberColWidth,
      showSorterTooltip: { title: ATTRIBUTE_ECPI },
      ...searchMaxMinValue({
        preText: "$",
        getField: (r) => r.data?.attributeECpi,
        dataIndex: "attributeECpi",
        placeholderSuffix: " ",
        onFilterTable,
      }),
      sorter: (a, b) =>
        sortNumberWithNullable(a, b, (el) => el.data?.attributeECpi),
      getSummaryField: (record) => record.data?.attributeECpi,
      render: (record) => {
        const recordValue = getRoundedValue(
          record,
          record.data?.attributeECpi,
          ECPI_DECIMAL
        );
        return getCellNumber(recordValue, "", "$");
      },
      onCell: (record) => {
        return {
          className: "custom-td-bg",
          ["style"]: {
            backgroundColor: getShadeColor(
              record.data?.attributeECpi,
              maxAtrrECPI,
              TABLE_COLUMN_COLOR[1]
            ),
          },
        };
      },
    },
    {
      columnId: COL_IDS.skanECPI,
      title: getTitleWith2Lines("SKAN", "eCPI"),
      calc: {
        numerator: COL_IDS.skanCost,
        denominator: COL_IDS.skanInstall,
        preffix: "$",
        maxDecimal: ECPI_DECIMAL,
      },
      width: numberColWidth,
      ...searchMaxMinValue({
        preText: "$",
        getField: (r) => r.data?.skanECpi,
        dataIndex: "skanECpi",
        placeholderSuffix: " ",
        onFilterTable,
      }),
      sorter: (a, b) => sortNumberWithNullable(a, b, (el) => el.data?.skanECpi),
      getSummaryField: (record) => record.data?.skanECpi,
      render: (record) => {
        const recordValue = getRoundedValue(
          record,
          record.data?.skanECpi,
          ECPI_DECIMAL
        );
        return getCellNumber(recordValue, "", "$");
      },
      onCell: (record) => {
        return {
          className: "custom-td-bg",
          ["style"]: {
            backgroundColor: getShadeColor(
              record.data?.skanECpi,
              maxSkanECpi,
              TABLE_COLUMN_COLOR[1]
            ),
          },
        };
      },
    },
    getLTV(COL_IDS.ltvD1),
    getLTV(COL_IDS.ltvD3),
    getLTV(COL_IDS.ltvD7),
    getLTV(COL_IDS.ltvD14),
    getLTV(COL_IDS.ltvD30),
    getColData(COL_IDS.cohortCost),
    cohortECPI,
    getColData(COL_IDS.users, getTitleWith2Lines("Cohort", "Installs")),
    getRoas(COL_IDS.cohortROASD0),
    getRoas(COL_IDS.cohortROASD1),
    getRoas(COL_IDS.cohortROASD3),
    getRoas(COL_IDS.cohortROASD7),
    getRoas(COL_IDS.cohortROASD14),
    getRoas(COL_IDS.cohortROASD30),
    getRoas(COL_IDS.cohortROASD60),
    getRoas(COL_IDS.cohortROASD90),
    getRoas(COL_IDS.cohortROASD180),
    // activityROICol,
    getColData(COL_IDS.impression, "Impressions", 180),
    getColData(COL_IDS.click, "Clicks", 180),
    getColData(
      COL_IDS.attributeSession,
      getTitleWith2Lines("MMP", "Session"),
      180
    ),
    getRevCol(
      COL_IDS.attributeRevenue,
      getTitleWith2Lines("MMP", "LTV Revenue")
    ),
    getRevCol(
      COL_IDS.attributeRevenueAdEvent,
      getTitleWith2Lines("MMP", "Activity Revenue (af_ad_revenue)"),
      180
    ),
    getRevCol(
      COL_IDS.attributeRevenuePurchaseEvent,
      getTitleWith2Lines("MMP", "Activity Revenue (af_purchase)"),
      180
    ),
    {
      columnId: COL_IDS.ctr,
      title: getTableTitleWithTooltip("CTR"),
      // Click-through rate = Clicks / Impressions
      // Tỉ lệ chuyển đổi từ hiển thị thành Click
      calc: {
        numerator: COL_IDS.click,
        denominator: COL_IDS.impression,
        per: 100,
        suffixStr: "%",
      },
      width: numberColWidth,
      showSorterTooltip: { title: CTR },
      ...searchMaxMinValue({
        getField: (r) => r.data?.ctr,
        dataIndex: "ctr",
        placeholderSuffix: " ",
        onFilterTable,
      }),
      sorter: (a, b) => sortNumberWithNullable(a, b, (el) => el.data?.ctr),
      getSummaryField: (record) => record.data?.ctr,
      render: (record) => getCellNumber(record.data?.ctr),
      onCell: (record) => {
        return {
          className: "custom-td-bg",
          ["style"]: {
            backgroundColor: getShadeColor(record.data?.ctr, maxCTR),
          },
        };
      },
    },
    {
      columnId: COL_IDS.cvr,
      title: getTableTitleWithTooltip("CVR"),
      // Conversion rate (clicks to installs) = Installs / Clicks
      // tỉ lệ chuyển đổi từ click thành Install
      calc: {
        numerator: COL_IDS.install,
        denominator: COL_IDS.click,
        per: 100,
        suffixStr: "%",
      },
      width: numberColWidth,
      showSorterTooltip: { title: CVR },
      ...searchMaxMinValue({
        getField: (r) => r.data?.cvr,
        dataIndex: "cvr",
        placeholderSuffix: " ",
        onFilterTable,
      }),
      sorter: (a, b) => sortNumberWithNullable(a, b, (el) => el.data?.cvr),
      getSummaryField: (record) => record.data?.cvr,
      render: (record) => getCellNumber(record.data?.cvr),
      onCell: (record) => {
        return {
          className: "custom-td-bg",
          ["style"]: {
            backgroundColor: getShadeColor(record.data?.cvr, maxCVR),
          },
        };
      },
    },
    {
      columnId: COL_IDS.ecpc,
      title: getTableTitleWithTooltip("eCPC"),
      // Effective cost per click = Cost / Clicks
      // Chị phí trên mỗi lượt click
      calc: {
        numerator: COL_IDS.cost,
        denominator: COL_IDS.click,
        preffix: "$",
        maxDecimal: ECPC_DECIMAL,
      },
      width: numberColWidth,
      showSorterTooltip: { title: eCPC },
      ...searchMaxMinValue({
        preText: "$",
        getField: (r) => r.data?.eCpc,
        dataIndex: "eCpc",
        placeholderSuffix: " ",
        onFilterTable,
      }),
      sorter: (a, b) => sortNumberWithNullable(a, b, (el) => el.data?.eCpc),
      getSummaryField: (record) => record.data?.eCpc,
      render: (record) => getCellNumber(record.data?.eCpc, "", "$"),
      onCell: (record) => {
        return {
          className: "custom-td-bg",
          ["style"]: {
            backgroundColor: getShadeColor(
              record.data?.eCpc,
              maxECPC,
              TABLE_COLUMN_COLOR[1]
            ),
          },
        };
      },
    },
    {
      columnId: COL_IDS.ecpm,
      title: getTableTitleWithTooltip("eCPM"),
      // Effective cost per mile (thousand impressions) = Cost / 1000 Impressions
      // Cost trên 1000 lượt hiển thị
      calc: {
        numerator: COL_IDS.cost,
        denominator: COL_IDS.impression,
        preffix: "$",
        per: 1000,
      },
      width: numberColWidth,
      showSorterTooltip: { title: eCPM },
      ...searchMaxMinValue({
        preText: "$",
        getField: (r) => r.data?.eCpm,
        dataIndex: "eCpm",
        placeholderSuffix: " ",
        onFilterTable,
      }),
      sorter: (a, b) => sortNumberWithNullable(a, b, (el) => el.data?.eCpm),
      getSummaryField: (record) => record.data?.eCpm,
      render: (record) => getCellNumber(record.data?.eCpm, "", "$"),
      onCell: (record) => {
        return {
          className: "custom-td-bg",
          ["style"]: {
            backgroundColor: getShadeColor(
              record.data?.eCpm,
              maxECPM,
              TABLE_COLUMN_COLOR[1]
            ),
          },
        };
      },
    },
    {
      columnId: COL_IDS.ocvr,
      title: getTableTitleWithTooltip("oCVR"),
      // CTR x CVR (installs per mile) = Installs / 1000 Impressions
      // số lượt install trên 1000 lượt hiển thị
      calc: {
        numerator: COL_IDS.install,
        denominator: COL_IDS.impression,
        per: 1000,
      },
      width: numberColWidth,
      showSorterTooltip: { title: oCVR },
      ...searchMaxMinValue({
        getField: (r) => r.data?.oCvr,
        dataIndex: "oCvr",
        placeholderSuffix: " ",
        onFilterTable,
      }),
      sorter: (a, b) => sortNumberWithNullable(a, b, (el) => el.data?.oCvr),
      getSummaryField: (record) => record.data?.oCvr,
      render: (record) => getCellNumber(record.data?.oCvr, ""),
      onCell: (record) => {
        return {
          className: "custom-td-bg",
          ["style"]: {
            backgroundColor: getShadeColor(
              record.data?.oCvr,
              maxOCVR,
              TABLE_COLUMN_COLOR[2]
            ),
          },
        };
      },
    },
    getCohortRev(COL_IDS.cohortRevenueD0),
    getCohortRev(COL_IDS.cohortRevenueD1),
    getCohortRev(COL_IDS.cohortRevenueD3),
    getCohortRev(COL_IDS.cohortRevenueD7),
    getCohortRev(COL_IDS.cohortRevenueD14),
    getCohortRev(COL_IDS.cohortRevenueD30),
    getCohortRev(COL_IDS.cohortRevenueD60),
    getCohortRev(COL_IDS.cohortRevenueD90),
    getCohortRev(COL_IDS.cohortRevenueD180, undefined, 170),
    getColData(
      COL_IDS.billableCost,
      getTitleWith2Lines("Billable", "Cost"),
      undefined,
      1,
      "",
      COST_DECIMAL
    ),
    getColData(
      COL_IDS.billableInstall,
      getTitleWith2Lines("Billable", "Installs")
    ),
    billableECpiCol,
  ];

  return colums;
};
