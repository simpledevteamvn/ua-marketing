import React, { useState } from "react";
import PropTypes from "prop-types";
import Table from "antd/lib/table";
import Tooltip from "antd/lib/tooltip";
import { AiOutlineEdit } from "@react-icons/all-files/ai/AiOutlineEdit";
import DeleteOutlined from "@ant-design/icons/lib/icons/DeleteOutlined";
import Popconfirm from "antd/lib/popconfirm";
import moment from "moment";
import GamePlatformIcon from "../../../partials/common/GamePlatformIcon";
function AppGroupTable(props) {
  const defaultPageSize = 10;
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const { listData, onEdit, onDelete, isLoading } = props;

  const columns = [
    {
      title: "Group name",
      render: (record) => (
        <div className="flex items-center">
          <div className="">{record?.name}</div>
        </div>
      ),
    },
    {
      title: "Total apps",
      render: (record) => (
        <div className="flex items-center">
          <div className="">{record?.apps.length}</div>
        </div>
      ),
    },
    {
      title: "Update by",
      render: (record) => (
        <div className="flex items-center">
          <div className="">{record?.lastModifiedBy}</div>
        </div>
      ),
    },
    {
      title: "Last modified",
      render: (record) => (
        <div className="flex items-center">
          <div className="whitespace-nowrap md:whitespace-normal">
            {moment(record?.lastModifiedDate).format("YYYY-MM-DD HH:mm:ss")}
          </div>
        </div>
      ),
    },
    {
      title: "App detail",
      render: (record) => {
        const { apps } = record;
        if (!apps?.length) return <></>;
        const totalApp = apps.length;

        return (
          <div className="flex items-center flex-wrap -mx-1.5 -mt-1">
            {apps.slice(0, 2).map((item, index) => (
              <div
                className="whitespace-nowrap md:whitespace-normal flex items-center mx-1.5 mt-1"
                key={index}
              >
                {item.icon && (
                  <GamePlatformIcon
                    app={item}
                    imgClass="w-8 h-8 rounded-md shrink-0"
                    iconClass="w-5 h-5 bottom-[-4px]"
                  />
                )}
                <Tooltip title={item.name}>
                  <div className="truncate ml-5">{item.name}</div>
                </Tooltip>
                {index < totalApp - 1 && <span>,</span>}
              </div>
            ))}
            {totalApp > 2 && (
              <Tooltip
                title={apps
                  .slice(2, 22)
                  .map((item, index) => <div key={index}>{item.name}</div>)
                  .concat(totalApp > 22 ? <div key={23}>...</div> : null)}
              >
                <div className="whitespace-nowrap md:whitespace-normal flex items-center mx-1.5 mt-1">
                  ... {totalApp - 2} more apps ...
                </div>
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      title: "Action",
      width: 140,
      render: (text, record) => {
        return (
          <div className="flex space-x-2 ml-2">
            <>
              <Tooltip title="Edit group">
                <AiOutlineEdit
                  size={20}
                  className="text-slate-600 hover:text-antPrimary cursor-pointer"
                  onClick={() => onEdit(record)}
                />
              </Tooltip>

              <Popconfirm
                placement="left"
                title="Are you sure to delete this group?"
                onConfirm={() => onDelete(record)}
                okText="Yes"
                cancelText="No"
              >
                <Tooltip title="Delete group">
                  <DeleteOutlined
                    size={20}
                    className="icon-danger text-xl cursor-pointer"
                  />
                </Tooltip>
              </Popconfirm>
            </>
          </div>
        );
      },
    },
  ];

  const pagination = {
    hideOnSinglePage: true,
    pageSize,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
  };

  return (
    <Table
      id="app-groups-table"
      rowKey={(record) => record?.id}
      columns={columns}
      loading={isLoading}
      dataSource={[...listData]}
      scroll={{ x: 600 }}
      pagination={pagination}
      onChange={(pagination) => {
        pagination?.pageSize && setPageSize(pagination?.pageSize);
      }}
    />
  );
}

AppGroupTable.defaultProps = {
  listData: [],
};
AppGroupTable.propTypes = {
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  isLoading: PropTypes.bool,
  listData: PropTypes.array,
};

export default AppGroupTable;
