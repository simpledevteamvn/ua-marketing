import {
  sortByString,
  sortNumberWithNullable,
} from "../../../../../utils/Helpers";
import { showListData } from "../../../../../utils/helper/UIHelper";
import getColumnSearchProps from "../../../../../partials/common/Table/CustomSearch";
import { perCreativeCols } from "../ColumnsHelpers";
import { getCreativePackName } from "../../../../../partials/common/Table/Columns/CreativePackName";

export default function getTableColumns(props) {
  const {
    onClickName,
    onSearchTable,
    onFilterTable,
    setPreviewData,
    setImgPreview,
    tableData,
  } = props;

  return [
    {
      title: "Name",
      width: 220,
      sorter: sortByString("name"),
      /**
       * Số lượng creatives trong 1 pack có thể lớn nên với cấu trúc tree sẽ load hết video => nặng
       * Giải pháp trước mắt là show modal để phân trang
       */
      render: (rd) => getCreativePackName(rd, onClickName),
      ...getColumnSearchProps({
        dataIndex: "name",
        callback: (value) => onSearchTable(value, "name"),
        customFilter: () => true,
      }),
    },
    {
      title: "Networks",
      width: 120,
      dataIndex: "networkCode",
      sorter: sortByString("networkCode"),
    },
    {
      title: "Campaigns",
      width: 180,
      render: (rd) => showListData(rd.campaignNames, "campaign"),
      sorter: (a, b) =>
        sortNumberWithNullable(a, b, (el) => el.campaignNames?.length),
    },
    // {
    //   title: "Type",
    //   width: 80,
    //   render: (rd) => getLabelFromStr(rd.type),
    //   sorter: sortByString("type"),
    //   ...getColumnSearchProps({
    //     dataIndex: "type",
    //     getField: (el) => el.type,
    //     callback: (value) => onSearchTable(value, "type"),
    //     customFilter: () => true,
    //   }),
    // },
    ...perCreativeCols({ onFilterTable, tableData }),
  ];
}
