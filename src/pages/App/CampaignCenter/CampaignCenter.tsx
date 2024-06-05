import Tabs from "antd/lib/tabs";
import React, { useEffect, useState } from "react";
import {
  createSearchParams,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import Page from "../../../utils/composables/Page";
import CampaignsHistory from "./CampaignsHistory/CampaignsHistory";
import CampaignIntel from "./CampaignIntel/CampaignIntel";
import { getCountryEl, sortByString } from "../../../utils/Helpers";
import BatchHistory from "./BatchHistory/BatchHistory";
import { getDateCol } from "../../../partials/common/Table/Helper";
import { CampaignCenterTabs } from "../../../utils/ProtectedRoutes";
import { FromCol, ToCol } from "../../../utils/helper/UIHelper";
import getColumnSearchProps from "../../../partials/common/Table/CustomSearch";

export const CampaignTabs = [
  {
    id: "0",
    name: "Campaign intelligence",
    tabUrl: "report",
  },
  // { id: "1", name: "Rules Bidding", tabUrl: "rules-bidding" },
  { id: "2", name: "Bid history", tabUrl: CampaignCenterTabs.bidHistory },
  { id: "3", name: "Budget history", tabUrl: CampaignCenterTabs.budgetHistory },
  { id: "4", name: "Batch history", tabUrl: CampaignCenterTabs.batchHistory },
];

export const miniHistoryCols = (onSearchTable: any = undefined) => {
  if (!onSearchTable) {
    return [
      {
        title: "Network",
        render: (record) => (
          <div className="whitespace-nowrap md:whitespace-normal">
            {record.network}
          </div>
        ),
      },
      { title: "Campaign Name", dataIndex: "campaignName" },
      {
        title: "Ad Group",
        render: (record) => (
          <div className="whitespace-nowrap md:whitespace-normal">
            {record.adGroupName}
          </div>
        ),
      },
      { title: "Keyword", dataIndex: "keyword" },
      {
        title: "Country",
        render: getCountryEl,
      },
    ];
  }

  return [
    {
      title: "Network",
      render: (record) => (
        <div className="whitespace-nowrap md:whitespace-normal">
          {record.network}
        </div>
      ),
      sorter: sortByString("network"),
      ...getColumnSearchProps({
        dataIndex: "network",
        callback: (value) => onSearchTable(value, "network"),
        customFilter: () => true,
      }),
    },
    {
      title: "Campaign Name",
      dataIndex: "campaignName",
      sorter: sortByString("campaignName"),
      ...getColumnSearchProps({
        getField: (el) => el.campaignName,
        callback: (value) => onSearchTable(value, "campaignName"),
        customFilter: () => true,
      }),
    },
    {
      title: "Ad Group",
      render: (record) => (
        <div className="whitespace-nowrap md:whitespace-normal">
          {record.adGroupName}
        </div>
      ),
      sorter: sortByString("adGroupName"),
      ...getColumnSearchProps({
        getField: (el) => el.adGroupName,
        callback: (value) => onSearchTable(value, "adGroupName"),
        customFilter: () => true,
      }),
    },
    {
      title: "Keyword",
      dataIndex: "keyword",
      sorter: sortByString("keyword"),
      ...getColumnSearchProps({
        dataIndex: "keyword",
        callback: (value) => onSearchTable(value, "keyword"),
        customFilter: () => true,
      }),
    },
    {
      title: "Country",
      render: getCountryEl,
      sorter: sortByString("country"),
      ...getColumnSearchProps({
        dataIndex: "country",
        callback: (value) => onSearchTable(value, "country"),
        customFilter: () => true,
      }),
    },
  ];
};

export const historyColumns = (
  currenciesConfigs,
  onSearchTable = undefined
) => [
  {
    title: "Date",
    render: getDateCol,
  },
  { title: "Updated By", dataIndex: "createdBy" },
  ...miniHistoryCols(onSearchTable),
  FromCol(currenciesConfigs),
  ToCol(currenciesConfigs),
];

const getTabComponent = (tabUrl) => {
  switch (tabUrl) {
    case CampaignCenterTabs.budgetHistory:
      return <CampaignsHistory isBudget />;

    case CampaignCenterTabs.bidHistory:
      return <CampaignsHistory />;

    case CampaignCenterTabs.batchHistory:
      return <BatchHistory />;

    case CampaignCenterTabs.report:
    default:
      return <CampaignIntel />;
  }
};

function CampaignCenter() {
  const urlParams = useParams();
  const navigate = useNavigate();
  let [searchParams] = useSearchParams();

  const [tab, setTab] = useState(CampaignTabs[0].tabUrl);
  const [isInit, setIsInit] = useState(true);

  useEffect(() => {
    const tabUrl = searchParams.get("tab");
    const activedTab = CampaignTabs.find((tabObj) => tabObj.tabUrl === tabUrl);

    if (activedTab?.tabUrl === tab) return;
    setTab(activedTab?.tabUrl || CampaignTabs[0].tabUrl);
  }, [window.location.search]);

  useEffect(() => {
    if (isInit) {
      return setIsInit(false);
    }
    window.location.reload();
  }, [urlParams.appId]);

  const onChangeTab = (tabUrl) => {
    if (tab === tabUrl) return;

    navigate({
      search: createSearchParams({ tab: tabUrl }).toString(),
    });
  };

  const items = CampaignTabs.map((tab) => {
    return {
      key: tab.tabUrl,
      label: tab.name,
      children: <div className="p-4 sm:p-6">{getTabComponent(tab.tabUrl)}</div>,
    };
  });

  return (
    <Page>
      <div className="">
        <Tabs
          destroyInactiveTabPane
          type="card"
          items={items}
          activeKey={tab}
          onChange={onChangeTab}
        />
      </div>
    </Page>
  );
}

export default CampaignCenter;
