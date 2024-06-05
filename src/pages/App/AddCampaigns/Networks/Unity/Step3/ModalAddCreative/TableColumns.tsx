import {
  getLabelFromStr,
  sortByString,
} from "../../../../../../../utils/Helpers";
import getColumnSearchProps from "../../../../../../../partials/common/Table/CustomSearch";
import { getCreativePackName } from "../../../../../../../partials/common/Table/Columns/CreativePackName";

export const defaultCreativeName = (rd) => rd.creativeSetName || "default";

export const getColumns = (props) => {
  const { setPreviewData, setImgPreview, onSearchTable } = props;

  let columns: any = [
    {
      title: "Name",
      width: 200,
      render: (rd) => getCreativePackName(rd),
      // render: (rd) => getCreativePackName(rd, onClickName),
      sorter: sortByString("name"),
      ...getColumnSearchProps({
        dataIndex: "name",
        getField: (el) => el.name,
        callback: (value) => onSearchTable(value, "name"),
        customFilter: () => true,
      }),
    },
    {
      title: "Type",
      width: 80,
      render: (rd) => getLabelFromStr(rd.type),
      sorter: sortByString("type"),
      ...getColumnSearchProps({
        dataIndex: "type",
        getField: (el) => el.type,
        callback: (value) => onSearchTable(value, "type"),
        customFilter: () => true,
      }),
    },
  ];

  return columns;
};
