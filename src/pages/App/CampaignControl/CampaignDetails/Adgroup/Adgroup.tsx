import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { sortNumberWithNullable } from "../../../../../utils/Helpers";
import KeywordTable from "./KeywordTable";
import {
  checkContainText,
  checkRangeValue,
  setRangeValue,
} from "../../../../../utils/helper/TableHelpers";
import { EDITABLE_STAT_IDS } from "../../../../../constants/constants";
import ModalEditMultiple from "../../../CampaignCenter/CampaignIntel/ModalEditMultiple";
import service from "../../../../../partials/services/axios.config";
import { toast } from "react-toastify";
import ModalEdit from "../../../CampaignCenter/CampaignIntel/ModalEdit";
import {
  SortData,
  SortMap,
} from "../../../../../partials/common/Table/interface";
import {
  getSortedData,
  onChangeInfiniteTable,
  sortByString,
} from "../../../../../partials/common/Table/Helper";
import InfiniteScrollTable from "../../../../../utils/hooks/InfiniteScrollTable";
import { getColumns } from "./AdGroupColumns";
import TableWrapper from "../../../../../partials/common/Table/TableWrapper";
import { performanceSortMap } from "../../../../../partials/common/Table/Columns/PerformanceCols";
import ModalEditCountries from "./ModalEditCountries";

