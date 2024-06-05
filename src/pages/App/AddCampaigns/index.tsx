import React, { useEffect, useState } from "react";
import Page from "../../../utils/composables/Page";
import Loading from "../../../utils/Loading";
import Breadcrumb from "antd/lib/breadcrumb/Breadcrumb";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import {
  APP_PATH,
  NETWORK_CODES,
  ORGANIZATION_PATH,
} from "../../../constants/constants";
import { useQuery } from "@tanstack/react-query";
import { CAMPAIGN_CONFIGS } from "../../../api/constants.api";
import { getCampaignConfig } from "../../../api/add-campaign/add-campaign.api";
import Mintegral from "./Networks/Mintegral/Mintegral";
import service from "../../../partials/services/axios.config";
import Select from "antd/lib/select";
import classNames from "classnames";
import { getNetworkConnector } from "./Helpers";
import Unity from "./Networks/Unity/Unity";
import Applovin from "./Networks/Applovin/Applovin";
import Empty from "antd/lib/empty";
import { getAppFromAdNetwork } from "../../../utils/Helpers";

const SUPPORTED_NETWORKS = [
  NETWORK_CODES.mintegral,
  NETWORK_CODES.unity,
  NETWORK_CODES.applovin,
  // NETWORK_CODES.google,
];

function AddCampaigns(props) {
  const urlParams = useParams();
  const organisationCode = useSelector(
    (state: RootState) => state.account.userData.organization.code
  );

  const [isLoading, setIsLoading] = useState(false);
  const [campaignConfigs, setCampaignConfigs] = useState<any>({});
  const [applicationsData, setApplicationsData] = useState<any>([]);
  const [activedApp, setActivedApp] = useState<any>();
  const [stepData, setStepData] = useState({});
  const networkCode = activedApp?.networkConnector?.network?.code;

  const { data: campaignConfigRes } = useQuery({
    queryKey: [CAMPAIGN_CONFIGS, networkCode],
    queryFn: getCampaignConfig,
    staleTime: 20 * 60000,
    enabled: !!networkCode,
  });

  useEffect(() => {
    setIsLoading(true);
    service.get(`/store-app/${urlParams.appId}`).then(
      (res: any) => {
        const apps = res?.results?.applications || [];
        const appFromAdNetwork = getAppFromAdNetwork(apps);

        const supportedApps = appFromAdNetwork?.filter((el) =>
          SUPPORTED_NETWORKS.includes(el.networkConnector?.network.code)
        );
        setApplicationsData(supportedApps);
        // setActivedApp(res?.results?.applications[5]); // fake init with special network
        setIsLoading(false);
      },
      () => setIsLoading(false)
    );
  }, []);

  useEffect(() => {
    setCampaignConfigs(campaignConfigRes?.results || {});
  }, [campaignConfigRes]);

  const onChangeTargetApp = (value) => {
    const activedApp = applicationsData.find((el) => el.id === value);
    setActivedApp(activedApp);
    setStepData({});
  };

  const campaignUrl =
    ORGANIZATION_PATH +
    "/" +
    organisationCode +
    APP_PATH +
    "/" +
    urlParams.appId +
    "/campaign-control";

  const networkProps = {
    campaignConfigs,
    applicationsData,
    stepData,
    setIsLoading,
    setStepData,
    activedApp,
  };

  let contentComp;
  switch (networkCode) {
    case NETWORK_CODES.mintegral:
      contentComp = <Mintegral {...networkProps} />;
      break;
    case NETWORK_CODES.unity:
      contentComp = <Unity {...networkProps} />;
      break;
    case NETWORK_CODES.applovin:
      contentComp = <Applovin {...networkProps} />;
      break;

    default:
      break;
  }

  return (
    <Page>
      {isLoading && <Loading />}

      <div className="page-breadcrum">
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link to={campaignUrl}>Campaign</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Create campaign</Breadcrumb.Item>
        </Breadcrumb>
      </div>
      <div className="px-4 sm:px-6 lg:px-12 2xl:px-24 py-6">
        <div className="page-title">Create campaign</div>

        <div className="mt-3 flex items-center">
          <div className="text-base mr-3">Target:</div>
          <Select
            placeholder="Select linked app"
            className="!w-[520px]"
            value={activedApp?.id}
            onChange={onChangeTargetApp}
          >
            {getNetworkConnector(applicationsData)}
          </Select>
        </div>
        {/* <div className="mt-2">
          <a href="https://adv.mintegral.com/offers/create" target="_blank">
            View on network
          </a>
        </div> */}

        <div
          className={classNames(
            "border rounded px-6 py-5 text-base mt-4 min-h-[200px]",
            activedApp && contentComp
              ? "bg-white"
              : "bg-slate-50 flex flex-col justify-center"
          )}
        >
          {activedApp ? (
            contentComp
          ) : (
            <>
              <Empty description={false} className="!mt-6" />
              <div className="text-center italic mt-2 mb-6">
                Please choose a target app to create campaign.
              </div>
            </>
          )}
        </div>
      </div>
    </Page>
  );
}

AddCampaigns.propTypes = {};

export default AddCampaigns;
