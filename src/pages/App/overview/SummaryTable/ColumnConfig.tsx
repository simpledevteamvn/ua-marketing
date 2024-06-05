import React from "react";
import {
  getColumnNumber,
  getCountryNameFromCode,
  getShadeColor,
  getTableCellBg,
  getTotalChildrenStr,
  roundNumber,
  sortNumberWithNullable,
} from "../../../../utils/Helpers";
import Tooltip from "antd/lib/tooltip";
import {
  ARPDAU_DECIMAL,
  ECPI_DECIMAL,
  HIGHLIGHT_STYLE,
  TABLE_COLUMN_COLOR,
} from "../../../../constants/constants";
import {
  ACTIVITY_ROI,
  CVR,
  LTV,
  RETENTION,
  ROAS,
  SIGMA_RETENTION,
  eCPI,
} from "../../../../constants/tooltip";
import {
  getTableTitleWithTooltip,
  getTitleWith2Lines,
} from "../../../../partials/common/Table/Header";
import searchMaxMinValue from "../../../../partials/common/Table/SearchMaxMinValue";
import classNames from "classnames";
import getColumnSearchProps from "../../../../partials/common/Table/CustomSearch";
import Highlighter from "react-highlight-words";
import {
  COL_IDS,
  PARTIAL_DAY_2,
} from "../../CampaignCenter/CampaignIntel/constants";
import {
  getCol,
  getMax,
  getPartialNote,
  getSummaryByField,
  isBorderDashed,
} from "../../CampaignCenter/CampaignIntel/Helper";
import moment from "moment";

const GEO_FILTER = "geo";

