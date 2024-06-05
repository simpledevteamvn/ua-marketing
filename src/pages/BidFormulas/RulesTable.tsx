import React from "react";
import PropTypes from "prop-types";
import Table from "antd/lib/table";
import { getCountriesEl, sortByString } from "../../utils/Helpers";
import Tooltip from "antd/lib/tooltip";
import { AiOutlineEdit } from "@react-icons/all-files/ai/AiOutlineEdit";
import DeleteOutlined from "@ant-design/icons/lib/icons/DeleteOutlined";
import moment from "moment";
import { numberWithCommas } from "../../utils/Utils";
import searchMaxMinValue from "../../partials/common/Table/SearchMaxMinValue";
import getColumnSearchProps from "../../partials/common/Table/CustomSearch";
import { showListData } from "../../utils/helper/UIHelper";

function RulesTable(props) {
  const {
    isLoading,
    isAdmin,
    listData,
    totalData,
    tableFilters,
    onChangeFilter,
    onEdit,
    onDelete,
    onFilterTable,
    onSearchTable,
  } = props;

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
      title: "Update by",
      width: 140,
      dataIndex: "lastModifiedBy",
      ...getColumnSearchProps({
        getField: (el) => el.lastModifiedBy,
        callback: (value) => onSearchTable(value, "lastModifiedBy"),
        customFilter: () => true,
      }),
      sorter: sortByString("lastModifiedBy"),
    },
    {
      title: "Last modified",
      width: 180,
      render: (record) => (
        <div className="whitespace-nowrap md:whitespace-normal">
          {moment(record.lastModifiedDate).format("DD-MM-YYYY HH:mm:ss")}
        </div>
      ),
      sorter: (a, b) => {
        const aDate = moment(a.lastModifiedDate).format("DD-MM-YYYY HH:mm:ss");
        const bDate = moment(b.lastModifiedDate).format("DD-MM-YYYY HH:mm:ss");
        return ("" + aDate).localeCompare(bDate);
      },
    },
    {
      title: "Apps",
      width: 300,
      render: (record) => {
        if (Array.isArray(record.storeApps) && record.storeApps.length) {
          const appNames = record.storeApps.map((el) => el.name);
          return showListData(appNames, "app");
        }
        return "All Apps";
      },
    },
    {
      title: "Countries",
      width: 400,
      render: getCountriesEl,
    },
    {
      title: "Currency",
      dataIndex: "currency",
      width: 60,
      sorter: sortByString("currency"),
    },
    {
      title: "Max bid",
      width: 140,
      ...searchMaxMinValue({
        getField: (r) => r.maxBidValue,
        dataIndex: "maxBidValue",
        placeholderSuffix: " ",
        onFilterTable,
        step: 0.01,
      }),
      render: (record) => numberWithCommas(record.maxBidValue),
      sorter: (a, b) => a.maxBidValue - b.maxBidValue,
    },
    {
      title: "Max budget",
      width: 160,
      ...searchMaxMinValue({
        getField: (r) => r.maxBudgetValue,
        dataIndex: "maxBudgetValue",
        placeholderSuffix: " ",
        onFilterTable,
      }),
      render: (record) => numberWithCommas(record.maxBudgetValue),
      sorter: (a, b) => a.maxBudgetValue - b.maxBudgetValue,
    },
    {
      title: "Action",
      width: 120,
      render: (record) => {
        const { storeApps } = record;
        if (!isAdmin && !storeApps?.length) return;
        return (
          <div className="flex space-x-2 ml-2">
            <Tooltip title="Edit rule">
              <AiOutlineEdit
                size={20}
                className="text-slate-600 hover:text-antPrimary cursor-pointer"
                onClick={() => onEdit(record)}
              />
            </Tooltip>

            <Tooltip title="Delete rule">
              <DeleteOutlined
                className="icon-danger text-xl cursor-pointer"
                onClick={() => onDelete(record)}
              />
            </Tooltip>
          </div>
        );
      },
    },
  ];

  const pagination = {
    pageSize: tableFilters.size,
    current: tableFilters.page + 1,
    total: totalData || listData.length,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
  };

  return (
    <Table
      className="-mb-4"
      id="rule-table"
      getPopupContainer={() => document.getElementById("rule-table")!}
      loading={isLoading}
      rowKey={(record) => record.id}
      // @ts-ignore
      columns={columns}
      dataSource={[...listData]}
      scroll={{ x: 1000 }}
      pagination={pagination}
      onChange={onChangeFilter}
    />
  );
}

RulesTable.defaultProps = {
  listData: [],
};

RulesTable.propTypes = {
  isLoading: PropTypes.bool,
  isAdmin: PropTypes.bool,
  listData: PropTypes.array,
  totalData: PropTypes.number,
  onChangeFilter: PropTypes.func,
  onFilterTable: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onSearchTable: PropTypes.func,
  tableFilters: PropTypes.object,
};

export default RulesTable;
