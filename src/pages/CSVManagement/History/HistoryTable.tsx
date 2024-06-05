import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Table from "antd/lib/table/Table";
import { capitalizeWord } from "../../../utils/Helpers";
import DetailHistory from "./DetailHistory";
import StatusCol from "../../../partials/common/Table/Columns/StatusCol";
import { getDateCol } from "../../../partials/common/Table/Helper";
import Popconfirm from "antd/lib/popconfirm";
import service from "../../../partials/services/axios.config";
import { toast } from "react-toastify";
import { EDITABLE_STAT_IDS } from "../../../constants/constants";
type Filter = { page: number; size: number };
type ExpandedData = { [id: number]: Filter };

function HistoryTable(props) {
  const {
    isLoading,
    listData,
    tableFilters,
    total,
    onChange,
    updateTableData,
  } = props;
  const [isLoadingTable, setIsLoadingTable] = useState(false);
  // Filters in FE
  const defaultDetailFilters: Filter = {
    page: 0,
    size: 10,
  };
  const [filters, setFilters] = useState<ExpandedData>({});
  const [currenciesConfigs, setCurrenciesConfigs] = useState([]);

  useEffect(() => {
    service.get("/exchange-rate").then(
      (res: any) => {
        setCurrenciesConfigs(res.results || []);
      },
      () => {}
    );
  }, []);

  const revertCSV = (rd) => {
    setIsLoadingTable(true);
    service
      .put("/bid/file/revert", null, { params: { fileHistoryId: rd.id } })
      .then(
        (res: any) => {
          setNewBatchHistory(rd.id, res.results);
          toast(res.message, { type: "success" });
          setIsLoadingTable(false);
        },
        () => setIsLoadingTable(false)
      );
  };

  const setNewBatchHistory = (fileHistoryId, newBatchHistory) => {
    const newTableData = listData?.map((el) => {
      if (el.id === fileHistoryId) {
        return {
          ...el,
          revertedBy: newBatchHistory.revertedBy,
          histories: newBatchHistory.histories,
          status: newBatchHistory.status,
        };
      }

      return el;
    });

    updateTableData({ ...listData, content: newTableData });
  };

  const isDisableRevertBtn = (status) => {
    return status === "Failure" || status === "Processing";
  };

  const columns = [
    {
      title: "Date",
      render: getDateCol,
    },
    { title: "Updated By", dataIndex: "createdBy" },
    {
      title: "File Name",
      dataIndex: "fileName",
    },
    {
      title: "Network",
      render: (record) => capitalizeWord(record.network),
    },
    StatusCol,
    {
      title: "Action",
      render: (record) => {
        if (record.type === "budget") return "";
        if (record.revertedBy) return "Reverted by " + record.revertedBy;

        return (
          <Popconfirm
            placement="left"
            title="Are you sure to revert this action?"
            onConfirm={() => revertCSV(record)}
            okText="Yes"
            cancelText="No"
            disabled={isDisableRevertBtn(record.status)}
          >
            <button
              disabled={isDisableRevertBtn(record.status)}
              className="btn-info btn-sm whitespace-nowrap"
            >
              Revert
            </button>
          </Popconfirm>
        );
      },
    },
  ];

  const onChangeDetail = (recordIdx, pagination) => {
    const { pageSize, current } = pagination;
    setFilters({
      ...filters,
      [recordIdx]: { size: pageSize, page: current - 1 },
    });
  };

  const expandedRowRender = (record, idx, indent, expanded) => {
    if (!expanded || !record.histories?.length) return <></>;

    return (
      <DetailHistory
        recordIdx={idx}
        data={record.histories}
        tableFilters={filters[idx] || defaultDetailFilters}
        onChange={onChangeDetail}
        revertedBy={record.revertedBy}
        parentRecord={record}
        onChangeBatchHistory={setNewBatchHistory}
        batchType={EDITABLE_STAT_IDS.bid}
        currenciesConfigs={currenciesConfigs}
      />
    );
  };

  const onExpand = (expanded, record) => {
    if (!expanded || !record.histories?.length) return;

    const activedIdx = listData.findIndex((el) => el.id === record.id);
    if (activedIdx !== -1 && !filters[activedIdx]) {
      setFilters({ ...filters, [activedIdx]: defaultDetailFilters });
    }
  };

  const pagination = {
    pageSize: tableFilters?.size,
    current: tableFilters?.page + 1,
    total,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
  };

  return (
    <Table
      className="mt-6"
      loading={isLoading || isLoadingTable}
      rowKey={(record) => record.id}
      columns={columns}
      dataSource={[...listData]}
      scroll={{ x: 600 }}
      expandable={{
        expandedRowRender,
        rowExpandable: () => true,
        onExpand,
      }}
      pagination={pagination}
      onChange={onChange}
    />
  );
}

HistoryTable.propTypes = {
  isLoading: PropTypes.bool,
  listData: PropTypes.array,
  tableFilters: PropTypes.object,
  onChange: PropTypes.func,
  updateTableData: PropTypes.func,
  total: PropTypes.number,
};

export default HistoryTable;
