import React, { useEffect, useState } from "react";
import Page from "../../../utils/composables/Page";
import {
  createSearchParams,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import Tabs from "antd/lib/tabs";
import TelegramSettings from "./Telegram/TelegramSettings";
import DetailNotifications from "./DetailNotifications/DetailNotifications";

export const NotificationsTabIds = {
  notifications: "1",
  telegram: "2",
};

export const NotificationsTabs = [
  { id: "0", name: "Notifications", tabUrl: NotificationsTabIds.notifications },
  { id: "1", name: "Telegram", tabUrl: NotificationsTabIds.telegram },
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
      case NotificationsTabIds.telegram:
        return <TelegramSettings />;

      case NotificationsTabIds.notifications:
      default:
        return <DetailNotifications />;
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
      <Tabs type="card" items={items} activeKey={tab} onChange={onChangeTab} />
    </Page>
  );
}

export default Notifications;
