import DownOutlined from "@ant-design/icons/lib/icons/DownOutlined";
import Dropdown from "antd/lib/dropdown";
import Menu from "antd/lib/menu";
import Button from "antd/lib/button";
import Table from "antd/lib/table";
import React, { useState } from "react";
import { TABLE_SORT_OPTIONS } from "../../../constants/constants";
import CompareTwoNumber from "../../../partials/common/CompareTwoNumber";
import { capitalizeWord, sortByString } from "../../../utils/Helpers";
import { formatValue } from "../../../utils/Utils";
import getColumnSearchProps from "../../../partials/common/Table/CustomSearch";
import searchMaxMinValue from "../../../partials/common/Table/SearchMaxMinValue";

const listData = [
  {
    id: 1,
    name: "BlueMonster",
    cost: 183,
    preCost: 112,
    installs: 233,
    preInstalls: 264,
    status: "running",
  },
  {
    id: 2,
    name: "BlueMonster2",
    cost: 113,
    preCost: 112,
    installs: 22,
    preInstalls: 132,
    status: "",
  },
  {
    id: 3,
    name: "BlueMonster3",
    cost: 203,
    preCost: 112,
    installs: 85,
    preInstalls: 120,
    status: "",
  },
  {
    id: 4,
    name: "BlueMonster4",
    cost: 134,
    preCost: 112,
    installs: 12385,
    preInstalls: 2305,
    status: "",
  },
  {
    id: 5,
    name: "BlueMonster5",
    cost: 65,
    preCost: 100,
    installs: 85,
    preInstalls: 103,
    status: "",
  },
  {
    id: 6,
    name: "BlueMonster6",
    cost: 233,
    preCost: 333,
    installs: 85,
    preInstalls: 103,
    status: "",
  },
];

function CampaignPerformance() {
  const defaultFilters = {
    cost: {},
    installs: {},
  };

  const [isLoading, setIsLoading] = useState(false);
  const [selectedSort, setSelectedSort] = useState(TABLE_SORT_OPTIONS[0].key);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 5,
    },
    filters: defaultFilters,
  });
  const [tableData, setTableData] = useState(listData);

  const onChageMenu = (item) => {
    setSelectedSort(item.key);
  };

  const onFilterTable = ({ field = "", max, min }) => {
    setTableParams({
      ...tableParams,
      filters: { ...tableParams.filters, [field]: { min, max } },
    });

    const newFilters = Object.assign({}, tableParams.filters, {
      [field]: { min, max },
    });
    getTableData(newFilters);
  };

  const handleTableChange = (pagination, filters, sorter) => {
    // console.log(
    //   "pagination, filters, sorter :>> ",
    //   pagination,
    //   filters,
    //   sorter
    // );
    // setTableParams({
    //   pagination,
    //   filters,
    //   ...sorter,
    // });
  };

  const getTableData = (newFilters) => {
    const listFilter = newFilters || tableParams.filters;
    // console.log("filters :>> ", listFilter);

    // Todo: call api and update table
    // setTableData(results);
    // setIsLoading(false);
    // setTableParams({
    //   ...tableParams,
    //   pagination: {
    //     ...tableParams.pagination,
    //     total: 200, // 200 is mock data, you should read it from server
    //   },
    // });
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      sorter: sortByString("name"),
      ...getColumnSearchProps({ dataIndex: "name" }),
    },
    {
      title: "Cost",
      defaultSortOrder: "descend",
      sortDirections: ["ascend", "descend", "ascend"],
      sorter: (a, b) => a.cost - b.cost,
      render: (record) => (
        <div className="flex text-xs2 tracking-tighter">
          <div className="mr-1.5">{formatValue(record.cost)}</div>
          {CompareTwoNumber(record.cost, record.preCost)}
        </div>
      ),
      ...searchMaxMinValue({ dataIndex: "cost", preText: "$" }),
      // ...searchMaxMinValue({ onFilterTable, dataIndex: "cost", preText: "$" }),
    },
    {
      title: "Installs",
      sortDirections: ["ascend", "descend", "ascend"],
      sorter: (a, b) => a.cost - b.cost,
      render: (record) => (
        <div className="flex text-xs2 tracking-tighter">
          <div className="mr-1.5">{record.installs}</div>
          {CompareTwoNumber(record.installs, record.preInstalls)}
        </div>
      ),
      ...searchMaxMinValue({ dataIndex: "installs" }),
      // ...searchMaxMinValue({ onFilterTable, dataIndex: "installs" }),
    },
    {
      title: "Status",
      sorter: sortByString("status"),
      ...getColumnSearchProps({ dataIndex: "status" }),
      render: (record) => (
        <div className="text-lime-500">{capitalizeWord(record.status)}</div>
      ),
    },
  ];

  const menu = (
    <Menu
      selectable
      onSelect={(item) => onChageMenu(item)}
      defaultSelectedKeys={[selectedSort]}
      items={TABLE_SORT_OPTIONS}
    />
  );

  return (
    <div className="overview-section">
      <div className="px-5 py-4">
        <div className="flex justify-between items-center">
          <h2 className="flex font-bold text-slate-800 text-xl">
            <div>Campaign Performance</div>
          </h2>
          <Dropdown overlay={menu} trigger={["click"]}>
            <Button>
              {TABLE_SORT_OPTIONS.find((el) => el.key === selectedSort)?.label}
              <DownOutlined />
            </Button>
          </Dropdown>
        </div>

        <Table
          id="campaign-performance"
          getPopupContainer={() =>
            document.getElementById("campaign-performance")
          }
          size="middle"
          className="mt-3.5"
          rowKey={(record) => record.id}
          columns={columns}
          dataSource={[...tableData]}
          pagination={
            tableData?.length < 5
              ? false
              : { pageSize: 5, showSizeChanger: false }
          }
          // pageSize : tableParams.pagination.pageSize}
          loading={isLoading}
          onChange={handleTableChange}
        />
      </div>
    </div>
  );
}

export default CampaignPerformance;
