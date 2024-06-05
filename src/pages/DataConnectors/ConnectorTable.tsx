import React, { useState } from "react";
import PropTypes from "prop-types";
import Table from "antd/lib/table";
import Tooltip from "antd/lib/tooltip";
import { AiOutlineEdit } from "@react-icons/all-files/ai/AiOutlineEdit";
import { AiOutlineSync } from "@react-icons/all-files/ai/AiOutlineSync";
import { capitalizeWord, sortByString } from "../../utils/Helpers";
import DetailConnector from "./DetailConnector";
import service from "../../partials/services/axios.config";
import classNames from "classnames";
import DeleteOutlined from "@ant-design/icons/lib/icons/DeleteOutlined";
import { CONNECTOR_STATUS_FILTER } from "../../constants/constants";

function ConnectorTable(props) {
  const defaultPageSize = 20;
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const defaultFilters = {
    page: 0,
    size: 10,
    total: 0,
    sortBy: "",
    sortDirection: "asc",
    name: "",
    platforms: [],
  };
  // const defaultExpandedData = {
  //   "-1": {
  //     data: [],
  //     filters: { ...defaultFilters },
  //   },
  // };
  const [expandedData, setExpandedData] = useState({});
  const {
    isAdmin,
    listData,
    onSync,
    onEdit,
    onDelete,
    onLinkApp,
    isLoading,
    spinIcons,
    setIsLoading,
    linkedAppRes,
  } = props;

  const columns = [
    {
      title: "Name",
      sorter: (a, b) => ("" + a.network?.name).localeCompare(b.network?.name),
      render: (record) => (
        <div className="flex items-center">
          {record.network?.imageUrl && (
            <img
              alt=" "
              src={record.network.imageUrl}
              className="h-8 w-8 rounded mr-2 shrink-0"
            />
          )}
          <div>
            <div className="font-semibold text-black text-base">
              {record.network?.name}
            </div>
            <div className="italic text-xs">{record.name}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Total app",
      dataIndex: "totalApps",
      sorter: (a, b) => a.totalApps - b.totalApps,
    },
    {
      title: "Type",
      sorter: (a, b) =>
        ("" + a.network?.networkType?.name).localeCompare(
          b.network?.networkType?.name
        ),
      render: (record) => (
        <div className="whitespace-nowrap md:whitespace-normal">
          {record.network?.networkType?.name}
        </div>
      ),
    },
    {
      title: "Status",
      sorter: sortByString("status"),
      render: (record) => capitalizeWord(record.status),
    },
    {
      title: "Action",
      width: 140,
      render: (text, record, idx) => {
        return (
          <div className="flex space-x-2 ml-2">
            <Tooltip title="Synchronize connector">
              <AiOutlineSync
                size={20}
                className={classNames(
                  "text-slate-600 hover:text-antPrimary cursor-pointer",
                  spinIcons?.includes(idx) && "animate-spin"
                )}
                onClick={() => onSync(record, idx)}
              />
            </Tooltip>

            {isAdmin && (
              <>
                <Tooltip title="Edit connector">
                  <AiOutlineEdit
                    size={20}
                    className="text-slate-600 hover:text-antPrimary cursor-pointer"
                    onClick={() => onEdit(record)}
                  />
                </Tooltip>

                <Tooltip title="Delete connector">
                  <DeleteOutlined
                    className="icon-danger text-xl cursor-pointer"
                    onClick={() => onDelete(record)}
                  />
                </Tooltip>
              </>
            )}
          </div>
        );
      },
    },
  ];

  const expandedRowRender = (record, idx) => {
    if (!record.totalApps) return <></>;
    const recordId = record.id;

    return (
      <DetailConnector
        isLoading={spinIcons?.includes(idx)}
        connectorId={recordId}
        listData={expandedData[record.id]?.data || []}
        onLinkApp={onLinkApp}
        onChange={onChangeDetailTable}
        tableFilters={getTableFilters(recordId)}
        linkedAppRes={linkedAppRes}
      />
    );
  };

  const getTableFilters = (recordId) => {
    if (!recordId || !expandedData[recordId]?.filters) return defaultFilters;

    return expandedData[recordId].filters;
  };

  const onExpand = (expanded, record) => {
    const recordIdx = listData.findIndex((item) => item.id === record.id);

    if (
      !expanded ||
      !record.totalApps ||
      expandedData[record.id]?.data?.length ||
      spinIcons?.includes(recordIdx)
    ) {
      return;
    }
    getDetailData(record.id, null);
  };

  const getDetailData = (recordId, filters) => {
    setIsLoading(true);
    const filterParams = filters || getTableFilters(recordId);
    const params = {
      networkConnectorId: recordId,
      ...filterParams,
      platforms: filterParams.platforms.join(","),
    };
    delete params.total;

    service.get("/application", { params }).then(
      (res: any) => {
        setIsLoading(false);

        if (!res?.results?.content) return;
        setExpandedData({
          ...expandedData,
          [recordId]: {
            ...expandedData[recordId],
            data: res.results.content,
            filters: {
              ...filterParams,
              total: res.results.totalElements,
            },
          },
        });
      },
      () => setIsLoading(false)
    );
  };

  const onChangeDetailTable = (
    connectorId,
    pagination,
    filters,
    sorter,
    extra
  ) => {
    const status =
      filters[2]?.length === CONNECTOR_STATUS_FILTER.length
        ? ""
        : filters[2]?.[0] || "";

    const sortDirection = sorter?.order === "descend" ? "desc" : "asc";
    let sortBy = sorter?.column?.title?.toLowerCase() || "";
    if (sortBy === "type") {
      sortBy = "platform";
    }

    const newFilters = {
      page: pagination.current - 1 || defaultFilters.page,
      size: pagination.pageSize || defaultFilters.size,
      sortBy,
      sortDirection,
      name: filters[0] ? filters[0][0] : "",
      platforms: filters[1] || [],
      status,
    };

    setExpandedData({
      ...expandedData,
      [connectorId.id]: {
        ...expandedData[connectorId.id],
        filters: {
          ...newFilters,
        },
      },
    });

    getDetailData(connectorId, newFilters);
  };

  const pagination = {
    hideOnSinglePage: true,
    pageSize,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
  };

  return (
    <Table
      id="connector-table"
      getPopupContainer={() => document.getElementById("connector-table")!}
      rowKey={(record) => record.id + record.totalApps}
      columns={columns}
      loading={isLoading}
      dataSource={[...listData]}
      scroll={{ x: 600 }}
      size="middle"
      expandable={{
        expandedRowRender,
        rowExpandable: (record) => true,
        onExpand: onExpand,
      }}
      pagination={pagination}
      onChange={(pagination) => {
        pagination?.pageSize && setPageSize(pagination?.pageSize);
      }}
    />
  );
}

ConnectorTable.defaultProps = {
  listData: [],
};
ConnectorTable.propTypes = {
  isAdmin: PropTypes.bool,
  onSync: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  setIsLoading: PropTypes.func,
  isLoading: PropTypes.bool,
  spinIcons: PropTypes.array,
  listData: PropTypes.array,
  onLinkApp: PropTypes.func,
  linkedAppRes: PropTypes.object,
};

export default ConnectorTable;
