import React from "react";
import PropTypes from "prop-types";
import Select from "antd/lib/select";
import { ALL_NETWORK_OPTION } from "../../../constants/constants";
import { filterSelectByDOM, onSelectWithAllOpt } from "../../../utils/Helpers";
import { maxTagPlaceholder } from "./MaxTagPlaceholder";

const { Option, OptGroup } = Select;

function SelectNetwork(props) {
  const { isMultiple, value, onChange, classNames, listNetwork, disabled } =
    props;

  const listNetworkEl = listNetwork?.map((dataObj: any, idx) => {
    const imgUrl = dataObj.imageUrl || dataObj.network?.imageUrl;
    const dataValue = dataObj.code || dataObj.id;

    return (
      <Option value={dataValue} key={idx}>
        <div className="flex items-center">
          {imgUrl && (
            <img src={imgUrl} alt=" " className="h-[18px] w-[18px] mr-1.5" />
          )}
          {dataObj.name}
        </div>
      </Option>
    );
  });

  let contentEl = listNetworkEl;
  if (isMultiple && listNetwork?.length) {
    contentEl = (
      <>
        <OptGroup label={`All Networks (${listNetwork.length})`}>
          <Option value={ALL_NETWORK_OPTION}>All Networks</Option>
        </OptGroup>

        <OptGroup label="Networks">{listNetworkEl}</OptGroup>
      </>
    );
  }

  const listOpts = listNetwork?.map((data) => data.code);
  const onChangeValue = (networks) => {
    if (isMultiple) {
      onSelectWithAllOpt(
        networks,
        listOpts,
        ALL_NETWORK_OPTION,
        value,
        onChange
      );
    } else {
      onChange(networks);
    }
  };

  return (
    <Select
      mode={isMultiple ? "multiple" : undefined}
      maxTagCount="responsive"
      maxTagPlaceholder={(v) =>
        maxTagPlaceholder(v, value, onChangeValue, disabled)
      }
      allowClear
      placeholder="Select ad networks"
      className={`w-full ${classNames}`}
      value={value}
      onChange={onChangeValue}
      disabled={disabled}
      showSearch
      filterOption={filterSelectByDOM}
    >
      {contentEl}
    </Select>
  );
}

SelectNetwork.defaultProps = {
  isMultiple: true,
};

SelectNetwork.propTypes = {
  isMultiple: PropTypes.bool,
  value: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
  listNetwork: PropTypes.array,
  classNames: PropTypes.string,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
};

export default SelectNetwork;
