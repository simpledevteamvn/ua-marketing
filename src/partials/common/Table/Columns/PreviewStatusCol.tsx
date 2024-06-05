import React from "react";
import { filterColumn, sortByString } from "../../../../utils/Helpers";
import { STATUS_FILTER } from "../../../../constants/tableFilter";
import { filterIcon } from "../Helper";

const renderStatus = (record) => {
  const { status } = record;

  const statusText = () => {
    if (status === "UPDATE_FAILURE") {
      return "Failure";
    }
    return "Success";
  }

  const statusTextStyle = () => {
    let color;
    if (status === "UPDATE_FAILURE") {
      color = "rgb(248 113 113)";
    } else {
      color = "rgb(94 200 94)";
    }

    return {
      color: color
    };
  }

  return (
    <div style={statusTextStyle()}>
      {statusText()}
    </div>
  );
};

export const PreviewStatusCol = {
  title: "Status",
  filters: STATUS_FILTER,
  filterIcon: filterIcon,
  onFilter: (value, record) => filterColumn(value, record, "status"),
  sorter: sortByString("status"),
  render: renderStatus,
};

const StatusCol = {
  title: "Status",
  render: renderStatus,
};

export default StatusCol;
