import React from "react";

import { getCountryEl, sortByString } from "../../../../../utils/Helpers";
import Table from "antd/lib/table";
import { toast } from "react-toastify";
import Modal from "antd/lib/modal";

const defaultColumns = [
  {
    title: "Network",
    dataIndex: "network",
    sorter: sortByString("network"),
  },
  {
    title: "Campaign Name",
    dataIndex: "campaignName",
    sorter: sortByString("campaignName"),
  },
  {
    title: "Message",
    dataIndex: "message",
    sorter: sortByString("message"),
  },
  {
    title: "Country",
    sorter: sortByString("country"),
    render: getCountryEl,
  },
];

export const showBatchErrModal = (
  listData,
  columns: any = defaultColumns,
  getTableId: any = null
) => {
  const getRowKey = (rd: any) =>
    getTableId ? getTableId(rd) : rd.network + rd.campaignName + rd.country;
  toast(`An error has occurred.`, { type: "error" });

  return Modal.error({
    wrapClassName: "custom-modal-error",
    title: <div className="mb-2">The campaigns below update failed.</div>,
    content: (
      <Table
        // @ts-ignore
        columns={columns}
        dataSource={listData}
        rowKey={getRowKey}
        pagination={listData?.length < 10 ? false : { pageSize: 10 }}
        scroll={{ x: 500 }}
      />
    ),
  });
};
