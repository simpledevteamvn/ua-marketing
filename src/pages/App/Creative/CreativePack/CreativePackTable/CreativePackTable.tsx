import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import getTableColumns from "./TableColumns";
import {
  checkContainText,
  checkRangeValue,
  setRangeValue,
} from "../../../../../utils/helper/TableHelpers";
import TableWrapper from "../../../../../partials/common/Table/TableWrapper";
import ModalDetail from "./ModalDetail";

function CreativePackTable(props) {
  const { isLoading, tableData, setIsLoading, setPreviewData, setImgPreview } =
    props;

  const defaultDetailFilters = {
    page: 0,
    size: 5,
  };
  const defaultPageSize = 10;
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [expandedKeys, setExpandedKeys] = useState<any[]>([]);
  const [filters, setFilters] = useState<any>({});
  const [columns, setColumns] = useState(getTableColumns({}));

  const [filterByMaxMin, setFilterByMaxMin] = useState<any>({});
  const [searchData, setSearchData] = useState<any>({});

  const [packToView, setPackToView] = useState<any>({}); // show modal

  const onFilterTable = (data) => {
    setRangeValue(data, filterByMaxMin, setFilterByMaxMin);
  };

  const onSearchTable = (value, field) => {
    setSearchData({ ...searchData, [field]: value });
  };

  useEffect(() => {
    setColumns(
      getTableColumns({
        onClickName,
        onFilterTable,
        onSearchTable,
        setPreviewData,
        setImgPreview,
        tableData,
      })
    );
  }, [tableData, expandedKeys]);

  const onClickName = (rd) => {
    if (rd.creatives?.length || rd.assets?.length) {
      setPackToView(rd);
    }

    const isExpanded = expandedKeys.includes(rd.id);
    onExpand(!isExpanded, rd);
  };

  const onExpand = (expanded, record) => {
    if (expanded) {
      setExpandedKeys([...expandedKeys, record.id]);
    } else {
      const newKeys = expandedKeys.filter((el) => el !== record.id);
      setExpandedKeys(newKeys);
    }

    const activedIdx = tableData.findIndex((el) => el.id === record.id);
    if (activedIdx !== -1 && !filters[activedIdx]) {
      setFilters({ ...filters, [activedIdx]: defaultDetailFilters });
    }
  };

  const onChangeTable = (pagination) => {
    if (pagination?.pageSize && pagination.pageSize !== pageSize) {
      setPageSize(pagination.pageSize);
    }
  };

  const filteredData = tableData?.filter((el) => {
    let result = true;

    const isContainText = checkContainText(searchData, el);
    const checkValue = checkRangeValue(filterByMaxMin, el);

    if (!isContainText || !checkValue) {
      result = false;
    }

    return result;
  });

  const pagination = {
    pageSize,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
  };

  return (
    <>
      <TableWrapper
        setColumns={setColumns}
        initialColumns={columns}
        isShowSummary={false}
        isShowSettings={false}
        bordered
        id="CreativePack"
        getPopupContainer={() => document.getElementById("CreativePack")!}
        dataSource={filteredData || []}
        loading={isLoading}
        rowKey={(rd) => rd.id}
        scroll={{ x: 2000 }}
        onChange={onChangeTable}
        expandedRowKeys={[...expandedKeys]}
        expandable={{
          expandedRowKeys: [...expandedKeys],
          onExpand,
        }}
        pagination={pagination}
      />

      <ModalDetail
        isOpen={!!packToView?.id}
        onClose={() => setPackToView({})}
        rd={packToView}
        setPreviewData={setPreviewData}
        setImgPreview={setImgPreview}
      />
    </>
  );
}

CreativePackTable.propTypes = {
  isLoading: PropTypes.bool,
  setIsLoading: PropTypes.func,
  tableData: PropTypes.array,
  setPreviewData: PropTypes.func,
  setImgPreview: PropTypes.func,
};

export default CreativePackTable;
