import React from "react";
import { NameColumn } from "../../Creative/Helpers";
import {
  filterColumn,
  getLabelFromStr,
  sortByString,
} from "../../../../utils/Helpers";
import getColumnSearchProps from "../../../../partials/common/Table/CustomSearch";
import { TYPE_OF_NETWORK } from "../../../../constants/tooltip";
import { getTableTitleWithTooltip } from "../../../../partials/common/Table/Header";

export function getColumns(props) {
  const { setPreviewData, setImgPreview, onSearchTable, listTypes } = props;

  let filterTypes;
  if (listTypes?.length) {
    filterTypes = listTypes?.map((type) => ({
      text: getLabelFromStr(type),
      value: type,
    }));
  }

  return [
    {
      title: "Name",
      width: 200,
      render: (rd) => (
        <div className="flex items-center justify-between">
          {NameColumn(rd, setPreviewData, setImgPreview)}
        </div>
      ),
      sorter: sortByString("name"),
      ...getColumnSearchProps({
        dataIndex: "name",
        getField: (el) => el.name,
        callback: (value) => onSearchTable(value, "name"),
        customFilter: () => true,
      }),
    },
    {
      title: "Network",
      width: 70,
      sorter: (el1, el2) => {
        const name1 = el1.network?.name;
        const name2 = el2.network?.name;
        return ("" + name1).localeCompare(name2);
      },
      ...getColumnSearchProps({
        dataIndex: "network",
        getField: (el) => el.network?.name,
        callback: (value) => onSearchTable(value, "network.name"),
        customFilter: () => true,
      }),
      render: (rd) => {
        const network = rd.network || {};
        const { name, imageUrl } = network;
        return (
          <div>
            <div className="flex items-center whitespace-nowrap md:whitespace-normal">
              {imageUrl && (
                <img alt=" " src={imageUrl} className="h-8 w-8 rounded mr-2" />
              )}
              <div className="">{name}</div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Type",
      width: 100,
      filters: filterTypes,
      onFilter: (value, record) => filterColumn(value, record, "type"),
      render: (rd) => getLabelFromStr(rd.type),
      sorter: sortByString("type"),
    },
    {
      title: getTableTitleWithTooltip("Origin type"),
      width: 100,
      showSorterTooltip: { title: TYPE_OF_NETWORK },
      render: (rd) => rd.originType,
      sorter: sortByString("originType"),
      ...getColumnSearchProps({
        getField: (el) => el.originType,
        callback: (value) => onSearchTable(value, "originType"),
        customFilter: () => true,
      }),
    },
  ];
}
