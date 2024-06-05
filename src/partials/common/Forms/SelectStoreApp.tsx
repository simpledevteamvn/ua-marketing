import React from "react";
import PropTypes from "prop-types";
import Select from "antd/lib/select";
import GamePlatformIcon from "../GamePlatformIcon";
import { ALL_APP_OPTION } from "../../../constants/constants";
import {
  filterSelectGroupByKey,
  onSelectWithAllOpt,
} from "../../../utils/Helpers";
import { maxTagPlaceholder } from "./MaxTagPlaceholder";

export const getActivedApp = (listApp: any[] = [], activedId: string = "") => {
  if (!listApp?.length || !activedId) return {};

  const results = listApp.find((el) => el.storeId + el.name === activedId);
  return results || {};
};

function SelectStoreApp(props) {
  const {
    loading,
    isMultiple,
    hasAllOpt,
    classNames,
    listApp,
    activedApp,
    setActivedApp,
    onBlur,
    getKey,
    filterOption,
    autoFocus,
  } = props;

  const onGetKey = (data) => {
    if (getKey) {
      return getKey(data);
    }
    return data.storeId + data.name;
  };

  const listAppEl = listApp?.map((data, idx) => (
    <Select.Option key={onGetKey(data)} size="large">
      <div className="flex items-center">
        {data.icon && <GamePlatformIcon app={data} inputSize={true} />}
        {data.name}
      </div>
    </Select.Option>
  ));

  let contentEl = listAppEl;
  if (hasAllOpt && listApp.length) {
    contentEl = (
      <>
        <Select.OptGroup label={`All Apps (${listApp.length})`}>
          <Select.Option size="large" value={ALL_APP_OPTION}>
            All Apps
          </Select.Option>
        </Select.OptGroup>

        <Select.OptGroup label="Apps">{listAppEl}</Select.OptGroup>
      </>
    );
  }

  const listOpts = listApp?.map((data) => onGetKey(data));
  const onChangeValue = (values) => {
    if (isMultiple) {
      if (!hasAllOpt) {
        // Case multiple without the all_option (default multiple)
        return setActivedApp(values);
      }
      onSelectWithAllOpt(
        values,
        listOpts,
        ALL_APP_OPTION,
        activedApp,
        setActivedApp
      );
    } else {
      setActivedApp(values);
    }
  };

  return (
    <Select
      loading={loading}
      className={`w-full ${classNames}`}
      placeholder="App name / Package name"
      mode={isMultiple ? "multiple" : undefined}
      maxTagCount="responsive"
      maxTagPlaceholder={(v) => maxTagPlaceholder(v, activedApp, onChangeValue)}
      allowClear
      value={activedApp}
      onChange={onChangeValue}
      showSearch
      autoFocus={autoFocus}
      filterOption={filterOption || filterSelectGroupByKey}
      onBlur={onBlur}
    >
      {contentEl}
    </Select>
  );
}

SelectStoreApp.defaultProps = {
  classNames: "",
  isMultiple: false,
  loading: false,
  autoFocus: true,
};

SelectStoreApp.propTypes = {
  isMultiple: PropTypes.bool,
  loading: PropTypes.bool,
  hasAllOpt: PropTypes.bool,
  autoFocus: PropTypes.bool,
  listApp: PropTypes.array,
  classNames: PropTypes.string,
  activedApp: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
  setActivedApp: PropTypes.func,
  onBlur: PropTypes.func,
  getKey: PropTypes.func,
  filterOption: PropTypes.func,
};

export default SelectStoreApp;
