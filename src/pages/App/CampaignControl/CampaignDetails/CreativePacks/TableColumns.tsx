import { ID_COL } from "../../../../../partials/common/Table/Columns/IndexCol";
import { PerformanceColumns } from "../../../../../partials/common/Table/Columns/PerformanceCols";
import getColumnSearchProps from "../../../../../partials/common/Table/CustomSearch";
import { keepSortColumn } from "../../../../../partials/common/Table/Helper";
import { getCreativePackName } from "../../../../../partials/common/Table/Columns/CreativePackName";

export function getColumns(props) {
  const { onSearchTable, onFilterTable, onClickName } = props;

  return [
    ID_COL,
    {
      title: "Name",
      width: 350,
      maxWidth: 600,
      render: (rd) => getCreativePackName(rd, onClickName),
      ...getColumnSearchProps({
        dataIndex: "name",
        callback: (value) => onSearchTable(value, "name"),
        customFilter: () => true,
      }),
      sorter: keepSortColumn,
    },
    ...PerformanceColumns({ onFilterTable, isKeepSort: true }),
  ];
}
