import React from "react";
import Button from "antd/lib/button";
import Input from "antd/lib/input";
import PropTypes from "prop-types";
import SearchOutlined from "@ant-design/icons/lib/icons/SearchOutlined";
import classNames from "classnames";

// Ref: https://codesandbox.io/s/y7kxxr1n8z?file=/src/index.js:2095-2139
const getColumnSearchProps = (props) => {
  const {
    isFilterWithApi = false,
    dataIndex,
    getField = (record) => null,
    customFilter,
    callback,
  } = props;
  const InputRef = React.createRef();

  const handleSearch = (selectedKeys, confirm) => {
    confirm();
    callback && callback(selectedKeys[0]);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
  };

  const onFilter = (value, record) => {
    const dataInfo = (getField && getField(record)) || record[dataIndex];
    return dataInfo.toString().toLowerCase().includes(value.toLowerCase());
  };

  return {
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div className="p-2 rounded shadow-sm">
        <Input
          ref={InputRef}
          placeholder={`Search ${dataIndex || ""}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            !isFilterWithApi && handleSearch(selectedKeys, confirm)
          }
          style={{ width: 188, marginBottom: 8, display: "block" }}
        />
        <div className="flex">
          <Button
            className="flex-1"
            size="small"
            onClick={() => handleReset(clearFilters)}
          >
            Reset
          </Button>
          <Button
            className="ml-2 flex-1"
            type="primary"
            size="small"
            onClick={() => handleSearch(selectedKeys, confirm)}
          >
            Search
          </Button>
        </div>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        className={classNames(
          "text-lg mt-px",
          filtered ? "text-[#1890ff]" : ""
        )}
      />
    ),
    onFilter: isFilterWithApi ? () => true : customFilter || onFilter,
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        // @ts-ignore
        setTimeout(() => InputRef.current && InputRef.current.focus(), 100);
      }
    },
  };
};

getColumnSearchProps.defaultProps = {};

getColumnSearchProps.propTypes = {
  callback: PropTypes.func,
  getField: PropTypes.func,
  customFilter: PropTypes.func,
};

export default getColumnSearchProps;
