import React, { useEffect, useState } from "react";
import {
  createSearchParams,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import Tabs from "antd/lib/tabs";
import Page from "../../utils/composables/Page";
import Apps from "./Apps";
import AppGroups from "./AppGroups/AppGroups";

export const AppTabIds = {
  apps: "1",
  groups: "2",
};

export const AppTabs = [
  { id: "0", name: "Apps", tabUrl: AppTabIds.apps },
  { id: "1", name: "App groups", tabUrl: AppTabIds.groups },
];

function AppMainPage() {
  const navigate = useNavigate();
  let [searchParams] = useSearchParams();

  const [tab, setTab] = useState(AppTabs[0].tabUrl);
  const [items, setItems] = useState<any>([]);

  useEffect(() => {
    const tabUrl = searchParams.get("tab");
    const activedTab = AppTabs.find((tabObj) => tabObj.tabUrl === tabUrl);

    !items.length &&
      setItems(
        AppTabs.map((tab) => {
          return {
            key: tab.tabUrl,
            label: tab.name,
            children: (
              <div className="p-4 sm:p-6">{getTabComponent(tab.tabUrl)}</div>
            ),
          };
        })
      );

    if (activedTab?.tabUrl === tab) return;
    setTab(activedTab?.tabUrl || AppTabs[0].tabUrl);
  }, [window.location.search]);

  const getTabComponent = (tabUrl) => {
    switch (tabUrl) {
      case AppTabIds.apps:
        return <Apps />;

      case AppTabIds.groups:
      default:
        return <AppGroups />;
    }
  };

  const onChangeTab = (tabUrl) => {
    if (tab === tabUrl) return;

    navigate({
      search: createSearchParams({ tab: tabUrl }).toString(),
    });
  };

  return (
    <Page>
      <div
        className="px-4 sm:px-6 lg:px-8 py-4 sm:py-8 w-full h-[calc(100vh-64px)] overflow-y-scroll"
        id="ScrollableApps"
      >
        <Tabs
          type="card"
          items={items}
          activeKey={tab}
          onChange={onChangeTab}
        />
      </div>
    </Page>
  );
}

export default AppMainPage;
