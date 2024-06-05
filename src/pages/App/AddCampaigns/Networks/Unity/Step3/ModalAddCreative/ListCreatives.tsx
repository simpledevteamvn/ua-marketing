import Table from "antd/lib/table";
import React, { useEffect, useState } from "react";
import { checkContainText } from "../../../../../../../utils/helper/TableHelpers";
import { getColumns } from "./TableColumns";
import { getRowSelection } from "../../../../../../../partials/common/Table/Helper";
import { getTotalSelected } from "../../../../../../../utils/helper/UIHelper";

function ListCreatives(props) {
  const {
    data,
    selectedRecords,
    setSelectedRecords,
    setImgPreview,
    setPreviewData,
    className,
  } = props;

  const [searchData, setSearchData] = useState<any>({});
  const [columns, setColumns] = useState(getColumns({}));

  const defaultPageSize = 10;
  const [tableFilters, setTableFilters] = useState({
    page: 0,
    size: defaultPageSize,
  });

  useEffect(() => {
    setColumns(
      getColumns({
        setPreviewData,
        setImgPreview,
        onSearchTable,
      })
    );
  }, [data]);

  const onSearchTable = (value, field) => {
    setSearchData({ ...searchData, [field]: value });
  };

  const onChange = (pagination, filters) => {
    const { pageSize, current } = pagination;

    if (pageSize !== tableFilters.size || current - 1 !== tableFilters.page) {
      setTableFilters({ size: pageSize, page: current - 1 });
    }
  };

  const filteredData = data.filter((el) => {
    let result = true;

    const isContainText = checkContainText(searchData, el);

    if (!isContainText) {
      result = false;
    }

    return result;
  });

  const rowSelection = getRowSelection(
    selectedRecords,
    setSelectedRecords,
    data
  );

  const pagination = {
    pageSize: tableFilters?.size,
    current: tableFilters?.page + 1,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
  };
  const id = "CreativesForAddCamp";

  return (
    <>
      <div className={`my-4 text-sm2 ${className}`}>
        {getTotalSelected(selectedRecords)}
      </div>
      <Table
        id={id}
        size="middle"
        getPopupContainer={() => document.getElementById(id)!}
        rowKey={(record) => record.id}
        scroll={{ x: 600 }}
        // @ts-ignore
        columns={columns}
        dataSource={filteredData}
        onChange={onChange}
        pagination={pagination}
        rowSelection={rowSelection}
      />
    </>
  );
}

export default ListCreatives;
