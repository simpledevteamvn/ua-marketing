import React from "react";
import {
  getShadeColor,
  getTableCellBg,
  getValueWithCurrency,
  sortByString,
  sortNumberWithNullable,
} from "../../../../utils/Helpers";
import getColumnSearchProps from "../../../../partials/common/Table/CustomSearch";
import { Link } from "react-router-dom";
import { BidColumn } from "../Helper";
import searchMaxMinValue from "../../../../partials/common/Table/SearchMaxMinValue";
import { numberWithCommas } from "../../../../utils/Utils";
import Tooltip from "antd/lib/tooltip";
import Popconfirm from "antd/lib/popconfirm";
import {
  EDITABLE_STATUS,
  LIST_CAMPAIGN_STATUS,
  NETWORK_CODES,
  NOT_A_NUMBER,
  TABLE_COLUMN_COLOR,
} from "../../../../constants/constants";
import Switch from "antd/lib/switch";
import CopyOutlined from "@ant-design/icons/lib/icons/CopyOutlined";

export const getColumns = (props) => {
  const {
    onSearchTable,
    onFilterTable,
    currenciesConfigs,
    onChangeStatus,
    handleCloneCamp,
    tableData,
  } = props;

  const maxCost = !tableData?.length
    ? 0
    : Math.max(...tableData?.map((el: any) => el.cost || 0));
  const maxEcpi = !tableData?.length
    ? 0
    : Math.max(...tableData?.map((el: any) => el.eCpi || 0));

  return [
    {
      title: "Network Connector",
      width: 150,
      sorter: sortByString("networkConnectorName"),
      ...getColumnSearchProps({
        getField: (el) => el.networkConnectorName,
        callback: (value) => onSearchTable(value, "networkConnectorName"),
        customFilter: () => true,
      }),
      render: (rd) => {
        const { network, networkConnectorName } = rd;
        const flag = network?.imageUrl;
        return (
          <div className="flex items-center truncate">
            {flag ? (
              <img
                src={flag}
                alt=" "
                className="w-6 h-6 rounded-sm mr-1 mb-px"
              />
            ) : (
              <span className="w-7"></span>
            )}
            <span className="truncate">{networkConnectorName}</span>
          </div>
        );
      },
    },
    {
      title: "Name",
      width: 200,
      ...getColumnSearchProps({
        dataIndex: "name",
        callback: (value) => onSearchTable(value, "name"),
        customFilter: () => true,
      }),
      sorter: sortByString("name"),
      render: (rd) => {
        return (
          <Link
            to={rd.id}
            className="truncate"
            // className="inline-block truncate w-[180px]" // use when exist fixed column
            title={rd.name}
          >
            {rd.name}
          </Link>
        );
      },
    },
    {
      title: "Type",
      width: 80,
      dataIndex: "billing",
      sorter: sortByString("billing"),
    },
    BidColumn(onFilterTable, currenciesConfigs, {}),
    {
      title: "Daily Budget",
      width: 120,
      render: (rd) => {
        const isNA = rd.network?.defaultBudgetAccess === EDITABLE_STATUS.none;
        if (isNA) return NOT_A_NUMBER;

        return getValueWithCurrency(
          rd.defaultBudget?.dailyBudget,
          rd.currency,
          currenciesConfigs
        );
      },
      ...searchMaxMinValue({
        getField: (el) => el.defaultBudget?.dailyBudget,
        placeholderSuffix: " ",
        onFilterTable,
      }),
      sorter: (a, b) =>
        sortNumberWithNullable(a, b, (el) => el.defaultBudget?.dailyBudget),
    },
    {
      title: "Cost",
      width: 70,
      render: (rd) => <div className="px-2">{numberWithCommas(rd.cost)}</div>,
      ...searchMaxMinValue({
        dataIndex: "cost",
        placeholderSuffix: " ",
        onFilterTable,
      }),
      sorter: (a, b) => sortNumberWithNullable(a, b, (el) => el.cost),
      onCell: (record) => getTableCellBg(record, "", maxCost, (el) => el.cost),
    },
    {
      title: "eCpi",
      width: 70,
      render: (rd) => numberWithCommas(rd.eCpi),
      ...searchMaxMinValue({
        dataIndex: "eCpi",
        placeholderSuffix: " ",
        onFilterTable,
      }),
      sorter: (a, b) => sortNumberWithNullable(a, b, (el) => el.eCpi),
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
      title: "Action",
      width: 70,
      // fixed: "right",
      align: "center",
      render: (record) => {
        const isRunning = record.status === LIST_CAMPAIGN_STATUS.running.value;

        const { networkCode } = record;
        const supportedNetworks = [
          NETWORK_CODES.adjoe,
          NETWORK_CODES.vungle,
          NETWORK_CODES.ironSource,
          NETWORK_CODES.entravision,
          NETWORK_CODES.aura,
        ];
        let title = isRunning ? "Pause" : "Run";
        let isDisabled = false;
        if (networkCode && supportedNetworks.includes(networkCode)) {
          title = "This network does not support changing campaign status.";
          isDisabled = true;
        }

        return (
          <div className="flex items-center justify-center space-x-2">
            <Tooltip title={title}>
              <Popconfirm
                placement="left"
                title={`${isRunning ? "Pause" : "Run"} this campaign?`}
                onConfirm={() => onChangeStatus(record)}
                okText="Yes"
                disabled={isDisabled}
                cancelText="No"
              >
                <Switch
                  disabled={isDisabled}
                  style={{ backgroundColor: isRunning ? "#16a34a" : "#d6d3d1" }}
                  size="small"
                  checked={isRunning}
                />
              </Popconfirm>
            </Tooltip>
            <Tooltip title="Clone">
              <CopyOutlined
                onClick={() => handleCloneCamp(record)}
                className="text-base cursor-pointer"
              />
            </Tooltip>
          </div>
        );
      },
    },
  ];
};
