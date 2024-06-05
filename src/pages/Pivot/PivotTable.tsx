import React, { useState } from "react";
import PropTypes from "prop-types";
import Table from "antd/lib/table/Table";
import { getDateCol } from "../../partials/common/Table/Helper";
import { Link } from "react-router-dom";
import Tooltip from "antd/lib/tooltip";
import { AiOutlineEdit } from "@react-icons/all-files/ai/AiOutlineEdit";
import DeleteOutlined from "@ant-design/icons/lib/icons/DeleteOutlined";
import Popconfirm from "antd/lib/popconfirm";
import { getTreeLabel } from "./Helpers";
import { showListData } from "../../utils/helper/UIHelper";

function PivotTable(props) {
  const { isLoading, listData, listStoreApps, onEdit, onDelete } = props;

  const defaultPageSize = 20;
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const columns = [
    {
      title: "Name",
      render: (record) => <Link to={`${record.id}`}>{record.name}</Link>,
    },
    { title: "Created By", dataIndex: "createdBy" },
    { title: "Date", width: 180, render: getDateCol },
    {
      title: "App name",
      render: (record) => {
        if (!record.storeAppIds?.length) return;

        const listNames = record.storeAppIds.map((id) => {
          const activedApp = listStoreApps.find((app) => app.id === id);
          return activedApp?.name;
        });

        return showListData(listNames, "app");
      },
    },
    {
      title: "Filters",
      render: (record) => {
        if (!record.filters?.length) return;
        return record.filters.map((el) => getTreeLabel(el)).join(", ");
      },
    },
    {
      title: "Columns",
      render: (record) => {
        if (!record.columns?.length) return;
        return record.columns.map((el) => getTreeLabel(el)).join(", ");
      },
    },
    {
      title: "Rows",
      render: (record) => {
        if (!record.rows?.length) return;
        return record.rows.map((el) => getTreeLabel(el)).join(", ");
      },
    },
    {
      title: "Values",
      render: (record) => {
        if (!record.values?.length) return;
        return record.values.map((el) => getTreeLabel(el.name)).join(", ");
      },
    },
    {
      title: "Actions",
      render: (text, record, idx) => {
        return (
          <div className="flex space-x-2 ml-2">
            <Tooltip title="Edit pivot">
              <AiOutlineEdit
                size={20}
                className="text-slate-600 hover:text-antPrimary cursor-pointer"
                onClick={() => onEdit(record)}
              />
            </Tooltip>

            <Popconfirm
              placement="left"
              title="Are you sure to delete this pivot?"
              onConfirm={() => onDelete(record)}
              okText="Yes"
              cancelText="No"
            >
              <Tooltip title="Delete connector">
                <DeleteOutlined className="icon-danger text-xl cursor-pointer" />
              </Tooltip>
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  const onChangeTable = (pagination) => {
    if (pagination?.pageSize && pagination.pageSize !== pageSize) {
      setPageSize(pagination.pageSize);
    }
  };

  const pagination = {
    pageSize,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
  };

  return (
    <Table
      id="pivot-table"
      getPopupContainer={() => document.getElementById("pivot-table")!}
      loading={isLoading}
      rowKey={(record) => record.id}
      columns={columns}
      dataSource={[...listData]}
      scroll={{ x: 800 }}
      pagination={pagination}
      onChange={onChangeTable}
    />
  );
}

PivotTable.propTypes = {
  isLoading: PropTypes.bool,
  listData: PropTypes.array,
  listStoreApps: PropTypes.array,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

export default PivotTable;