export default function getTableColumns(props) {
  const {
    tableData = [],
    storedFilter,
    filter,
    subFilter,
    onClickName,
    searchText,
    onSearchText,
    isSkanPage,
    dateRange,
    dateRange2,
    isMobile,
    onFilterTable,
  } = props;

  const getColData = (
    field,
    label: any = "",
    width: any = 140,
    sorterTooltip = "",
    settingDecimal: number | undefined = undefined,
    hiddenSummary = false
  ) => {
    return getCol({
      listData: tableData,
      field,
      label,
      width,
      sorterTooltip,
      settingDecimal,
      hiddenSummary,
      onFilterTable,
    });
  };

  // Column with partial day handler (border dashed)
  const getCol2 = (
    field,
    totalPartialDay = 1,
    label: any = "",
    width: any = 140,
    sorterTooltip: any = ""
  ) => {
    const borderDashed = isBorderDashed(dateRange, field, totalPartialDay);
    return getCol({
      listData: tableData,
      field,
      label,
      width,
      borderDashed,
      filter,
      subFilter,
      totalPartialDay,
      sorterTooltip,
      onFilterTable,
    });
  };

  const getRevCol = (field, label, width = 140) => {
    return getCol({
      listData: tableData,
      field,
      label,
      width,
      preff: "$",
      summaryPreff: "$",
      onFilterTable,
    });
  };

  const getARPDAUCol = () => {
    const totalRev = getSummaryByField(tableData, COL_IDS.rev);
    const totalDAU = getSummaryByField(tableData, COL_IDS.dau);
    const sumValue = totalDAU
      ? roundNumber(totalRev / totalDAU, true, ARPDAU_DECIMAL)
      : 0;

    return getCol({
      listData: tableData,
      field: COL_IDS.arpdau,
      label: getArpdauTitle(dateRange),
      width: 140,
      sumValue,
      onFilterTable,
    });
  };

  const getLatestARPDAUCol = () => {
    const totalRev = getSummaryByField(tableData, COL_IDS.lastestRev);
    const totalDAU = getSummaryByField(tableData, COL_IDS.lastestDau);
    const sumValue = totalDAU
      ? roundNumber(totalRev / totalDAU, true, ARPDAU_DECIMAL)
      : 0;

    return getCol({
      listData: tableData,
      field: COL_IDS.latestArpdau,
      label: getArpdauTitle2(),
      width: 160,
      sumValue,
      onFilterTable,
    });
  };

  const getRetention = (id) => {
    const borderDashed = isBorderDashed(dateRange, id);
    const tooltip = (
      <div>
        {borderDashed && getPartialNote()}
        <div>
          {borderDashed && "- "}
          {RETENTION}
        </div>
      </div>
    );
    return getCol2(id, 1, "", undefined, tooltip);
  };

  const getSigmaRetention = (id) => {
    const borderDashed = isBorderDashed(dateRange, id);
    const tooltip = (
      <div>
        {borderDashed && getPartialNote()}
        <div>
          {borderDashed && "- "}
          {SIGMA_RETENTION}
        </div>
      </div>
    );
    return getCol2(id, 1, "", undefined, tooltip);
  };

  const getLTV = (id) => {
    const borderDashed = isBorderDashed(dateRange, id, PARTIAL_DAY_2);
    const tooltip = (
      <div>
        {borderDashed && getPartialNote()}
        <div>- {LTV}</div>
        <div>- ARPDAU is calculated in chosen time range</div>
      </div>
    );
    return getCol2(id, PARTIAL_DAY_2, "", undefined, tooltip);
  };

  const getRoas = (id, width: any = undefined) => {
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
    return getCol2(id, PARTIAL_DAY_2, "", width, tooltip);
  };

  const maxCost = Math.max(...tableData?.map((el: any) => el.data?.cost || 0));
  const maxSkanCost = Math.max(
    ...tableData?.map((el: any) => el.data?.skanCost || 0)
  );
  const maxECPI = Math.max(...tableData?.map((el: any) => el.data?.eCpi || 0));
  const maxConversionRate = Math.max(
    ...tableData?.map((el: any) => el.data?.conversionRate || 0)
  );

  const maxNullConversionRate = Math.max(
    ...tableData?.map((el: any) => el.data?.nullConversionRate || 0)
  );
  const maxClickToInstallRate = Math.max(
    ...tableData?.map((el: any) => el.data?.clickToInstallRate || 0)
  );
  const maxTotalRevenueModel = Math.max(
    ...tableData?.map((el: any) => el.data?.totalRevenueModel || 0)
  );

  const nameCol = {
    columnId: "name",
    title: "Name",
    width: 260,
    fixed: !isMobile ? "left" : undefined,
    render: (record) => {
      let name = record.name || record.id;
      let flagEl;
      if (
        (filter === GEO_FILTER &&
          (record.isEmptyChildren || record.children?.length)) ||
        (subFilter === GEO_FILTER &&
          !record.isEmptyChildren &&
          !record.children?.length)
      ) {
        if (!record.id) return;
        name = getCountryNameFromCode(record.id) + " (" + record.id + ")";
        flagEl = (
          <span className={`fi fi-${record.id?.toLowerCase()} w-5 h-3 mr-1`} />
        );
      }

      const totalChildren = getTotalChildrenStr(record);
      const recordLength = record.children?.length;
      const recordName = name + totalChildren;

      return (
        <Tooltip title={recordName}>
          <div
            className={classNames("truncate", recordLength && "cursor-pointer")}
            onClick={() => recordLength && onClickName(record)}
          >
            {flagEl}

            <Highlighter
              highlightStyle={HIGHLIGHT_STYLE}
              searchWords={[searchText]}
              autoEscape
              textToHighlight={recordName}
            />
          </div>
        </Tooltip>
      );
    },
    ...getColumnSearchProps({
      dataIndex: "name",
      getField: (record) => record.name || record.id,
      callback: onSearchText,
    }),
    sorter: (a, b) => {
      const activedFilter = storedFilter?.find((el) => el.key === filter);

      if (activedFilter?.isNumberType) {
        const regexNumber = /^\d+$/;
        let aData = a.name || a.id;
        let bData = b.name || b.id;
        aData = regexNumber.test(aData) ? aData : -1;
        bData = regexNumber.test(bData) ? bData : -1;
        return aData - bData;
      }
      if (a.name || b.name) {
        return ("" + a.name).localeCompare(b.name);
      } else return ("" + a.id).localeCompare(b.id);
    },
  };
  const costCol = {
    title: "Cost",
    width: 110,
    columnId: COL_IDS.cost,
    getSummaryField: (record) => record.data?.cost,
    summaryPrefix: "$",
    ...searchMaxMinValue({
      preText: "$",
      getField: (el) => el.data?.cost,
      dataIndex: "cost",
      placeholderSuffix: " ",
      onFilterTable,
    }),
    sorter: (a, b) => sortNumberWithNullable(a, b, (el) => el.data?.cost),
    render: (record) => (
      <div className="table-cell-padding">
        {getColumnNumber(record.data?.cost, "$")}
      </div>
    ),
    onCell: (record) =>
      getTableCellBg(record, "cost", maxCost, (el) => el.data?.cost),
  };
  const skanCostCol = {
    columnId: COL_IDS.skanCost,
    title: getTitleWith2Lines("SKAN", "Cost"),
    width: 110,
    getSummaryField: (record) => record.data?.skanCost,
    summaryPrefix: "$",
    ...searchMaxMinValue({
      preText: "$",
      getField: (el) => el.data?.skanCost,
      dataIndex: "skanCost",
      placeholderSuffix: " ",
      onFilterTable,
    }),
    sorter: (a, b) => sortNumberWithNullable(a, b, (el) => el.data?.skanCost),
    render: (record) => (
      <div className="table-cell-padding">
        {getColumnNumber(record.data?.skanCost, "$")}
      </div>
    ),
    onCell: (record) =>
      getTableCellBg(record, "", maxSkanCost, (el) => el.data?.skanCost),
  };

  const eCPICol = {
    // Effective cost per installs = Cost / Installs
    title: getTableTitleWithTooltip("eCPI"),
    columnId: COL_IDS.ecpi,
    showSorterTooltip: { title: eCPI },
    width: 110,
    calc: {
      numerator: COL_IDS.cost,
      denominator: COL_IDS.nonOrganicInstall,
      preffix: "$",
      maxDecimal: ECPI_DECIMAL,
    },
    ...searchMaxMinValue({
      preText: "$",
      getField: (el) => el.data?.eCpi,
      dataIndex: "eCpi",
      placeholderSuffix: " ",
      onFilterTable,
    }),
    render: (record) => getColumnNumber(record.data?.eCpi, "$"),
    sorter: (a, b) => sortNumberWithNullable(a, b, (el) => el.data?.eCpi),
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
  };
  const attrECPICol = {
    title: getTitleWith2Lines("MMP", "eCPI", true),
    columnId: COL_IDS.attributeECpi,
    showSorterTooltip: { title: eCPI },
    width: 110,
    calc: {
      numerator: COL_IDS.attributeCost,
      denominator: COL_IDS.attributeInstall,
      preffix: "$",
      maxDecimal: ECPI_DECIMAL,
    },
    ...searchMaxMinValue({
      preText: "$",
      getField: (el) => el.data?.attributeECpi,
      dataIndex: "attributeECpi",
      placeholderSuffix: " ",
      onFilterTable,
    }),
    render: (record) => getColumnNumber(record.data?.attributeECpi, "$"),
    sorter: (a, b) =>
      sortNumberWithNullable(a, b, (el) => el.data?.attributeECpi),
    onCell: (record) => {
      return {
        className: "custom-td-bg",
        ["style"]: {
          backgroundColor: getShadeColor(
            record.data?.attributeECpi,
            getMax(COL_IDS.attributeECpi, tableData),
            TABLE_COLUMN_COLOR[1]
          ),
        },
      };
    },
  };
  const cvrCol = {
    // Conversion rate (clicks to installs) = Installs / Clicks
    // tỉ lệ chuyển đổi từ click thành Install
    title: getTableTitleWithTooltip("CVR"),
    columnId: COL_IDS.cvr,
    showSorterTooltip: { title: CVR },
    width: 110,
    calc: {
      numerator: COL_IDS.nonOrganicInstall,
      denominator: COL_IDS.click,
      per: 100,
      suffixStr: "%",
    },
    ...searchMaxMinValue({
      getField: (el) => el.data?.conversionRate,
      dataIndex: "conversionRate",
      placeholderSuffix: " ",
      onFilterTable,
    }),
    render: (record) => getColumnNumber(record.data?.conversionRate, "", "%"),
    sorter: (a, b) =>
      sortNumberWithNullable(a, b, (el) => el.data?.conversionRate),
    onCell: (record) => {
      return {
        className: "custom-td-bg",
        ["style"]: {
          backgroundColor: getShadeColor(
            record.data?.conversionRate,
            maxConversionRate
          ),
        },
      };
    },
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
            getMax(COL_IDS.activityROI, tableData),
            TABLE_COLUMN_COLOR[1]
          ),
        },
      };
    },
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
    render: (record) => getColumnNumber(record.data?.billableECpi, "$"),
    onCell: (record) => {
      return {
        className: "custom-td-bg",
        ["style"]: {
          backgroundColor: getShadeColor(
            record.data?.billableECpi,
            getMax(COL_IDS.billableECpi, tableData),
            TABLE_COLUMN_COLOR[1]
          ),
        },
      };
    },
  };

  const getArpdauTitle = (range) => {
    const startTime = moment(range[0]).format("DD/MM");
    const endTime = moment(range[1]).format("DD/MM");
    const time = "(" + startTime + " - " + endTime + ")";

    return (
      <div>
        <div>ARPDAU</div>
        <div className="font-normal">{time}</div>
      </div>
    );
  };

  const getArpdauTitle2 = () => {
    return (
      <div>
        <div>ARPDAU</div>
        <div className="font-normal">(Chosen time range)</div>
      </div>
    );
  };

  const getRevenueTooltip = () => {
    const startTime = moment(dateRange[0]).format("DD/MM");
    const endTime = moment(dateRange[1]).format("DD/MM");
    return "Activity Revenue from " + startTime + " to " + endTime;
  };

  const getDAUTooltip = () => {
    const startTime = moment(dateRange[0]).format("DD/MM");
    const endTime = moment(dateRange[1]).format("DD/MM");

    return "Total Daily Active Users from " + startTime + " to " + endTime;
  };

  return [
    nameCol,
    costCol,
    getColData(COL_IDS.nonOrganicInstall, "Non-Organic Installs", 160),
    eCPICol,
    getColData(COL_IDS.impression, "Impressions", 110),
    getColData(COL_IDS.click, "Clicks", 110),
    cvrCol,
    // Skan page
    getColData(COL_IDS.install, "Installs", 110),
    getColData(COL_IDS.clickThroughInstall, "Click-through installs", 160),
    getColData(COL_IDS.viewThoughInstall, "View-through installs", 160),
    {
      width: 160,
      title: "Null conversion value rate",
      columnId: COL_IDS.nullConversionRate,
      calc: {
        numerator: (el) =>
          el.data?.nullConversionRate * el.data?.nonOrganicInstall,
        denominator: (el) => el.data?.nonOrganicInstall,
        suffixStr: "%",
      },
      ...searchMaxMinValue({
        getField: (el) => el.data?.nullConversionRate,
        dataIndex: "nullConversionRate",
        placeholderSuffix: " ",
        onFilterTable,
      }),
      sorter: (a, b) =>
        sortNumberWithNullable(a, b, (el) => el.data?.nullConversionRate),
      render: (record) => (
        <div className="table-cell-padding">
          {getColumnNumber(record.data?.nullConversionRate, "", "%")}
        </div>
      ),
      onCell: (record) =>
        getTableCellBg(
          record,
          "",
          maxNullConversionRate,
          (el) => el.data?.nullConversionRate
        ),
    },
    {
      width: 160,
      title: "Click-to-install rate",
      columnId: COL_IDS.clickToInstallRate,
      ...searchMaxMinValue({
        getField: (el) => el.data?.clickToInstallRate,
        dataIndex: "clickToInstallRate",
        placeholderSuffix: " ",
        onFilterTable,
      }),
      calc: {
        numerator: (el) => el.data?.click * el.data?.clickToInstallRate,
        denominator: COL_IDS.click,
        suffixStr: "%",
      },
      sorter: (a, b) =>
        sortNumberWithNullable(a, b, (el) => el.data?.clickToInstallRate),
      render: (record) => (
        <div className="table-cell-padding">
          {getColumnNumber(record.data?.clickToInstallRate, "", "%")}
        </div>
      ),
      onCell: (record) =>
        getTableCellBg(
          record,
          "",
          maxClickToInstallRate,
          (el) => el.data?.clickToInstallRate
        ),
    },
    {
      width: 160,
      title: "Total revenue (modeled)",
      columnId: COL_IDS.totalRevenueModel,
      calc: {
        numerator: (el) =>
          el.data?.totalRevenueModel * (1 + el.data?.nullConversionRate * 0.01),
        denominator: () => 1,
        preffix: "$",
      },
      ...searchMaxMinValue({
        getField: (el) => el.data?.totalRevenueModel,
        dataIndex: "clickToInstallRate",
        placeholderSuffix: " ",
        onFilterTable,
      }),
      sorter: (a, b) =>
        sortNumberWithNullable(a, b, (el) => el.data?.totalRevenueModel),
      render: (record) => (
        <div className="table-cell-padding">
          {getColumnNumber(record.data?.totalRevenueModel, "$")}
        </div>
      ),
      onCell: (record) =>
        getTableCellBg(
          record,
          "",
          maxTotalRevenueModel,
          (el) => el.data?.totalRevenueModel
        ),
    },
    getColData(COL_IDS.totalRevenue, "Total revenue", 140),
    // Skan data
    skanCostCol,
    getColData(
      COL_IDS.skanInstall,
      getTitleWith2Lines("SKAN", "Installs"),
      120
    ),
    getColData(
      COL_IDS.skanNonOrganicInstall,
      getTitleWith2Lines("SKAN", "Non-Organic Installs"),
      160
    ),
    getColData(
      COL_IDS.skanOrganicInstall,
      getTitleWith2Lines("SKAN", "Organic Installs"),
      150
    ),
    // Attribute (MMP)
    getColData(COL_IDS.attributeSession, getTitleWith2Lines("MMP", "Session")),
    getColData(COL_IDS.attributeClick, getTitleWith2Lines("MMP", "Clicks")),
    getColData(COL_IDS.attributeCost, getTitleWith2Lines("MMP", "Cost")),
    attrECPICol,
    getColData(
      COL_IDS.attributeImpression,
      getTitleWith2Lines("MMP", "Impressions")
    ),
    getColData(COL_IDS.attributeInstall, getTitleWith2Lines("MMP", "Installs")),
    getRevCol(
      COL_IDS.attributeRevenue,
      getTitleWith2Lines("MMP", "LTV Revenue")
    ),
    getRevCol(
      COL_IDS.attributeRevenueAdEvent,
      getTitleWith2Lines("MMP", "Activity Revenue (af_ad_revenue)"),
      160
    ),
    getRevCol(
      COL_IDS.attributeRevenuePurchaseEvent,
      getTitleWith2Lines("MMP", "Activity Revenue (af_purchase)"),
      160
    ),

    // LTV + retention
    getARPDAUCol(),
    getLatestARPDAUCol(),
    getColData(
      COL_IDS.dau,
      getTableTitleWithTooltip("DAU"),
      undefined,
      getDAUTooltip()
    ),
    getColData(
      COL_IDS.rev,
      getTableTitleWithTooltip("Revenue"),
      undefined,
      getRevenueTooltip()
    ),
    getLTV(COL_IDS.ltvD1),
    getLTV(COL_IDS.ltvD3),
    getLTV(COL_IDS.ltvD7),
    getLTV(COL_IDS.ltvD14),
    getLTV(COL_IDS.ltvD30),

    getColData(COL_IDS.users, "Users"),
    getRetention(COL_IDS.retentionD1),
    getRetention(COL_IDS.retentionD2),
    getRetention(COL_IDS.retentionD3),
    getRetention(COL_IDS.retentionD4),
    getRetention(COL_IDS.retentionD5),
    getRetention(COL_IDS.retentionD6),
    getRetention(COL_IDS.retentionD7),
    getRetention(COL_IDS.retentionD8),
    getRetention(COL_IDS.retentionD9),
    getRetention(COL_IDS.retentionD10),
    getRetention(COL_IDS.retentionD11),
    getRetention(COL_IDS.retentionD12),
    getRetention(COL_IDS.retentionD13),
    getRetention(COL_IDS.retentionD14),
    getRetention(COL_IDS.retentionD15),
    getRetention(COL_IDS.retentionD16),
    getRetention(COL_IDS.retentionD17),
    getRetention(COL_IDS.retentionD18),
    getRetention(COL_IDS.retentionD19),
    getRetention(COL_IDS.retentionD20),
    getRetention(COL_IDS.retentionD21),
    getRetention(COL_IDS.retentionD22),
    getRetention(COL_IDS.retentionD23),
    getRetention(COL_IDS.retentionD24),
    getRetention(COL_IDS.retentionD25),
    getRetention(COL_IDS.retentionD26),
    getRetention(COL_IDS.retentionD27),
    getRetention(COL_IDS.retentionD28),
    getRetention(COL_IDS.retentionD29),
    getRetention(COL_IDS.retentionD30),

    getSigmaRetention(COL_IDS.retentionZD1),
    getSigmaRetention(COL_IDS.retentionZD2),
    getSigmaRetention(COL_IDS.retentionZD3),
    getSigmaRetention(COL_IDS.retentionZD4),
    getSigmaRetention(COL_IDS.retentionZD5),
    getSigmaRetention(COL_IDS.retentionZD6),
    getSigmaRetention(COL_IDS.retentionZD7),
    getSigmaRetention(COL_IDS.retentionZD8),
    getSigmaRetention(COL_IDS.retentionZD9),
    getSigmaRetention(COL_IDS.retentionZD10),
    getSigmaRetention(COL_IDS.retentionZD11),
    getSigmaRetention(COL_IDS.retentionZD12),
    getSigmaRetention(COL_IDS.retentionZD13),
    getSigmaRetention(COL_IDS.retentionZD14),
    getSigmaRetention(COL_IDS.retentionZD15),
    getSigmaRetention(COL_IDS.retentionZD16),
    getSigmaRetention(COL_IDS.retentionZD17),
    getSigmaRetention(COL_IDS.retentionZD18),
    getSigmaRetention(COL_IDS.retentionZD19),
    getSigmaRetention(COL_IDS.retentionZD20),
    getSigmaRetention(COL_IDS.retentionZD21),
    getSigmaRetention(COL_IDS.retentionZD22),
    getSigmaRetention(COL_IDS.retentionZD23),
    getSigmaRetention(COL_IDS.retentionZD24),
    getSigmaRetention(COL_IDS.retentionZD25),
    getSigmaRetention(COL_IDS.retentionZD26),
    getSigmaRetention(COL_IDS.retentionZD27),
    getSigmaRetention(COL_IDS.retentionZD28),
    getSigmaRetention(COL_IDS.retentionZD29),
    getSigmaRetention(COL_IDS.retentionZD30),

    // Cohort
    getColData(COL_IDS.cohortCost),
    getRoas(COL_IDS.cohortROASD0),
    getRoas(COL_IDS.cohortROASD1),
    getRoas(COL_IDS.cohortROASD3),
    getRoas(COL_IDS.cohortROASD7),
    getRoas(COL_IDS.cohortROASD14),
    getRoas(COL_IDS.cohortROASD30),
    getRoas(COL_IDS.cohortROASD60),
    getRoas(COL_IDS.cohortROASD90),
    getRoas(COL_IDS.cohortROASD180, 170),
    activityROICol,
    getCol2(COL_IDS.cohortRevenueD0),
    getCol2(COL_IDS.cohortRevenueD1),
    getCol2(COL_IDS.cohortRevenueD3),
    getCol2(COL_IDS.cohortRevenueD7),
    getCol2(COL_IDS.cohortRevenueD14),
    getCol2(COL_IDS.cohortRevenueD30),
    getCol2(COL_IDS.cohortRevenueD60),
    getCol2(COL_IDS.cohortRevenueD90),
    getCol2(COL_IDS.cohortRevenueD180, undefined, 170),
    getColData(COL_IDS.billableCost, getTitleWith2Lines("Billable", "Cost")),
    getColData(
      COL_IDS.billableInstall,
      getTitleWith2Lines("Billable", "Installs")
    ),
    billableECpiCol,
  ];
}
