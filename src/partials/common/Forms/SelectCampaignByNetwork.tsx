import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Select from "antd/lib/select";
import {
  ALL_CAMPAIGNS_OPTION,
  ALL_NETWORK_OPTION,
} from "../../../constants/constants";
import {
  filterSelectGroup,
  getSelectMultipleParams,
  onSelectWithAllOpt,
} from "../../../utils/Helpers";
import { useQuery } from "@tanstack/react-query";
import { getCampaigns } from "../../../api/common/common.api";
import { LIST_CAMPAIGN_BY_NETWORK } from "../../../api/constants.api";
import { useParams } from "react-router-dom";
import { maxTagPlaceholder } from "./MaxTagPlaceholder";

const { Option, OptGroup } = Select;

function SelectCampaignByNetwork(props) {
  const urlParams = useParams();
  const {
    value,
    onChange,
    classNames,
    networkData,
    listNetwork,
    storeAppIds,
    isGetRawId,
    status,
    initNetworkSuccess,
    initWithEmptyList,
    setListCampaignData,
  } = props;

  const [listCampaign, setListCampaign] = useState<any>([]);

  const getParams = () => {
    let listStoreIds = urlParams.appId;
    if (storeAppIds.length) {
      listStoreIds = storeAppIds?.join(",");
    }

    let networks = getSelectMultipleParams(
      networkData,
      ALL_NETWORK_OPTION
    )?.join(",");

    if (listNetwork.length && networkData.includes(ALL_NETWORK_OPTION)) {
      networks = listNetwork.map((el) => el.code).join(",");
    }

    return {
      storeAppIds: listStoreIds,
      networks,
      status,
    };
  };

  const { data: listCampaingRes } = useQuery({
    queryKey: [LIST_CAMPAIGN_BY_NETWORK, { params: getParams() }, listNetwork],
    queryFn: getCampaigns,
    staleTime: 5 * 60000,
    enabled: initNetworkSuccess === undefined || initNetworkSuccess,
  });

  useEffect(() => {
    const newData = listCampaingRes?.results || [];
    setListCampaign(newData);
    setListCampaignData && setListCampaignData(newData);
  }, [listCampaingRes]);

  const listOpts = listCampaign?.map((data) =>
    isGetRawId ? data.rawCampaignId : data.id
  );

  const crrValue = initWithEmptyList
    ? value
    : listCampaign?.length
    ? value
    : [];

  const onChangeValue = (listCampaign) => {
    onSelectWithAllOpt(
      listCampaign,
      listOpts,
      ALL_CAMPAIGNS_OPTION,
      value,
      onChange
    );
  };

  return (
    <Select
      mode="multiple"
      allowClear
      className={`w-full ${classNames}`}
      placeholder="Select campaigns"
      value={crrValue}
      onChange={onChangeValue}
      showSearch
      maxTagCount="responsive"
      maxTagPlaceholder={(v) => maxTagPlaceholder(v, crrValue, onChangeValue)}
      filterOption={filterSelectGroup}
    >
      {listCampaign?.length > 0 && (
        <>
          <OptGroup label={`All Campaigns (${listCampaign.length})`}>
            <Option value={ALL_CAMPAIGNS_OPTION}>All Campaigns</Option>
          </OptGroup>

          <OptGroup label="Campaign">
            {listCampaign.map((camp: any, idx) => (
              <Option
                value={isGetRawId ? camp.rawCampaignId : camp.id}
                key={idx}
              >
                {camp.name}
              </Option>
            ))}
          </OptGroup>
        </>
      )}
    </Select>
  );
}

SelectCampaignByNetwork.defaultProps = {
  networkData: [],
  listNetwork: [],
  storeAppIds: [],
  isGetRawId: false,
  initWithEmptyList: false,
};

SelectCampaignByNetwork.propTypes = {
  value: PropTypes.array,
  classNames: PropTypes.string,
  onChange: PropTypes.func,
  networkData: PropTypes.array,
  listNetwork: PropTypes.array,
  storeAppIds: PropTypes.array,
  isGetRawId: PropTypes.bool,
  initNetworkSuccess: PropTypes.bool,
  initWithEmptyList: PropTypes.bool,
  status: PropTypes.string,
  setListCampaignData: PropTypes.func,
};

export default SelectCampaignByNetwork;
