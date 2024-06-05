import React, { useEffect, useState } from "react";
import {
  createSearchParams,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import Tabs from "antd/lib/tabs";
import Page from "../../utils/composables/Page";
import BidRules from "./BidRules";
import AutomatedRules from "./AutomatedRules/AutomatedRules";
import AutomatedRuleHistory from "./AutomatedRuleHistory/AutomatedRuleHistory";

export const RuleTabIds = {
  rules: "1",
  automatedRules: "2",
  history: "3",
};

export const NotificationsTabs = [
  { id: "0", name: "Rules", tabUrl: RuleTabIds.rules },
  { id: "1", name: "Automated rules", tabUrl: RuleTabIds.automatedRules },
  { id: "2", name: "History", tabUrl: RuleTabIds.history },
];

function Notifications() {
  const navigate = useNavigate();
  let [searchParams] = useSearchParams();

  const [tab, setTab] = useState(NotificationsTabs[0].tabUrl);
  const [items, setItems] = useState<any>([]);

  useEffect(() => {
    const tabUrl = searchParams.get("tab");
    const activedTab = NotificationsTabs.find(
      (tabObj) => tabObj.tabUrl === tabUrl
    );

    !items.length &&
      setItems(
        NotificationsTabs.map((tab) => {
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
    setTab(activedTab?.tabUrl || NotificationsTabs[0].tabUrl);
  }, [window.location.search]);

  const getTabComponent = (tabUrl) => {
    switch (tabUrl) {
      case RuleTabIds.automatedRules:
        return <AutomatedRules />;
      case RuleTabIds.history:
        return <AutomatedRuleHistory />;

      case RuleTabIds.rules:
      default:
        return <BidRules />;
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

export default Notifications;
