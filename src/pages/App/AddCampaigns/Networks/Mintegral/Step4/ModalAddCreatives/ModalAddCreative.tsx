import React, { useEffect, useState } from "react";
import Modal from "antd/lib/modal";
import Button from "antd/lib/button";
import service from "../../../../../../../partials/services/axios.config";
import Select from "antd/lib/select";
import {
  capitalizeWord,
  getLabelFromStr,
} from "../../../../../../../utils/Helpers";
import SelectCampaignByNetwork from "../../../../../../../partials/common/Forms/SelectCampaignByNetwork";
import ListCreatives from "./ListCreatives";
import { getNetworkConnector } from "../../../../Helpers";
import { useQuery } from "@tanstack/react-query";
import { CREATIVES_FROM_NETWORK } from "../../../../../../../api/constants.api";
import { QueryFunc } from "../../../../../../../api/common/common.api";

function ModalAddCreative(props) {
  const {
    isOpen,
    onClose,
    activedApp,
    applicationsData,
    handleAddCreatives,
    setIsLoading,
    setImgPreview,
    setPreviewData,
  } = props;

  const [creatives, setCreatives] = useState<any>([]);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);

  const [listType, setListType] = useState<string[]>([]);
  // const [appsInNetwork, setAppsInNetwork] = useState([]);

  // const [activedApps, setActivedApps] = useState([]);
  const [activedCamps, setActivedCamps] = useState([]);
  const [activedTypes, setActivedTypes] = useState([]);
  const [activedStatus, setActivedStatus] = useState<string>();

  const networkCode = activedApp?.networkConnector?.network?.code;

  const onCloseModal = () => {
    onClose();
    setTimeout(() => {
      setSelectedRecords([]);
      setActivedCamps([]);
      setActivedTypes([]);
      setActivedStatus(undefined);
    }, 300);
  };

  const getCreativeParams = () => ({
    networkConnectorId: activedApp?.networkConnector?.id,
    appIds: activedApp?.id,
    // appIds: activedApps.join(","),
    campaignIds: activedCamps?.join(","),
    types: activedTypes?.join(","),
    status: activedStatus,
  });

  const getCreativesFromNetwork: QueryFunc = async () => {
    const params = getCreativeParams();
    return await service.get("/creatives/campaign-creation", { params });
  };

  const {
    data: creativesRes,
    refetch,
    isLoading,
    isError,
    isSuccess,
    isRefetching,
  } = useQuery({
    queryKey: [CREATIVES_FROM_NETWORK],
    queryFn: getCreativesFromNetwork,
    staleTime: 20 * 60000,
    enabled: isOpen,
  });

  useEffect(() => {
    isLoading && isOpen && setIsLoading(true);
    (isError || isSuccess) && setIsLoading(false);
  }, [isOpen, isLoading, isError, isSuccess]);

  useEffect(() => {
    setIsLoading(isRefetching);
  }, [isRefetching]);

  useEffect(() => {
    setCreatives(creativesRes?.results || []);
  }, [creativesRes]);

  useEffect(() => {
    const networkConnectorId = activedApp?.networkConnector?.id;
    if (!isOpen || !networkConnectorId) return;

    service.get("/creative/type").then(
      (res: any) => {
        setListType(res.results || []);
      },
      () => {}
    );
  }, [isOpen, activedApp?.id]);

  // useEffect(() => {
  //   if (networkCode && applicationsData?.length) {
  //     const listApps = applicationsData.filter(
  //       (el) => el.networkConnector?.network?.code === networkCode
  //     );
  //     setAppsInNetwork(listApps);
  //   }
  // }, [applicationsData, activedApp?.id]);

  const onSearch = () => {
    refetch();
  };

  const onApply = () => {
    const listData = creatives.filter((el) => selectedRecords.includes(el.id));
    handleAddCreatives(listData);
    onCloseModal();
  };

  return (
    <Modal
      title="Add creatives"
      maskClosable={false}
      width={1000}
      open={isOpen}
      onCancel={onCloseModal}
      footer={[
        <Button key="back" htmlType="button" onClick={onCloseModal}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          htmlType="submit"
          disabled={!selectedRecords?.length}
          onClick={onApply}
        >
          Apply
        </Button>,
      ]}
    >
      <div className="flex items-center flex-wrap -mx-1 -mt-3">
        {/* <Select
          placeholder="Select target resources"
          mode="multiple"
          maxTagCount="responsive"
          allowClear
          value={activedApps?.id}
          onChange={setActivedApps}
          className="w-full xs:w-[180px] !mx-1 !mt-3"
        >
          {getNetworkConnector(appsInNetwork)}
        </Select> */}
        <SelectCampaignByNetwork
          classNames="xs:w-[240px] !mx-1 !mt-3"
          networkData={[networkCode]}
          value={activedCamps}
          onChange={setActivedCamps}
        />
        <Select
          placeholder="Select type"
          mode="multiple"
          maxTagCount="responsive"
          allowClear
          value={activedTypes}
          onChange={setActivedTypes}
          className="w-full xs:w-[180px] !mx-1 !mt-3"
        >
          {listType?.length > 0 &&
            listType.map((type) => (
              <Select.Option key={type}>{getLabelFromStr(type)}</Select.Option>
            ))}
        </Select>
        <Select
          className="xs:w-[130px] !mx-1 !mt-3"
          placeholder="Select status"
          allowClear
          value={activedStatus}
          onChange={setActivedStatus}
        >
          {["ACTIVE", "PAUSED"].map((data) => (
            <Select.Option key={data}>{capitalizeWord(data)}</Select.Option>
          ))}
        </Select>
        <Button type="primary" className="!mx-1 !mt-3" onClick={onSearch}>
          Search
        </Button>
      </div>

      <ListCreatives
        data={creatives}
        selectedRecords={selectedRecords}
        setSelectedRecords={setSelectedRecords}
        setImgPreview={setImgPreview}
        setPreviewData={setPreviewData}
      />
    </Modal>
  );
}

export default ModalAddCreative;
