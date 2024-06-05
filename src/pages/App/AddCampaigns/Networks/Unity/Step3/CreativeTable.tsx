import React, { useEffect, useState } from "react";
import Table from "antd/lib/table";
import Button from "antd/lib/button/button";
import DeleteOutlined from "@ant-design/icons/lib/icons/DeleteOutlined";
import PlusOutlined from "@ant-design/icons/lib/icons/PlusOutlined";
import { checkContainText } from "../../../../../../utils/helper/TableHelpers";
import { getRowSelection } from "../../../../../../partials/common/Table/Helper";
import Popconfirm from "antd/lib/popconfirm";
import { getColumns } from "./ModalAddCreative/TableColumns";

function CreativeTable(props) {
  const {
    handleAdd,
    handleDelete,
    data,
    setImgPreview,
    setPreviewData,
    countries,
    activedCountries,
  } = props;

  const [searchData, setSearchData] = useState<any>({});
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [columns, setColumns] = useState(getColumns({}));

  const defaultPageSize = 20;
  const [tableFilters, setTableFilters] = useState({
    size: defaultPageSize,
    page: 0,
  });

  useEffect(() => {
    setColumns(
      getColumns({
        setPreviewData,
        setImgPreview,
        onSearchTable,
      })
    );
  }, [data, countries, activedCountries]);

  const onSearchTable = (value, field) => {
    setSearchData({ ...searchData, [field]: value });
  };

  const onDelete = () => {
    handleDelete(selectedRecords);
    setSelectedRecords([]);
  };

  const onChange = (pagination, filters) => {
    const { pageSize, current } = pagination;
    setTableFilters({ size: pageSize, page: current - 1 });
  };

  const rowSelection = getRowSelection(
    selectedRecords,
    setSelectedRecords,
    data
  );

  const filteredData = data?.filter((el) => {
    let result = true;

    const isContainText = checkContainText(searchData, el);

    if (!isContainText) {
      result = false;
    }

    return result;
  });

  const pagination = {
    pageSize: tableFilters.size,
    current: tableFilters.page + 1,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
  };

  const tableEl = (
    <Table
      id="UnityStep3Creative"
      size="middle"
      rowKey={(record) => record.id}
      // @ts-ignore
      columns={columns}
      dataSource={filteredData}
      scroll={{ x: 800 }}
      pagination={pagination}
      onChange={(pagination, filters) => onChange(pagination, filters)}
      rowSelection={rowSelection}
    />
  );

  return (
    <div className="">
      <div className="mb-4 -mt-10 flex justify-end items-center">
        <div className="flex space-x-3">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="small"
            onClick={handleAdd}
          >
            Add
          </Button>
          <Popconfirm
            placement="left"
            title="Remove creatives?"
            onConfirm={onDelete}
            okText="Yes"
            cancelText="No"
            className="aaaaa"
          >
            <Button
              danger
              type="primary"
              icon={<DeleteOutlined />}
              size="small"
              disabled={!selectedRecords?.length}
            >
              Delete
            </Button>
          </Popconfirm>
        </div>
      </div>
      {tableEl}
    </div>
  );
}

export default CreativeTable;
