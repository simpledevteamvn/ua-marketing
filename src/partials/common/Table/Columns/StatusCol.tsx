import React from "react";
import { filterColumn, sortByString } from "../../../../utils/Helpers";
import classNames from "classnames";
import { STATUS_FILTER } from "../../../../constants/tableFilter";
import { filterIcon } from "../Helper";

const renderStatus = (record) => {
  const { status } = record;

  return (
    <div
      className={classNames(
        status === "Failure" && "text-red-400",
        status === "Warning" && "text-yellow-500",
        status === "Success" && "text-green-500"
      )}
    >
      {status}
    </div>
  );
};

export const FullyStatusCol = {
  title: "Status",
  filters: STATUS_FILTER,
  filterIcon: filterIcon,
  onFilter: (value, record) => filterColumn(value, record, "status"),
  sorter: sortByString("status"),
  render: renderStatus,
};

const StatusCol = {
  title: "Status",
  sorter: sortByString("status"),
  render: renderStatus,
};

export default StatusCol;
