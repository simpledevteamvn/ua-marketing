import React, { useEffect, useState } from "react";
import Transfer from "antd/lib/transfer";
import CountriesList from "countries-list";
import PropTypes from "prop-types";
import { getCountryNameFromCode } from "../../../utils/Helpers";

function TransferCountries(props) {
  const { value, onChange } = props;
  const [countries, setCountries] = useState<any>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  useEffect(() => {
    const listCountries = Object.keys(CountriesList.countries).map((code) => ({
      key: code,
      title: (
        <>
          <span className={`fi fi-${code.toLowerCase()} w-5 h-3 mr-1`} />
          {getCountryNameFromCode(code)} ({code})
        </>
      ),
    }));
    setCountries(listCountries);
  }, []);

  const onChangeTransfer = (nextTargetKeys, direction, moveKeys: string[]) => {
    onChange(nextTargetKeys);
  };

  const onSelectChange = (
    sourceSelectedKeys: string[],
    targetSelectedKeys: string[]
  ) => {
    setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
  };

  const onExclude = () => {
    const newList = countries
      .filter((el) => !selectedKeys?.includes(el.key))
      .map((el) => el.key);
    onChange(newList);
    setSelectedKeys([]);
  };

  const onClearAll = () => {
    onChange([]);
  };

  const filterOption = (inputValue, option) => {
    const name = getCountryNameFromCode(option.key) + " (" + option.key + ")";
    return name.toLowerCase().includes(inputValue.toLowerCase());
  };

  return (
    <Transfer
      className="flex"
      // className="flex hidden-operation"
      listStyle={{ flexGrow: 1, height: 300 }}
      oneWay
      showSearch
      filterOption={filterOption}
      dataSource={countries}
      operations={[]}
      titles={[
        <div
          className="text-link"
          onClick={onExclude}
          title="Get exclusion of selected countries"
        >
          Exclude
        </div>,
        <div className="text-link" onClick={onClearAll}>
          Clear all
        </div>,
      ]}
      targetKeys={value}
      selectedKeys={selectedKeys}
      onChange={onChangeTransfer}
      onSelectChange={onSelectChange}
      render={(item) => item.title}
    />
  );
}

TransferCountries.propTypes = {
  value: PropTypes.array,
  onChange: PropTypes.func,
};

export default TransferCountries;
