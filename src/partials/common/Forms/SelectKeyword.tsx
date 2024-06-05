import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Select from "antd/lib/select";
import {
  ALL_KEYWORD_OPTION,
  ALL_CAMPAIGNS_OPTION,
  ALL_NETWORK_OPTION,
  ALL_AD_GROUP_OPTION,
} from "../../../constants/constants";
import {
  filterSelectGroup,
  getSelectMultipleParams,
  onSelectWithAllOpt,
} from "../../../utils/Helpers";
import service from "../../services/axios.config";
import { useParams } from "react-router-dom";
import { maxTagPlaceholder } from "./MaxTagPlaceholder";

const { Option, OptGroup } = Select;

function SelectKeyword(props) {
  const urlParams = useParams();
  const {
    value,
    onChange,
    classNames,
    networkData,
    campaignIds,
    rawAdGroupIds,
  } = props;

  const [listKeyword, setListKeyword] = useState<any>([]);

  useEffect(() => {
    const params = {
      storeAppId: urlParams.appId,
      networks: getSelectMultipleParams(networkData, ALL_NETWORK_OPTION)?.join(
        ","
      ),
      campaignIds: getSelectMultipleParams(
        campaignIds,
        ALL_CAMPAIGNS_OPTION
      )?.join(","),
      rawAdGroupIds: getSelectMultipleParams(
        rawAdGroupIds,
        ALL_AD_GROUP_OPTION
      )?.join(","),
    };

    service.get("/adgroup/keywords", { params }).then(
      (res: any) => {
        setListKeyword(res.results || []);
      },
      () => {}
    );
  }, [networkData, campaignIds, rawAdGroupIds]);

  const listOpts = listKeyword || [];
  const onChangeValue = (listKeyword) =>
    onSelectWithAllOpt(
      listKeyword,
      listOpts,
      ALL_KEYWORD_OPTION,
      value,
      onChange
    );

  return (
    <Select
      mode="multiple"
      allowClear
      className={`w-full ${classNames}`}
      placeholder="Select keywords"
      value={listKeyword?.length ? value : []}
      onChange={onChangeValue}
      showSearch
      maxTagCount="responsive"
      maxTagPlaceholder={(v) => maxTagPlaceholder(v, value, onChangeValue)}
      filterOption={filterSelectGroup}
    >
      {listKeyword?.length > 0 && (
        <>
          <OptGroup label={`All Keyword (${listKeyword.length})`}>
            <Option value={ALL_KEYWORD_OPTION}>All Keyword</Option>
          </OptGroup>

          <OptGroup label="Keyword">
            {listKeyword.map((keyword: any, idx) => (
              <Option value={keyword} key={idx}>
                {keyword}
              </Option>
            ))}
          </OptGroup>
        </>
      )}
    </Select>
  );
}

SelectKeyword.defaultProps = {
  networkData: [],
  campaignIds: [],
  rawAdGroupIds: [],
};

SelectKeyword.propTypes = {
  value: PropTypes.array,
  classNames: PropTypes.string,
  onChange: PropTypes.func,
  networkData: PropTypes.array,
  campaignIds: PropTypes.array,
  rawAdGroupIds: PropTypes.array,
};

export default SelectKeyword;
