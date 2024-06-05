import {
  getColumnNumber,
  sortNumberWithNullable,
} from "../../../../utils/Helpers";
import { keepSortColumn } from "../Helper";
import searchMaxMinValue from "../SearchMaxMinValue";
import { SortMap } from "../interface";

export function PerformanceColumns({ onFilterTable, isKeepSort = false }) {
  return [
    {
      title: "Cost",
      width: 100,
      render: (rd) => getColumnNumber(rd.data?.cost, "$"),
      sorter: isKeepSort
        ? keepSortColumn
        : (a, b) => sortNumberWithNullable(a, b, (el) => el.data?.cost),
      ...searchMaxMinValue({
        dataIndex: "cost",
        placeholderSuffix: " ",
        getField: (el) => el.data?.cost,
        onFilterTable,
      }),
    },
    {
      title: "Installs",
      width: 100,
      render: (rd) => getColumnNumber(rd.data?.install),
      sorter: isKeepSort
        ? keepSortColumn
        : (a, b) => sortNumberWithNullable(a, b, (el) => el.data?.install),
      ...searchMaxMinValue({
        dataIndex: "install",
        placeholderSuffix: " ",
        getField: (el) => el.data?.install,
        onFilterTable,
      }),
    },
    {
      title: "eCpi",
      width: 100,
      render: (rd) => getColumnNumber(rd.data?.eCpi, "$"),
      sorter: isKeepSort
        ? keepSortColumn
        : (a, b) => sortNumberWithNullable(a, b, (el) => el.data?.eCpi),
      ...searchMaxMinValue({
        dataIndex: "eCpi",
        placeholderSuffix: " ",
        getField: (el) => el.data?.eCpi,
        onFilterTable,
      }),
    },
    {
      title: "Impressions",
      width: 100,
      render: (rd) => getColumnNumber(rd.data?.impression),
      sorter: isKeepSort
        ? keepSortColumn
        : (a, b) => sortNumberWithNullable(a, b, (el) => el.data?.impression),
      ...searchMaxMinValue({
        dataIndex: "impression",
        placeholderSuffix: " ",
        getField: (el) => el.data?.impression,
        onFilterTable,
      }),
    },
    {
      title: "Clicks",
      width: 100,
      render: (rd) => getColumnNumber(rd.data?.click),
      sorter: isKeepSort
        ? keepSortColumn
        : (a, b) => sortNumberWithNullable(a, b, (el) => el.data?.click),
      ...searchMaxMinValue({
        dataIndex: "click",
        placeholderSuffix: " ",
        getField: (el) => el.data?.click,
        onFilterTable,
      }),
    },
  ];
}

export const performanceSortMap: SortMap[] = [
  {
    title: "Cost",
    sorter: (a, b) => sortNumberWithNullable(a, b, (el) => el.data?.cost),
  },
  {
    title: "Installs",
    sorter: (a, b) => sortNumberWithNullable(a, b, (el) => el.data?.install),
  },
  {
    title: "eCpi",
    sorter: (a, b) => sortNumberWithNullable(a, b, (el) => el.data?.eCpi),
  },
  {
    title: "Impressions",
    sorter: (a, b) => sortNumberWithNullable(a, b, (el) => el.data?.impression),
  },
  {
    title: "Clicks",
    sorter: (a, b) => sortNumberWithNullable(a, b, (el) => el.data?.click),
  },
];
