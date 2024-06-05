import React from "react";
import Tooltip from "antd/lib/tooltip";
import { ID_COL } from "../../../../../partials/common/Table/Columns/IndexCol";
import getColumnSearchProps from "../../../../../partials/common/Table/CustomSearch";
import { keepSortColumn } from "../../../../../partials/common/Table/Helper";
import searchMaxMinValue from "../../../../../partials/common/Table/SearchMaxMinValue";
import {
  capitalizeWord,
  getTotalChildrenStr,
} from "../../../../../utils/Helpers";
import { PAUSED, RUNNING } from "../../../../../constants/dropdowns";
import EditNumberCell from "../../../../../partials/common/Table/EditNumberCell";
import {
  EDITABLE_STAT_IDS,
  NETWORK_CODES,
} from "../../../../../constants/constants";
import { NO_BIDDING, NO_BUDGET } from "../../../../../constants/tooltip";
import { PerformanceColumns } from "../../../../../partials/common/Table/Columns/PerformanceCols";
import Popconfirm from "antd/lib/popconfirm";
import Switch from "antd/lib/switch";
import service from "../../../../../partials/services/axios.config";
import DeleteOutlined from "@ant-design/icons/lib/icons/DeleteOutlined";
import { AiOutlineEdit } from "@react-icons/all-files/ai/AiOutlineEdit";
import { toast } from "react-toastify";
import { showListData } from "../../../../../utils/helper/UIHelper";

export function getColumns(props) {
  const {
    onSearchTable,
    onFilterTable,
    onClickName,
    currenciesConfigs,
    network,
    onEdit,
    onConfirmUpdateFailure,
    onEditSpecifyBid,
    setAdgroup,
    setIsLoading,
    editCountries,
  } = props;

  const onChangeStatus = (rd, isRunning) => {
    const params = { adGroupId: rd.id, enable: !isRunning };

    setIsLoading(true);
    service.put("/adgroup/status", null, { params }).then(
      (res: any) => {
        toast(res.message, { type: "success" });
        setIsLoading(false);
        setAdgroup((prevData) =>
          prevData.map((el) => {
            if (el.id === rd.id) {
              const newStatus = isRunning ? PAUSED : RUNNING;

              return { ...el, status: newStatus };
            }
            return el;
          })
        );
      },
      () => setIsLoading(false)
    );
  };

  const onDelete = (rd) => {
    setIsLoading(true);
    service.delete("/adgroup", { params: { adGroupId: rd.id } }).then(
      (res: any) => {
        toast(res.message, { type: "success" });
        setIsLoading(false);
        setAdgroup((prevData) => prevData.filter((el) => el.id !== rd.id));
      },
      () => setIsLoading(false)
    );
  };

  const columns: any = [
    ID_COL,
    {
      title: "Name",
      width: 250,
      sorter: keepSortColumn,
      render: (rd) => {
        const totalChildren = getTotalChildrenStr(rd);
        const rdName = rd.name + totalChildren;

        return (
          <Tooltip title={rdName}>
            <div className="flex justify-between items-center truncate">
              <div
                className="cursor-pointer truncate"
                onClick={() => onClickName(rd)}
              >
                {rdName}
              </div>
              {rd.status === RUNNING && (
                <div className="actived-dot !w-1.5 !h-1.5" />
              )}
            </div>
          </Tooltip>
        );
      },
      ...getColumnSearchProps({
        dataIndex: "name",
        callback: (value) => onSearchTable(value, "name"),
        customFilter: () => true,
      }),
    },
    {
      title: "Countries",
      width: 100,
      render: (rd) => {
        const canEdit = [NETWORK_CODES.facebook, NETWORK_CODES.tiktok].includes(
          network?.code
        );
        return (
          <div className="flex items-center truncate">
            <div className="truncate">{showListData(rd.countries)}</div>
            {canEdit && (
              <AiOutlineEdit
                size={16}
                className="text-antPrimary/80 hover:text-antPrimary cursor-pointer ml-2 shrink-0"
                onClick={() => editCountries(rd)}
              />
            )}
          </div>
        );
      },
    },
    {
      title: "Bid",
      width: 90,
      render: (rd) => {
        // Fake record theo trang cũ (Campaign Management) để dùng EditNumberCell component
        const record = { network, adGroup: rd };
        return (
          <EditNumberCell
            record={record}
            fieldName={EDITABLE_STAT_IDS.bid}
            NATooltip={NO_BIDDING}
            historyField="bidHistory"
            onEditCell={onEdit}
            onConfirmUpdateFailure={onConfirmUpdateFailure}
            onEditSpecifyBid={onEditSpecifyBid}
            currenciesConfigs={currenciesConfigs}
          />
        );
      },
      sorter: keepSortColumn,
      ...searchMaxMinValue({
        dataIndex: "bid",
        placeholderSuffix: " ",
        getField: (r) => r.bid?.bid,
        onFilterTable,
      }),
    },
    {
      title: "Daily budget",
      width: 120,
      render: (rd) => {
        const record = { network, adGroup: rd };
        return (
          <EditNumberCell
            record={record}
            fieldName={EDITABLE_STAT_IDS.budget}
            NATooltip={NO_BUDGET}
            historyField="budgetHistory"
            onEditCell={onEdit}
            onConfirmUpdateFailure={onConfirmUpdateFailure}
            currenciesConfigs={currenciesConfigs}
          />
        );
      },
      sorter: keepSortColumn,
      ...searchMaxMinValue({
        dataIndex: "budget",
        placeholderSuffix: " ",
        getField: (r) => r.budget?.dailyBudget,
        onFilterTable,
      }),
    },
    {
      title: "Bid Type",
      width: 100,
      render: (rd) => capitalizeWord(rd.bidType),
      sorter: keepSortColumn,
      ...getColumnSearchProps({
        getField: (r) => r.bidType,
        callback: (value) => onSearchTable(value, "bidType"),
        customFilter: () => true,
      }),
    },
    ...PerformanceColumns({ onFilterTable, isKeepSort: true }),
  ];

  if (
    [
      NETWORK_CODES.tiktok,
      NETWORK_CODES.appleSearchAds,
      NETWORK_CODES.facebook,
    ].includes(network?.code)
  ) {
    columns.push({
      title: "Action",
      fixed: "right",
      align: "center",
      width: 90,
      render: (rd) => {
        const isRunning = rd.status === RUNNING;

        return (
          <div className="flex items-center justify-center space-x-2">
            <Tooltip title={isRunning ? "Pause" : "Run"}>
              <Popconfirm
                placement="left"
                title={`${isRunning ? "Pause" : "Run"} this adgroup?`}
                onConfirm={() => onChangeStatus(rd, isRunning)}
                okText="Yes"
                cancelText="No"
              >
                <Switch
                  style={{ backgroundColor: isRunning ? "#16a34a" : "#d6d3d1" }}
                  size="small"
                  checked={isRunning}
                />
              </Popconfirm>
            </Tooltip>
            <Tooltip title="Remove">
              <Popconfirm
                placement="left"
                title="Remove this adgroup bid configuration?"
                onConfirm={() => onDelete(rd)}
                okText="Yes"
                cancelText="No"
              >
                <DeleteOutlined className="icon-danger text-xl cursor-pointer" />
              </Popconfirm>
            </Tooltip>
          </div>
        );
      },
    });
  }

  return columns;
}
