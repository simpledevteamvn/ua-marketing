import React, { useState } from "react";
import PropTypes from "prop-types";
import Table from "antd/lib/table/Table";
import {
  getCountryEl,
  getCountryNameFromCode,
  sortByString,
} from "../../../utils/Helpers";
import { FullyStatusCol } from "../../../partials/common/Table/Columns/StatusCol";
import searchMaxMinValue from "../../../partials/common/Table/SearchMaxMinValue";
import getColumnSearchProps from "../../../partials/common/Table/CustomSearch";
import {
  checkContainText,
  checkRangeValue,
  setRangeValue,
} from "../../../utils/helper/TableHelpers";
import service from "../../../partials/services/axios.config";
import { toast } from "react-toastify";
import { ActionColumn } from "../../App/CampaignCenter/BatchHistory/DetailHistory";
import ModalEditMultiple from "../../App/CampaignCenter/CampaignIntel/ModalEditMultiple";

function DetailHistory(props) {
  const defaultCellData = { editedField: "", crrValue: null, cellData: {} };
  const {
    recordIdx,
    data,
    tableFilters,
    onChange,
    revertedBy,
    onChangeBatchHistory,
    batchType,
    parentRecord,
    currenciesConfigs,
  } = props;
  const id = recordIdx + "detail-csv-history";

  const [isLoading, setIsLoading] = useState(false);
  const [filterByMaxMin, setFilterByMaxMin] = useState<any>({});
  const [searchData, setSearchData] = useState<any>({});

  const [editedBid, setEditedBid] = useState(defaultCellData);
  const [isOpenEdit, setIsOpenEdit] = useState(false); // Case normal
  const [editedRecord, setEditedRecord] = useState<any>({});

  const onFilterTable = (data) => {
    setRangeValue(data, filterByMaxMin, setFilterByMaxMin);
  };

  const onSearchTable = (value, field) => {
    setSearchData({ ...searchData, [field]: value });
  };

  const onCloseEditModal = () => {
    setEditedBid(defaultCellData);
    setIsOpenEdit(false);
  };

  // Logic hiện tại: khi update batch/multiple thì khi có record lỗi thì các record ko lỗi vẫn được update bình thường.
  // Còn các data bị lỗi có thể dùng ModalEditMultiple sửa lại bid và dùng hàm customEditSingle này để update lại
  const customEditSingle = (params, urlStr, callback) => {
    callback && callback();
    const customParams = {
      fileHistoryId: parentRecord.id,
      targetHistoryId: editedRecord.id,
      bidValue: params.bid,
    };

    setIsLoading(true);
    service
      .put("/bid/file/update-failure", null, { params: customParams })
      .then(
        (res: any) => {
          res.message && toast(res.message, { type: "success" });
          onChangeBatchHistory(parentRecord.id, res.results);
          setIsLoading(false);
        },
        () => setIsLoading(false)
      );
  };

  const revertBatch = (record) => {
    setIsLoading(true);
    const params = {
      fileHistoryId: parentRecord?.id,
      targetHistoryId: record.id,
    };
    service.put("/bid/file/revert-target", null, { params: params }).then(
      (res: any) => {
        onChangeBatchHistory(parentRecord.id, res.results);
        toast(res.message, { type: "success" });
        setIsLoading(false);
      },
      () => setIsLoading(false)
    );
  };

  const onEdit = (record) => {
    setEditedBid({
      editedField: batchType,
      crrValue: record.previousValue,
      cellData: record,
    });
    setIsOpenEdit(true);
    setEditedRecord(record);
  };

  const columns = [
    {
      title: "Network",
      dataIndex: "network",
      sorter: sortByString("network"),
      ...getColumnSearchProps({
        getField: (el) => el.network,
        callback: (value) => onSearchTable(value, "network"),
        customFilter: () => true,
      }),
    },
    {
      title: "App Name",
      dataIndex: "appName",
      sorter: sortByString("appName"),
      ...getColumnSearchProps({
        getField: (el) => el.appName,
        callback: (value) => onSearchTable(value, "appName"),
        customFilter: () => true,
      }),
    },
    {
      title: "Campaign Name",
      dataIndex: "campaignName",
      sorter: sortByString("campaignName"),
      ...getColumnSearchProps({
        getField: (el) => el.campaignName,
        callback: (value) => onSearchTable(value, "campaignName"),
        customFilter: () => true,
      }),
    },
    {
      title: "Ad Group",
      dataIndex: "adGroup",
      sorter: sortByString("adGroup"),
      ...getColumnSearchProps({
        getField: (el) => el.adGroup,
        callback: (value) => onSearchTable(value, "adGroup"),
        customFilter: () => true,
      }),
    },
    {
      title: "Country",
      render: getCountryEl,
      ...getColumnSearchProps({
        dataIndex: "code",
        getField: (el) => el.country,
        callback: (value) => onSearchTable(value, "country"),
        customFilter: () => true,
      }),
      sorter: (el1, el2) => {
        const name1 = getCountryNameFromCode(el1.country);
        const name2 = getCountryNameFromCode(el2.country);

        return ("" + name1).localeCompare(name2);
      },
    },
    {
      title: "Keyword",
      dataIndex: "keyword",
      sorter: sortByString("keyword"),
      ...getColumnSearchProps({
        getField: (el) => el.keyword,
        callback: (value) => onSearchTable(value, "keyword"),
        customFilter: () => true,
      }),
    },
    {
      title: "From",
      ...searchMaxMinValue({
        dataIndex: "previousValue",
        placeholderSuffix: " ",
        onFilterTable,
      }),
      render: (record) => {
        const { previousValue } = record;
        if (previousValue || previousValue === 0) {
          return "$" + previousValue;
        }
        return previousValue;
      },
      sorter: (a, b) => a.previousValue - b.previousValue,
    },
    {
      title: "To",
      ...searchMaxMinValue({
        dataIndex: "value",
        placeholderSuffix: " ",
        onFilterTable,
      }),
      render: (record) => "$" + record.value,
      sorter: (a, b) => a.value - b.value,
    },
    FullyStatusCol,
    ActionColumn(revertedBy, revertBatch, onEdit),
  ];

  const filteredData = data.filter((el) => {
    let result = true;

    const isContainText = checkContainText(searchData, el);
    const checkValue = checkRangeValue(filterByMaxMin, el);

    if (!isContainText || !checkValue) {
      result = false;
    }

    return result;
  });

  const pagination = {
    pageSize: tableFilters?.size,
    current: tableFilters?.page + 1,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
  };

  return (
    <>
      <Table
        id={id}
        loading={isLoading}
        getPopupContainer={() => document.getElementById(id)!}
        rowKey={(record: any) => record.tableId || record.id}
        // @ts-ignore
        columns={columns}
        dataSource={filteredData}
        pagination={pagination}
        onChange={(pagination, filters, sorter, extra) =>
          onChange(recordIdx, pagination)
        }
      />

      <ModalEditMultiple
        isOpen={isOpenEdit}
        onClose={onCloseEditModal}
        editedCellData={editedBid}
        customEditSingle={customEditSingle}
        currenciesConfigs={currenciesConfigs}
      />
    </>
  );
}

DetailHistory.propTypes = {
  recordIdx: PropTypes.number,
  data: PropTypes.array,
  tableFilters: PropTypes.object,
  onChange: PropTypes.func,
  revertedBy: PropTypes.string,
  parentRecord: PropTypes.object,
  batchType: PropTypes.string,
  onChangeBatchHistory: PropTypes.func,
  currenciesConfigs: PropTypes.array,
};

export default DetailHistory;
