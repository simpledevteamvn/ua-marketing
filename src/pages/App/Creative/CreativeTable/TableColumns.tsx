import React from "react";
import {
  filterColumn,
  getColumnNumber,
  getLabelFromStr,
  getShadeColor,
  getTableCellBg,
  sortByString,
  sortNumberWithNullable,
} from "../../../../utils/Helpers";
import { NameColumn } from "../Helpers";
import { getTableTitleWithTooltip } from "../../../../partials/common/Table/Header";
import {
  CTR,
  CVR,
  eCPC,
  eCPI,
  eCPM,
  IVR,
  oCVR,
} from "../../../../constants/tooltip";
// @ts-ignore
import getColumnSearchProps from "../../../../partials/common/Table/CustomSearch";
import searchMaxMinValue from "../../../../partials/common/Table/SearchMaxMinValue";
import { showListData } from "../../../../utils/helper/UIHelper";
import { TABLE_COLUMN_COLOR } from "../../../../constants/constants";
import Tag from "antd/lib/tag";
import { TAGGING_COLORS } from "../../../Assets/constants";

export const getTableColumns = (props) => {
  const {
    onSearchTable,
    setImgPreview,
    setPreviewData,
    onFilterTable,
    listType,
    listData,
  } = props;

  let filterTypes;
  if (listType?.length) {
    filterTypes = listType?.map((type) => ({
      text: getLabelFromStr(type),
      value: type,
    }));
  }

  const columns = [
    {
      title: "Creative name",
      columnId: "name",
      width: 450,
      maxWidth: 800,
      sorter: sortByString("name"),
      ...getColumnSearchProps({
        dataIndex: "name",
        callback: (value) => onSearchTable(value, "name"),
        customFilter: () => true,
      }),
      className: "table-expand-icon-mt-3",
      render: (record) => {
        const { creativeId, status } = record;
        if (creativeId) {
          if (status === "ACTIVE") {
            return (
              <div className="flex items-center justify-end min-h-[28px]">
                <div className="actived-dot" />
              </div>
            );
          }
          return <></>;
        }

        return NameColumn(record, setPreviewData, setImgPreview);
      },
    },
    {
      title: "Networks",
      columnId: "network",
      width: 200,
      ...getColumnSearchProps({
        dataIndex: "network",
        callback: (value) => onSearchTable(value, "network"),
        customFilter: () => true,
      }),
      sorter: sortByString("network"),
      render: (rd) => {
        if (rd.creativeId) {
          return rd.networkCode;
        }
        return showListData(rd.networkCodes, "network", 2);
      },
    },
    {
      title: "Campaigns",
      columnId: "campaign",
      width: 250,
      render: (rd) => showListData(rd.campaignNames, "campaign"),
    },
    {
      title: "Type",
      columnId: "type",
      width: 150,
      filters: filterTypes,
      onFilter: (value, record) => filterColumn(value, record, "type"),
      sorter: sortByString("type"),
      render: (record) => getLabelFromStr(record.type),
    },
    {
      title: "Tags",
      width: 200,
      render: (record) => {
        const { marks } = record;
        if (!marks?.length) return "";

        return (
          <div className="flex flex-wrap -my-0.5">
            {marks.map((text, idx) => {
              const tagColor =
                idx < TAGGING_COLORS.length ? idx : idx % TAGGING_COLORS.length;

              return (
                <Tag
                  color={TAGGING_COLORS[tagColor]}
                  key={text}
                  className="!my-0.5 truncate"
                >
                  {text}
                </Tag>
              );
            })}
          </div>
        );
      },
    },
    ...perCreativeCols({ onFilterTable, listData }),
  ];
  return columns;
};

