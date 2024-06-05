import React, { useState } from "react";
import PropTypes from "prop-types";
import Tooltip from "antd/lib/tooltip";
import Table from "antd/lib/table";
import { AiOutlineEdit } from "@react-icons/all-files/ai/AiOutlineEdit";

function NetworkTable(props) {
  const defaultPageSize = 20;
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const { onEdit, listData } = props;

  const columns = [
    {
      title: "Name",
      render: (record) => (
        <div className="flex items-center">
          {record.imageUrl && (
            <img
              alt=" "
              src={record.imageUrl}
              className="h-6 w-6 rounded mr-1.5"
            />
          )}
          <span>{record.name}</span>
        </div>
      ),
    },
    {
      title: "Code",
      render: (record) => (
        <div className="whitespace-nowrap md:whitespace-normal">
          {record.code}
        </div>
      ),
    },
    {
      title: "Image url",
      dataIndex: "imageUrl",
      width: 200,
    },
    {
      title: "Type",
      sorter: (a, b) =>
        ("" + a.networkType.name).localeCompare(b.networkType.name),
      render: (record) => (
        <div className="whitespace-nowrap md:whitespace-normal">
          {record.networkType.name}
        </div>
      ),
    },
    {
      title: "Configs",
      render: (record) => record.configs.join(", "),
      width: 300,
    },
    {
      title: "Action",
      render: (record) => (
        <Tooltip title="Edit Network">
          <AiOutlineEdit
            size={20}
            className="text-slate-600 hover:text-antPrimary cursor-pointer"
            onClick={() => onEdit(record)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <Table
      id="network-table"
      // @ts-ignore
      getPopupContainer={() => document.getElementById("network-table")}
      rowKey={(record) => record.id}
      columns={columns}
      dataSource={[...listData]}
      scroll={{ x: 600 }}
      pagination={listData?.length < defaultPageSize ? false : { pageSize }}
      onChange={(pagination) => {
        pagination?.pageSize && setPageSize(pagination?.pageSize);
      }}
    />
  );
}

NetworkTable.defaultProps = {
  listData: [],
};

NetworkTable.propTypes = {
  onEdit: PropTypes.func,
  listData: PropTypes.array,
};

export default NetworkTable;