function Adgroup(props) {
  const {
    listData,
    campaignData,
    currenciesConfigs,
    setIsLoading,
    setAdgroup,
  } = props;

  const [expandedKeys, setExpandedKeys] = useState<any[]>([]);
  const defaultDetailFilters = {
    page: 0,
    size: 5,
  };
  const [filters, setFilters] = useState<any>({});
  const [filterByMaxMin, setFilterByMaxMin] = useState<any>({});
  const [searchData, setSearchData] = useState<any>({});

  const defaultCellData = { editedField: "", crrValue: null, cellData: {} };
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [editedData, setEditedData] = useState(defaultCellData);

  // Edit special bid (Roas, Retension)
  const [isOpenEditModal, setIsOpenEditModal] = useState(false);
  const [editedBid, setEditedBid] = useState<any>({});

  const PAGE_SIZE = 20;
  const [tablePage, setTablePage] = useState(0);
  const [sortData, setSortData] = useState<SortData>({});
  const [columns, setColumns] = useState(getColumns({}));
  const [isEditCountries, setIsEditCountries] = useState(false);
  const [editedCountries, setEditedCountries] = useState([]);

  const { network } = campaignData;

  const onClickName = (rd) => {
    const isExpanded = expandedKeys.includes(rd.id);
    onExpand(!isExpanded, rd);
  };

  const onFilterTable = (data) => {
    setRangeValue(data, filterByMaxMin, setFilterByMaxMin);
  };

  const onSearchTable = (value, field) => {
    setSearchData({ ...searchData, [field]: value });
  };

  const onConfirmUpdateFailure = (dataObj, field) => {
    setIsLoading(true);
    service.put(`/${field}/status/disable`, dataObj).then(
      (res: any) => {
        setIsLoading(false);
        const updatedData = res.results;

        if (!updatedData) return;
        const newData = listData.map((el) =>
          el.bid.rawAdGroupId === updatedData.rawAdGroupId
            ? { ...el, bid: updatedData }
            : el
        );
        setAdgroup(newData);
      },
      () => setIsLoading(false)
    );
  };

  const sortMap: SortMap[] = [
    {
      title: "Name",
      sorter: (a, b) => sortByString(a, b, "name"),
    },
    {
      title: "Bid",
      sorter: (a, b) => sortNumberWithNullable(a, b, (el) => el.bid?.bid),
    },
    {
      title: "Daily budget",
      sorter: (a, b) =>
        sortNumberWithNullable(a, b, (el) => el.budget?.dailyBudget),
    },
    {
      title: "Bid Type",
      sorter: (a, b) => sortByString(a, b, "bidType"),
    },
    ...performanceSortMap,
  ];

  useEffect(() => {
    setColumns(
      getColumns({
        onSearchTable,
        onFilterTable,
        onClickName,
        currenciesConfigs,
        network,
        onEdit,
        onConfirmUpdateFailure,
        onEditSpecifyBid,
        setAdgroup,
        setIsLoading,
        editCountries,
      })
    );
  }, [listData, expandedKeys]);

  const editCountries = (rd) => {
    setIsEditCountries(true);
    setEditedCountries(rd);
  };

  const updateCountry = (resData) => {
    setAdgroup(listData.map((el) => (el.id === resData.id ? resData : el)));
  };

  const customEditSingle = (params, urlStr, callback) => {
    setIsLoading(true);
    service.put(urlStr, params).then(
      (res: any) => updateEditAction(res, callback),
      () => setIsLoading(false)
    );
  };

  const onEditSpecifyBid = (bidObj, record) => {
    setEditedBid(bidObj || {});
    setIsOpenEditModal(true);
  };

  const onSubmitEditSpecifyBid = (params, callback) => {
    setIsLoading(true);
    service.put("/bid", params).then(
      (res: any) => updateEditAction(res, callback),
      () => {
        setIsLoading(false);
      }
    );
  };

  const updateEditAction = (res, callback) => {
    res.message && toast(res.message, { type: "success" });

    const newData = listData.map((el) => {
      if (el.bid?.rawAdGroupId === res.results?.rawAdGroupId) {
        return { ...el, bid: res.results };
      }
      return el;
    });
    setAdgroup(newData);
    setIsLoading(false);
    callback && callback();
  };

  const onEdit = (rd, editedField = EDITABLE_STAT_IDS.bid, currentData) => {
    if (!rd.adGroup) return;

    const { bid, budget } = rd.adGroup;

    if (editedField === EDITABLE_STAT_IDS.bid && bid) {
      setEditedData({
        editedField,
        crrValue: bid.bid,
        cellData: bid,
      });
      setIsOpenEdit(true);
    }

    if (editedField === EDITABLE_STAT_IDS.budget && budget) {
      setEditedData({
        editedField,
        crrValue: budget.dailyBudget,
        cellData: budget,
      });
      setIsOpenEdit(true);
    }
  };

  const onDelete = (rd) => {
    console.log("rd :>> ", rd);
  };

  const onCloseEditModal = () => {
    setEditedData(defaultCellData);
    setIsOpenEdit(false);
  };

  const onChangeDetail = (recordIdx, pagination) => {
    const { pageSize, current } = pagination;
    setFilters({
      ...filters,
      [recordIdx]: { size: pageSize, page: current - 1 },
    });
  };

  const updateKeyword = (resData, idx) => {
    const newData = [...listData];
    const newKeywords = newData[idx].targetingKeywords?.map((el) =>
      el.bid?.rawTargetingKeywordId === resData?.rawTargetingKeywordId
        ? { ...el, bid: resData }
        : el
    );
    newData[idx].targetingKeywords = newKeywords;

    setAdgroup(newData);
  };

  const expandedRowRender = (record, idx, indent, expanded) => {
    const keywordData = record.targetingKeywords;
    if (!expanded || !keywordData?.length) return <></>;

    return (
      <KeywordTable
        updateKeyword={(resData) => updateKeyword(resData, idx)}
        network={network}
        recordIdx={idx}
        tableFilters={filters[idx] || defaultDetailFilters}
        onChange={onChangeDetail}
        data={keywordData}
        currenciesConfigs={currenciesConfigs}
        setIsLoading={setIsLoading}
      />
    );
  };

  const onExpand = (expanded, record) => {
    if (expanded) {
      setExpandedKeys([...expandedKeys, record.id]);
    } else {
      const newKeys = expandedKeys.filter((el) => el !== record.id);
      setExpandedKeys(newKeys);
    }

    const activedIdx = listData.findIndex((el) => el.id === record.id);
    if (activedIdx !== -1 && !filters[activedIdx]) {
      setFilters({ ...filters, [activedIdx]: defaultDetailFilters });
    }
  };

  const sortedData = getSortedData(listData, sortData);
  const filteredData = sortedData.filter((el) => {
    let result = true;

    const isContainText = checkContainText(searchData, el);
    const checkValue = checkRangeValue(filterByMaxMin, el);

    if (!isContainText || !checkValue) {
      result = false;
    }

    return result;
  });

  InfiniteScrollTable({
    listData,
    setTablePage,
    tablePage,
    filteredData,
    PAGE_SIZE,
    tableId: "CampaignAdgroup",
  });

  const paginationedData = filteredData.slice(0, PAGE_SIZE * (tablePage + 1));
  const isScrollY = filteredData && filteredData.length > 10;

  return (
    <>
      <div className="page-section-multi">
        <div className="text-black font-semibold text-lg mb-2">
          Ad Groups
          {filteredData?.length > 0 && (
            <span className="ml-1">({filteredData?.length})</span>
          )}
        </div>
        <TableWrapper
          setColumns={setColumns}
          initialColumns={columns}
          isShowSummary={false}
          isShowSettings={false}
          id="CampaignAdgroup"
          rowKey={(record) => record.id}
          dataSource={paginationedData}
          scroll={{ x: 1800, y: isScrollY ? 325 : undefined }}
          expandable={{
            expandedRowKeys: [...expandedKeys],
            expandedRowRender,
            rowExpandable: (rd) => !!rd.targetingKeywords?.length,
            onExpand,
          }}
          pagination={false}
          onChange={(p, f, s, e) =>
            onChangeInfiniteTable(p, f, s, e, sortMap, setSortData)
          }
        />

        <ModalEdit
          // CountryBid cũng có modal này nên cần thay formId
          formId="formAdgroupEditSpecifyBid"
          isOpen={isOpenEditModal}
          editedBid={editedBid}
          onClose={() => setIsOpenEditModal(false)}
          onSubmitEdit={onSubmitEditSpecifyBid}
          networkCode={network?.code}
        />

        <ModalEditMultiple
          isOpen={isOpenEdit}
          onClose={onCloseEditModal}
          editedCellData={editedData}
          customEditSingle={customEditSingle}
          currenciesConfigs={currenciesConfigs}
        />

        <ModalEditCountries
          isOpen={isEditCountries}
          onClose={() => setIsEditCountries(false)}
          initedData={editedCountries}
          setIsLoading={setIsLoading}
          callback={updateCountry}
        />
      </div>
    </>
  );
}

Adgroup.propTypes = {
  listData: PropTypes.array,
  currenciesConfigs: PropTypes.array,
  campaignData: PropTypes.object,
  setIsLoading: PropTypes.func,
  setAdgroup: PropTypes.func,
};

export default Adgroup;
