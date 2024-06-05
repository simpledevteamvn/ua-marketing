import React, { useState } from "react";
import {
  getCountryEl,
  sortNumberWithNullable,
} from "../../../../../utils/Helpers";
import getColumnSearchProps from "../../../../../partials/common/Table/CustomSearch";
import {
  checkContainText,
  checkRangeValue,
  setRangeValue,
} from "../../../../../utils/helper/TableHelpers";
import { BidColumn } from "../../Helper";
import Table from "antd/lib/table";
import classNames from "classnames";
import { ID_COL } from "../../../../../partials/common/Table/Columns/IndexCol";
import {
  SortData,
  SortMap,
} from "../../../../../partials/common/Table/interface";
import {
  getSortedData,
  keepSortColumn,
  onChangeInfiniteTable,
  sortByCountry,
  sortByString,
} from "../../../../../partials/common/Table/Helper";
import InfiniteScrollTable from "../../../../../utils/hooks/InfiniteScrollTable";

function SourceBids({ sourceBids, currenciesConfigs, campaignData }) {
  const [searchData, setSearchData] = useState<any>({});
  const [filterByMaxMin, setFilterByMaxMin] = useState<any>({});

  const PAGE_SIZE = 20;
  const [tablePage, setTablePage] = useState(0);
  const [sortData, setSortData] = useState<SortData>({});

  const onSearchTable = (value, field) => {
    setSearchData({ ...searchData, [field]: value });
  };

  const onFilterTable = (data) => {
    setRangeValue(data, filterByMaxMin, setFilterByMaxMin);
  };

  const sortMap: SortMap[] = [
    {
      title: "Country",
      sorter: (a, b) => sortByCountry(a, b),
    },
    {
      title: "Source app id",
      sorter: (a, b) => sortByString(a, b, "sourceAppId"),
    },
    {
      title: "Bid",
      sorter: (a, b) => sortNumberWithNullable(a, b, (el) => el.bid),
    },
  ];

  const columns = [
    ID_COL,
    {
      title: "Country",
      render: getCountryEl,
      sorter: keepSortColumn,
      ...getColumnSearchProps({
        dataIndex: "country",
        callback: (value) => onSearchTable(value, "country"),
        customFilter: () => true,
      }),
    },
    {
      title: "Source app id",
      dataIndex: "sourceAppId",
      sorter: keepSortColumn,
      ...getColumnSearchProps({
        dataIndex: "",
        getField: (el) => el.sourceAppId,
        callback: (value) => onSearchTable(value, "sourceAppId"),
        customFilter: () => true,
      }),
    },
    // bidAccess của siteId luôn bằng true
    // Ref: EditNumberCell.tsx -> getBidData function
    BidColumn(
      onFilterTable,
      currenciesConfigs,
      campaignData,
      true,
      keepSortColumn
    ),
    {
      title: "Type",
      render: (rd) => rd.type,
    },
  ];

  const sortedData = getSortedData(sourceBids, sortData);
  const filteredData = sortedData.filter((el) => {
    let result = true;

    const isContainText = checkContainText(searchData, el, true);
    const checkValue = checkRangeValue(filterByMaxMin, el);

    if (!isContainText || !checkValue) {
      result = false;
    }

    return result;
  });

  InfiniteScrollTable({
    listData: sourceBids,
    setTablePage,
    tablePage,
    filteredData,
    PAGE_SIZE,
    tableId: "CampaignSourceBid",
  });

  const paginationedData = filteredData.slice(0, PAGE_SIZE * (tablePage + 1));
  const isScrollY = filteredData && filteredData.length > 10;

  return (
    <div className="page-section-multi mt-6">
      <div className="flex justify-between">
        <div className="text-black font-semibold text-lg">
          Sources & Bids
          {filteredData?.length > 0 && (
            <span className="ml-1">({filteredData?.length})</span>
          )}
        </div>
      </div>
      <Table
        id="CampaignSourceBid"
        className={classNames("mt-3", isScrollY && "custom-mask")}
        size="middle"
        rowKey={(record: any) => record.id}
        // @ts-ignore
        columns={columns}
        dataSource={paginationedData}
        scroll={{ x: 600, y: isScrollY ? 325 : undefined }}
        pagination={false}
        onChange={(p, f, s, e) =>
          onChangeInfiniteTable(p, f, s, e, sortMap, setSortData)
        }
      />
    </div>
  );
}

export default SourceBids;
