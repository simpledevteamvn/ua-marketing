import React from "react";
import PropTypes from "prop-types";
import Table from "antd/lib/table/Table";
import { getDateCol } from "../../../../partials/common/Table/Helper";

function NotificationsTable(props) {
  const { isLoading, tableData, tableFilters, onChangeTable } = props;

  const columns = [
    { title: "Created by", dataIndex: "createdBy" },
    { title: "Date", render: getDateCol },
    { title: "Title", dataIndex: "title" },
    { title: "Description", dataIndex: "description" },
  ];

  const listData = Array.isArray(tableData?.content) ? tableData.content : [];
  const pagination = {
    pageSize: tableFilters?.size,
    current: tableFilters?.page + 1,
    total: tableData?.totalElements,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
  };

  return (
    <Table
      id="notifications-table"
      getPopupContainer={() => document.getElementById("notifications-table")!}
      loading={isLoading}
      rowKey={(record) => record.id}
      // @ts-ignore
      hideOnSinglePage
      // @ts-ignore
      columns={columns}
      dataSource={listData}
      scroll={{ x: 600 }}
      pagination={pagination}
      onChange={onChangeTable}
    />
  );
}

NotificationsTable.propTypes = {
  isLoading: PropTypes.bool,
  tableData: PropTypes.object,
  tableFilters: PropTypes.object,
  onChangeTable: PropTypes.func,
};

export default NotificationsTable;
