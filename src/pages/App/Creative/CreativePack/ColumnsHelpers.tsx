import React from "react";
import {
  getColumnNumber,
  getShadeColor,
  getTableCellBg,
  sortNumberWithNullable,
} from "../../../../utils/Helpers";
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
import searchMaxMinValue from "../../../../partials/common/Table/SearchMaxMinValue";
import { TABLE_COLUMN_COLOR } from "../../../../constants/constants";

export const perCreativeCols = ({ onFilterTable, tableData = [] }) => {
  const maxImpression = Math.max(
    ...tableData?.map((el: any) => el.data?.impression || 0)
  );
  const maxClick = Math.max(
    ...tableData?.map((el: any) => el.data?.click || 0)
  );
  const maxInstall = Math.max(
    ...tableData?.map((el: any) => el.data?.install || 0)
  );
  const maxCTR = Math.max(...tableData?.map((el: any) => el.data?.ctr || 0));
  const maxCVR = Math.max(...tableData?.map((el: any) => el.data?.cvr || 0));
  const maxCost = Math.max(...tableData?.map((el: any) => el.data?.cost || 0));
  const maxEcpi = Math.max(...tableData?.map((el: any) => el.data?.eCpi || 0));
  const maxEcpc = Math.max(...tableData?.map((el: any) => el.data?.eCpc || 0));
  const maxEcpm = Math.max(...tableData?.map((el: any) => el.data?.eCpm || 0));
  const maxOCVR = Math.max(...tableData?.map((el: any) => el.data?.oCvr || 0));
  const maxIvr = Math.max(...tableData?.map((el: any) => el.data?.ivr || 0));

  return [
    {
      title: "Impressions",
      columnId: "impression",
      width: 150,
      ...searchMaxMinValue({
        dataIndex: "impression",
        getField: (el) => el.data?.impression,
        placeholderSuffix: " ",
        onFilterTable,
      }),
      sorter: (a, b) =>
        sortNumberWithNullable(a, b, (el) => el.data?.impression),
      render: (record) => (
        <div className="px-2">{getColumnNumber(record.data?.impression)}</div>
      ),
      onCell: (record) =>
        getTableCellBg(record, "", maxImpression, (el) => el.data?.impression),
    },
    {
      title: "Clicks",
      columnId: "click",
      width: 120,
      ...searchMaxMinValue({
        dataIndex: "click",
        getField: (el) => el.data?.click,
        placeholderSuffix: " ",
        onFilterTable,
      }),
      sorter: (a, b) => sortNumberWithNullable(a, b, (el) => el.data?.click),
      render: (record) => (
        <div className="px-2">{getColumnNumber(record.data?.click)}</div>
      ),
      onCell: (record) =>
        getTableCellBg(record, "", maxClick, (el) => el.data?.click),
    },
    {
      title: "Installs",
      columnId: "install",
      width: 120,
      ...searchMaxMinValue({
        dataIndex: "install",
        getField: (el) => el.data?.install,
        placeholderSuffix: " ",
        onFilterTable,
      }),
      sorter: (a, b) => sortNumberWithNullable(a, b, (el) => el.data?.install),
      render: (record) => (
        <div className="px-2">{getColumnNumber(record.data?.install)}</div>
      ),
      onCell: (record) =>
        getTableCellBg(record, "", maxInstall, (el) => el.data?.install),
    },
    {
      title: getTableTitleWithTooltip("CTR"),
      columnId: "ctr",
      showSorterTooltip: { title: CTR },
      width: 120,
      ...searchMaxMinValue({
        dataIndex: "ctr",
        getField: (el) => el.data?.ctr,
        placeholderSuffix: " ",
        onFilterTable,
      }),
      sorter: (a, b) => sortNumberWithNullable(a, b, (el) => el.data?.ctr),
      render: (record) => getColumnNumber(record.data?.ctr, "", "%"),
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
      title: getTableTitleWithTooltip("CVR"),
      columnId: "cvr",
      showSorterTooltip: { title: CVR },
      width: 120,
      ...searchMaxMinValue({
        dataIndex: "cvr",
        getField: (el) => el.data?.cvr,
        placeholderSuffix: " ",
        onFilterTable,
      }),
      sorter: (a, b) => sortNumberWithNullable(a, b, (el) => el.data?.cvr),
      render: (record) => getColumnNumber(record.data?.cvr, "", "%"),
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
      title: "Cost",
      columnId: "cost",
      width: 120,
      ...searchMaxMinValue({
        dataIndex: "cost",
        getField: (el) => el.data?.cost,
        placeholderSuffix: " ",
        onFilterTable,
      }),
      sorter: (a, b) => sortNumberWithNullable(a, b, (el) => el.data?.cost),
      render: (record) => (
        <div className="px-2">{getColumnNumber(record.data?.cost, "$")}</div>
      ),
      onCell: (record) =>
        getTableCellBg(record, "", maxCost, (el) => el.data?.cost),
    },
    {
      title: getTableTitleWithTooltip("eCPI"),
      columnId: "eCpi",
      showSorterTooltip: { title: eCPI },
      width: 120,
      ...searchMaxMinValue({
        dataIndex: "eCpi",
        getField: (el) => el.data?.eCpi,
        placeholderSuffix: " ",
        onFilterTable,
      }),
      sorter: (a, b) => sortNumberWithNullable(a, b, (el) => el.data?.eCpi),
      render: (record) => getColumnNumber(record.data?.eCpi, "$"),
      onCell: (record) => {
        return {
          className: "custom-td-bg",
          ["style"]: {
            backgroundColor: getShadeColor(
              record.data?.eCpi,
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
        getField: (el) => el.data?.eCpc,
        placeholderSuffix: " ",
        onFilterTable,
      }),
      sorter: (a, b) => sortNumberWithNullable(a, b, (el) => el.data?.eCpc),
      render: (record) => getColumnNumber(record.data?.eCpc, "$"),
      onCell: (record) => {
        return {
          className: "custom-td-bg",
          ["style"]: {
            backgroundColor: getShadeColor(
              record.data?.eCpc,
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
        getField: (el) => el.data?.oCvr,
        placeholderSuffix: " ",
        onFilterTable,
      }),
      sorter: (a, b) => sortNumberWithNullable(a, b, (el) => el.data?.oCvr),
      render: (record) => getColumnNumber(record.data?.oCvr),
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
    {
      title: getTableTitleWithTooltip("eCPM"),
      columnId: "eCpm",
      showSorterTooltip: { title: eCPM },
      width: 130,
      ...searchMaxMinValue({
        dataIndex: "eCpm",
        getField: (el) => el.data?.eCpm,
        placeholderSuffix: " ",
        onFilterTable,
      }),
      sorter: (a, b) => sortNumberWithNullable(a, b, (el) => el.data?.eCpm),
      render: (record) => getColumnNumber(record.data?.eCpm, "$"),
      onCell: (record) => {
        return {
          className: "custom-td-bg",
          ["style"]: {
            backgroundColor: getShadeColor(
              record.data?.eCpm,
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
        getField: (el) => el.data?.ivr,
        placeholderSuffix: " ",
        onFilterTable,
      }),
      sorter: (a, b) => sortNumberWithNullable(a, b, (el) => el.data?.ivr),
      render: (record) => getColumnNumber(record.data?.ivr, "", "%"),
      onCell: (record) => {
        return {
          className: "custom-td-bg",
          ["style"]: {
            backgroundColor: getShadeColor(record.data?.ivr, maxIvr),
          },
        };
      },
    },
  ];
};