export const perCreativeCols = ({ onFilterTable, listData = [] }) => {
  const maxImpression = Math.max(
    ...listData?.map((el: any) => el.impression || 0)
  );
  const maxClick = Math.max(...listData?.map((el: any) => el.click || 0));
  const maxInstall = Math.max(...listData?.map((el: any) => el.install || 0));
  const maxCTR = Math.max(...listData?.map((el: any) => el.ctr || 0));
  const maxCVR = Math.max(...listData?.map((el: any) => el.cvr || 0));
  const maxCost = Math.max(...listData?.map((el: any) => el.cost || 0));
  const maxEcpi = Math.max(...listData?.map((el: any) => el.eCpi || 0));
  const maxEcpc = Math.max(...listData?.map((el: any) => el.eCpc || 0));
  const maxEcpm = Math.max(...listData?.map((el: any) => el.eCpm || 0));
  const maxOCVR = Math.max(...listData?.map((el: any) => el.oCvr || 0));
  const maxIvr = Math.max(...listData?.map((el: any) => el.ivr || 0));

  return [
    {
      title: "Impressions",
      columnId: "impression",
      width: 150,
      ...searchMaxMinValue({
        dataIndex: "impression",
        getField: (el) => el.impression,
        placeholderSuffix: " ",
        onFilterTable,
      }),
      sorter: (a, b) => sortNumberWithNullable(a, b, (el) => el.impression),
      render: (record) => (
        <div className="px-2">{getColumnNumber(record.impression)}</div>
      ),
      onCell: (record) =>
        getTableCellBg(record, "", maxImpression, (el) => el.impression),
    },
    {
      title: "Clicks",
      columnId: "click",
      width: 120,
      ...searchMaxMinValue({
        dataIndex: "click",
        getField: (el) => el.click,
        placeholderSuffix: " ",
        onFilterTable,
      }),
      sorter: (a, b) => sortNumberWithNullable(a, b, (el) => el.click),
      render: (record) => (
        <div className="px-2">{getColumnNumber(record.click)}</div>
      ),
      onCell: (record) =>
        getTableCellBg(record, "", maxClick, (el) => el.click),
    },
    {
      title: "Installs",
      columnId: "install",
      width: 120,
      ...searchMaxMinValue({
        dataIndex: "install",
        getField: (el) => el.install,
        placeholderSuffix: " ",
        onFilterTable,
      }),
      sorter: (a, b) => sortNumberWithNullable(a, b, (el) => el.install),
      render: (record) => (
        <div className="px-2">{getColumnNumber(record.install)}</div>
      ),
      onCell: (record) =>
        getTableCellBg(record, "", maxInstall, (el) => el.install),
    },
    {
      title: getTableTitleWithTooltip("CTR"),
      columnId: "ctr",
      showSorterTooltip: { title: CTR },
      width: 120,
      ...searchMaxMinValue({
        dataIndex: "ctr",
        getField: (el) => el.ctr,
        placeholderSuffix: " ",
        onFilterTable,
      }),
      sorter: (a, b) => sortNumberWithNullable(a, b, (el) => el.ctr),
      render: (record) => getColumnNumber(record.ctr, "", "%"),
      onCell: (record) => {
        return {
          className: "custom-td-bg",
          ["style"]: {
            backgroundColor: getShadeColor(record.ctr, maxCTR),
          },
        };
      },
    },
    {
      title: getTableTitleWithTooltip("CVR"),
      columnId: "cvr",
      showSorterTooltip: { title: CVR },
      width: 120,
      ...searchMaxMinValue({
        dataIndex: "cvr",
        getField: (el) => el.cvr,
        placeholderSuffix: " ",
        onFilterTable,
      }),
      sorter: (a, b) => sortNumberWithNullable(a, b, (el) => el.cvr),
      render: (record) => getColumnNumber(record.cvr, "", "%"),
      onCell: (record) => {
        return {
          className: "custom-td-bg",
          ["style"]: {
            backgroundColor: getShadeColor(record.cvr, maxCVR),
          },
        };
      },
    },
    {
      title: "Cost",
      columnId: "cost",
      width: 120,
      ...searchMaxMinValue({
        dataIndex: "cost",
        getField: (el) => el.cost,
        placeholderSuffix: " ",
        onFilterTable,
      }),
      sorter: (a, b) => sortNumberWithNullable(a, b, (el) => el.cost),
      render: (record) => (
        <div className="px-2">{getColumnNumber(record.cost, "$")}</div>
      ),
      onCell: (record) => getTableCellBg(record, "", maxCost, (el) => el.cost),
    },
    {
      title: getTableTitleWithTooltip("eCPI"),
      columnId: "eCpi",
      showSorterTooltip: { title: eCPI },
      width: 120,
      ...searchMaxMinValue({
        dataIndex: "eCpi",
        getField: (el) => el.eCpi,
        placeholderSuffix: " ",
        onFilterTable,
      }),
      sorter: (a, b) => sortNumberWithNullable(a, b, (el) => el.eCpi),
      render: (record) => getColumnNumber(record.eCpi, "$"),
      onCell: (record) => {
        return {
          className: "custom-td-bg",
          ["style"]: {
            backgroundColor: getShadeColor(
              record.eCpi,
              maxEcpi,
              TABLE_COLUMN_COLOR[1]
            ),
          },
        };
      },
    },
    {
      title: getTableTitleWithTooltip("eCPC"),
      columnId: "eCpc",
      showSorterTooltip: { title: eCPC },
      width: 130,
      ...searchMaxMinValue({
        dataIndex: "eCpc",
        getField: (el) => el.eCpc,
        placeholderSuffix: " ",
        onFilterTable,
      }),
      sorter: (a, b) => sortNumberWithNullable(a, b, (el) => el.eCpc),
      render: (record) => getColumnNumber(record.eCpc, "$"),
      onCell: (record) => {
        return {
          className: "custom-td-bg",
          ["style"]: {
            backgroundColor: getShadeColor(
              record.eCpc,
              maxEcpc,
              TABLE_COLUMN_COLOR[1]
            ),
          },
        };
      },
    },
    {
      title: getTableTitleWithTooltip("oCVR"),
      columnId: "oCvr",
      showSorterTooltip: { title: oCVR },
      width: 130,
      ...searchMaxMinValue({
        dataIndex: "oCvr",
        getField: (el) => el.oCvr,
        placeholderSuffix: " ",
        onFilterTable,
      }),
      sorter: (a, b) => sortNumberWithNullable(a, b, (el) => el.oCvr),
      render: (record) => getColumnNumber(record.oCvr),
      onCell: (record) => {
        return {
          className: "custom-td-bg",
          ["style"]: {
            backgroundColor: getShadeColor(
              record.oCvr,
              maxOCVR,
              TABLE_COLUMN_COLOR[2]
            ),
          },
        };
      },
    },
    {
      title: getTableTitleWithTooltip("eCPM"),
      columnId: "eCpm",
      showSorterTooltip: { title: eCPM },
      width: 130,
      ...searchMaxMinValue({
        dataIndex: "eCpm",
        getField: (el) => el.eCpm,
        placeholderSuffix: " ",
        onFilterTable,
      }),
      sorter: (a, b) => sortNumberWithNullable(a, b, (el) => el.eCpm),
      render: (record) => getColumnNumber(record.eCpm, "$"),
      onCell: (record) => {
        return {
          className: "custom-td-bg",
          ["style"]: {
            backgroundColor: getShadeColor(
              record.eCpm,
              maxEcpm,
              TABLE_COLUMN_COLOR[1]
            ),
          },
        };
      },
    },
    {
      title: getTableTitleWithTooltip("IVR"),
      columnId: "ivr",
      showSorterTooltip: { title: IVR },
      width: 120,
      ...searchMaxMinValue({
        dataIndex: "ivr",
        getField: (el) => el.ivr,
        placeholderSuffix: " ",
        onFilterTable,
      }),
      sorter: (a, b) => sortNumberWithNullable(a, b, (el) => el.ivr),
      render: (record) => getColumnNumber(record.ivr, "", "%"),
      onCell: (record) => {
        return {
          className: "custom-td-bg",
          ["style"]: {
            backgroundColor: getShadeColor(record.ivr, maxIvr),
          },
        };
      },
    },
  ];
};
