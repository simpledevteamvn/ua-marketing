import React, { useEffect, useState } from "react";
import Table from "antd/lib/table/Table";
import {
  capitalizeWord,
  sortByString,
  sortNumberWithNullable,
} from "../../../../../utils/Helpers";
import searchMaxMinValue from "../../../../../partials/common/Table/SearchMaxMinValue";
import getColumnSearchProps from "../../../../../partials/common/Table/CustomSearch";
import {
  checkContainText,
  checkRangeValue,
  setRangeValue,
} from "../../../../../utils/helper/TableHelpers";
import { EDITABLE_STAT_IDS } from "../../../../../constants/constants";
import EditNumberCell from "../../../../../partials/common/Table/EditNumberCell";
import { NO_BIDDING } from "../../../../../constants/tooltip";
import ModalEditMultiple from "../../../CampaignCenter/CampaignIntel/ModalEditMultiple";
import service from "../../../../../partials/services/axios.config";
import { toast } from "react-toastify";
import { PerformanceColumns } from "../../../../../partials/common/Table/Columns/PerformanceCols";

function KeywordTable({
  data,
  recordIdx,
  tableFilters,
  onChange,
  network,
  currenciesConfigs,
  setIsLoading,
  updateKeyword,
}) {
  const defaultCellData = { editedField: "", crrValue: null, cellData: {} };
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [editedData, setEditedData] = useState(defaultCellData);
  const [listKeywords, setListKeywords] = useState([]);

  const [filterByMaxMin, setFilterByMaxMin] = useState<any>({});
  const [searchData, setSearchData] = useState<any>({});

  useEffect(() => {
    const sortedData = data;
    sortedData.sort((a, b) =>
      sortNumberWithNullable(b, a, (el) => el.data?.cost)
    );
    setListKeywords(sortedData);
  }, [data]);

  const onFilterTable = (data) => {
    setRangeValue(data, filterByMaxMin, setFilterByMaxMin);
  };

  const onSearchTable = (value, field) => {
    setSearchData({ ...searchData, [field]: value });
  };

  const onEdit = (rd, editedField = EDITABLE_STAT_IDS.bid, currentData) => {
    if (!rd.keyword) return;

    const { bid, budget } = rd.keyword;

    if (editedField === EDITABLE_STAT_IDS.bid && bid) {
      setEditedData({
        editedField,
        crrValue: bid.bid,
        cellData: bid,
      });
      setIsOpenEdit(true);
    }

    // Level Keyword không có budget

    // if (editedField === EDITABLE_STAT_IDS.budget && budget) {
    //   setEditedData({
    //     editedField,
    //     crrValue: budget.dailyBudget,
    //     cellData: budget,
    //   });
    //   setIsOpenEdit(true);
    // }
  };

  const customEditSingle = (params, urlStr, callback) => {
    setIsLoading(true);
    service.put(urlStr, params).then(
      (res: any) => updateEditAction(res, callback),
      () => setIsLoading(false)
    );
  };

  const updateEditAction = (res, callback) => {
    res.message && toast(res.message, { type: "success" });
    updateKeyword(res.results);
    setIsLoading(false);
    callback && callback();
  };

  const onCloseEditModal = () => {
    setEditedData(defaultCellData);
    setIsOpenEdit(false);
  };

  const columns = [
    {
      title: "Keyword",
      width: 190,
      render: (rd) => (
        <div className="flex justify-between items-center truncate">
          <span title={rd.text}>{rd.text}</span>
          {rd.status === "ACTIVE" && <div className="actived-dot" />}
        </div>
      ),
      sorter: sortByString("text"),
      ...getColumnSearchProps({
        dataIndex: "keyword",
        getField: (el) => el.text,
        callback: (value) => onSearchTable(value, "text"),
        customFilter: () => true,
      }),
    },
    {
      title: "Match type",
      width: 130,
      sorter: sortByString("matchType"),
      render: (rd) => capitalizeWord(rd.matchType),
      ...getColumnSearchProps({
        getField: (el) => el.matchType,
        callback: (value) => onSearchTable(value, "matchType"),
        customFilter: () => true,
      }),
    },
    {
      title: "Bid",
      width: 100,
      // render: (rd) => rd.bid?.bid,
      render: (rd) => {
        // Fake record theo trang cũ (Campaign Management) để dùng EditNumberCell component
        const record = { network, keyword: rd };
        return (
          <EditNumberCell
            record={record}
            fieldName={EDITABLE_STAT_IDS.bid}
            NATooltip={NO_BIDDING}
            historyField="bidHistory"
            onEditCell={onEdit}
            // Level Keyword và SiteId hiện tại (22/5/2023) chưa có type đặc biệt
            // Level Keyword không có budget
            // onEditSpecifyBid={onEditSpecifyBid}
            currenciesConfigs={currenciesConfigs}
          />
        );
      },
      ...searchMaxMinValue({
        dataIndex: "bid",
        placeholderSuffix: " ",
        getField: (el) => el.bid?.bid,
        onFilterTable,
      }),
      sorter: (a, b) => sortNumberWithNullable(a, b, (el) => el.bid?.bid),
    },
    ...PerformanceColumns({ onFilterTable }),
  ];

  const filteredData = listKeywords.filter((el) => {
    let result = true;

    const isContainText = checkContainText(searchData, el);
    const checkValue = checkRangeValue(filterByMaxMin, el);

    if (!isContainText || !checkValue) {
      result = false;
    }

    return result;
  });

  const id = recordIdx + "detail-adgroup";
  const pagination = {
    pageSize: tableFilters?.size,
    current: tableFilters?.page + 1,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
  };

  return (
    <>
      <Table
        id={id}
        size="middle"
        getPopupContainer={() => document.getElementById(id)!}
        // @ts-ignore
        columns={columns}
        dataSource={filteredData}
        scroll={{ x: 600 }}
        rowKey={(record) => record.rawTargetingKeywordId}
        onChange={(pagination, filters, sorter, extra) =>
          onChange(recordIdx, pagination)
        }
        pagination={pagination}
      />

      <ModalEditMultiple
        formId="formEditKeyword"
        isOpen={isOpenEdit}
        onClose={onCloseEditModal}
        editedCellData={editedData}
        customEditSingle={customEditSingle}
        currenciesConfigs={currenciesConfigs}
      />
    </>
  );
}

export default KeywordTable;
