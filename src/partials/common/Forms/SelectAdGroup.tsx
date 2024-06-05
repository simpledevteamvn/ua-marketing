import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Select from "antd/lib/select";
import {
  ALL_AD_GROUP_OPTION,
  ALL_CAMPAIGNS_OPTION,
  ALL_NETWORK_OPTION,
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

function SelectAdGroup(props) {
  const urlParams = useParams();
  const {
    value,
    onChange,
    classNames,
    networkData,
    campaignIds,
    storeAppIds,
    field,
  } = props;

  const [listAdGroup, setListAdGroup] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storeAppId = urlParams.appId;
    const params: any = {
      storeAppIds: storeAppIds?.length ? storeAppIds : [storeAppId],
      networks: getSelectMultipleParams(networkData, ALL_NETWORK_OPTION),
      campaignIds: getSelectMultipleParams(campaignIds, ALL_CAMPAIGNS_OPTION),
    };

    if (!storeAppId && !storeAppIds?.length) {
      return;
    }

    setIsLoading(true);
    service.post("/adgroup-get-store-apps", params).then(
      (res: any) => {
        setIsLoading(false);
        setListAdGroup(res.results || []);
      },
      () => setIsLoading(false)
    );
  }, [networkData, campaignIds, storeAppIds]);

  const listOpts = listAdGroup?.map((data) => data[field]);

  const onChangeValue = (listAdGroup) =>
    onSelectWithAllOpt(
      listAdGroup,
      listOpts,
      ALL_AD_GROUP_OPTION,
      value,
      onChange
    );

  return (
    <Select
      mode="multiple"
      loading={isLoading}
      allowClear
      className={`w-full ${classNames}`}
      placeholder="Select ad groups"
      value={listAdGroup?.length ? value : []}
      onChange={onChangeValue}
      showSearch
      maxTagCount="responsive"
      maxTagPlaceholder={(v) => maxTagPlaceholder(v, value, onChangeValue)}
      filterOption={filterSelectGroup}
    >
      {listAdGroup?.length > 0 && (
        <>
          <OptGroup label={`All Ad Group (${listAdGroup.length})`}>
            <Option value={ALL_AD_GROUP_OPTION}>All Ad Group</Option>
          </OptGroup>

          <OptGroup label="Ad Group">
            {listAdGroup.map((adGroup: any, idx) => (
              <Option value={adGroup[field]} key={idx}>
                {adGroup.name}
              </Option>
            ))}
          </OptGroup>
        </>
      )}
    </Select>
  );
}

SelectAdGroup.defaultProps = {
  networkData: [],
  campaignIds: [],
  field: "rawAdGroupId",
};

SelectAdGroup.propTypes = {
  value: PropTypes.array,
  classNames: PropTypes.string,
  onChange: PropTypes.func,
  networkData: PropTypes.array,
  campaignIds: PropTypes.array,
  storeAppIds: PropTypes.array,
  field: PropTypes.string,
};

export default SelectAdGroup;
