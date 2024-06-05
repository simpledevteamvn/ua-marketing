import React, { useState } from "react";
import PropTypes from "prop-types";
import Table from "antd/lib/table";
import { sortByString } from "../../../utils/Helpers";
import Tooltip from "antd/lib/tooltip";
import { AiOutlineEdit } from "@react-icons/all-files/ai/AiOutlineEdit";
import DeleteOutlined from "@ant-design/icons/lib/icons/DeleteOutlined";
import getColumnSearchProps from "../../../partials/common/Table/CustomSearch";
import searchMaxMinValue from "../../../partials/common/Table/SearchMaxMinValue";

function CurrencyTable(props) {
  const { listData, onEdit, onDelete, isAdmin, onSearchTable, onFilterTable } =
    props;

  const defaultPageSize = 20;
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const columns = [
    {
      title: "Currency",
      dataIndex: "currency",
      ...getColumnSearchProps({
        getField: (el) => el.currency,
        callback: (value) => onSearchTable(value, "currency"),
        customFilter: () => true,
      }),
      sorter: sortByString("currency"),
    },
    {
      title: "Exchange rate (USD)",
      dataIndex: "rate",
      ...searchMaxMinValue({
        dataIndex: "rate",
        placeholderSuffix: " ",
        onFilterTable,
      }),
      sorter: (a, b) => a.rate - b.rate,
    },
  ];
  const actionCol = {
    title: "Action",
    render: (record) => {
      return (
        <div className="flex space-x-2 ml-2">
          <Tooltip title="Edit currency">
            <AiOutlineEdit
              size={20}
              className="text-slate-600 hover:text-antPrimary cursor-pointer"
              onClick={() => onEdit(record)}
            />
          </Tooltip>

          <Tooltip title="Delete currency">
            <DeleteOutlined
              className="icon-danger text-xl cursor-pointer"
              onClick={() => onDelete(record)}
            />
          </Tooltip>
        </div>
      );
    },
  };

  if (isAdmin) {
    // @ts-ignore
    columns.push(actionCol);
  }

  const onChangeTable = (pagination) => {
    if (pagination?.pageSize && pagination.pageSize !== pageSize) {
      setPageSize(pagination.pageSize);
    }
  };

  const pagination = {
    pageSize,
    total: listData.length,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
  };

  return (
    <Table
      // @ts-ignore
      columns={columns}
      dataSource={listData}
      scroll={{ x: 600 }}
      rowKey={(record) => record.currency}
      pagination={pagination}
      onChange={onChangeTable}
    />
  );
}

CurrencyTable.propTypes = {
  listData: PropTypes.array,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onSearchTable: PropTypes.func,
  onFilterTable: PropTypes.func,
  isAdmin: PropTypes.bool,
};

export default CurrencyTable;
