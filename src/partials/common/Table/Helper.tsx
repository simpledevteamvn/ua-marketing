import SearchOutlined from "@ant-design/icons/lib/icons/SearchOutlined";
import { AiOutlineEdit } from "@react-icons/all-files/ai/AiOutlineEdit";
import Tooltip from "antd/lib/tooltip";
import classNames from "classnames";
import moment from "moment";
import React from "react";
import {
  capitalizeWord,
  checkNumberValue,
  getCountryNameFromCode,
} from "../../../utils/Helpers";
import { SortData, SortMap } from "./interface";
import { ASCEND, DESCEND } from "../../../constants/constants";

export const getRowSelection = (
  selectedRecords,
  setSelectedRecords,
  listData,
  fieldId = "id"
) => {
  return {
    selectedRowKeys: selectedRecords,
    onSelect: (record, selected, selectedRows, nativeEvent) => {
      let newListIds: any = [...selectedRecords];

      if (selected) {
        newListIds.push(record[fieldId]);
      } else {
        newListIds = newListIds.filter((el) => el !== record[fieldId]);
      }
      setSelectedRecords(newListIds);
    },
    onSelectAll: (selected, selectedRows, changeRows) => {
      let listIds = [];
      if (selected) {
        listIds = listData.map((el) => el[fieldId]);
      }
      setSelectedRecords(listIds);
    },
  };
};

export function SpecifyBidCell(props) {
  const { bidData, onClick, type, field1, field2, fieldName1, fieldName2 } =
    props;
  const editIconClass =
    "text-antPrimary/80 hover:text-antPrimary cursor-pointer flex-shrink-0 ml-2";

  return (
    <div className="flex items-center justify-between">
      <div className="text-xs2">
        {checkNumberValue(bidData?.[field1]) && (
          <div>
            <span>{fieldName1 || capitalizeWord(field1)}:</span>
            <span className="ml-1">{bidData?.[field1]}</span>
          </div>
        )}

        {checkNumberValue(bidData?.[field2]) && (
          <div>
            <span className="">{fieldName2 || capitalizeWord(field2)}:</span>
            <span className="ml-1">{bidData?.[field2]}</span>
          </div>
        )}
      </div>

      {onClick && (
        <Tooltip title={`Edit ${capitalizeWord(type)} bid`}>
          <AiOutlineEdit
            size={16}
            className={editIconClass}
            onClick={onClick}
          />
        </Tooltip>
      )}
    </div>
  );
}

export const filterIcon = (filtered) => (
  <SearchOutlined
    className={classNames("text-lg mt-px", filtered && "text-antPrimary")}
  />
);

export const getDateCol = (record) => (
  <div className="whitespace-nowrap md:whitespace-normal">
    {moment(record?.createdDate)?.format("DD-MM-YYYY HH:mm:ss")}
  </div>
);

export const getSortedData = (listData, sortData: SortData) => {
  const sortedData = [...listData];

  if (sortData?.sorter) {
    if (sortData.sortType === ASCEND) {
      sortedData.sort((a, b) => sortData.sorter(a, b));
    }
    if (sortData.sortType === DESCEND) {
      sortedData.sort((a, b) => sortData.sorter(b, a));
    }
  }

  return sortedData;
};

export const keepSortColumn = (a, b, sortOrder) =>
  sortOrder === ASCEND ? 1 : -1;

/**
 * List handle functions for infinite scroll table
 */
export const onChangeInfiniteTable = (
  pagination,
  filters,
  sorter,
  extra,
  sortMap: SortMap[],
  setSortData
) => {
  if (!sorter?.column?.title) {
    return setSortData({});
  }
  const activedSort = sortMap.find(
    (el: any) => el.title === sorter?.column?.title
  );

  if (!activedSort) return;
  setSortData({
    sortType: sorter.order,
    sorter: activedSort?.sorter,
  });
};

export function sortByString(a, b, attr) {
  if (!attr) {
    return 1; // keep position of current data
  }

  // https://stackoverflow.com/questions/51165/how-to-sort-strings-in-javascript
  return ("" + a[attr]).localeCompare(b[attr]);
}

export const sortByCountry = (a, b) => {
  const aData = getCountryNameFromCode(a.country);
  const bData = getCountryNameFromCode(b.country);

  return ("" + aData).localeCompare(bData);
};

/**
 * End: infinite scroll table
 */
