import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Select from "antd/lib/select";
import {
  ALL_CAMPAIGNS_OPTION,
  ALL_COUNTRIES_OPTION,
  ALL_NETWORK_OPTION,
  ALL_SITE_ID_OPTION,
} from "../../../constants/constants";
import {
  filterSelectGroup,
  getSelectMultipleParams,
  onSelectWithAllOpt,
} from "../../../utils/Helpers";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { LIST_SITE_ID } from "../../../api/constants.api";
import { getListSiteId } from "../../../api/campaign-center/campaign-center.api";
import { maxTagPlaceholder } from "./MaxTagPlaceholder";

function SelectSiteId(props) {
  const urlParams = useParams();
  const {
    value,
    onChange,
    classNames,
    networkData,
    countryData,
    campaignData,
    storeAppIds,
  } = props;

  const [listSiteIds, setListSiteIds] = useState<any>([]);

  const getParams = () => {
    const listStoreId = urlParams.appId;

    return {
      storeAppIds: storeAppIds?.length ? storeAppIds : [listStoreId],
      networks: getSelectMultipleParams(networkData, ALL_NETWORK_OPTION),
      campaignIds: getSelectMultipleParams(campaignData, ALL_CAMPAIGNS_OPTION),
      countries: getSelectMultipleParams(countryData, ALL_COUNTRIES_OPTION),
    };
  };

  const {
    data: listSiteIdRes,
    isLoading: isLoadingData,
    isFetching: isFetchingData,
  } = useQuery({
    queryKey: [LIST_SITE_ID, getParams()],
    queryFn: getListSiteId,
    staleTime: 20 * 60000,
  });

  useEffect(() => {
    setListSiteIds(listSiteIdRes?.results || []);
  }, [listSiteIdRes]);

  const listOpts = listSiteIds || [];
  const onChangeValue = (values) =>
    onSelectWithAllOpt(values, listOpts, ALL_SITE_ID_OPTION, value, onChange);

  return (
    <Select
      loading={isLoadingData || isFetchingData}
      mode="multiple"
      allowClear
      className={`w-full ${classNames}`}
      placeholder="Select site ids"
      value={value}
      onChange={onChangeValue}
      showSearch
      maxTagCount="responsive"
      maxTagPlaceholder={(v) => maxTagPlaceholder(v, value, onChangeValue)}
      filterOption={filterSelectGroup}
    >
      {listSiteIds?.length > 0 && (
        <>
          <Select.OptGroup label={`All Site Ids (${listSiteIds.length})`}>
            <Select.Option value={ALL_SITE_ID_OPTION}>
              All Site Ids
            </Select.Option>
          </Select.OptGroup>

          <Select.OptGroup label="Site Id">
            {listSiteIds.map((siteId: any, idx) => (
              <Select.Option value={siteId} key={idx}>
                {siteId}
              </Select.Option>
            ))}
          </Select.OptGroup>
        </>
      )}
    </Select>
  );
}

SelectSiteId.defaultProps = {
  networkData: [],
  campaignData: [],
  countryData: [],
  storeAppIds: [],
};

SelectSiteId.propTypes = {
  value: PropTypes.array,
  classNames: PropTypes.string,
  onChange: PropTypes.func,
  networkData: PropTypes.array,
  campaignData: PropTypes.array,
  countryData: PropTypes.array,
  storeAppIds: PropTypes.array,
};

export default SelectSiteId;
