import React, { useEffect, useState } from "react";
import Table from "antd/lib/table/Table";
import { getColumns } from "./ColumnConfig";
import { checkContainText } from "../../../../utils/helper/TableHelpers";

function CreativeTable(props) {
  const { data, setPreviewData, setImgPreview, isLoading, listTypes } = props;
  const defaultPageSize = 10;
  const [tableFilters, setTableFilters] = useState({
    page: 0,
    size: defaultPageSize,
  });

  const [columns, setColumns] = useState(getColumns({}));
  const [searchData, setSearchData] = useState<any>({});

  useEffect(() => {
    setColumns(
      getColumns({
        setPreviewData,
        setImgPreview,
        onSearchTable,
        listTypes,
      })
    );
  }, [listTypes]);

  const onSearchTable = (value, field) => {
    setSearchData({ ...searchData, [field]: value });
  };

  const onChange = (pagination, filters) => {
    const { pageSize, current } = pagination;
    setTableFilters({ size: pageSize, page: current - 1 });
  };

  const filteredData = data.filter((el) => {
    let result = true;
    const isContainText = checkContainText(searchData, el);

    if (!isContainText) {
      result = false;
    }
    return result;
  });

  const id = "CreativesByNetworkTable";
  const pagination = {
    pageSize: tableFilters?.size,
    current: tableFilters?.page + 1,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
  };

  return (
    <Table
      id={id}
      loading={isLoading}
      getPopupContainer={() => document.getElementById(id)!}
      rowKey={(rd: any) => rd.id}
      // @ts-ignore
      columns={columns}
      dataSource={filteredData}
      pagination={pagination}
      onChange={onChange}
    />
  );
}

export default CreativeTable;
