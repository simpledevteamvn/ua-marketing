import React, { useEffect, useState } from "react";
import Page from "../../utils/composables/Page";
import Tabs from "antd/lib/tabs";
import {
  createSearchParams,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import TemplateManagement from "./TemplateManagement/TemplateManagement";
import History from "./History/History";

const CSVTabUrls = {
  csvTemplate: "template",
  history: "history",
};
const CSVTabs = [
  { id: "0", name: "Bid CSV", tabUrl: CSVTabUrls.csvTemplate },
  { id: "1", name: "History", tabUrl: CSVTabUrls.history },
];

const getTabComponent = (tabUrl) => {
  switch (tabUrl) {
    case CSVTabUrls.history:
      return <History />;

    case CSVTabUrls.csvTemplate:
    default:
      return <TemplateManagement />;
  }
};

function CSVManagement(props) {
  const urlParams = useParams();
  const navigate = useNavigate();
  let [searchParams] = useSearchParams();

  const [tab, setTab] = useState(CSVTabs[0].tabUrl);
  const [isInit, setIsInit] = useState(true);

  useEffect(() => {
    const tabUrl = searchParams.get("tab");
    const activedTab = CSVTabs.find((tabObj) => tabObj.tabUrl === tabUrl);

    if (activedTab?.tabUrl === tab) return;
    setTab(activedTab?.tabUrl || CSVTabs[0].tabUrl);
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

  const items = CSVTabs.map((tab) => {
    return {
      key: tab.tabUrl,
      label: tab.name,
      children: <div className="p-4 sm:p-6">{getTabComponent(tab.tabUrl)}</div>,
    };
  });

  return (
    <Page>
      <Tabs
        destroyInactiveTabPane
        type="card"
        items={items}
        activeKey={tab}
        onChange={onChangeTab}
      />
    </Page>
  );
}

export default CSVManagement;
