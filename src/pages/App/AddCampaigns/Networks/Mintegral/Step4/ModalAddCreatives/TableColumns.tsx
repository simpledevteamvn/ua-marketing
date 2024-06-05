import React from "react";
import { NameColumn } from "../../../../../Creative/Helpers";
import { ACTIVE_STATUS } from "../../../../../../../constants/constants";
import {
  getLabelFromStr,
  sortByDate,
  sortByString,
} from "../../../../../../../utils/Helpers";
import getColumnSearchProps from "../../../../../../../partials/common/Table/CustomSearch";
import moment from "moment";
import SelectCountryFromList from "../../../../../../../partials/common/Forms/SelectCountryFromList";

export const defaultCreativeName = (rd) => rd.creativeSetName || "default";

export const getColumns = (props) => {
  const {
    setPreviewData,
    setImgPreview,
    onSearchTable,
    listCountries,
    activedCountries,
    onChangeCountries,
    handleSetName,
    isShortcut,
  } = props;

  let columns: any = [
    {
      title: "Name",
      width: 200,
      render: (rd) => (
        <div className="flex items-center justify-between">
          <>{NameColumn(rd, setPreviewData, setImgPreview)}</>
          {rd.status === ACTIVE_STATUS && <div className="actived-dot" />}
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

  if (!isShortcut) {
    const dimensionCol = {
      title: "Dimension",
      width: 100,
      render: (rd) => rd.rawCreative?.dimension,
      ...getColumnSearchProps({
        dataIndex: "dimension",
        callback: (value) => onSearchTable(value, "dimension"),
        customFilter: () => true,
      }),
      sorter: (el1, el2) => {
        const name1 = el1.rawCreative?.dimension;
        const name2 = el2.rawCreative?.dimension;

        return ("" + name1).localeCompare(name2);
      },
    };
    const dateCol = {
      title: "Last modified date",
      width: 140,
      sorter: sortByDate("lastModifiedDate"),
      render: (record) => {
        if (!record.lastModifiedDate) return "";
        return moment(record.lastModifiedDate)?.format("DD-MM-YYYY HH:mm:ss");
      },
    };
    columns = [...columns, dimensionCol, dateCol];
  }

  if (listCountries?.length) {
    const locationCol = {
      title: "Location",
      width: 140,
      render: (rd) => (
        <SelectCountryFromList
          placeholder="All"
          listCountries={listCountries}
          value={activedCountries?.[rd.id]}
          onChange={(value) => onChangeCountries(rd, value)}
        />
      ),
    };
    const creativeNameCol = {
      title: "Creative Set Name",
      width: 130,
      render: (rd) => (
        <div className="text-link" onClick={() => handleSetName(rd)}>
          {defaultCreativeName(rd)}
        </div>
      ),
    };

    columns = [...columns, locationCol, creativeNameCol];
  }

  return columns;
};
