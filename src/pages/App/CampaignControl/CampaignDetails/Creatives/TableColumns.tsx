import React from "react";
import { ID_COL } from "../../../../../partials/common/Table/Columns/IndexCol";
import { PerformanceColumns } from "../../../../../partials/common/Table/Columns/PerformanceCols";
import getColumnSearchProps from "../../../../../partials/common/Table/CustomSearch";
import { keepSortColumn } from "../../../../../partials/common/Table/Helper";
import { capitalizeWord } from "../../../../../utils/Helpers";
import { NameColumn } from "../../../Creative/Helpers";
import { ACTIVE_STATUS } from "../../../../../constants/constants";

export function getColumns(props) {
  const { onSearchTable, onFilterTable, setPreviewData, setImgPreview } = props;

  return [
    ID_COL,
    {
      title: "Name",
      width: 350,
      maxWidth: 600,
      render: (rd) => {
        return (
          <div className="flex items-center justify-between">
            <>{NameColumn(rd, setPreviewData, setImgPreview)}</>
            {rd.status === ACTIVE_STATUS && <div className="actived-dot" />}
          </div>
        );
      },
      ...getColumnSearchProps({
        dataIndex: "name",
        callback: (value) => onSearchTable(value, "name"),
        customFilter: () => true,
      }),
      sorter: keepSortColumn,
    },
    {
      title: "Dimension",
      width: 100,
      render: (rd) => rd.rawCreative?.dimension,
      ...getColumnSearchProps({
        dataIndex: "dimension",
        callback: (value) => onSearchTable(value, "dimension"),
        customFilter: () => true,
      }),
      sorter: keepSortColumn,
    },
    {
      title: "Type",
      width: 100,
      render: (rd) => capitalizeWord(rd.type),
      sorter: keepSortColumn,
      ...getColumnSearchProps({
        dataIndex: "type",
        callback: (value) => onSearchTable(value, "type"),
        customFilter: () => true,
      }),
    },
    ...PerformanceColumns({ onFilterTable, isKeepSort: true }),
  ];
}
