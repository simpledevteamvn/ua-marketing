import React from "react";
import Button from "antd/lib/button";
import InputNumber from "antd/lib/input-number";
import PropTypes from "prop-types";
import classNames from "classnames";
import { capitalizeWord } from "../../../utils/Helpers";
import SearchOutlined from "@ant-design/icons/lib/icons/SearchOutlined";
// import SearchOutlined from "@ant-design/icons/lib/icons/SearchOutlined";

// Ref: https://ant.design/components/table/
const searchMaxMinValue = (props) => {
  const {
    dataIndex,
    placeholderSuffix,
    getField,
    onFilterTable, // support for call api (sort from Back-end)
    preText,
    step,
  } = props;

  const MinInputRef: React.RefObject<HTMLInputElement> = React.createRef();
  const MaxInputRef: React.RefObject<HTMLInputElement> = React.createRef();

  const handleSearch = (selectedKeys, confirm) => {
    confirm();
    handleFilter();
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    handleFilter();
  };

  const handleFilter = () => {
    if (!onFilterTable) return;

    const min = MinInputRef.current?.value;
    const max = MaxInputRef.current?.value;

    onFilterTable({ field: dataIndex, min, max, getField });
  };

  const getInputValue: (any) => number | null = (inputRef) => {
    let inputValue;
    const inputMaxValue = inputRef.current?.value;

    if (inputMaxValue === "0") {
      inputValue = 0;
    } else {
      inputValue = Number(inputMaxValue) ? Number(inputMaxValue) : null;
    }

    return inputValue;
  };

  const getPlaceHolder = (text) => {
    const suffixText = placeholderSuffix || dataIndex || "";
    return text + " " + capitalizeWord(suffixText);
  };

  const preBtn = !preText ? (
    <></>
  ) : (
    <div className="border border-antBorder bg-zinc-100/50 border-r-0 w-[30px] flex items-center">
      <span className="mx-auto">{preText}</span>
    </div>
  );
  const inputStep = step || 1;

  return {
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div className="p-2 rounded shadow-sm text-sm">
        <div className="flex">
          {preBtn}
          <InputNumber
            ref={MinInputRef}
            step={inputStep}
            className={classNames(
              "!rounded-r-none z-10",
              preText ? "!w-24 !rounded-l-none" : "!w-28"
            )}
            value={selectedKeys[0]}
            onChange={(num) => {
              const maxValue = getInputValue(MaxInputRef);
              setSelectedKeys(num ? [num, maxValue] : [null, maxValue]);
            }}
            placeholder={getPlaceHolder("Min")}
            onPressEnter={() => handleSearch(selectedKeys, confirm)}
          />
          <div className="border !border-x-0 border-antBorder bg-zinc-100 w-[30px] flex items-center">
            <span className="mx-auto text-base">~</span>
          </div>
          {preBtn}
          <InputNumber
            ref={MaxInputRef}
            step={inputStep}
            className={classNames(
              "!rounded-l-none z-10",
              preText ? "!w-24" : "!w-28"
            )}
            value={selectedKeys[1]}
            onChange={(num) => {
              const minValue = getInputValue(MinInputRef);
              setSelectedKeys(num ? [minValue, num] : [minValue]);
            }}
            placeholder={getPlaceHolder("Max")}
            onPressEnter={() => handleSearch(selectedKeys, confirm)}
          />
        </div>

        <div className="flex mt-3">
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
        className={classNames("text-lg mt-px", filtered && "text-antPrimary")}
      />
    ),
    onFilter: (value, record) => {
      if (onFilterTable) return true;

      const dataInfo = getField ? getField(record) : record[dataIndex];
      const minValue = getInputValue(MinInputRef);
      const maxValue = getInputValue(MaxInputRef);

      if (minValue === null && maxValue === null) return true;
      if (minValue === null && maxValue !== null) {
        return dataInfo <= maxValue;
      }
      if (minValue !== null && maxValue === null) {
        return dataInfo >= minValue;
      }

      if (dataInfo > Number(maxValue) || dataInfo < Number(minValue)) {
        return false;
      }
      return true;
    },
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(
          () => MinInputRef.current && MinInputRef.current.focus(),
          100
        );
      }
    },
  };
};

searchMaxMinValue.defaultProps = {
  preText: "",
  placeholderSuffix: "",
};

searchMaxMinValue.propTypes = {
  callback: PropTypes.func,
  getField: PropTypes.func,
  preText: PropTypes.string,
  placeholderSuffix: PropTypes.string,
};

export default searchMaxMinValue;
