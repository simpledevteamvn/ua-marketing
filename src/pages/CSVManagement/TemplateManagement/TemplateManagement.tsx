import Button from "antd/lib/button";
import Collapse from "antd/lib/collapse";
import React, { useEffect, useState } from "react";
import {
  baseURL,
  checkResponseStatus,
  LIST_ERROR_CODE,
  OG_CODE_HEADER,
} from "../../../partials/services/axios.config";

import Loading from "../../../utils/Loading";
import {
  ALL_CAMPAIGNS_OPTION,
  LIST_CAMPAIGN_STATUS,
} from "../../../constants/constants";
import Page from "../../../utils/composables/Page";
import DownloadOutlined from "@ant-design/icons/lib/icons/DownloadOutlined";
import SelectNetwork from "../../../partials/common/Forms/SelectNetwork";
import axios from "axios";
import { RootState } from "../../../redux/store";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { LIST_AD_NETWORK, LIST_STORE_APPS } from "../../../api/constants.api";
import { getListAdNetwork } from "../../../api/common/common.api";
import SelectCampaignByNetwork from "../../../partials/common/Forms/SelectCampaignByNetwork";
import Radio from "antd/lib/radio";
import SelectStoreApp, {
  getActivedApp,
} from "../../../partials/common/Forms/SelectStoreApp";
import { getStoreApps } from "../../../api/apps/apps.api";
import UploadCSV from "./UploadCSV";
import {
  DIMENSION_SUFFIX,
  DimensionSuffixDrd,
} from "../../../partials/common/Dropdowns/Dropdowns";
import { downloadCSV } from "./Helpers";

function TemplateManagement(props) {
  const token = useSelector((state: RootState) => state.account.token);
  const organizationCode = useSelector(
    (state: RootState) => state.account.userData.organization.code
  );

  const [isLoading, setIsLoading] = useState(false);
  const [listAdNetwork, setListAdNetwork] = useState([]);
  const [activedNetwork, setActivedNetwork] = useState<any>();
  const [status, setStatus] = useState(LIST_CAMPAIGN_STATUS.running.value);
  const [activedCamp, setActivedCamp] = useState([]);
  const [includeStatus, setIncludeStatus] = useState(DIMENSION_SUFFIX.includes);
  const [listStoreApps, setListStoreApps] = useState([]);
  const [activedApp, setActivedApp] = useState<string[]>();

  const { data: listNetwork } = useQuery({
    queryKey: [LIST_AD_NETWORK],
    queryFn: getListAdNetwork,
    staleTime: 60 * 60000,
  });

  const { data: storeAppsRes } = useQuery({
    queryKey: [LIST_STORE_APPS],
    queryFn: getStoreApps,
    staleTime: 120 * 60000,
  });

  useEffect(() => {
    setListStoreApps(storeAppsRes?.results || []);
  }, [storeAppsRes]);

  useEffect(() => {
    setListAdNetwork(listNetwork?.results);
  }, [listNetwork]);

  const onChangeApp = (values) => {
    setActivedApp(values);
    setActivedCamp([]);
  };

  const onDownloadTemplate = () => {
    const appData = getAppIds()?.includes(ALL_CAMPAIGNS_OPTION)
      ? []
      : getAppIds();
    const params = {
      network: activedNetwork,
      storeAppIds: appData?.join(","),
      campaignIds: activedCamp?.join(","),
      status,
      isExcludeCampaign: includeStatus === DIMENSION_SUFFIX.excludes,
    };

    setIsLoading(true);
    axios
      .get(`${baseURL}/bid/file`, {
        params,
        headers: { Authorization: token, [OG_CODE_HEADER]: organizationCode },
      })
      .then(
        (res: any) => {
          setIsLoading(false);
          // https://stackoverflow.com/questions/41938718/how-to-download-files-using-axios
          // https://stackoverflow.com/questions/27120757/failed-to-execute-createobjecturl-on-url

          if (LIST_ERROR_CODE.includes(res.data.code)) {
            return checkResponseStatus(res);
          }
          downloadCSV(res);
        },
        () => setIsLoading(false)
      );
  };

  const getAppIds = () => {
    return activedApp?.map((str) => getActivedApp(listStoreApps, str).id);
  };
  const filterLeftClass = "form-filter-left large";

  return (
    <Page>
      {isLoading && <Loading />}

      <Collapse defaultActiveKey={["1"]}>
        <Collapse.Panel header="Download CSV" key="1">
          <div className="">
            <div className="grid grid-cols-12 gap-2 mt-5">
              <div className={filterLeftClass}>
                Network <span className="text-red-400 ml-px">*</span>
              </div>
              <div className="form-filter-right large">
                <SelectNetwork
                  classNames="xs:w-[250px]"
                  isMultiple={false}
                  listNetwork={listAdNetwork}
                  value={activedNetwork}
                  onChange={setActivedNetwork}
                />
              </div>
            </div>
            <div className="grid grid-cols-12 gap-2 mt-5">
              <div className={filterLeftClass}>
                App <span className="text-red-400 ml-px">*</span>
              </div>
              <div className="form-filter-right large">
                <SelectStoreApp
                  autoFocus={false}
                  isMultiple
                  classNames="filter-item xs:w-[250px]"
                  listApp={listStoreApps}
                  activedApp={activedApp}
                  setActivedApp={onChangeApp}
                />
              </div>
            </div>
            <div className="grid grid-cols-12 gap-2 mt-5">
              <div className={filterLeftClass}>Campaign</div>
              <div className="form-filter-right large">
                <div>
                  <Radio.Group
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    {Object.values(LIST_CAMPAIGN_STATUS).map((data) => (
                      <Radio value={data.value} key={data.value}>
                        {data.label}
                      </Radio>
                    ))}
                  </Radio.Group>
                </div>
                <div className="mt-2.5 flex space-x-1">
                  <DimensionSuffixDrd
                    value={includeStatus}
                    onChange={setIncludeStatus}
                  />
                  <SelectCampaignByNetwork
                    classNames="xs:w-[300px]"
                    networkData={activedNetwork ? [activedNetwork] : []}
                    value={activedCamp}
                    onChange={setActivedCamp}
                    storeAppIds={getAppIds()}
                    status={status}
                  />
                </div>
              </div>
            </div>
          </div>

          <Button
            type="primary"
            className="mt-6 md:mt-1 mb-5"
            icon={<DownloadOutlined />}
            disabled={!activedNetwork || !activedApp?.length}
            onClick={onDownloadTemplate}
          >
            Download
          </Button>
        </Collapse.Panel>
        <Collapse.Panel header="Upload CSV File" key="2">
          <UploadCSV
            setIsLoading={setIsLoading}
            listAdNetwork={listAdNetwork}
            filterLeftClass={filterLeftClass}
          />
        </Collapse.Panel>
      </Collapse>
    </Page>
  );
}

export default TemplateManagement;
