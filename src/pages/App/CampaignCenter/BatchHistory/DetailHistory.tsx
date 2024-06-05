import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Table from "antd/lib/table/Table";
import {
  getCountryEl,
  getCountryNameFromCode,
  sortByString,
} from "../../../../utils/Helpers";
import StatusCol from "../../../../partials/common/Table/Columns/StatusCol";
import searchMaxMinValue from "../../../../partials/common/Table/SearchMaxMinValue";
import getColumnSearchProps from "../../../../partials/common/Table/CustomSearch";
import { FromCol, ToCol } from "../../../../utils/helper/UIHelper";
import {
  checkContainText,
  checkRangeValue,
  setRangeValue,
} from "../../../../utils/helper/TableHelpers";
import { Popconfirm } from "antd";
import ModalEditMultiple from "../CampaignIntel/ModalEditMultiple";
import service from "../../../../partials/services/axios.config";
import { toast } from "react-toastify";

function DetailHistory(props) {
  const {
    data,
    recordIdx,
    tableFilters,
    onChange,
    onChangeBatchHistory,
    currenciesConfigs,
    setIsLoading,
    batchType,
    revertedBy,
    batchHistoryId,
  } = props;
  const id = recordIdx + "detail-batch-history";

  const defaultCellData = { editedField: "", crrValue: null, cellData: {} };
  const [editedBid, setEditedBid] = useState(defaultCellData);
  const [isOpenEdit, setIsOpenEdit] = useState(false); // Case nomal
  const [editedRecord, setEditedRecord] = useState<any>({});

  const [filterByMaxMin, setFilterByMaxMin] = useState<any>({});
  const [searchData, setSearchData] = useState<any>({});

  const tableStyle = {
    marginTop: "-17px",
    marginLeft: "33px",
    marginBottom: "-18px",
  };

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

  const onEdit = (record) => {
    setEditedBid({
      editedField: batchType,
      crrValue: record.previousValue,
      cellData: record,
    });
    setIsOpenEdit(true);
    setEditedRecord(record);
  };

  const customEditSingle = (params, urlStr, callback) => {
    callback && callback();
    setIsLoading(true);
    const customParams = {
      batchHistoryId: batchHistoryId,
      targetHistoryId: editedRecord.id,
      bidValue: params.bid,
    };
    service.put("/bid/update-failure", null, { params: customParams }).then(
      (res: any) => updateEditAction(res),
      () => setIsLoading(false)
    );
  };

  const updateEditAction = (res) => {
    res.message && toast(res.message, { type: "success" });
    onChangeBatchHistory(batchHistoryId, res.results);
    setIsLoading(false);
  };

  const revertBatch = (record) => {
    setIsLoading(true);
    const params = {
      batchHistoryId: batchHistoryId,
      targetHistoryId: record.id,
    };
    service.put("/bid/revert-target", null, { params: params }).then(
      (res: any) => {
        onChangeBatchHistory(batchHistoryId, res.results);
        toast(res.message, { type: "success" });
        setIsLoading(false);
      },
      () => setIsLoading(false)
    );
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
      width: 242,
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
      width: 350,
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
      width: 220,
    },
    {
      ...FromCol(currenciesConfigs),
      ...searchMaxMinValue({
        dataIndex: "previousValue",
        placeholderSuffix: " ",
        onFilterTable,
      }),
      sorter: (a, b) => a.previousValue - b.previousValue,
      width: 140,
    },
    {
      ...ToCol(currenciesConfigs),
      ...searchMaxMinValue({
        dataIndex: "value",
        placeholderSuffix: " ",
        onFilterTable,
      }),
      sorter: (a, b) => a.value - b.value,
      width: 135,
    },
    {
      ...StatusCol,
      width: 135,
    },
    ActionColumn(revertedBy, revertBatch, onEdit),
  ];

  const filteredData = data?.filter((el) => {
    let result = true;

    const isContainText = checkContainText(searchData, el);
    const checkValue = checkRangeValue(filterByMaxMin, el);

    if (!isContainText || !checkValue) {
      result = false;
    }

    return result;
  });

  return (
    <>
      <Table
        id={id}
        getPopupContainer={() => document.getElementById(id)!}
        rowKey={(record: any) =>
          record.network + record.campaignName + record.country
        }
        // @ts-ignore
        columns={columns}
        dataSource={filteredData}
        pagination={{
          pageSize: tableFilters?.size,
          current: tableFilters?.page + 1,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
        }}
        onChange={(pagination, filters, sorter, extra) =>
          onChange(recordIdx, pagination)
        }
        style={tableStyle}
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
  currenciesConfigs: PropTypes.array,
  tableFilters: PropTypes.object,
  onChange: PropTypes.func,
  onChangeBatchHistory: PropTypes.func,
  setIsLoading: PropTypes.func,
  batchType: PropTypes.string,
  revertedBy: PropTypes.string,
  batchHistoryId: PropTypes.string,
};

export default DetailHistory;

export const ActionColumn = (revertedBy, onRevert, onEdit) => ({
  title: "Action",
  render: (record) => {
    if (record.type === "budget") return "";
    if (revertedBy) {
      if (record.revertedBy && record.revertedBy !== revertedBy) {
        return "Reverted by " + record.revertedBy;
      }
      return "Reverted";
    }
    if (record.revertedBy) return "Reverted by " + record.revertedBy;

    const isSuccess = () => {
      return record.status === "Success";
    };

    return isSuccess() ? (
      <Popconfirm
        placement="left"
        title="Are you sure to revert this action?"
        onConfirm={() => onRevert(record)}
        okText="Yes"
        cancelText="No"
      >
        <button className="btn-info btn-sm whitespace-nowrap">Revert</button>
      </Popconfirm>
    ) : (
      <button
        onClick={() => onEdit(record)}
        style={{ width: "59.77px" }}
        className="btn-info btn-sm whitespace-nowrap"
      >
        Edit
      </button>
    );
  },
});
