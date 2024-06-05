import React, { useState } from "react";
import { AiOutlineEdit } from "@react-icons/all-files/ai/AiOutlineEdit";
import Table from "antd/lib/table";
import Tooltip from "antd/lib/tooltip";
import {
  capitalizeWord,
  filterColumn,
  sortByBool,
  sortByString,
} from "../../utils/Helpers";
import PropTypes from "prop-types";
import { ROLES } from "../../constants/constants";
import { BsUnlock } from "@react-icons/all-files/bs/BsUnlock";
import { BiBlock } from "@react-icons/all-files/bi/BiBlock";
import getColumnSearchProps from "../../partials/common/Table/CustomSearch";
import { filterIcon } from "../../partials/common/Table/Helper";
import { ROLE_FILTER } from "../../constants/tableFilter";
import { showListData } from "../../utils/helper/UIHelper";

export const STATUS_FILTER = [
  {
    text: "Activated",
    value: true,
  },
  {
    text: "Not activated",
    value: false,
  },
];

const MemberTable = (props) => {
  const defaultPageSize = 20;
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const { onEdit, listData, onDeactive, onActive, onSearchTable } = props;

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      ...getColumnSearchProps({
        dataIndex: "name",
        callback: (value) => onSearchTable(value, "name"),
        customFilter: () => true,
      }),
      sorter: sortByString("name"),
    },
    {
      title: "Email",
      dataIndex: "email",
      ...getColumnSearchProps({
        dataIndex: "email",
        callback: (value) => onSearchTable(value, "email"),
        customFilter: () => true,
      }),
      sorter: sortByString("email"),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      sorter: sortByString("phone"),
    },
    {
      title: "Role",
      filters: ROLE_FILTER,
      filterIcon: filterIcon,
      onFilter: (value, record) =>
        filterColumn(value, record, "", (el) => el.role?.name),
      sorter: (a, b) => ("" + a.role.name).localeCompare(b.role.name),
      render: (record) => capitalizeWord(record.role.name),
    },
    {
      title: "Status",
      filters: STATUS_FILTER,
      filterIcon: filterIcon,
      onFilter: (value, record) => record.isActive === value,
      sorter: sortByBool("isActive"),
      render: (record) =>
        record.isActive ? STATUS_FILTER[0].text : STATUS_FILTER[1].text,
    },
    {
      title: "Apps",
      width: "30%",
      render: (record) => {
        if (record.role.name === ROLES.admin) {
          return "All";
        }

        const { storeApps } = record;
        if (!storeApps || !storeApps.length) return "";

        const listApp = storeApps.map((app) => app?.name);
        return showListData(listApp, "app");
      },
    },
    {
      title: "Action",
      render: (record) => (
        <div className="flex space-x-2 ml-2">
          <Tooltip title="Edit member">
            <AiOutlineEdit
              size={20}
              className="text-slate-600 hover:text-antPrimary cursor-pointer"
              onClick={() => onEdit(record)}
            />
          </Tooltip>

          {record.isActive ? (
            <Tooltip title="Lock member">
              <BiBlock
                size={20}
                className="text-red-500 hover:text-red-600 cursor-pointer"
                onClick={() => onDeactive(record)}
              />
            </Tooltip>
          ) : (
            <Tooltip title="Unlock member">
              <BsUnlock
                size={20}
                className="text-slate-600 hover:text-antPrimary cursor-pointer"
                onClick={() => onActive(record)}
              />
            </Tooltip>
          )}
        </div>
      ),
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
      id="member-table"
      getPopupContainer={() => document.getElementById("member-table")!}
      rowKey={(record) => record.id}
      // @ts-ignore
      columns={columns}
      rowClassName={(record) => (record.isActive ? "" : "text-red-500")}
      dataSource={[...listData]}
      scroll={{ x: 600 }}
      pagination={pagination}
      onChange={onChangeTable}
    />
  );
};

MemberTable.defaultProps = {
  listData: [],
};

MemberTable.propTypes = {
  listData: PropTypes.array,
  onEdit: PropTypes.func,
  onDeactive: PropTypes.func,
  onActive: PropTypes.func,
  onSearchTable: PropTypes.func,
};

export default MemberTable;
